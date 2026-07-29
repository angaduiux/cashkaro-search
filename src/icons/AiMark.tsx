/**
 * AiMark — the glass sparkle that heads the AI Expand band.
 *
 * Replaces the vendored Fluent Emoji `sparkles-3d.png`, whose warm orange/yellow
 * render clashed with the band's cool aura and the CTA's cobalt→violet ramp. Drawn
 * as `react-native-svg` rather than shipped as an asset so it is crisp at any size,
 * carries no licence, and takes every colour from `theme/tokens` — the same reason
 * the coupon artwork is inlined (`icons/couponAssets.tsx`).
 *
 * Each star is built the way a glass object reads, back to front, with every layer
 * **clipped to the star's own silhouette** so nothing halos outside it:
 *   1. `shade`  — the silhouette offset down-right in indigo: the contact shadow
 *   2. `body`   — an opaque cobalt base, then ice → azure → cobalt → navy along the
 *                 light's diagonal (all-blue: the old cyan→mint→violet ramp's light
 *                 end matched the band's lavender field and vanished at 1×)
 *   3. `depth`  — transparent → violet shade toward the bottom-right (the far face)
 *   4. `gloss`  — a white wash falling from the top-left corner
 *   5. `spec`   — one soft elliptical hot spot, tilted with the diagonal
 *   6. `rim`    — a hairline white stroke: the lit edge, drawn last so it stays crisp
 * Nothing is blurred (react-native-svg filters are uneven across platforms), so the
 * depth comes from stacked gradients only, which also keeps it cheap to composite
 * under the band's 120 Hz aura.
 *
 * Star geometry is parametric, not a traced path: a four-point sparkle is a diamond
 * whose sides bow toward the centre, so each arm is one quadratic curve with the
 * control point pulled to `waist × radius`. One helper draws both the large mark and
 * its small companion, so they cannot drift apart.
 */
