/**
 * timelineIcons — the three gradient glyphs on the hero's Cashback Timelines strip,
 * as react-native-svg.
 *
 * Source: Figma "Store Page V2.0 — Deliverable" (`XgdQOrfPsC6HNv24uS9jgN`),
 * node 1716:76773 "Frame 1686562334" — the strip's three 26×26 icon frames
 * (1716:76777 Tracks In · 1716:76786 Confirms in · 1716:76795 Withdraw). Every
 * `d` below is the **exported asset's own path data**, copied byte-for-byte out of
 * the SVGs `download_assets` returned; the files are kept at `assets/timeline/` as
 * the provenance record. Nothing here is redrawn or approximated.
 *
 * Inlined as components rather than `require()`d for the same reason as
 * `couponAssets.tsx`: this project has no metro SVG transformer, so an `.svg`
 * import would not resolve.
 *
 * | component          | Figma node   | meaning                  | ramp                       |
 * |--------------------|--------------|--------------------------|----------------------------|
 * | `TracksInIcon`     | 1716:76777   | clock — waiting to track | amber  `timeline.tracks*`  |
 * | `ConfirmsInIcon`   | 1716:76786   | check — confirmed        | sky    `timeline.confirms*`|
 * | `WithdrawIcon`     | 1716:76795   | bank + ₹ — money out     | mint   `timeline.withdraw*`|
 *
 * Two things in the export are deliberately dropped: the wrapper `<g>`'s
 * `mix-blend-mode: plus-darker` (no react-native-svg equivalent, and these are
 * opaque fills on a white cell, where it is a no-op), and `preserveAspectRatio="none"`
 * (the icons are always drawn square).
 */
import React, { useId } from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { color } from '../theme/tokens';

/** Every glyph is authored on the same 26×26 canvas Figma exported. */
export const TIMELINE_ICON_SIZE = 26;

type IconProps = { size?: number };

/** Shared shell: one path, one vertical ramp, a per-instance gradient id.
 *  Gradient ids share ONE namespace across every SVG on the page, so a literal id
 *  would make the second cell's glyph resolve to the first cell's ramp (the bug
 *  `couponAssets.StubNotch` documents). `useId` per instance; colons stripped
 *  because they are not valid inside a `url()` reference. */
