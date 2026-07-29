/**
 * VoiceSheet — voice-to-text input as a bottom sheet over a dimmed page.
 *
 * Composition follows the reference pattern: a scrim, a white sheet with rounded top
 * corners, and everything centred on one vertical axis — prompt, the thing being
 * said, one orb, one hint. No left-aligned labels, no control row; the orb IS the
 * control, so the sheet has a single focal point.
 *
 * The meter **is** the orb — a gradient-blob sphere in a blooming aura
 * ([motion/VoiceBlobs](../motion/VoiceBlobs.tsx)), Siri/Gemini-style, where every
 * blob rides its own frequency band from
 * [motion/useVoiceLevel](../motion/useVoiceLevel.ts). Bars and pulse rings are gone:
 * a bar meter quantises a voice into five numbers, where blobs crossing at
 * different rates read as the voice itself. The orb keeps its silhouette through
 * all six phases and only its glyph changes, so the beats below never cost the
 * person their focal point.
 *
 * Six states. The first two are driven by the signal; the three after the phrase lands
 * are timed beats, because a voice search that jumps straight from the last syllable to
 * a results page gives the person no chance to see what was heard:
 *
 *   `listening`  prompt + a quoted suggestion that swaps every 2.4s, so the surface is
 *                alive before a word is said
 *   `hearing`    the suggestion is replaced by the transcript, which grows ONLY while
 *                `voiced` is true — stop talking and it stalls mid-phrase. Words land no
 *                faster than WORD_MIN_MS apart, so a phrase reads at speaking pace
 *   `settling`   heard: the disc turns to a check and the transcript holds, long enough
 *                to read it back (SETTLE_DWELL_MS)
 *   `processing` understood: the disc shows the thinking dots (PROCESS_MS)
 *   `searching`  handing over: "Searching…", then the query commits (SEARCH_MS)
 *   `nomatch`    no voice at all for NO_MATCH_MS → "Sorry, I didn't get that" with
 *                tappable chips, which beat retrying by voice
 *
 * The sheet enters on a TIMING curve, not a spring: a spring's overshoot on a 320px
 * translate reads as a bounce on a surface this large. The message block is a fixed
 * height for the same reason — a 1-line suggestion swapping for a 2-line transcript
 * would otherwise resize the sheet mid-flow and bounce everything below it.
 *
 * There is no speech recognition here — the words come from `PHRASES`, revealed in
 * time with real voice activity. Swap in an STT engine's partial results and nothing
 * else in this file changes.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { color, type as t, space, radius, duration, MIN_TAP_TARGET } from '../theme/tokens';
import { EASE } from '../motion/motion';
import { Icon } from '../icons/Icon';
import { useVoiceLevel } from '../motion/useVoiceLevel';
import { VoiceBlobs } from '../motion/VoiceBlobs';

export type VoicePhase = 'listening' | 'hearing' | 'settling' | 'processing' | 'searching' | 'nomatch';

/** Quoted examples, cycled while idle. Real CashKaro intents, not lorem. */
const SUGGESTIONS = ['masala dosa', 'nike running shoes', 'best cashback card', 'iphone 16 deals'];
/** No-match chips — one tap is faster than speaking again. */
const CHIPS = ['Nike', 'Amazon', 'Croma'];
/** What a showcase run "hears", word by word. */
const PHRASES = [
  ['nike', 'running', 'shoes', 'under', '5000'],
  ['best', 'cashback', 'credit', 'card'],
  ['iphone', '16', 'pro', 'deals'],
];

/** Silence that ends a partial phrase. */
const SILENCE_MS = 450;
/** No voice at all for this long → offer chips instead of waiting forever. */
const NO_MATCH_MS = 5200;
/** Idle suggestion dwell. */
const SUGGEST_MS = 2400;
/** How often the signal is sampled (silence + no-match detection). */
const SAMPLE_MS = 125;
/** Floor on the gap between revealed words — the sampler runs at 125ms, which
 *  spits a whole phrase out in half a second and reads as a machine gun. */
const WORD_MIN_MS = 280;

