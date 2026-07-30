/**
 * Credit-card tile — a card's form wherever it appears as a TILE rather than as the
 * full comparison card: the similar-cards rail, a View-all card rail, and Explore's
 * "Jump back in" (D105). Transcribed from Figma Cashkaro-Search-2026
 * (`0O2eU4S1vipmvXFT2eeJ9h`, node 1696:5271, six 104×162 tiles); every metric comes
 * from `CARD_TILE_SPEC` and every colour from `color.ckds`.
 *
 * It is the Storepage store tile (`ResultCards` → `StoreTile`) with a card's two
 * things swapped in, so a rail of stores and a rail of cards read as one system:
 *
 *   ┌ frame ── white, r12, #eee hairline, 4px inset, elevation.xs ── (the store tile's)
 *   │ bed 94×113 (r10) on #f2f4f8 under a #f0f4ff top glow
 *   │   · white issuer chip 77×26.5 (r7.2) — the frame's own wordmark export
 *   │   · card artwork 67×45 (3:2, the big card's ratio) over a soft white disc,
 *   │     with the spec's "Shine" laid across it
 *   │   · green line at the bed's foot: "Lifetime free" / the card's own superlative
 *   └ foot ── "Flat ₹1,400" cobalt 14 + "REWARDS" 8 caps ── (the store tile's)
 *
 * Two spec effects are rebuilt rather than shipped as PNGs: the blur disc behind the
 * artwork and the shine over it are Gaussian-blurred ellipses in Figma, and this
 * project draws softness as a real radial gradient, never a blur filter (D017). The
 * exported wordmarks ARE shipped as assets — they are artwork, not an effect.
 *
 * Everything rendered here is feed data (D004): the figure is `item.cashback`, the
 * caption `item.cashbackCaption`, the green line is read off `item.fees` /
 * `item.topPick`, and a card with no reward shows its CTA label instead of a zero.
 */
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, ImageSourcePropType } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ResultItem } from '../data/dataContract';
import { color, type as t, space, radius, fontFamily, elevation, spring, CARD_TILE_SPEC as S } from '../theme/tokens';
import { radialFill } from '../motion/Aura';

/**
 * The wordmark's leaf box. Figma gives each brand its own (SBI 56.9 wide, Axis ~74 as a
 * mark + wordmark pair), which one component can't reproduce per asset — so the leaf is
 * the set's middle, 80% of the chip, and `contain` keeps every export's own aspect.
 * Measured against the frame render: the chip's full content box (67.4) drew the marks
 * ~8% wider than the design.
 */
const CHIP_LEAF_W = S.chipW * 0.8;

