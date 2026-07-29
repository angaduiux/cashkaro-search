/**
 * cardIcons — the credit-card card's exported Figma vectors, as react-native-svg.
 *
 * Source: Figma "Mini App Main" (`9RfW1gNewOnFDsNqaHsRoF`) — the **"Card Icons"
 * component set at 714:32723**, which is the whole set the USP rows draw from, plus
 * the CTA chevron (673:27223) and the fee divider "Line 30" (673:27216) off the card
 * itself (4007:57107). Every path below is the **exported asset's own path data**,
 * copied byte-for-byte out of the SVGs that `get_design_context` returned — nothing
 * is redrawn (D051's rule, D061).
 *
 * The set's variant NAMES are the mapping: a USP row about cashback takes
 * `Cashback`, one about a lounge takes `Lounge`, and so on — `benefitIconFor()`
 * below is that mapping, applied to the row's own words when the data doesn't name
 * an icon outright. `reward` is the fallback, as it is in the spec's cards.
 *
 * Inlined as components rather than `require()`d because this project has no metro
 * SVG transformer, so an `.svg` import wouldn't resolve (same reason as
 * [couponAssets](./couponAssets.tsx)).
 *
 * **Geometry.** Each glyph is an 18px frame with the vector inset 12.5% — a 13.5px
 * drawing whose 1.4px stroke overhangs that box by ~5%. The exported SVG's own
 * coordinates already carry a 0.7 margin for that overhang, so each icon states a
 * NEGATIVE-origin viewBox that lands the drawing where Figma has it inside the 18px
 * frame, instead of scaling the path (which would thin the stroke).
 *
 * | name        | Figma variant | svg box        | viewBox origin | stroke |
 * |-------------|---------------|----------------|----------------|--------|
 * | `reward`    | "reward"      | 14.9 × 14.15   | -1.55 -1.93    | 1.4    |
 * | `food`      | "Food"        | 14.9 × 14.15   | -1.55 -2.30    | 1.4    |
 * | `discounts` | "Discounts"   | 14.9 sq        | -1.55 -1.55    | 1.4    |
 * | `lounge`    | "Lounge"      | 14.9 sq        | -1.55 -1.55    | 1.4    |
 * | `cashback`  | "Cashback"    | 12.75 × 15.75  | -3.75 -1.50    | 1.5    |
 * | `vouchers`  | "Vouchers"    | 14.8 sq        | -1.60 -1.60    | 1.3    |
 * | `fuels`     | "Fuels"       | 14.15 × 13.4   | -1.55 -2.30    | 1.4    |
 */
import React, { useId } from 'react';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { color, CARD_SPEC } from '../theme/tokens';

export type CardIconName = 'reward' | 'food' | 'discounts' | 'lounge' | 'cashback' | 'vouchers' | 'fuels';

type Glyph = { d: string; viewBox: string; stroke: number };

/** Trophy — "4 reward points on every ₹200 spent." */
const REWARD: Glyph = {
  viewBox: '-1.55 -1.93 18 18',
  stroke: 1.4,
  d: 'M4.45 13.45H10.45M7.45 10.45V13.45M7.45 10.45C8.44456 10.45 9.39839 10.0549 10.1017 9.35165C10.8049 8.64839 11.2 7.69456 11.2 6.7V0.7H3.7V6.7C3.7 7.69456 4.09509 8.64839 4.79835 9.35165C5.50161 10.0549 6.45544 10.45 7.45 10.45ZM0.7 4.45C0.7 4.84782 0.858035 5.22936 1.13934 5.51066C1.42064 5.79196 1.80218 5.95 2.2 5.95C2.59782 5.95 2.97936 5.79196 3.26066 5.51066C3.54196 5.22936 3.7 4.84782 3.7 4.45C3.7 4.05218 3.54196 3.67064 3.26066 3.38934C2.97936 3.10804 2.59782 2.95 2.2 2.95C1.80218 2.95 1.42064 3.10804 1.13934 3.38934C0.858035 3.67064 0.7 4.05218 0.7 4.45ZM11.2 4.45C11.2 4.84782 11.358 5.22936 11.6393 5.51066C11.9206 5.79196 12.3022 5.95 12.7 5.95C13.0978 5.95 13.4794 5.79196 13.7607 5.51066C14.042 5.22936 14.2 4.84782 14.2 4.45C14.2 4.05218 14.042 3.67064 13.7607 3.38934C13.4794 3.10804 13.0978 2.95 12.7 2.95C12.3022 2.95 11.9206 3.10804 11.6393 3.38934C11.358 3.67064 11.2 4.05218 11.2 4.45Z',
};