// ── The three beats after the phrase lands ───────────────────────────────────
/** heard: hold the finished transcript long enough to read it back. */
const SETTLE_DWELL_MS = 900;
/** processed: the thinking beat, before anything is claimed about results. */
const PROCESS_MS = 1100;
/** searching: the hand-over beat; the query commits at the end of it. */
const SEARCH_MS = 800;
/** Sheet entry — slower than the old spring, and with no overshoot. */
const ENTER_MS = 520;

/** The line under the disc — one per phase, so each beat says what it is doing. */
const HINTS: Record<VoicePhase, string> = {
  listening: 'Tap to cancel',
  hearing: 'Tap to cancel',
  settling: 'That’s what I heard',
  processing: 'Working out what you meant…',
  searching: 'Starting your search…',
  nomatch: 'Tap microphone to try again',
};

/** Glyph sizes on the orb — the mic is the resting state, the beats are smaller so
 *  the sphere's own light stays the loudest thing in the sheet. */
const GLYPH_MIC = 30;
const GLYPH_BEAT = 26;

export function VoiceSheet({
  visible,
  onCancel,
  onCommit,
}: {
  visible: boolean;
  onCancel: () => void;
  onCommit: (text: string) => void;
}) {
  const reduced = useReducedMotion();
  const { level, bands, voiced } = useVoiceLevel(visible);
  const [phase, setPhase] = useState<VoicePhase>('listening');
  const [words, setWords] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState(0);
  const phrase = useRef(PHRASES[0]);

  const transcript = words.join(' ');
  const nomatch = phase === 'nomatch';
  /** Everything after the phrase lands: the disc is no longer a live meter. */
  const done = phase === 'settling' || phase === 'processing' || phase === 'searching';

  // The sampler below runs off a stable interval, so it can't read `phase` from the
  // closure — a ref mirrors it, and the sampler stops once the phrase has landed
  // (otherwise it keeps re-firing `settling` and resets the beats underneath them).
  const phaseRef = useRef<VoicePhase>('listening');
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (!visible) return;
    phrase.current = PHRASES[Math.floor(Date.now() / 1000) % PHRASES.length];
    setWords([]);
    setPhase('listening');
    setSuggestion(0);
  }, [visible]);

  // Idle suggestion carousel — stops the moment anything is heard.
  useEffect(() => {
    if (!visible || words.length || nomatch) return;
    const id = setInterval(() => setSuggestion((i) => (i + 1) % SUGGESTIONS.length), SUGGEST_MS);
    return () => clearInterval(id);
  }, [visible, words.length, nomatch]);

  // The only place JS reads the signal: reveal words on voiced activity, finalise on a
  // breath, and fall back to chips if nothing is ever said.
  useEffect(() => {
    if (!visible) return;
    const opened = Date.now();
    let lastVoiced = Date.now();
    let lastWord = 0;
    let spoken = 0;
    const id = setInterval(() => {
      // Past `hearing` the phrase is final — the timed beats own the sheet now.
      if (phaseRef.current !== 'listening' && phaseRef.current !== 'hearing') return;
      const now = Date.now();
      const complete = spoken >= phrase.current.length;
      if (voiced.value && !complete) {
        lastVoiced = now;
        // Reveal at speaking pace, not at the sampler's pace.
        if (now - lastWord < WORD_MIN_MS) return;
        lastWord = now;
        spoken += 1;
        setWords(phrase.current.slice(0, spoken));
        setPhase('hearing');
      } else if (complete && !voiced.value) {
        // A complete utterance finalises on the first breath, the way real STT commits
        // once it has a whole phrase. Waiting out SILENCE_MS never fired: the meter's
        // slow release keeps `level` above the gate for most of a natural pause.
        setPhase('settling');
      } else if (!voiced.value && spoken > 0 && now - lastVoiced > SILENCE_MS) {
        setPhase('settling');
      } else if (spoken === 0 && now - opened > NO_MATCH_MS) {
        setPhase('nomatch');
      }
    }, SAMPLE_MS);
    return () => clearInterval(id);
  }, [visible, voiced]);

  const accept = useCallback(() => {
    if (transcript) onCommit(transcript);
  }, [transcript, onCommit]);

  // ── heard → processed → searching ───────────────────────────────────────────
  // It commits itself: the person already said it, so a confirm tap is a step for
  // nothing. What they do need is to see WHICH of those three things is happening —
  // one silent pause reads as a hang, three labelled beats read as a system working.
  useEffect(() => {
    if (phase !== 'settling' || !transcript) return;
    const id = setTimeout(() => setPhase('processing'), SETTLE_DWELL_MS);
    return () => clearTimeout(id);
  }, [phase, transcript]);
  useEffect(() => {
    if (phase !== 'processing') return;
    const id = setTimeout(() => setPhase('searching'), PROCESS_MS);
    return () => clearTimeout(id);
  }, [phase]);
  useEffect(() => {
    if (phase !== 'searching') return;
    const id = setTimeout(accept, SEARCH_MS);
    return () => clearTimeout(id);
  }, [phase, accept]);

  // ── Entry: scrim fades, sheet rises ─────────────────────────────────────────
  // Timing, not spring: `spring.smooth` is under-damped (ζ ≈ 0.9), and on a 320px
  // translate that overshoot is a visible bounce at the top edge of the sheet.
  const enter = useSharedValue(0);
  useEffect(() => {
    enter.value = reduced
      ? visible
        ? 1
        : 0
      : withTiming(visible ? 1 : 0, { duration: ENTER_MS, easing: EASE.emphasized });
  }, [visible, reduced]);
  const scrimStyle = useAnimatedStyle(() => ({ opacity: enter.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(enter.value, [0, 1], [320, 0]) }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.scrimFill, scrimStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Dismiss voice search"
        />
      </Animated.View>

      <Animated.View style={[styles.sheet, sheetStyle]}>
        <View style={styles.grabber} />

        {nomatch ? (
          <Animated.View entering={FadeIn.duration(duration.base)} style={styles.centre}>
            <Text style={[t.body17Regular, styles.prompt]}>Sorry, I didn’t get that. Try saying…</Text>
            <View style={styles.chips}>
              {CHIPS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => onCommit(c.toLowerCase())}
                  style={styles.chip}
                  accessibilityRole="button"
                  accessibilityLabel={'Search ' + c}
                >
                  <Text style={[t.body16Regular, { color: color.voice.chipText }]}>{c}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ) : (
          <View style={styles.centre}>
            <Text style={[t.body17Regular, styles.prompt]}>
              {done ? 'Got it' : transcript ? 'Listening…' : 'Hi, I’m listening. Try saying…'}
            </Text>
            {transcript ? (
              <Text style={[t.heading20Bold, styles.said]} numberOfLines={2}>
                {transcript}
              </Text>
            ) : (
              <Suggestion index={suggestion} reduced={!!reduced} />
            )}
          </View>
        )}

        <MicDisc
          bands={bands}
          level={level}
          phase={phase}
          reduced={!!reduced}
          // During the beats a tap skips ahead rather than cancelling — the person
          // has already said it, so the only thing left to want is "go now".
          onPress={done ? accept : onCancel}
        />

        <Text style={[t.body13Medium, styles.hint]}>{HINTS[phase]}</Text>
      </Animated.View>
    </View>
  );
}

