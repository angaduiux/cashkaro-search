/**
 * "Aura" — the flowing-gradient engine behind the AI surfaces (Expand Search).
 *
 * Built the way this would be done natively on iOS rather than the way it is
 * usually done on the web:
 *
 * • ONE display-linked clock (`useFrameCallback` ≈ CADisplayLink) drives every
 *   layer on the UI thread. No JS-thread work per frame, so it holds 120 Hz on
 *   ProMotion and never stutters while the list above it scrolls.
 * • Motion is sampled from that clock with sin/cos at INTEGER harmonics of one
 *   master loop, so each layer travels a Lissajous path — organic, never a
 *   visible back-and-forth — and the whole composite is seamless when the clock
 *   wraps. Nothing "restarts".
 * • Softness comes from real radial gradients drawn by the platform
 *   (CAGradientLayer-class work), NOT from a blur filter. RN only wires
 *   `filter: blur()` through to iOS behind an off-by-default SwiftUI feature
 *   flag, so the old web-only `filter` produced hard-edged circles on device;
 *   and an offscreen blur pass per frame is exactly what drops frames. The blur
 *   *look* comes from SOFT_RAMP below — an eight-stop alpha falloff shaped like
 *   the one a gaussian would leave, which is why the orbs have no visible edge.
 * • Every gradient falls off to a ZERO-ALPHA STOP OF ITS OWN HUE, never to
 *   `transparent` — fading to transparent interpolates through grey and leaves
 *   a dirty ring at the edge of the glow.
 */
import React, { useEffect } from 'react';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { color, AI_FLOW_HUES, AI_ORB_HUES, AI_ORB_SIZE } from '../theme/tokens';

/**
 * Master loop (ms). Every harmonic below is an integer, so the wrap is seamless.
 * 16s rather than 24s: at 24 the field drifted so slowly it read as a static
 * gradient unless you stared at it.
 */
export const AURA_LOOP = 16000;
const TAU = Math.PI * 2;
/** Cap the frame delta so returning from background doesn't teleport the field. */
const MAX_FRAME_MS = 64;

export type AuraClock = {
  /** Milliseconds into the master loop, wrapped to [0, AURA_LOOP). */
  t: SharedValue<number>;
  /** Playback rate. Push toward ~2 to make the surface visibly "think". */
  rate: SharedValue<number>;
};

/**
 * The single clock. Returns shared values only — changing `rate` retimes every
 * layer at once, mid-flight, with no seam (nothing is keyframed to a duration).
 * Under reduced motion the clock never starts and every layer renders its t=0
 * pose, which is composed to look correct standing still.
 */
export function useAuraClock(active = true): AuraClock {
  const t = useSharedValue(0);
  const rate = useSharedValue(1);
  const reduced = useReducedMotion();
  const running = active && !reduced;

  const frame = useFrameCallback((info) => {
    'worklet';
    const dt = Math.min(info.timeSincePreviousFrame ?? 0, MAX_FRAME_MS);
    t.value = (t.value + dt * rate.value) % AURA_LOOP;
  }, false);

  useEffect(() => {
    frame.setActive(running);
    return () => frame.setActive(false);
    // `frame` is a fresh object each render; keying on it would restart the
    // clock every render. `running` is the only real input.
  }, [running]);

  return { t, rate };
}

type Stop = readonly [color: string, position: string];
type FillOpts = {
  /** 'circle' keeps the falloff even in a square box; 'ellipse' fills the box. */
  shape?: 'circle' | 'ellipse';
  /**
   * 'closest-side' lands the last stop on the nearest edge; 'farthest-side' on
   * the far one. `{ x, y }` sets the ellipse's own radii (% of the box, or px) —
   * needed whenever the light is NOT centred, since both keywords tie the radii
   * to the box's edges and a low centre would then read as a squashed disc.
   */
  size?: 'closest-side' | 'farthest-side' | { x: string; y: string };
  at?: readonly [string, string];
};

/**
 * A radial-gradient fill. Native gets RN 0.86's structured
 * `experimental_backgroundImage` (no string parsing, no guesswork); web gets the
 * equivalent CSS. A `circle` + `closest-side` in a square box puts the last stop
 * exactly on the edge, so the glow never clips.
 */