export function CardTile({
  item,
  width = S.w,
  onPress,
}: {
  item: ResultItem;
  width?: number;
  onPress?: () => void;
}) {
  const k = width / S.w; // every metric below is the spec's, scaled by the tile width
  const cb = item.cashback;
  const prefix = cb.type === 'flat_inr' || (cb.type === 'pct_single' && cb.prefix === 'flat') ? 'Flat' : 'Upto';
  const value =
    cb.type === 'flat_inr' ? `₹${cb.value.toLocaleString('en-IN')}`
    : cb.type === 'pct_single' ? `${cb.value}%`
    : cb.type === 'pct_range' ? `${cb.max}%`
    : '';

  const note = noteFor(item, width);
  const art = item.artwork ?? null;
  const artSource: ImageSourcePropType | undefined =
    art == null ? undefined : typeof art === 'string' ? { uri: art } : (art as ImageSourcePropType);
  const chip = item.issuerLogo ?? null;

  return (
    <Press label={item.title} onPress={onPress}>
      <View style={[styles.frame, { width }]}>
        <View style={styles.bed}>
          <LinearGradient
            colors={[color.ckds.cardTileGlow, color.ckds.cardTileGlow0]}
            locations={[0.157, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            // The glow is wider than the bed in the spec, so it has no visible side
            // edge — it just stops being blue.
            style={[styles.glow, { width: S.glowW * k, height: S.glowH * k }]}
          />

          {/* Soft white disc the artwork sits on (Figma's two blurred ellipses). */}
          <View style={[styles.blob, radialFill(BLOB_STOPS), { width: S.blobSize * k, height: S.blobSize * k }]} />

          {chip != null && (
            <View style={[styles.chip, { width: S.chipW * k, height: S.chipH * k, padding: S.chipPad * k }]}>
              <Image
                source={chip as ImageSourcePropType}
                style={{ width: CHIP_LEAF_W * k, height: (S.chipH - S.chipPad * 2) * k }}
                resizeMode="contain"
                accessibilityLabel={item.subtitle ?? item.title}
              />
            </View>
          )}

          {artSource && (
            <View style={[styles.artWrap, { width: S.artW * k, height: S.artH * k, borderRadius: S.artRadius * k }]}>
              <Image source={artSource} style={styles.art} resizeMode="cover" accessibilityLabel={item.title} />
              {/* "Shine" — a wide, soft highlight sitting half off the artwork's top. */}
              <View
                style={[
                  styles.shine,
                  radialFill(SHINE_STOPS, { shape: 'ellipse' }),
                  { width: S.shineW * k, height: S.shineH * k, top: -S.shineH * k * 0.5 },
                ]}
                pointerEvents="none"
              />
            </View>
          )}

          {note != null && (
            <View style={[styles.strip, { height: S.stripH * k }]}>
              <Text style={styles.noteText} numberOfLines={1}>
                {note}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.foot}>
          {value ? (
            <>
              <Text style={[t.body14BoldSnug, { color: color.ckds.cta }]} numberOfLines={1}>
                {prefix} {value}
              </Text>
              <Text style={[t.caption8SemiBoldCaps, { color: color.ckds.cashbackCaption }]}>
                {item.cashbackCaption ?? 'REWARDS'}
              </Text>
            </>
          ) : (
            <Text style={[t.body14BoldSnug, { color: color.ckds.cta }]} numberOfLines={1}>
              {item.ctaLabel ?? 'Get this card'}
            </Text>
          )}
        </View>
      </View>
    </Press>
  );
}

/**
 * Press-scale wrapper — the same 0.97 snappy spring `ResultCards`' store tile uses, so
 * a card tile answers a finger identically. Written here rather than imported from
 * [ResultCards](./ResultCards.tsx) because that module renders this one: importing back
 * would close a cycle, and this project has been bitten by one before (catalog ↔
 * realData).
 */
function Press({ children, label, onPress }: { children: React.ReactNode; label: string; onPress?: () => void }) {
  const s = useSharedValue(1);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={st}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        onPressIn={() => (s.value = withSpring(0.97, spring.snappy))}
        onPressOut={() => (s.value = withSpring(1, spring.snappy))}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

/**
 * The green line. The spec shows two kinds — a fee statement ("Lifetime free") and a
 * superlative ("Best Cashback Card") — so it takes the fee fact when the card is free
 * and otherwise the disclosed top-pick reason. Never invented: no free card and no
 * disclosed reason ⇒ no line, and the bed closes without one.
 *
 * **It only ever holds a line that FITS.** The strip is the bed's full width and one
 * line tall, and a feed reason can be a sentence ("Highest flat cashback on online
 * spends"); ellipsising it mid-word looked like a bug, so a line too long for the space
 * is dropped instead. The budget is measured, not guessed: Outfit Regular at 10px runs
 * ~4.9px per character on this copy, and the strip has `width - 4` to spend.
 */
function noteFor(item: ResultItem, width: number): string | null {
  const fees = item.fees;
  const free = (v?: string | null) => !v || /free|nil|^₹?0$/i.test(v.trim());
  const budget = Math.floor((width - 4) / NOTE_CHAR_W);
  const fits = (v?: string | null) => (v && v.length <= budget ? v : null);
  // In order: the fee fact the mock shows, then the card's OWN headline reward (its
  // first benefit tag — "5% online"), then the disclosed ranking reason. A card whose
  // every fact is longer than one line shows nothing rather than an ellipsis.
  if (fees && (fees.state === 'free' || (free(fees.joining) && free(fees.annual)))) return 'Lifetime free';
  if (fees && free(fees.joining)) return 'Zero joining fee'; // free to take, not to keep
  return fits(item.benefitTags?.[0]?.label) ?? fits(item.topPick?.reason) ?? null;
}

/** Average advance of the note's 10px type, in px — the fit budget above divides by it. */
const NOTE_CHAR_W = 4.9;

/**
 * White, fading to nothing — the blur disc under the artwork (D017: gradient, not
 * blur). Kept faint on purpose: at Figma's own 95% centre it flooded the bed and the
 * #f2f4f8 grey disappeared, so the artwork had nothing to sit on.
 */
const BLOB_STOPS = [
  ['rgba(255,255,255,0.62)', '0%'],
  ['rgba(255,255,255,0.24)', '55%'],
  ['rgba(255,255,255,0)', '100%'],
] as const;

/** The shine: the same white, much fainter — Figma paints it at 20% under plus-lighter. */
const SHINE_STOPS = [
  ['rgba(255,255,255,0.34)', '0%'],
  ['rgba(255,255,255,0.12)', '60%'],
  ['rgba(255,255,255,0)', '100%'],
] as const;

const styles = StyleSheet.create({
  // The store tile's frame, value for value (radius.lg, #eee, 4px inset, elevation.xs)
  // — the two tiles are one object with different contents.
  frame: {
    backgroundColor: color.surface,
    borderRadius: radius.lg, // 12
    borderWidth: 1,
    borderColor: color.card.border, // #eee
    paddingHorizontal: space.xs,
    paddingTop: space.xs,
    paddingBottom: space.s,
    ...elevation.xs,
  },
  bed: {
    aspectRatio: S.bedAspect,
    borderRadius: radius.md, // 10
    overflow: 'hidden',
    backgroundColor: color.ckds.cardTileWash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: { position: 'absolute', top: -1 },
  blob: { position: 'absolute', bottom: 0, left: 0, borderRadius: radius.full },
  // NO white plate behind the wordmark. Figma draws one, but under `mix-blend-multiply`
  // — and white multiplied over anything is that thing, so the plate never renders in
  // the design either. Painting it read as a chip stuck on the bed; the box stays only
  // to hold the wordmark's own geometry.
  chip: {
    position: 'absolute',
    top: '8%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Centred in the bed, then nudged below the chip: the spec puts the artwork's box at
  // 42–49 of 113 depending on how tall that card's issuer chip is. The shadow is the
  // frame's own "Rectangle" under the plastic — it grounds the card on the bed, which
  // is the whole point of the bed.
  artWrap: {
    position: 'absolute',
    top: '38%',
    overflow: 'hidden',
    ...elevation.cardArt,
    boxShadow: '0px 3px 5px rgba(0,0,0,0.22)', // the web half of the same token
  } as any,
  art: { width: '100%', height: '100%' },
  shine: { position: 'absolute', alignSelf: 'center' },
  strip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma sets this line in Metropolis Medium; Outfit Medium at the same size reads a
  // weight heavier than the mock, so the line takes Regular and keeps the spec's
  // -0.4 tracking. It is a quiet fact under the artwork, not a badge.
  noteText: { fontFamily: fontFamily.regular, fontSize: 10, lineHeight: 12, letterSpacing: -0.4, color: color.ckds.offGreen },
  foot: { alignItems: 'center', paddingTop: space.s6, gap: space.xxs },
});