/** The quoted idle example. Cross-fades on swap so the sheet never looks frozen while
 *  it waits for a voice. */
function Suggestion({ index, reduced }: { index: number; reduced: boolean }) {
  return (
    <Animated.Text
      key={index}
      entering={reduced ? undefined : FadeIn.duration(duration.moderate)}
      exiting={reduced ? undefined : FadeOut.duration(duration.fast)}
      style={[t.heading20Bold, styles.said]}
    >
      {'“' + SUGGESTIONS[index] + '”'}
    </Animated.Text>
  );
}

/**
 * The orb: a blob sphere in a blooming aura, with one glyph per phase on top.
 *
 * The blobs carry the signal, so nothing here quantises it — the tap target is the
 * sphere itself (96px, well clear of MIN_TAP_TARGET) and the glyph only ever says
 * *which beat* the sheet is on. `live` parks the field once the phrase has landed,
 * so the orb visibly settles under "Got it" instead of chasing room noise.
 */
function MicDisc({
  bands,
  level,
  phase,
  reduced,
  onPress,
}: {
  bands: SharedValue<number>[];
  level: SharedValue<number>;
  phase: VoicePhase;
  reduced: boolean;
  onPress?: () => void;
}) {
  const nomatch = phase === 'nomatch';
  const live = phase === 'listening' || phase === 'hearing';
  const done = !live && !nomatch;

  const breath = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    breath.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(breath);
  }, [reduced]);

  return (
    <View style={styles.orbSlot}>
      <VoiceBlobs level={level} bands={bands} live={live}>
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          style={styles.orbTap}
          accessibilityRole="button"
          accessibilityLabel={done ? HINTS[phase] : nomatch ? 'Tap microphone to try again' : 'Listening, tap to cancel'}
          accessibilityState={{ busy: phase === 'processing' || phase === 'searching' }}
        >
          {/* One glyph per beat, so "heard → understood → searching" is legible at a
              glance and not just a change of caption. */}
          {phase === 'settling' ? (
            <Icon name="check" size={GLYPH_MIC} color={color.voice.micGlyph} weight="solid" />
          ) : phase === 'processing' ? (
            <ThinkingDots breath={breath} reduced={reduced} />
          ) : phase === 'searching' ? (
            <Icon name="search" size={GLYPH_BEAT} color={color.voice.micGlyph} weight="solid" />
          ) : (
            <Icon name="mic" size={GLYPH_MIC} color={color.voice.micGlyph} weight="solid" />
          )}
        </Pressable>
      </VoiceBlobs>
    </View>
  );
}