/** Cloche — "Up to 15% off at partner restaurants." */
const FOOD: Glyph = {
  viewBox: '-1.55 -2.30 18 18',
  stroke: 1.4,
  d: 'M7.45001 0.700053C7.21264 0.870431 7.02031 1.09603 6.88964 1.35737C6.75897 1.61871 6.69389 1.90793 6.70001 2.20005C6.69389 2.49218 6.75897 2.7814 6.88964 3.04273C7.02031 3.30407 7.21264 3.52968 7.45001 3.70005M10.45 0.700053C10.2126 0.870431 10.0203 1.09603 9.88964 1.35737C9.75897 1.61871 9.69389 1.90793 9.70001 2.20005C9.69389 2.49218 9.75897 2.7814 9.88964 3.04273C10.0203 3.30407 10.2126 3.52968 10.45 3.70005M4.45001 0.700053C4.21264 0.870431 4.02031 1.09603 3.88964 1.35737C3.75897 1.61871 3.69389 1.90793 3.70001 2.20005C3.69389 2.49218 3.75897 2.7814 3.88964 3.04273C4.02031 3.30407 4.21264 3.52968 4.45001 3.70005M1.45 5.95005H13.45C13.6489 5.95005 13.8397 6.02907 13.9803 6.16972C14.121 6.31038 14.2 6.50114 14.2 6.70005V7.07505C14.2 8.20005 12.3123 11.2548 11.2 11.9501V12.7001C11.2 12.899 11.121 13.0897 10.9803 13.2304C10.8397 13.371 10.6489 13.4501 10.45 13.4501H4.45C4.25109 13.4501 4.06032 13.371 3.91967 13.2304C3.77902 13.0897 3.7 12.899 3.7 12.7001V11.9501C2.43475 11.1596 0.7 8.20005 0.7 7.07505V6.70005C0.7 6.50114 0.779018 6.31038 0.91967 6.16972C1.06032 6.02907 1.25109 5.95005 1.45 5.95005Z',
};

/** Rosette-with-percent — "Shopping get 7.5% cashback on myntra." */
const DISCOUNTS: Glyph = {
  viewBox: '-1.55 -1.55 18 18',
  stroke: 1.4,
  d: 'M5.19155 9.69158L9.69155 5.19158M5.94155 5.56658C5.94155 5.77368 5.77366 5.94158 5.56655 5.94158C5.35945 5.94158 5.19155 5.77368 5.19155 5.56658C5.19155 5.35947 5.35945 5.19158 5.56655 5.19158C5.77366 5.19158 5.94155 5.35947 5.94155 5.56658ZM9.69155 9.31658C9.69155 9.52368 9.52366 9.69158 9.31655 9.69158C9.10945 9.69158 8.94155 9.52368 8.94155 9.31658C8.94155 9.10947 9.10945 8.94158 9.31655 8.94158C9.52366 8.94158 9.69155 9.10947 9.69155 9.31658ZM2.19156 3.84156C2.19156 3.40395 2.3654 2.98427 2.67483 2.67483C2.98427 2.3654 3.40395 2.19156 3.84156 2.19156H4.59156C5.02723 2.19131 5.44512 2.01876 5.75406 1.71156L6.27906 1.18656C6.43239 1.03236 6.6147 0.909988 6.81549 0.826487C7.01628 0.742986 7.2316 0.7 7.44906 0.7C7.66652 0.7 7.88183 0.742986 8.08263 0.826487C8.28342 0.909988 8.46572 1.03236 8.61906 1.18656L9.14406 1.71156C9.45299 2.01876 9.87088 2.19131 10.3066 2.19156H11.0566C11.4942 2.19156 11.9138 2.3654 12.2233 2.67483C12.5327 2.98427 12.7066 3.40395 12.7066 3.84156V4.59156C12.7068 5.02723 12.8794 5.44512 13.1866 5.75406L13.7116 6.27906C13.8658 6.43239 13.9881 6.6147 14.0716 6.81549C14.1551 7.01628 14.1981 7.2316 14.1981 7.44906C14.1981 7.66652 14.1551 7.88183 14.0716 8.08263C13.9881 8.28342 13.8658 8.46572 13.7116 8.61906L13.1866 9.14406C12.8794 9.45299 12.7068 9.87088 12.7066 10.3066V11.0566C12.7066 11.4942 12.5327 11.9138 12.2233 12.2233C11.9138 12.5327 11.4942 12.7066 11.0566 12.7066H10.3066C9.87088 12.7068 9.45299 12.8794 9.14406 13.1866L8.61906 13.7116C8.46572 13.8658 8.28342 13.9881 8.08263 14.0716C7.88183 14.1551 7.66652 14.1981 7.44906 14.1981C7.2316 14.1981 7.01628 14.1551 6.81549 14.0716C6.6147 13.9881 6.43239 13.8658 6.27906 13.7116L5.75406 13.1866C5.44512 12.8794 5.02723 12.7068 4.59156 12.7066H3.84156C3.40395 12.7066 2.98427 12.5327 2.67483 12.2233C2.3654 11.9138 2.19156 11.4942 2.19156 11.0566V10.3066C2.19131 9.87088 2.01876 9.45299 1.71156 9.14406L1.18656 8.61906C1.03236 8.46572 0.909988 8.28342 0.826487 8.08263C0.742986 7.88183 0.7 7.66652 0.7 7.44906C0.7 7.2316 0.742986 7.01628 0.826487 6.81549C0.909988 6.6147 1.03236 6.43239 1.18656 6.27906L1.71156 5.75406C2.01876 5.44512 2.19131 5.02723 2.19156 4.59156V3.84156Z',
};