export function radialFill(stops: readonly Stop[], opts: FillOpts = {}): ViewStyle {
  const shape = opts.shape ?? 'circle';
  const size = opts.size ?? 'closest-side';
  const [left, top] = opts.at ?? ['50%', '50%'];
  if (Platform.OS === 'web') {
    const css = stops.map(([c, p]) => `${c} ${p}`).join(', ');
    // CSS writes explicit radii as two lengths in place of the extent keyword.
    const extent = typeof size === 'string' ? size : `${size.x} ${size.y}`;
    return { backgroundImage: `radial-gradient(${shape} ${extent} at ${left} ${top}, ${css})` } as ViewStyle;
  }
  return {
    experimental_backgroundImage: [
      {
        type: 'radial-gradient',
        shape,
        size,
        position: { left, top },
        colorStops: stops.map(([c, p]) => ({ color: c, positions: [p] })),
      },
    ],
  };
}

/**
 * A gaussian-ish falloff in seven stops.
 *
 * A gradient's edge is visible whenever alpha falls off linearly — the eye finds
 * the point where the ramp stops. These stops front-load the alpha and leave a
 * long, flattening tail that reaches zero well inside the box, so there is no
 * boundary to find: the orb reads as blurred rather than as a disc. Nothing here
 * is a blur *filter* — this is the shape a blur would have produced.
 */
const SOFT_RAMP: readonly [alpha: number, at: string][] = [
  [1, '0%'],
  [0.82, '16%'],
  [0.52, '34%'],
  [0.26, '52%'],
  [0.1, '68%'],
  [0.02, '82%'],
  [0, '92%'],
  [0, '100%'],
];

const orbStops = (rgb: readonly [number, number, number], peak: number): Stop[] =>
  SOFT_RAMP.map(([a, at]) => [`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${+(a * peak).toFixed(3)})`, at] as Stop);

/**
 * One soft orb fill from a hex hue at an explicit peak alpha — the same
 * edgeless falloff the AI field uses, exposed so other surfaces (the voice
 * sheet's blob orb) build their gradients from this ramp rather than
 * re-deriving one that would feather differently.
 */
export function softOrbFill(hex: string, peak: number): ViewStyle {
  return radialFill(orbStops(parseHex(hex) ?? [124, 58, 237], peak));
}

/**
 * Peak alpha per orb. Five soft orbs overlap, so each one stays low — the
 * richness comes from where they cross, not from any single orb's density.
 */
const ORB_PEAKS = [0.34, 0.3, 0.26, 0.24, 0.2] as const;

/** The AI set — violet, orchid, magenta, aqua, cobalt (see AI_ORB_HUES). */
const AI_FILLS: ViewStyle[] = AI_ORB_HUES.map((hue, i) => {
  const rgb = parseHex(hue) ?? [124, 58, 237];
  return radialFill(orbStops(rgb, ORB_PEAKS[i % ORB_PEAKS.length]));
});

/**
 * `rgba()` from a `#rgb` / `#rrggbb` / `#rrggbbaa` hex at an explicit alpha —
 * any alpha already in the hex is ignored, since the orb sets its own. Returns
 * null for anything that isn't hex, so callers can fall back rather than feed a
 * bad colour into a gradient stop.
 */
function parseHex(hex: string | null | undefined): [number, number, number] | null {
  if (!hex || hex[0] !== '#') return null;
  const h = hex.slice(1);
  const short = h.length === 3 || h.length === 4;
  if (!short && h.length !== 6 && h.length !== 8) return null;
  const out: number[] = [];
  for (let i = 0; i < 3; i++) {
    const n = parseInt(short ? h[i].repeat(2) : h.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(n)) return null;
    out.push(n);
  }
  return [out[0], out[1], out[2]];
}

export function tintRgba(hex: string | null | undefined, alpha: number): string | null {
  const rgb = parseHex(hex);
  return rgb ? `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})` : null;
}

/** Chroma the deepened hue aims for — mid-strength: reads as colour, not as ink. */
const TARGET_CHROMA = 120;
/**
 * Below this saturation (chroma ÷ brightest channel) a tint has no colour to
 * amplify — it is grey, black or white. Judged relative, not absolute: a pastel
 * like Nykaa's `#fce7f0` carries only 21/255 of chroma but is unmistakably pink,
 * while `#262626` carries none at any brightness.
 */
const GREY_SAT = 0.06;
/**
 * And below this brightness even a chromatic tint is too inky to glow with — The
 * Body Shop's `#004236` is a real green, but a glow that dark reads as a stain.
 */
