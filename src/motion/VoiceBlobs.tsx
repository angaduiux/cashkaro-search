/**
 * VoiceBlobs — the voice sheet's gradient-blob orb, in the Siri / Gemini idiom.
 *
 * Two nested fields, one clock, and the mic signal as the only input:
 *
 *  • **Aura** (behind the core, unclipped) — three big soft blobs, aqua → violet →
 *    magenta, drifting on Lissajous paths. Loudness blooms them: the layer scales
 *    and brightens with `level`, and each blob is pushed outward by ITS OWN
 *    frequency band, so a sibilant throws the magenta blob while a vowel swells
 *    the aqua one. That difference is what makes it read as *reacting to a voice*
 *    rather than as one disc breathing.
 *  • **Core** (a circular clip) — the tappable sphere: a lit base ramp with four
 *    blobs travelling inside it, a rotating specular band, a lit rim and a bottom
 *    inner shade. Clipping soft blobs to a circle is what gives the liquid-metal
 *    look; without the clip they read as three lamps on a table.
 *
 * It inherits the rules the AI surfaces already settled (D017), because breaking
 * them is what makes this class of effect look cheap:
 *   – ONE display-linked clock ([Aura](./Aura.tsx) `useAuraClock`) drives every
 *     layer on the UI thread; nothing is keyframed, so loudness can retime the
 *     whole field mid-flight by pushing `clock.rate` with no seam.
 *   – Motion is sampled at INTEGER harmonics of that clock's master loop, so the
 *     composite is seamless at the wrap and no blob traces a visible back-and-forth.
 *   – Softness is a real multi-stop radial gradient (`softOrbFill`), never a blur
 *     filter — RN doesn't wire `filter: blur()` to iOS by default, so a blur would
 *     leave hard-edged circles on device.
 *   – Every falloff ends on a zero-alpha stop of its own hue, so nothing
 *     interpolates through grey and leaves a dirty ring.
 *
 * `level`/`bands` are read straight off [useVoiceLevel](./useVoiceLevel.ts) shared
 * values inside worklets — the orb never touches React state, so it holds frame
 * rate while the sheet's transcript re-renders underneath it.
 */
import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import {
  color,
  radius,
  VOICE_AURA_BLOB,
  VOICE_AURA_HUES,
  VOICE_CORE_BLOB,
  VOICE_CORE_HUES,
  VOICE_ORB_CORE,
  VOICE_ORB_FIELD,
} from '../theme/tokens';
import { AURA_LOOP, softOrbFill, useAuraClock, type AuraClock } from './Aura';

const TAU = Math.PI * 2;

/**
 * One blob's path. `kx`/`ky`/`ks` are integer harmonics of the master loop —
 * non-integers would drift out of phase and show a seam when the clock wraps.
 * `band` is which analyser band pushes it, `push` how far that band throws it.
 */
type BlobSpec = {
  hue: string;
  peak: number;
  size: number;
  /** Rest offset from the field's centre, px. */
  cx: number;
  cy: number;
  kx: number;
  ky: number;
  ks: number;
  phase: number;
  /** Drift amplitude, px. */
  ax: number;
  ay: number;
  band: number;
  push: number;
};

/**
 * The aura: three blobs on separate harmonic pairs, sitting on the three bands a
 * voice actually moves — low (chest), mid (vowels), high (consonants). Alphas are
 * low because they overlap; the colour comes from where they cross.
 */
const AURA: BlobSpec[] = [
  { hue: VOICE_AURA_HUES[0], peak: 0.30, size: VOICE_AURA_BLOB, cx: -30, cy: 14, kx: 2, ky: 3, ks: 2, phase: 0, ax: 22, ay: 16, band: 1, push: 26 },
  { hue: VOICE_AURA_HUES[1], peak: 0.26, size: VOICE_AURA_BLOB, cx: 26, cy: -16, kx: 3, ky: 2, ks: 3, phase: 0.37, ax: 20, ay: 18, band: 4, push: 24 },
  { hue: VOICE_AURA_HUES[2], peak: 0.22, size: VOICE_AURA_BLOB * 0.86, cx: 8, cy: 30, kx: 4, ky: 3, ks: 2, phase: 0.71, ax: 24, ay: 14, band: 7, push: 30 },
];

/**
 * Inside the core: four blobs at high alpha, travelling far enough to cross the
 * clip edge. Their peaks are near-opaque — the base ramp under them only shows
 * where they thin out, which is what keeps the sphere from looking like a plate.
 */