/** Lounge seat — "2 free airport lounge access/year". */
const LOUNGE: Glyph = {
  viewBox: '-1.55 -1.55 18 18',
  stroke: 1.4,
  d: 'M12.7 6.7C13.0978 6.7 13.4794 6.85804 13.7607 7.13934C14.042 7.42064 14.2 7.80218 14.2 8.2V11.2C14.2 11.5978 14.042 11.9794 13.7607 12.2607C13.4794 12.542 13.0978 12.7 12.7 12.7H2.2C1.80218 12.7 1.42064 12.542 1.13934 12.2607C0.858035 11.9794 0.7 11.5978 0.7 11.2V8.2C0.7 7.80218 0.858035 7.42064 1.13934 7.13934C1.42064 6.85804 1.80218 6.7 2.2 6.7C2.59782 6.7 2.97936 6.85804 3.26066 7.13934C3.54196 7.42064 3.7 7.80218 3.7 8.2V9.7H11.2V8.2C11.2 7.80218 11.358 7.42064 11.6393 7.13934C11.9206 6.85804 12.3022 6.7 12.7 6.7ZM2.2 6.7V2.95C2.2 2.35326 2.43705 1.78097 2.85901 1.35901C3.28097 0.937053 3.85326 0.7 4.45 0.7H10.45C11.0467 0.7 11.619 0.937053 12.041 1.35901C12.4629 1.78097 12.7 2.35326 12.7 2.95V6.7M2.95 12.7V14.2M11.95 12.7V14.2',
};

/** Phone-with-percent — "5% cashback on all online spends". */
const CASHBACK: Glyph = {
  viewBox: '-3.75 -1.50 18 18',
  stroke: 1.5,
  d: 'M6.375 14.25H2.25C1.85218 14.25 1.47064 14.092 1.18934 13.8107C0.908035 13.5294 0.75 13.1478 0.75 12.75V2.25C0.75 1.85218 0.908035 1.47064 1.18934 1.18934C1.47064 0.908035 1.85218 0.75 2.25 0.75H8.25C8.64782 0.75 9.02936 0.908035 9.31066 1.18934C9.59196 1.47064 9.75 1.85218 9.75 2.25V7.5M10.5 10.5L9 12.75H12L10.5 15M4.5 1.5H6M5.25 11.25V11.2575',
};

/** Coupon circle — vouchers, welcome gifts, gift cards. */
const VOUCHERS: Glyph = {
  viewBox: '-1.60 -1.60 18 18',
  stroke: 1.3,
  d: 'M1.1 5.15009H13.7M1.1 9.65009H13.7M7.025 0.650087C5.76151 2.6748 5.09166 5.01349 5.09166 7.40009C5.09166 9.78669 5.76151 12.1254 7.025 14.1501M7.775 0.650087C9.03849 2.6748 9.70835 5.01349 9.70835 7.40009C9.70835 9.78669 9.03849 12.1254 7.775 14.1501M0.65 7.40009C0.65 8.28651 0.824594 9.16425 1.16381 9.9832C1.50303 10.8021 2.00023 11.5463 2.62703 12.1731C3.25382 12.7999 3.99794 13.2971 4.81689 13.6363C5.63583 13.9755 6.51358 14.1501 7.4 14.1501C8.28642 14.1501 9.16417 13.9755 9.98311 13.6363C10.8021 13.2971 11.5462 12.7999 12.173 12.1731C12.7998 11.5463 13.297 10.8021 13.6362 9.9832C13.9754 9.16425 14.15 8.28651 14.15 7.40009C14.15 5.60988 13.4388 3.89299 12.173 2.62712C10.9071 1.36125 9.19021 0.650087 7.4 0.650087C5.60979 0.650087 3.8929 1.36125 2.62703 2.62712C1.36116 3.89299 0.65 5.60988 0.65 7.40009Z',
};