const DARK_MAX = 96;

/**
 * The brand tint, pushed to a usable chroma — or replaced with sky blue when it
 * has no usable colour at all.
 *
 * Two jobs. Pale tints (`#fff8e1`, `#e8f3ec`) get their distance from white
 * amplified, because an orb painted in the tint itself is invisible against the
 * wash it sits on; already-saturated ones get eased back. And **achromatic or
 * near-black tints are swapped for sky, never amplified** — Nike, AJIO, Puma and
 * friends are all `#262626` at low alpha, and amplifying nothing leaves a grey
 * cloud, which reads as dirt on the card rather than as light.
 */
const SKY: [number, number, number] = parseHex(color.aura.aiSky) ?? [56, 189, 248];

function deepenTint(hex: string | null | undefined): [number, number, number] | null {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const hi = Math.max(...rgb);
  const chroma = hi - Math.min(...rgb);
  if (hi === 0 || chroma / hi < GREY_SAT || hi < DARK_MAX) return SKY;
  const k = Math.min(5, TARGET_CHROMA / chroma);
  return rgb.map((c) => Math.max(0, Math.round(hi - (hi - c) * k))) as [number, number, number];
}

/**
 * True when a tint has no colour of its own, so the surface painting it should use
 * the sky fallback for its wash too — otherwise a sky-blue glow would sit on a
 * grey wash and read as two unrelated things.
 */
export function isColourlessTint(hex: string | null | undefined): boolean {
  const rgb = parseHex(hex);
  if (!rgb) return false;
  const hi = Math.max(...rgb);
  return hi === 0 || (hi - Math.min(...rgb)) / hi < GREY_SAT || hi < DARK_MAX;
}

/** The wash colour a surface should paint for `tint`: itself, or pale sky. */
export function auraWashTint(hex: string | null | undefined): string {
  return isColourlessTint(hex) ? color.aura.aiSkyWash : (hex ?? color.aura.aiSkyWash);
}

/**
 * A single STATIC glow, centred in its box — colour without motion, for surfaces
 * that sit behind content (the deals rail) where drift would pull the eye.
 *
 * The ramp is compressed into the inner `REACH` of the box and closed with a
 * zero-alpha stop at the edge, so the glow is already fully transparent before
 * any boundary: it cannot be clipped from the top or bottom no matter how short
 * the section is, and no `overflow` setting can cut it.
 *
 * `peak` is deliberately near-opaque. Whatever sits in front (a deal banner is a
 * PNG with its own baked white ground) hides the bright middle, so the only part
 * that ever reaches the eye is the outer half of the ramp — at a "tasteful" peak
 * that lands somewhere around 5% alpha and reads as nothing at all.
 */
// Raised from 0.78: with the ramp compressed that tightly, the only alpha left in the
// band that actually shows past a deal banner was ~5%, which read as nothing at all.
// 0.92 still closes on a zero-alpha stop at 100%, so the no-clipping guarantee holds.
const GLOW_REACH = 0.92;