function GradientGlyph({
  d,
  from,
  to,
  y1,
  y2,
  size = TIMELINE_ICON_SIZE,
}: {
  d: string;
  from: string;
  to: string;
  y1: number;
  y2: number;
  size?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const gid = `tl-${uid}`;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${TIMELINE_ICON_SIZE} ${TIMELINE_ICON_SIZE}`}>
      <Defs>
        {/* userSpaceOnUse with the export's own y stops — the ramp spans the glyph's
            drawn extent, not the 26px box, so it must not be normalised. */}
        <LinearGradient id={gid} x1={0} y1={y1} x2={0} y2={y2} gradientUnits="userSpaceOnUse">
          <Stop stopColor={from} />
          <Stop offset={1} stopColor={to} />
        </LinearGradient>
      </Defs>
      <Path d={d} fill={`url(#${gid})`} />
    </Svg>
  );
}

const TRACKS_D =
  'M8.5396 14.2323H12.9904C13.214 14.2323 13.4013 14.1567 13.5524 14.0057C13.7035 13.8546 13.779 13.6672 13.779 13.4436V7.64219C13.779 7.4186 13.7035 7.23126 13.5524 7.08018C13.4013 6.9291 13.214 6.85356 12.9904 6.85356C12.7728 6.85356 12.5885 6.9291 12.4375 7.08018C12.2864 7.23126 12.2108 7.4186 12.2108 7.64219V12.6641H8.5396C8.31601 12.6641 8.12565 12.7396 7.96853 12.8907C7.81745 13.0418 7.74191 13.2261 7.74191 13.4436C7.74191 13.6672 7.81745 13.8546 7.96853 14.0057C8.12565 14.1567 8.31601 14.2323 8.5396 14.2323ZM12.9995 22.454C11.6941 22.454 10.4704 22.2062 9.32824 21.7107C8.18608 21.2212 7.17989 20.5413 6.30967 19.6711C5.4455 18.807 4.76866 17.8068 4.27917 16.6707C3.78967 15.5285 3.54492 14.3048 3.54492 12.9995C3.54492 11.6941 3.78967 10.4704 4.27917 9.32824C4.76866 8.18608 5.4455 7.18291 6.30967 6.31874C7.17989 5.44852 8.18608 4.76866 9.32824 4.27917C10.4704 3.78967 11.6941 3.54492 12.9995 3.54492C14.3048 3.54492 15.5285 3.78967 16.6707 4.27917C17.8129 4.76866 18.816 5.44852 19.6802 6.31874C20.5444 7.18291 21.2212 8.18608 21.7107 9.32824C22.2062 10.4704 22.454 11.6941 22.454 12.9995C22.454 14.3048 22.2062 15.5285 21.7107 16.6707C21.2212 17.8068 20.5444 18.807 19.6802 19.6711C18.816 20.5413 17.8129 21.2212 16.6707 21.7107C15.5285 22.2062 14.3048 22.454 12.9995 22.454Z';

const CONFIRMS_D =
  'M12.9995 22.454C11.6941 22.454 10.4704 22.2062 9.32824 21.7107C8.18608 21.2212 7.17989 20.5413 6.30967 19.6711C5.4455 18.807 4.76866 17.8068 4.27917 16.6707C3.78967 15.5285 3.54492 14.3048 3.54492 12.9995C3.54492 11.6941 3.78967 10.4704 4.27917 9.32824C4.76866 8.18608 5.4455 7.18291 6.30967 6.31874C7.17989 5.44852 8.18608 4.76866 9.32824 4.27917C10.4704 3.78967 11.6941 3.54492 12.9995 3.54492C14.3048 3.54492 15.5285 3.78967 16.6707 4.27917C17.8129 4.76866 18.816 5.44852 19.6802 6.31874C20.5444 7.18291 21.2212 8.18608 21.7107 9.32824C22.2062 10.4704 22.454 11.6941 22.454 12.9995C22.454 14.3048 22.2062 15.5285 21.7107 16.6707C21.2212 17.8068 20.5444 18.807 19.6802 19.6711C18.816 20.5413 17.8129 21.2212 16.6707 21.7107C15.5285 22.2062 14.3048 22.454 12.9995 22.454ZM11.9933 17.4956C12.1746 17.4956 12.3408 17.4533 12.4918 17.3687C12.649 17.278 12.7819 17.1541 12.8907 16.997L17.1239 10.4523C17.1904 10.3495 17.2448 10.2408 17.2871 10.1259C17.3354 10.0111 17.3596 9.8963 17.3596 9.78148C17.3596 9.52766 17.2629 9.3222 17.0695 9.16507C16.8822 9.00795 16.6677 8.92939 16.4259 8.92939C16.1057 8.92939 15.8367 9.10162 15.6192 9.44608L11.9661 15.2838L10.2891 13.1808C10.1682 13.0297 10.0474 12.9239 9.92651 12.8635C9.80565 12.797 9.66968 12.7638 9.5186 12.7638C9.26479 12.7638 9.05025 12.8544 8.875 13.0357C8.69975 13.211 8.61212 13.4255 8.61212 13.6793C8.61212 13.8002 8.63327 13.918 8.67558 14.0328C8.72392 14.1416 8.7904 14.2534 8.875 14.3682L11.0596 16.997C11.1926 17.1662 11.3346 17.2931 11.4857 17.3777C11.6367 17.4563 11.8059 17.4956 11.9933 17.4956Z';

const WITHDRAW_D =
  'M5.9582 21.3214L5.87456 9.73225H5.19519C4.9256 9.73225 4.71532 9.64821 4.56435 9.48013C4.41338 9.30644 4.33789 9.11595 4.33789 8.90865C4.33789 8.5893 4.51043 8.32877 4.8555 8.12708L11.9565 3.86623C12.307 3.65333 12.6682 3.54688 13.0403 3.54688C13.4069 3.54688 13.7682 3.65333 14.124 3.86623L21.2251 8.12708C21.5701 8.33438 21.7427 8.5949 21.7427 8.90865C21.7427 9.11595 21.6672 9.30644 21.5162 9.48013C21.3652 9.64821 21.1577 9.73225 20.8935 9.73225H20.206L20.0415 21.3214H5.9582ZM5.42122 22.456C5.20555 22.456 5.01953 22.3747 4.86317 22.2123C4.70681 22.0498 4.62863 21.8565 4.62863 21.6324C4.62863 21.4027 4.70681 21.2066 4.86317 21.0441C5.01953 20.8816 5.20555 20.8004 5.42122 20.8004H20.5704C20.786 20.8004 20.9721 20.8816 21.1284 21.0441C21.2902 21.2066 21.3711 21.4027 21.3711 21.6324C21.3711 21.8565 21.2902 22.0498 21.1284 22.2123C20.9721 22.3747 20.786 22.456 20.5704 22.456H5.42122ZM12.4256 14.6066C12.8623 14.5898 13.2506 14.4945 13.5902 14.3209C13.9353 14.1416 14.213 13.8979 14.4233 13.5897C14.639 13.2816 14.7711 12.9258 14.8196 12.5224H15.5717C15.7443 12.5224 15.8305 12.4355 15.8305 12.2619C15.8305 12.0826 15.7443 11.9929 15.5717 11.9929H14.8277C14.8061 11.6792 14.7333 11.3878 14.6093 11.1189C14.4853 10.8444 14.302 10.6147 14.0593 10.4298H15.5717C15.6472 10.4298 15.7092 10.4046 15.7578 10.3541C15.8063 10.3037 15.8305 10.2393 15.8305 10.1609C15.8305 9.98157 15.7443 9.89193 15.5717 9.89193H10.7029C10.5681 9.89193 10.4576 9.93675 10.3713 10.0264C10.2905 10.1104 10.25 10.2281 10.25 10.3794V10.4214C10.25 10.5614 10.2905 10.6763 10.3713 10.7659C10.4576 10.8556 10.5681 10.9004 10.7029 10.9004H11.9808C12.3636 10.9004 12.6979 10.9845 12.9837 11.1525C13.2694 11.3206 13.442 11.6007 13.5013 11.9929H10.5654C10.49 11.9929 10.4279 12.0181 10.3794 12.0686C10.3309 12.119 10.3066 12.1834 10.3066 12.2619C10.3066 12.3291 10.3309 12.3907 10.3794 12.4468C10.4279 12.4972 10.49 12.5224 10.5654 12.5224H13.5013C13.4474 12.9258 13.2802 13.2087 12.9998 13.3712C12.7195 13.5337 12.3798 13.6149 11.9808 13.6149H10.897C10.7191 13.6149 10.5681 13.6653 10.4441 13.7662C10.3255 13.867 10.2662 14.0099 10.2662 14.1948V14.2368C10.2662 14.3825 10.2985 14.5085 10.3632 14.615C10.4333 14.7158 10.525 14.8223 10.6382 14.9344L13.2263 17.4892C13.3072 17.5732 13.3907 17.6461 13.477 17.7077C13.5633 17.7693 13.6711 17.8001 13.8005 17.8001C13.9623 17.8001 14.1052 17.7385 14.2292 17.6152C14.3532 17.492 14.4152 17.3463 14.4152 17.1782C14.4152 17.083 14.3909 16.9933 14.3424 16.9093C14.2993 16.8197 14.24 16.7412 14.1645 16.674L12.0617 14.615L12.4256 14.6066Z';

/** Clock — "Tracks In". Figma 1716:76777. */
export function TracksInIcon({ size }: IconProps) {
  return (
    <GradientGlyph
      d={TRACKS_D}
      from={color.timeline.tracksFrom}
      to={color.timeline.tracksTo}
      y1={3.54492}
      y2={22.454}
      size={size}
    />
  );
}

/** Circle-check — "Confirms in". Figma 1716:76786. */
export function ConfirmsInIcon({ size }: IconProps) {
  return (
    <GradientGlyph
      d={CONFIRMS_D}
      from={color.timeline.confirmsFrom}
      to={color.timeline.confirmsTo}
      y1={3.54492}
      y2={22.454}
      size={size}
    />
  );
}

/** Bank with a ₹ — "Withdraw". Figma 1716:76795. */
export function WithdrawIcon({ size }: IconProps) {
  return (
    <GradientGlyph
      d={WITHDRAW_D}
      from={color.timeline.withdrawFrom}
      to={color.timeline.withdrawTo}
      y1={3.54687}
      y2={22.456}
      size={size}
    />
  );
}

/** Cell label → its glyph, so `TimelineCell` stays data-driven. */
export const TIMELINE_ICON = {
  tracksIn: TracksInIcon,
  confirmsIn: ConfirmsInIcon,
  withdraw: WithdrawIcon,
} as const;

export type TimelineIconKey = keyof typeof TIMELINE_ICON;