/** The processing beat: three dots breathing in sequence off the same clock the
 *  idle meter uses, so the disc never goes inert while it "thinks". */
function ThinkingDots({ breath, reduced }: { breath: SharedValue<number>; reduced: boolean }) {
  return (
    <View style={styles.dotRow}>
      {[0, 1, 2].map((i) => (
        <ThinkingDot key={i} breath={breath} index={i} reduced={reduced} />
      ))}
    </View>
  );
}

function ThinkingDot({ breath, index, reduced }: { breath: SharedValue<number>; index: number; reduced: boolean }) {
  const style = useAnimatedStyle(() => {
    if (reduced) return { opacity: 0.6, transform: [{ scale: 1 }] };
    // Two pulses per breath cycle, each dot a third of a cycle behind the last.
    const w = 0.5 + 0.5 * Math.sin(Math.PI * 2 * (2 * breath.value - index / 3));
    return { opacity: 0.35 + 0.65 * w, transform: [{ scale: 0.75 + 0.25 * w }] };
  });
  return <Animated.View style={[styles.thinkDot, style]} />;
}

const styles = StyleSheet.create({
  scrimFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: color.voice.scrim },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.voice.sheet,
    borderTopLeftRadius: radius.hero,
    borderTopRightRadius: radius.hero,
    paddingTop: space.s12,
    paddingBottom: space.xl,
    paddingHorizontal: space.m20,
    alignItems: 'center',
    gap: space.m20,
    ...(Platform.OS === 'web' ? { boxShadow: '0 -10px 30px rgba(16,10,64,0.14)' } : null),
  },
  grabber: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: color.voice.sheetEdge },
  // FIXED height, not minHeight: a 1-line suggestion swapping for a 2-line
  // transcript resized the sheet mid-flow, which bounced the disc and the hint
  // under it on every state change. 104 clears prompt + two transcript lines.
  centre: { alignItems: 'center', gap: space.s, height: 104, justifyContent: 'center' },
  prompt: { color: color.voice.label, textAlign: 'center' },
  said: { color: color.voice.transcript, textAlign: 'center' },
  // Muted, not the brand orange it used to be: the orb is the only saturated thing
  // in the sheet, and an orange caption under a violet sphere read as a second,
  // unrelated accent.
  hint: { color: color.voice.labelMuted, textAlign: 'center' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.s12 },
  chip: {
    minHeight: MIN_TAP_TARGET,
    justifyContent: 'center',
    paddingHorizontal: space.m20,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: color.voice.chipBorder,
  },

  // The orb's field box is mostly transparent margin — room for the aura to travel
  // without being clipped. Pulled in so that margin doesn't read as dead space on
  // top of the sheet's own 20px gaps; the glow it holds is meant to reach the text.
  orbSlot: { marginVertical: -space.xxl, alignItems: 'center', justifyContent: 'center' },
  // The tap target fills the sphere, so the whole orb is pressable and the glyph
  // sits dead-centre on it.
  orbTap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: space.s6 },
  thinkDot: { width: space.s, height: space.s, borderRadius: radius.full, backgroundColor: color.voice.micGlyph },
});
