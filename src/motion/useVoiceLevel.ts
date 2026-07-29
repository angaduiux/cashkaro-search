/**
 * useVoiceLevel — the voice sheet's amplitude source, as Reanimated shared values.
 *
 * Two implementations behind one shape, because the visual must be identical either
 * way:
 *
 *  - **Web (real).** `getUserMedia` → `AnalyserMode` FFT. `level` is the RMS of the
 *    time-domain buffer; `bands` are BAND_COUNT log-spaced averages of the frequency
 *    buffer. This is genuinely the person's voice driving the UI.
 *  - **Native / permission denied (synthesized).** A speech-shaped envelope: syllable
 *    bursts at a plausible rate with pauses between phrases, plus per-band tilt so the
 *    bars move independently instead of in lockstep. Nothing here pretends to be real
 *    audio — it exists so the showcase still reads correctly in Expo Go, where mic
 *    capture needs a native module this managed project doesn't carry.
 *
 * `source` reports which path is live so the sheet can label itself honestly.
 *
 * Everything is written to shared values and read on the UI thread, so the meter never
 * touches React state and never drops a frame.
 */
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';

/** Bars in the meter. Log-spaced so speech energy spreads across them. */
export const BAND_COUNT = 9;

export type VoiceLevel = {
  /** Overall loudness, 0…1, already smoothed. */
  level: SharedValue<number>;
  /** Per-band loudness, 0…1, low frequency first. */
  bands: SharedValue<number>[];
  /** True while the level is above the speech gate. */
  voiced: SharedValue<boolean>;
  /** Which implementation is running. */
  source: 'mic' | 'synth' | 'pending';
};

/** Above this RMS we call it speech rather than room noise. */
const GATE = 0.055;
/** How long to wait on the mic permission before falling back to the synth. */
const MIC_GRANT_TIMEOUT = 900;

export function useVoiceLevel(active: boolean): VoiceLevel {
  const level = useSharedValue(0);
  const voiced = useSharedValue(false);
  // Hooks can't be called in a loop conditionally, so the bands are fixed-length.
  const b0 = useSharedValue(0);
  const b1 = useSharedValue(0);
  const b2 = useSharedValue(0);
  const b3 = useSharedValue(0);
  const b4 = useSharedValue(0);
  const b5 = useSharedValue(0);
  const b6 = useSharedValue(0);
  const b7 = useSharedValue(0);
  const b8 = useSharedValue(0);
  const bands = [b0, b1, b2, b3, b4, b5, b6, b7, b8];
  const bandsRef = useRef(bands);
  bandsRef.current = bands;

  const [source, setSource] = useState<VoiceLevel['source']>('pending');

  useEffect(() => {
    if (!active) {
      level.value = 0;
      voiced.value = false;
      bandsRef.current.forEach((b) => (b.value = 0));
      setSource('pending');
      return;
    }

    let stop = false;
    let cleanup: (() => void) | undefined;

    /** Smoothing: fast attack so a consonant lands immediately, slow release so the
     *  meter falls like a real VU rather than flickering. */
    const smooth = (prev: number, next: number) =>
      next > prev ? prev + (next - prev) * 0.55 : prev + (next - prev) * 0.16;

    const runSynth = () => {
      setSource('synth');
      let t = 0;
      // Phrase/pause structure: ~1.6s of speech, ~0.5s of breath.
      const timer = setInterval(() => {
        if (stop) return;
        t += 1 / 60;
        const phrase = t % 2.1;
        const speaking = phrase < 1.6;
        // Syllables ~4.5/s, with a slower amplitude arc across the phrase.
        const syll = Math.pow(Math.max(0, Math.sin(t * Math.PI * 4.5)), 1.6);
        const arc = Math.sin((phrase / 1.6) * Math.PI);
        const target = speaking ? 0.18 + syll * arc * 0.78 : 0.01;
        level.value = smooth(level.value, Math.min(1, target));
        voiced.value = level.value > GATE;
        bandsRef.current.forEach((b, i) => {
          // Tilt: lows track the envelope, highs favour the consonant transients.
          const tilt = 1 - Math.abs(i - 2.4) / BAND_COUNT;
          const jitter = 0.72 + 0.28 * Math.sin(t * (7 + i * 2.3) + i);
          b.value = smooth(b.value, Math.min(1, level.value * tilt * 1.9 * jitter));
        });
      }, 1000 / 60);
      cleanup = () => clearInterval(timer);
    };

    const runMic = async () => {
      try {
        // Race the permission prompt. If nothing comes back quickly — the person is
        // still deciding, there is no input device, or we are in a headless browser
        // where the prompt never resolves at all — start the synthesized envelope so
        // the meter is never dead, and drop the stream if it turns up late.
        let settled = false;
        const media = await Promise.race([
          navigator.mediaDevices.getUserMedia({ audio: true }).then((m) => {
            if (settled) m.getTracks().forEach((t) => t.stop());
            return m;
          }),
          new Promise<null>((res) => setTimeout(() => res(null), MIC_GRANT_TIMEOUT)),
        ]);
        if (!media) {
          settled = true;
          if (!stop) runSynth();
          return;
        }
        settled = true;
        if (stop) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        const Ctx: typeof AudioContext =
          (window as any).AudioContext ?? (window as any).webkitAudioContext;
        const ctx = new Ctx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.6;
        ctx.createMediaStreamSource(media).connect(analyser);

        const time = new Float32Array(analyser.fftSize);
        const freq = new Uint8Array(analyser.frequencyBinCount);
        // Log-spaced band edges over the speech-relevant part of the spectrum.
        const edges = Array.from({ length: BAND_COUNT + 1 }, (_, i) =>
          Math.floor(Math.pow(freq.length, i / BAND_COUNT)),
        );
        setSource('mic');

        const tick = () => {
          if (stop) return;
          analyser.getFloatTimeDomainData(time);
          let sum = 0;
          for (let i = 0; i < time.length; i++) sum += time[i] * time[i];
          // RMS, lifted with a curve so normal speech uses most of the range.
          const rms = Math.min(1, Math.pow(Math.sqrt(sum / time.length) * 5.2, 0.7));
          level.value = smooth(level.value, rms);
          voiced.value = level.value > GATE;

          analyser.getByteFrequencyData(freq);
          for (let i = 0; i < BAND_COUNT; i++) {
            let acc = 0;
            const lo = edges[i];
            const hi = Math.max(lo + 1, edges[i + 1]);
            for (let j = lo; j < hi; j++) acc += freq[j];
            const v = acc / (hi - lo) / 255;
            bandsRef.current[i].value = smooth(bandsRef.current[i].value, Math.min(1, v * 1.5));
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        cleanup = () => {
          media.getTracks().forEach((t) => t.stop());
          ctx.close().catch(() => {});
        };
      } catch {
        // No permission, no device, or a non-secure origin — fall back silently.
        if (!stop) runSynth();
      }
    };

    const canCapture =
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia;
    if (canCapture) runMic();
    else runSynth();

    return () => {
      stop = true;
      cleanup?.();
    };
  }, [active]);

  return { level, bands, voiced, source };
}