export function centredGlowFill(tint?: string | null, peak = 0.95): ViewStyle {
  const rgb = deepenTint(tint) ?? [124, 58, 237];
  const rgba = (a: number) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${+(a * peak).toFixed(3)})`;
  const stops: Stop[] = SOFT_RAMP.map(([a, at]) => {
    const pct = parseFloat(at) * GLOW_REACH;
    return [rgba(a), `${+pct.toFixed(1)}%`] as Stop;
  });
  return radialFill([...stops, [rgba(0), '100%']], { shape: 'ellipse', size: 'farthest-side' });
}

/**
 * A wide, LOW bloom — one light source sitting near the bottom of its box, so
 * the colour rises into the content from under it instead of sitting behind it.
 *
 * The radii are explicit (`spread` × `rise`, % of the box) because the centre is
 * off-centre: `farthest-side` would tie both radii to the box edges and paint a
 * squashed disc around a low centre. `spread` is deliberately the larger of the
 * two — a light that is wider than it is tall reads as a horizon, and a round one
 * at this position reads as a spotlight aimed at the pagination.
 *
 * `peak` is LOW, the opposite call to `centredGlowFill`'s: nothing covers this
 * bloom's core (it lives in the open whitespace under the artwork, not behind
 * it), so every bit of the ramp reaches the eye. The near-opaque peak a
 * hidden core needs (D036) would read here as a stain on the page.
 *
 * Unlike `centredGlowFill` this one does NOT self-guarantee against clipping:
 * a low centre puts part of the ramp past the bottom edge by construction. The
 * caller owns that edge — dissolve it into the page (see `dealGlow`'s fade in
 * ResultCards).
 */
export function bottomBloomFill(
  tint?: string | null,
  // Measured on the built page, not guessed (D014): a 100%-of-box horizontal radius
  // carries the light past both screen edges, and 24% vertical lands its zero
  // inside the whitespace under the artwork — so the only part of the ramp the
  // artwork hides is the top half, and the bottom reaches nothing before the page
  // does. 0.36 peaks at ~32% alpha where the light clears the banner: a wash you
  // can see the colour of, ~10% by the screen edges.
  { peak = 0.36, spread = '100%', rise = '24%', centre = '84%' }: { peak?: number; spread?: string; rise?: string; centre?: string } = {},
): ViewStyle {
  const rgb = deepenTint(tint) ?? [124, 58, 237];
  return radialFill(orbStops(rgb, peak), { shape: 'ellipse', size: { x: spread, y: rise }, at: ['50%', centre] });
}

/**
 * Hue arcs that read as ONE temperature. A companion hue is always rotated
 * *inside* the arc its brand hue falls in, so a warm brand gains a warm second
 * colour (Cleartrip's orange → amber) and a cool one a cool second colour
 * (sky → indigo). Rotating across an arc boundary is what would put a cold
 * highlight in a warm field, which reads as two unrelated lights.
 */
const HUE_FAMILIES: readonly (readonly [from: number, to: number])[] = [
  [340, 62], // warm — crimson → red → orange → yellow (wraps through 0)
  [62, 168], // green — lime → emerald → teal
  [168, 268], // cool — cyan → azure → blue → indigo
  [268, 340], // violet → orchid → magenta
];
/** Degrees between the two hues: a neighbour you can tell apart, not a contrast. */
const COMPANION_SHIFT = 34;
/** Least rotation that still reads as a second colour rather than a brightness. */
const COMPANION_MIN = 16;
/**
 * Room needed to rotate clockwise; with less, rotate the other way. A yellow
 * brand's companion is orange, not chartreuse — 8° short of its arc's end would
 * leave the family, which is the one thing this must not do.
 */
const COMPANION_ROOM = 24;
/** Which of the five orbs carry the second hue — spread, so every crossing mixes. */
const COMPANION_ORBS = [1, 3];

/**
 * Peak alpha per orb in the WHITE fan. Higher than a coloured field needs: these
 * separate from the wash on lightness alone, and white over an already-pale tint
 * is a small delta per unit alpha.
 */
const FAN_PEAKS = [0.85, 0.76, 0.66, 0.58, 0.5] as const;
/**
 * How much of the brand hue is left in each "white" — a breath of it, not its
 * colour, so the pools still belong to the page instead of reading as five grey
 * smudges. Paired with `FAN_LIGHTS`, near the top of the lightness range.
 */
const FAN_SATS = [0.1, 0.04, 0.16, 0, 0.08] as const;
const FAN_LIGHTS = [0.97, 0.99, 0.95, 1, 0.96] as const;

/**
 * Five BRIGHT, near-white orbs carrying a breath of the brand hue (D079).
 *
 * Colour-on-colour was the wrong idea: the orbs share the wash's hue by
 * construction (D060), so on a brand like Myntra they matched the field in hue
 * AND lightness and vanished (D078). White inverts the problem — a light pool
 * separates from ANY tinted wash, whatever hue the brand brings, and it lifts the
 * field instead of adding more of the colour the page already has.
 */
export function brandOrbFan(tint?: string | null): ViewStyle[] {
  const rgb = deepenTint(tint);
  const [h] = rgb ? rgbToHsl(rgb) : [0];
  return FAN_PEAKS.map((peak, i) =>
    radialFill(orbStops(hslToRgb(h, FAN_SATS[i], FAN_LIGHTS[i]), peak)),
  );
}

/** Clockwise distance a → b, in degrees. */
const cw = (a: number, b: number) => (b - a + 360) % 360;

function rgbToHsl([r, g, b]: readonly [number, number, number]): [h: number, s: number, l: number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const hi = Math.max(rn, gn, bn);
  const lo = Math.min(rn, gn, bn);
  const l = (hi + lo) / 2;
  const d = hi - lo;
  if (d === 0) return [0, 0, l];
  const s = l > 0.5 ? d / (2 - hi - lo) : d / (hi + lo);
  const h = hi === rn ? ((gn - bn) / d + (gn < bn ? 6 : 0)) : hi === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const [r1, g1, b1] =
    hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
}

/**
 * The brand hue's neighbour, same temperature: rotate clockwise inside the hue's
 * own family (orange → yellow, azure → indigo), or anticlockwise when the hue
 * already sits at that end of its arc (a yellow brand rotates back to orange).
 * Lightness lifts a touch so the second orb reads as light crossing the field
 * rather than as a second stain of the same weight.
 */
function companionRgb(rgb: readonly [number, number, number]): [number, number, number] {
  const [h, s, l] = rgbToHsl(rgb);
  const arc = HUE_FAMILIES.find(([from, to]) => cw(from, h) < cw(from, to)) ?? HUE_FAMILIES[0];
  const up = cw(h, arc[1]);
  const down = cw(arc[0], h);
  const dir = up >= COMPANION_ROOM ? 1 : -1;
  const room = dir > 0 ? up : down;
  const shift = Math.min(COMPANION_SHIFT, Math.max(COMPANION_MIN, room - 4));
  return hslToRgb(h + dir * shift, s, Math.min(0.78, l + 0.05));
}

/**
 * Five orb fills in TWO hues — the brand tint and its same-temperature neighbour
 * from `companionRgb` — differing again in alpha. The geometry below gives each
 * orb its own path, so the pair reads as one brand-coloured mist that shifts hue
 * where the orbs cross (Cleartrip: orange through amber), which one hue at five
 * alphas could only do in brightness. The companion carries slightly less alpha,
 * so the brand colour still leads. Falls back to the AI set when the brand tint
 * isn't a hex we can read.
 */
export function brandOrbFills(tint?: string | null): ViewStyle[] {
  const rgb = deepenTint(tint);
  if (!rgb) return AI_FILLS;
  const companion = companionRgb(rgb);
  // A two-hue brand field still carries more alpha than the five-hue AI field
  // without turning muddy — the hues are neighbours, so their overlaps blend.
  return ORB_PEAKS.map((peak, i) => {
    const second = COMPANION_ORBS.includes(i);
    return radialFill(orbStops(second ? companion : rgb, Math.min(1, peak * (second ? 1.2 : 1.35))));
  });
}

/**
 * One orb's path. `kx`/`ky`/`ks` are integer harmonics of the master loop and
 * `phase` offsets it within the loop, so three orbs from the same clock never
 * line up into an obvious rhythm.
 */
export type OrbSpec = {
  pos: ViewStyle;
  kx: number;
  ky: number;
  ks: number;
  phase: number;
  ax: number;
  ay: number;
};

/**
 * Five orbs, each on its own harmonic pair so they cross rather than drift in
 * parallel — the crossings are where the hue mixing happens, and they are the
 * whole effect. Centres sit outside the frame so the soft middle of the field
 * stays light enough to read text on. Amplitudes are large: with a falloff this
 * gentle, small travel is invisible.
 */
const ORBS: OrbSpec[] = [
  { pos: { left: -AI_ORB_SIZE * 0.34, top: -AI_ORB_SIZE * 0.4 }, kx: 2, ky: 3, ks: 2, phase: 0, ax: 74, ay: 46 },
  { pos: { right: -AI_ORB_SIZE * 0.3, top: -AI_ORB_SIZE * 0.34 }, kx: 3, ky: 2, ks: 4, phase: 0.37, ax: 64, ay: 52 },
  { pos: { left: AI_ORB_SIZE * 0.1, bottom: -AI_ORB_SIZE * 0.56 }, kx: 2, ky: 4, ks: 3, phase: 0.68, ax: 82, ay: 40 },
  { pos: { right: -AI_ORB_SIZE * 0.36, bottom: -AI_ORB_SIZE * 0.5 }, kx: 4, ky: 3, ks: 2, phase: 0.19, ax: 58, ay: 44 },
  { pos: { left: AI_ORB_SIZE * 0.34, top: -AI_ORB_SIZE * 0.46 }, kx: 3, ky: 4, ks: 5, phase: 0.83, ax: 70, ay: 38 },
];

/**
 * The full-bleed hero's own layout (D080): a CLUSTER low in the scene, centred on
 * the brand logo / cashback figure rather than the shared `ORBS` set, whose five
 * centres sit at the corners of the box. In a 620px-tall scene those corners put
 * two orbs below the fold and the rest up behind the search bar, so the light
 * pooled where there is nothing to light. Anchored from the top on both axes so
 * the cluster keeps its place as the scene's height changes, with smaller
 * amplitudes than the corner set — they drift WITHIN the cluster instead of
 * sweeping the whole field.
 */
export const HERO_ORBS: OrbSpec[] = [
  { pos: { left: -100, top: 30 }, kx: 2, ky: 3, ks: 2, phase: 0, ax: 54, ay: 34 },
  { pos: { right: -100, top: 5 }, kx: 3, ky: 2, ks: 4, phase: 0.37, ax: 48, ay: 38 },
  { pos: { left: 10, top: 140 }, kx: 2, ky: 4, ks: 3, phase: 0.68, ax: 62, ay: 28 },
  { pos: { right: -120, top: 140 }, kx: 4, ky: 3, ks: 2, phase: 0.19, ax: 44, ay: 32 },
  { pos: { left: -50, top: -40 }, kx: 3, ky: 4, ks: 5, phase: 0.83, ax: 52, ay: 26 },
];

function Orb({
  spec,
  fill,
  clock,
  gain,
  amp = 1,
  scale = 1,
}: {
  spec: OrbSpec;
  fill: ViewStyle;
  clock: AuraClock;
  gain: SharedValue<number>;
  amp?: number;
  scale?: number;
}) {
  const style = useAnimatedStyle(() => {
    const u = clock.t.value / AURA_LOOP;
    return {
      // Deeper opacity + scale swing than a "tasteful" ±10% — at that depth the
      // breathing was invisible next to the drift.
      opacity: gain.value * (0.66 + 0.34 * Math.sin(TAU * (spec.ky * u + spec.phase))),
      transform: [
        { translateX: spec.ax * amp * Math.sin(TAU * (spec.kx * u + spec.phase)) },
        { translateY: spec.ay * amp * Math.cos(TAU * (spec.ky * u + spec.phase * 1.7)) },
        { scale: (1 + 0.2 * Math.sin(TAU * (spec.ks * u + spec.phase))) * scale },
      ],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.orb, spec.pos, fill, style]} />;
}

/**
 * The living backdrop: three drifting glow orbs, optionally over the AI wash.
 * Clip it with the parent's `overflow: hidden` + radius.
 *
 * `fills` swaps the palette — pass `brandOrbFills(item.heroTint)` to make the
 * field glow in a store's own colour. `base={false}` when the parent already
 * paints its own wash and only wants the orbs on top of it.
 *
 * `amp` multiplies each orb's travel and `scale` its size — both default to 1,
 * so every existing surface is untouched. A big, sparsely-covered field (the
 * full-bleed hero, D075) needs more of both than a control-sized card: the same
 * ±70px drift that reads as motion inside a 340px card is nearly imperceptible
 * across a 620px one.
 */
export function AuraField({
  clock,
  gain,
  fills = AI_FILLS,
  base = true,
  amp = 1,
  scale = 1,
  specs = ORBS,
}: {
  clock: AuraClock;
  gain: SharedValue<number>;
  fills?: ViewStyle[];
  base?: boolean;
  amp?: number;
  scale?: number;
  /** Orb layout. Defaults to the corner-anchored shared set; the hero passes
   *  `HERO_ORBS` to cluster the light around its logo (D080). */
  specs?: OrbSpec[];
}) {
  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {base && (
        <LinearGradient
          colors={[color.surface, color.aura.aiCardTo]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
        />
      )}
      {specs.map((spec, i) => (
        <Orb key={i} spec={spec} fill={fills[i % fills.length]} clock={clock} gain={gain} amp={amp} scale={scale} />
      ))}
    </Animated.View>
  );
}

/**
 * The flowing hue ramp inside a control.
 *
 * Seam-free by construction: the strip is `SPAN × width` wide and carries the
 * cyclic ramp `REPEATS` times (plus a closing stop), so its pattern period is
 * exactly `SPAN / REPEATS × width` px. Translating by one period lands on a
 * pixel-identical frame — and because `SPAN − SPAN/REPEATS ≥ 1`, the strip still
 * covers the control at both ends of that travel. Nothing resets, ever.
 *
 * 3 / 2 puts two thirds of a cobalt→indigo→violet→orchid sweep across the
 * control at any moment, so the fill reads as travelling in one direction. A
 * period of exactly one width would put matching hues at both ends and read as
 * a symmetric pulse instead.
 */
export function FlowStrip({
  clock,
  width,
  harmonic = 2,
  reverse = false,
  style,
}: {
  clock: AuraClock;
  /** Measured control width (rounded to an integer by the caller). */
  width: number;
  /** Periods travelled per master loop. Integer → seamless. 2 ≈ 12s each. */
  harmonic?: number;
  reverse?: boolean;
  style?: ViewStyle;
}) {
  const period = (width * FLOW_SPAN) / FLOW_REPEATS;
  const anim = useAnimatedStyle(() => {
    const p = ((clock.t.value / AURA_LOOP) * harmonic) % 1;
    return { transform: [{ translateX: reverse ? -period + p * period : -p * period }] };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.stripWrap, anim, style]}>
      <LinearGradient
        colors={FLOW_STOPS}
        locations={FLOW_LOCATIONS}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: width * FLOW_SPAN, height: '100%' }}
      />
    </Animated.View>
  );
}

/** Strip width, as a multiple of the control width. */
const FLOW_SPAN = 3;
/** Ramps painted into that strip. Period = FLOW_SPAN / FLOW_REPEATS widths. */
const FLOW_REPEATS = 2;
// The ramp, FLOW_REPEATS times, closing on the hue it opened with. Evenly
// spaced, so one ramp spans exactly one pattern period.
const FLOW_STOPS = [...AI_FLOW_HUES, ...AI_FLOW_HUES, AI_FLOW_HUES[0]] as [string, string, ...string[]];
const FLOW_LOCATIONS = FLOW_STOPS.map((_, i) => i / (FLOW_STOPS.length - 1)) as [number, number, ...number[]];

/**
 * Specular sweep — a wide, soft ellipse of light that crosses a control and
 * fades at both ends. Replaces the usual hard white slab, which reads as a
 * seam rather than as light.
 */
export function Sweep({
  clock,
  width,
  harmonic = 2,
  style,
}: {
  clock: AuraClock;
  width: number;
  harmonic?: number;
  style?: ViewStyle;
}) {
  const band = Math.max(width * 0.55, 1);
  const anim = useAnimatedStyle(() => {
    const p = ((clock.t.value / AURA_LOOP) * harmonic) % 1;
    // Ease the travel and shape the light so it arrives and leaves, never blinks.
    const eased = p * p * (3 - 2 * p);
    return {
      opacity: Math.sin(Math.PI * p) * 0.9,
      transform: [{ translateX: -band + eased * (width + band) }],
    };
  });
  return <Animated.View pointerEvents="none" style={[styles.sweep, { width: band }, SWEEP_FILL, anim, style]} />;
}

// Ellipse + farthest-side so the light fills the tall band and feathers on
// every edge — a soft column of light rather than a hard-edged slab.
const SWEEP_FILL = radialFill(
  [
    [color.aura.aiSheen, '0%'],
    [color.aura.aiSheen, '18%'],
    [color.aura.aiSheen0, '100%'],
  ],
  { shape: 'ellipse', size: 'farthest-side' },
);

/**
 * A slow rotating light band, clipped by its parent — the gradient mark's
 * "specular highlight orbiting the icon" read, at 1/4 loop speed.
 */
export function Orbit({ clock, size, harmonic = 1 }: { clock: AuraClock; size: number; harmonic?: number }) {
  const anim = useAnimatedStyle(() => {
    const u = (clock.t.value / AURA_LOOP) * harmonic;
    return { transform: [{ rotate: `${u * 360}deg` }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.orbit, { width: size * 2, height: size * 2, left: -size / 2, top: -size / 2 }, anim]}>
      <LinearGradient
        colors={[color.aura.aiSheen0, color.aura.aiSheen, color.aura.aiSheen0]}
        locations={[0.34, 0.5, 0.66]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orb: { position: 'absolute', width: AI_ORB_SIZE, height: AI_ORB_SIZE },
  // Width comes from the child strip (2× the control), so no `right` anchor.
  stripWrap: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  sweep: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  orbit: { position: 'absolute' },
});