const CORE: BlobSpec[] = [
  { hue: VOICE_CORE_HUES[0], peak: 0.92, size: VOICE_CORE_BLOB, cx: -18, cy: -14, kx: 2, ky: 3, ks: 3, phase: 0.11, ax: 15, ay: 12, band: 1, push: 12 },
  { hue: VOICE_CORE_HUES[1], peak: 0.86, size: VOICE_CORE_BLOB * 0.94, cx: 16, cy: -10, kx: 3, ky: 4, ks: 2, phase: 0.44, ax: 13, ay: 14, band: 3, push: 11 },
  { hue: VOICE_CORE_HUES[2], peak: 0.80, size: VOICE_CORE_BLOB * 0.88, cx: -12, cy: 18, kx: 4, ky: 2, ks: 4, phase: 0.66, ax: 14, ay: 11, band: 5, push: 13 },
  { hue: VOICE_CORE_HUES[3], peak: 0.74, size: VOICE_CORE_BLOB * 0.8, cx: 18, cy: 16, kx: 3, ky: 2, ks: 3, phase: 0.88, ax: 12, ay: 13, band: 7, push: 14 },
];

/** Fills are static styles — built once at module load, never per frame. */
const AURA_FILLS: ViewStyle[] = AURA.map((b) => softOrbFill(b.hue, b.peak));
const CORE_FILLS: ViewStyle[] = CORE.map((b) => softOrbFill(b.hue, b.peak));

/** Loudness at full tilt runs the field this many times faster than at rest. */
const RATE_GAIN = 1.3;

/**
 * The orb. `level`/`bands` come from `useVoiceLevel`; `live` is false once the
 * phrase has landed, which parks the field at a calm idle instead of leaving it
 * chasing room noise while the sheet says "Got it".
 *
 * `children` is the glyph layer, drawn above every gradient.
 */
export function VoiceBlobs({
  level,
  bands,
  live,
  children,
}: {
  level: SharedValue<number>;
  bands: SharedValue<number>[];
  live: boolean;
  children?: React.ReactNode;
}) {
  const reduced = !!useReducedMotion();
  const clock = useAuraClock(true);

  // Loudness retimes the clock rather than restarting anything — the whole field
  // speeds up as the voice rises, which is most of why it feels alive. Under
  // reduced motion the clock never ticks, so the rate is moot.
  useAnimatedReaction(
    () => (live ? level.value : 0),
    (v) => {
      clock.rate.value = 1 + v * RATE_GAIN;
    },
  );

  return (
    <View style={styles.field} pointerEvents="box-none">
      <AuraLayer clock={clock} level={level} bands={bands} live={live} reduced={reduced} />
      <Core clock={clock} level={level} bands={bands} live={live} reduced={reduced}>
        {children}
      </Core>
    </View>
  );
}

type LayerProps = {
  clock: AuraClock;
  level: SharedValue<number>;
  bands: SharedValue<number>[];
  live: boolean;
  reduced: boolean;
};

/** The bloom around the core: quiet room → a faint halo; a loud syllable → a flare. */
function AuraLayer({ clock, level, bands, live, reduced }: LayerProps) {
  const style = useAnimatedStyle(() => {
    const v = live ? level.value : 0;
    return {
      opacity: 0.34 + v * 0.66,
      transform: [{ scale: reduced ? 1 : 1 + v * 0.26 }],
    };
  });
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.centre, style]} pointerEvents="none">
      {AURA.map((spec, i) => (
        <Blob key={i} spec={spec} fill={AURA_FILLS[i]} clock={clock} bands={bands} live={live} reduced={reduced} />
      ))}
    </Animated.View>
  );
}

/**
 * The sphere. Clip order matters: base ramp → drifting blobs → specular sweep →
 * rim/shade → glyph. The clip is a plain `overflow: hidden` circle, so the blobs
 * can travel past the edge and the silhouette stays perfectly round.
 */
function Core({ clock, level, bands, live, reduced, children }: LayerProps & { children?: React.ReactNode }) {
  const style = useAnimatedStyle(() => {
    const v = live ? level.value : 0;
    // A small swing: the core is the control, and a button that changes size by
    // a fifth stops reading as a tappable target.
    return { transform: [{ scale: reduced ? 1 : 1 + v * 0.08 }] };
  });
  return (
    <Animated.View style={[styles.core, style]} pointerEvents="box-none">
      <View style={styles.coreClip} pointerEvents="box-none">
        <LinearGradient
          colors={[color.voice.orbFrom, color.voice.orbVia, color.voice.orbTo]}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, styles.centre]} pointerEvents="none">
          {CORE.map((spec, i) => (
            <Blob key={i} spec={spec} fill={CORE_FILLS[i]} clock={clock} bands={bands} live={live} reduced={reduced} />
          ))}
        </View>
        <Specular clock={clock} level={level} live={live} reduced={reduced} />
        <View style={styles.rim} pointerEvents="none" />
        {children}
      </View>
    </Animated.View>
  );
}

