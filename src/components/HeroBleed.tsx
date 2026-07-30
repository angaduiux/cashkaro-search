import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  useReducedMotion,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { color, duration } from '../theme/tokens';
import { AuraField, auraWashTint, brandOrbFan, HERO_ORBS, tintRgba, useAuraClock } from '../motion/Aura';
import { ResultItem } from '../data/dataContract';

/**
 * HeroBleed — the full-bleed living backdrop behind a resolved best-match SERP:
 * a store (the store hero's wash from Figma 1646:7197, unboxed — D069) or a credit
 * card, whose best match unboxes onto the same scene in its issuer's hue (D104).
 *
 * Mounted by `Root` as the FIRST child of the app column, above the mock status
 * bar rather than inside the stage: `stageBody` clips and begins below the
 * status bar, so a wash mounted in the search layer could only ever be cut off
 * at that line. From here one gradient runs from the device's physical top edge,
 * behind the status bar and the shared search bar (both go transparent over it),
 * down through the hero, dissolving into page white — the hero reads as a scene,
 * not a card. The wash + orbs bloom in on mount, then parallax-fade against the
 * SERP scroll (`scrollY`, written by SerpShell's scroll handler), by which point
 * the bar's white underlay has taken over. `StoreHero` / `CreditCard` render
 * content-only.
 */
export function HeroBleed({ item, scrollY }: { item: ResultItem; scrollY: SharedValue<number> }) {
  const tint = heroBleedTint(item);
  // Half-alpha wash (D075). The flat tint is the quiet part of this surface —
  // what should read as colour is the drifting field on top of it.
  const wash = tintRgba(auraWashTint(tint), WASH_ALPHA) ?? auraWashTint(tint);
  const orbFills = useMemo(() => brandOrbFan(tint), [tint]);
  const clock = useAuraClock();
  const reduced = useReducedMotion();
  // Bloom-in: the orbs breathe up from nothing over ~1.4s while the wash fades
  // in — the page "comes alive" instead of popping. Reduced motion: full gain.
  const gain = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    gain.value = reduced ? 1 : withTiming(1, { duration: 1400, easing: Easing.out(Easing.cubic) });
  }, [reduced]);
  // Retime the shared clock for this surface alone (rate is a shared value, so
  // nothing else re-renders): the field crosses a 620px scene, not a card.
  useEffect(() => {
    clock.rate.value = FIELD_RATE;
  }, [clock]);

  // Scroll response: the scene drifts up at 0.4× (parallax) and is fully gone
  // by FADE_END, where the plain white page (and the bar underlay) take over.
  const drift = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, FADE_END], [1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: -scrollY.value * PARALLAX }],
  }));

  // The entrance and the scroll fade both drive OPACITY, so they cannot live on the
  // same view — a layout animation overwrites the style's value, which Reanimated
  // warns about and which makes the bloom-in fight the fade. The entrance stays on
  // the outer box; `drift` moves to an inner layer filling it.
  return (
    <Animated.View entering={FadeIn.duration(duration.moderate)} style={styles.bleed} pointerEvents="none">
      <Animated.View style={[StyleSheet.absoluteFill, drift]}>
      {/* Tinted wash → light grey base, top of screen to the dissolve. */}
      <LinearGradient
        colors={[wash, color.ckds.heroTo]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Drifting brand-hued orbs over the wash — no second base gradient. */}
      <AuraField clock={clock} gain={gain} fills={orbFills} base={false} amp={FIELD_AMP} scale={FIELD_SCALE} specs={HERO_ORBS} />
      {/* White dissolve: starts just under the big cashback figure and lands on
          pure page white at the backdrop's bottom edge, so there is no seam. */}
      <LinearGradient
          colors={[color.ckds.fade0, color.surface]}
          style={styles.dissolve}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
    </Animated.View>
  );
}

/**
 * The one place a hero's aura tint is resolved (StoreHero + HeroBleed).
 *
 * A card hero (D104) reaches this by the same route a brand does: its `logoBg`. Both
 * are issuer/brand hues carried at ~10% alpha for a logo tile, and both are read
 * here as the HUE only — `WASH_ALPHA` below sets the strength. That is what makes
 * SBI's cyan land at the same weight as Croma's mint rather than a shade of white.
 */
export function heroBleedTint(item: ResultItem): string {
  return item.heroTint ?? item.logoBg ?? color.ckds.heroFrom;
}

/** Backdrop height, measured from the PHYSICAL top of the device: status bar
 *  (44) + search bar (70) + context line (~44) + hero (~400) + slack. One height for
 *  both hero kinds: a card hero is ~150px shorter, so its scene is already deep into
 *  the white dissolve by the time the card ends (D104). */
const BLEED_H = 620;
/** The flat wash's alpha (D075). Low: the base is a hint of the brand, and the
 *  orb field — not this — is what carries colour into the scene. */
const WASH_ALPHA = 0.3;
/**
 * Orb travel ×, size × and clock × for a scene this large (D075). `SCALE` is
 * BELOW 1 on purpose: at 320px five orbs blanket a 500px-wide scene and the
 * field has no gaps left to read as blobs. Shrinking them and swinging them
 * further is what makes the motion visible.
 */
const FIELD_AMP = 1.4;
const FIELD_SCALE = 1.25;
const FIELD_RATE = 1.6;
/** White blending reaches well up into the scene (taller than the old 96px fade). */
const DISSOLVE_H = 300;
/** Scene fully faded by this scroll offset. */
const FADE_END = 320;
/** Scene scrolls at 0.4× content speed. */
const PARALLAX = 0.4;

const styles = StyleSheet.create({
  bleed: { position: 'absolute', top: 0, left: 0, right: 0, height: BLEED_H, overflow: 'hidden' },
  dissolve: { position: 'absolute', left: 0, right: 0, bottom: 0, height: DISSOLVE_H },
});