/** Fuel pump — surcharge waivers, fuel spends. */
const FUELS: Glyph = {
  viewBox: '-1.55 -2.30 18 18',
  stroke: 1.4,
  d: 'M11.2 2.2L13.45 4.45V9.7C13.45 9.99837 13.3315 10.2845 13.1205 10.4955C12.9095 10.7065 12.6234 10.825 12.325 10.825C12.0266 10.825 11.7405 10.7065 11.5295 10.4955C11.3185 10.2845 11.2 9.99837 11.2 9.7V7.45C11.2 7.05218 11.042 6.67064 10.7607 6.38934C10.4794 6.10804 10.0978 5.95 9.7 5.95H1.45M13.45 4.45H12.7C12.5011 4.45 12.3103 4.37098 12.1697 4.23033C12.029 4.08968 11.95 3.89891 11.95 3.7V2.95M1.45 12.7V2.2C1.45 1.80218 1.60804 1.42064 1.88934 1.13934C2.17064 0.858035 2.55218 0.7 2.95 0.7H7.45C7.84782 0.7 8.22936 0.858035 8.51066 1.13934C8.79196 1.42064 8.95 1.80218 8.95 2.2V12.7M0.7 12.7H9.7',
};

const GLYPHS: Record<CardIconName, Glyph> = {
  reward: REWARD,
  food: FOOD,
  discounts: DISCOUNTS,
  lounge: LOUNGE,
  cashback: CASHBACK,
  vouchers: VOUCHERS,
  fuels: FUELS,
};

/** One benefit-row glyph, in its 18px frame. */
export function CardBenefitIcon({ name, size = CARD_SPEC.benefitIcon }: { name: CardIconName; size?: number }) {
  const g = GLYPHS[name];
  return (
    <Svg width={size} height={size} viewBox={g.viewBox} fill="none">
      <Path
        d={g.d}
        stroke={color.card.bulletIcon}
        strokeOpacity={color.card.bulletIconOpacity}
        strokeWidth={g.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Which glyph a USP row gets — the component set's variant names, applied to the
 * row's own words. An explicit `Benefit.icon` (any name in the table above) wins;
 * otherwise this is the mapping, in priority order, because a row can mention two
 * things ("5% cashback at partner restaurants" is a dining benefit first).
 *
 * `reward` is the fallback, which is what the spec's cards use for a generic
 * points/reward line.
 */
export function benefitIconFor(text: string, icon?: string): CardIconName {
  if (icon && icon in GLYPHS) return icon as CardIconName;
  const s = text.toLowerCase();
  if (/lounge|airport/.test(s)) return 'lounge';
  if (/fuel|petrol|diesel|surcharge/.test(s)) return 'fuels';
  if (/dining|restaurant|food|swiggy|zomato|dine|eat/.test(s)) return 'food';
  if (/voucher|gift card|welcome (gift|benefit|voucher)|milestone/.test(s)) return 'vouchers';
  if (/cashback|cash back/.test(s)) return 'cashback';
  if (/\d+% off|discount|off at|save up|% off/.test(s)) return 'discounts';
  return 'reward';
}

/**
 * The CTA's chevron (673:27223) — a filled white arrow with a 0.3 cobalt edge,
 * drawn at 6.14 × 9.94 from a 5.384 × 9.259 export.
 */
export function ApplyChevron({ width = CARD_SPEC.chevW, height = CARD_SPEC.chevH }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 5.38412 9.25868" fill="none">
      <Path
        d="M0.3477 0.34804C0.611857 0.0838822 1.04048 0.0840274 1.30473 0.34804L4.9854 4.0287C5.31702 4.36068 5.31723 4.89901 4.9854 5.23085L1.30473 8.91054C1.04049 9.1746 0.611874 9.17471 0.3477 8.91054C0.0839379 8.64654 0.0841696 8.21874 0.3477 7.95448L3.41899 4.87636C3.55491 4.7398 3.55494 4.51876 3.41899 4.38222L0.3477 1.30409C0.0842028 1.03982 0.0839048 0.612018 0.3477 0.34804Z"
        fill={color.card.applyChevron}
        stroke={color.card.applyChevronEdge}
        strokeWidth={0.3}
      />
    </Svg>
  );
}

/**
 * The divider between the two fee columns ("Line 30", 673:27216) — a 45px hairline
 * that fades to white at both ends, so it reads as a soft separation rather than a
 * ruled line. Exported horizontal and rotated 90° in Figma; drawn vertical here.
 */
export function FeeDivider({ height = CARD_SPEC.dividerH }: { height?: number }) {
  const id = useId();
  return (
    <Svg width={1} height={height} viewBox={`0 0 1 ${height}`} fill="none">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
          <Stop stopColor={color.card.hairline0} />
          <Stop offset={0.528846} stopColor={color.card.hairlineMid} />
          <Stop offset={1} stopColor={color.card.hairline0} />
        </LinearGradient>
      </Defs>
      <Path d={`M0.5 0.5V${height - 0.5}`} stroke={`url(#${id})`} strokeLinecap="round" />
    </Svg>
  );
}