/**
 * One blob: Lissajous drift from the clock, plus an outward push along its own
 * radius from its band. The push is what makes five blobs move like five voices
 * instead of one envelope — a band-less version reads as a pulsing disc.
 */
function Blob({
  spec,
  fill,
  clock,
  bands,
  live,
  reduced,
}: {
  spec: BlobSpec;
  fill: ViewStyle;
  clock: AuraClock;
  bands: SharedValue<number>[];
  live: boolean;
  reduced: boolean;
}) {
  // Unit vector out from the centre, so a band pushes the blob away from the core
  // rather than in some arbitrary screen direction.
  const len = Math.hypot(spec.cx, spec.cy) || 1;
  const ux = spec.cx / len;
  const uy = spec.cy / len;

  const style = useAnimatedStyle(() => {
    const u = clock.t.value / AURA_LOOP;
    const b = live ? bands[spec.band % bands.length].value : 0;
    const drift = reduced ? 0 : 1;
    return {
      transform: [
        { translateX: spec.cx + drift * spec.ax * Math.sin(TAU * (spec.kx * u + spec.phase)) + ux * b * spec.push },
        { translateY: spec.cy + drift * spec.ay * Math.cos(TAU * (spec.ky * u + spec.phase * 1.7)) + uy * b * spec.push },
        // Band energy swells the blob as well as throwing it — loudness should
        // read as more colour, not only as more travel.
        { scale: 1 + (reduced ? 0 : 0.16 * Math.sin(TAU * (spec.ks * u + spec.phase))) + b * 0.22 },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.blob, { width: spec.size, height: spec.size, marginLeft: -spec.size / 2, marginTop: -spec.size / 2 }, fill, style]}
    />
  );
}

/**
 * The light on the sphere: a soft ellipse of white that orbits the core at a
 * quarter of the master loop and tightens as the voice rises. One highlight
 * travelling slowly is what says "solid object"; a static one says "sticker".
 */
function Specular({ clock, level, live, reduced }: Omit<LayerProps, 'bands'>) {
  const style = useAnimatedStyle(() => {
    const u = clock.t.value / AURA_LOOP;
    const v = live ? level.value : 0;
    const r = VOICE_ORB_CORE * 0.22;
    return {
      opacity: 0.5 + v * 0.4,
      transform: reduced
        ? [{ translateX: -r * 0.7 }, { translateY: -r * 0.7 }]
        : [
            { translateX: r * Math.cos(TAU * u - Math.PI * 0.75) },
            { translateY: r * Math.sin(TAU * u - Math.PI * 0.75) },
            { scale: 1 + v * 0.2 },
          ],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.spec, SPEC_FILL, style]} />;
}

const SPEC_SIZE = VOICE_ORB_CORE * 0.86;
const SPEC_FILL = softOrbFill(color.voice.orbSpec, 0.5);

const styles = StyleSheet.create({
  field: { width: VOICE_ORB_FIELD, height: VOICE_ORB_FIELD, alignItems: 'center', justifyContent: 'center' },
  centre: { alignItems: 'center', justifyContent: 'center' },
  // Blobs are centred on the field/core centre and offset from there, so a spec's
  // cx/cy read as "px from the middle" rather than as edge anchors.
  blob: { position: 'absolute', left: '50%', top: '50%' },
  core: {
    width: VOICE_ORB_CORE,
    height: VOICE_ORB_CORE,
    borderRadius: radius.full,
    // The orb sits on white, so it needs its own contact shadow or it floats.
    ...(Platform.OS === 'web'
      ? { boxShadow: `0 12px 28px ${color.voice.halo}` }
      : {
          shadowColor: color.voice.orbShadow,
          shadowOpacity: 0.3,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        }),
  },
  coreClip: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.full,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spec: {
    position: 'absolute',
    width: SPEC_SIZE,
    height: SPEC_SIZE,
    left: '50%',
    top: '50%',
    marginLeft: -SPEC_SIZE / 2,
    marginTop: -SPEC_SIZE / 2,
  },
  // Lit rim on white + a bottom inner shade: the two edges a real sphere has.
  rim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: color.voice.orbRim,
    ...(Platform.OS === 'web' ? { boxShadow: `inset 0 -10px 18px -10px ${color.voice.orbShade}` } : null),
  },
});