import React from 'react';
import Svg, {
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { color } from '../theme/tokens';

/**
 * Four-point sparkle path. `waist` is how far the sides bow in: 0 would be a plain
 * diamond, 1 a cross. 0.26 is the pinch that reads as the familiar "AI sparkle".
 */
function sparkle(cx: number, cy: number, r: number, waist = 0.2): string {
  const k = r * waist;
  const n = (v: number) => Math.round(v * 100) / 100;
  return [
    `M${n(cx)} ${n(cy - r)}`,
    `Q${n(cx + k)} ${n(cy - k)} ${n(cx + r)} ${n(cy)}`,
    `Q${n(cx + k)} ${n(cy + k)} ${n(cx)} ${n(cy + r)}`,
    `Q${n(cx - k)} ${n(cy + k)} ${n(cx - r)} ${n(cy)}`,
    // The closing quad needs its END POINT (back to the top of the star) before
    // `Z`. Without it react-native-svg's native parser throws InvalidNumber
    // inside the mounting transaction and takes the whole app down — a red box
    // with no component stack (see scripts/check-svg-paths.mjs).
    `Q${n(cx - k)} ${n(cy - k)} ${n(cx)} ${n(cy - r)}`,
    'Z',
  ].join(' ');
}

// Composition inside a 44-unit box: a large sparkle low-right, a small one up-left
// — the same two-star arrangement the 3D asset had, so the band's balance is unchanged.
const BIG = { d: sparkle(25.5, 25, 16.5), cx: 25.5, cy: 25, r: 16.5 };
const SMALL = { d: sparkle(11, 12, 8), cx: 11, cy: 12, r: 8 };

type Star = typeof BIG;

/** One glass star: six layers, all clipped to its silhouette. */
function GlassStar({ star, id, glossOpacity }: { star: Star; id: string; glossOpacity: number }) {
  const { d, cx, cy, r } = star;
  return (
    <>
      <Defs>
        <ClipPath id={`clip-${id}`}>
          <Path d={d} />
        </ClipPath>
        {/* The ramp runs along the star's own axis (±0.42r × ±0.92r), NOT the
            bounding box diagonal: a four-point star doesn't reach its box's
            corners, so corner-to-corner stops land in empty space and the purple
            end never shows. */}
        <LinearGradient
          id={`body-${id}`}
          x1={cx - r * 0.42}
          y1={cy - r * 0.92}
          x2={cx + r * 0.42}
          y2={cy + r * 0.92}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={color.aura.aiIce} />
          <Stop offset="0.14" stopColor={color.aura.aiAzure} />
          <Stop offset="0.52" stopColor={color.aura.aiCobalt3d} />
          <Stop offset="1" stopColor={color.aura.aiNavy} />
        </LinearGradient>
        <LinearGradient
          id={`depth-${id}`}
          x1={cx}
          y1={cy}
          x2={cx + r * 0.8}
          y2={cy + r}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={color.aura.aiGlassCore0} />
          <Stop offset="1" stopColor={color.aura.aiGlassDepth} />
        </LinearGradient>
        <LinearGradient
          id={`gloss-${id}`}
          x1={cx - r * 0.7}
          y1={cy - r}
          x2={cx + r * 0.1}
          y2={cy + r * 0.15}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={color.aura.aiGlassRim} />
          <Stop offset="0.45" stopColor={color.aura.aiGlassCore0} />
        </LinearGradient>
        <RadialGradient id={`spec-${id}`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color.aura.aiGlassCore} />
          <Stop offset="0.5" stopColor={color.aura.aiGlassSpecMid} />
          <Stop offset="1" stopColor={color.aura.aiGlassCore0} />
        </RadialGradient>
        {/* Rim brightest where the light hits, fading round to the unlit side. */}
        <LinearGradient
          id={`rim-${id}`}
          x1={cx - r * 0.4}
          y1={cy - r * 0.9}
          x2={cx + r * 0.4}
          y2={cy + r * 0.9}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset="0" stopColor={color.aura.aiGlassRimBlue} />
          <Stop offset="1" stopColor={color.aura.aiGlassRim0} />
        </LinearGradient>
      </Defs>

      {/* 1 — contact shade, down-right of the top-left light */}
      <Path d={d} fill={color.aura.aiGlassShade} opacity={0.5} translateX={0.8} translateY={1.6} />

      <G clipPath={`url(#clip-${id})`}>
        {/* 2a — opaque cobalt base UNDER the ramp. A gradient `url(#…)` that fails
            to resolve (some RN-Web/native combinations) falls back to no paint,
            which is how this mark ended up reading as a white silhouette on the
            band's pale field. A solid brand blue underneath means the worst case
            is a flat blue star, never an invisible one. */}
        <Path d={d} fill={color.aura.aiCobalt3d} />
        {/* 2b — glass body */}
        <Path d={d} fill={`url(#body-${id})`} />
        {/* 3 — far-face depth */}
        <Rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill={`url(#depth-${id})`} />
        {/* 4 — gloss off the top-left corner */}
        <Path d={d} fill={`url(#gloss-${id})`} opacity={glossOpacity} />
        {/* 5 — specular hot spot, tilted along the light diagonal */}
        <Ellipse
          cx={cx - r * 0.28}
          cy={cy - r * 0.32}
          rx={r * 0.24}
          ry={r * 0.12}
          fill={`url(#spec-${id})`}
          opacity={0.92}
          transform={`rotate(-38 ${cx - r * 0.28} ${cy - r * 0.32})`}
        />
      </G>

      {/* 6 — lit rim, last so the clip can't soften it */}
      <Path d={d} fill="none" stroke={`url(#rim-${id})`} strokeWidth={r * 0.06} />
    </>
  );
}

export function AiMark({ size = 44 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" accessibilityRole="image">
      <GlassStar star={BIG} id="b" glossOpacity={0.3} />
      <GlassStar star={SMALL} id="s" glossOpacity={0.35} />
    </Svg>
  );
}
