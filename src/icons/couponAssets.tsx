/**
 * couponAssets — the Coupon ticket's exported Figma artwork, as react-native-svg.
 *
 * Source: Figma "Store Page V2.0 — Deliverable" (`XgdQOrfPsC6HNv24uS9jgN`),
 * node 1835:16064 "Coupon". Every path below is the **exported asset's own path
 * data**, copied byte-for-byte out of the SVG that `get_design_context` returned —
 * nothing here is redrawn or approximated. The downloaded .svg files are kept
 * alongside at `assets/coupon/` as the provenance record.
 *
 * They are inlined as components rather than `require()`d because this project has
 * no metro SVG transformer (no `metro.config.js`), so an `.svg` import would fail
 * to resolve. The one asset that stays a file is the spinner, which is an animated
 * GIF and can't be expressed as a path — see `CouponTicket`.
 *
 * | component            | Figma asset       | box            |
 * |----------------------|-------------------|----------------|
 * | `StubNotch`          | Subtract          | 44 × 44        |
 * | `EdgeNotch`          | Subtract (right)  | 23 × 44        |
 * | `Perforation`        | Frame 1991634878  | 9 × card height|
 * | `ExpiryRibbon`       | Rectangle 34629145| 109.5 × 28     |
 * | `RibbonFold`         | Vector 2865/2866  | 12 × 2         |
 * | `ClockIcon`          | iconamoon:clock   | 9.5 × 9.5      |
 * | `CopyIcon`           | tabler:copy       | 15.157 sq      |
 * | `CheckTickIcon`      | qlementine check  | 21 × 21        |
 * | `SeeDetailsChevron`  | chevron-left      | 18 × 18        |
 */
import React, { useId } from 'react';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { color } from '../theme/tokens';

/** The concave bite taken out of the stub's inner edge. Carries the stub gradient,
 *  so the `copied` flag swaps the ramp exactly as Figma's two variants do. */
const NOTCH_D =
  'M0 10.6536C0 12.8053 1.76937 14.4966 3.73108 15.3808C7.20612 16.9471 9.625 20.4406 9.625 24.5C9.625 28.5594 7.20613 32.0523 3.73111 33.6184C1.76935 34.5025 0 36.1937 0 38.3454V44H44V0H0V10.6536Z';

/**
 * Just the LENS bitten out of the stub's inner edge — the boundary curve of
 * `NOTCH_D`, closed up its straight edge. Painting the stub as one gradient and
 * laying this white shape over it avoids the seam you get from `StubNotch`: that
 * band is drawn by react-native-svg while the stub's fill comes from
 * expo-linear-gradient, and the two rasterise a gradient slightly differently, so
 * the join showed as a faint stripe across the copied (green) stub.
 */
const BITE_D =
  'M0 10.6536C0 12.8053 1.76937 14.4966 3.73108 15.3808C7.20612 16.9471 9.625 20.4406 9.625 24.5C9.625 28.5594 7.20613 32.0523 3.73111 33.6184C1.76935 34.5025 0 36.1937 0 38.3454V10.6536Z';

export const BITE_W = 9.625;

/** The lens boundary WITHOUT the closing straight edge — for stroking the cut. */
const BITE_CURVE =
  'M0 10.6536C0 12.8053 1.76937 14.4966 3.73108 15.3808C7.20612 16.9471 9.625 20.4406 9.625 24.5C9.625 28.5594 7.20613 32.0523 3.73111 33.6184C1.76935 34.5025 0 36.1937 0 38.3454';

export function StubBite({ fill = color.surface }: { fill?: string }) {
  return (
    <Svg width={BITE_W + 1} height={44} viewBox={`0 0 ${BITE_W + 1} 44`}>
      <Path d={BITE_D} fill={fill} />
      <Path d={BITE_CURVE} fill="none" stroke={color.coupon.notchEdge} strokeWidth={1} />
    </Svg>
  );
}

/** Superseded by a single stub gradient + `StubBite`; kept for the archive. */
export function StubNotch({ copied = false }: { copied?: boolean }) {
  // Gradient ids share ONE namespace across every SVG on the page, so a literal
  // id makes the second ticket's notch resolve to the FIRST ticket's gradient —
  // which is why a copied (green) stub painted a purple band across its notch
  // while a default ticket was on screen. `useId` per instance, colons stripped
  // because they are not valid in an SVG id/url() reference.
  const uid = useId().replace(/:/g, '');
  const gid = `stub-${uid}`;
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44">
      <Defs>
        <LinearGradient id={gid} x1={44} y1={22} x2={0} y2={22} gradientUnits="userSpaceOnUse">
          {/* Figma's green ramp runs the other way (x1 0 → x2 44), so its stops are
              reversed here to keep the painted direction identical. */}
          {copied
            ? [
                <Stop key="a" stopColor={color.coupon.stubCopiedTo} />,
                <Stop key="b" offset={1} stopColor={color.coupon.stubCopiedFrom} />,
              ]
            : [
                <Stop key="a" stopColor={color.coupon.stubFrom} />,
                <Stop key="b" offset={0.495192} stopColor={color.coupon.stubVia} />,
                <Stop key="c" offset={1} stopColor={color.coupon.stubTo} />,
              ]}
        </LinearGradient>
      </Defs>
      <Path d={NOTCH_D} fill={`url(#${gid})`} />
    </Svg>
  );
}

/** The matching bite on the card's right edge — white, so it reads as a cut-out. */
export function EdgeNotch({ fill = color.surface }: { fill?: string }) {
  return (
    <Svg width={23} height={44} viewBox="0 0 23 44">
      <Path
        d="M23 10.5637C23 12.749 21.1777 14.4552 19.1735 15.326C15.6325 16.8647 13.1562 20.3927 13.1562 24.5C13.1562 28.6073 15.6325 32.1347 19.1735 33.6731C21.1777 34.5439 23 36.25 23 38.4353V44H0V0H23V10.5637Z"
        fill={fill}
      />
      {/* Same hairline as the left cut, so both read as physical cuts on white. */}
      <Path
        d="M23 10.5637C23 12.749 21.1777 14.4552 19.1735 15.326C15.6325 16.8647 13.1562 20.3927 13.1562 24.5C13.1562 28.6073 15.6325 32.1347 19.1735 33.6731C21.1777 34.5439 23 36.25 23 38.4353"
        fill="none"
        stroke={color.coupon.notchEdge}
        strokeWidth={1}
      />
    </Svg>
  );
}

/**
 * The tear line between stub and body: a white strip whose LEFT edge is a column of
 * scallops. Figma exports it as one 9×152 path; the loop below emits that same path
 * with the export's own numbers — control points `1.93195 / 1.85586`, a 9.834-tall
 * bite and a 10.1875 pitch (read off the export's consecutive `L0.199219 y` stops:
 * 228.646 → 218.459 → 208.271 …) — parameterised by height so the strip is never
 * stretched. The export also carries a `dx:-5 blur:2` glow in the stub's own purple;
 * it is omitted because it falls on the 44px stub that sits immediately left of the
 * strip, i.e. purple-on-purple.
 */
export function Perforation({ height, fill = color.surface }: { height: number; fill?: string }) {
  const PITCH = 10.1875;
  const BITE = 9.834;
  let d = `M9 0V${height}H0`;
  for (let y = height - 0.354; y > 0; y -= PITCH) {
    d += `L0.199219 ${y.toFixed(3)}C1.93195 ${(y - 3.068).toFixed(3)} 1.85586 ${(y - 6.838).toFixed(3)} 0 ${(y - BITE).toFixed(3)}`;
  }
  d += 'L0 0Z';
  return (
    <Svg width={9} height={height} viewBox={`0 0 9 ${height}`}>
      <Path d={d} fill={fill} />
    </Svg>
  );
}

/**
 * Expiry pill. The 20px shape sits in a 28px box — the extra 8 is its own drop
 * shadow, which Figma bakes into the asset's bounds.
 *
 * `width` stretches the art horizontally (`preserveAspectRatio="none"`, height
 * pinned at 28). The frame's label is a 7-character timer ("23h:25m") so the art is
 * drawn 109.5 wide; real copy ("Ends in 2 days") overruns it, and stretching keeps
 * the label inside the ribbon where truncating would have eaten it. Only the two
 * tapered ends shear, by a few degrees at the widths this surface produces.
 */
export const RIBBON_W = 109.5;

export function ExpiryRibbon({ width = RIBBON_W }: { width?: number }) {
  const uid = useId().replace(/:/g, '');
  const gid = `ribbon-${uid}`;
  return (
    <Svg width={width} height={28} viewBox="0 0 109.5 28" preserveAspectRatio="none">
      <Defs>
        <LinearGradient id={gid} x1={4} y1={10} x2={136.5} y2={10} gradientUnits="userSpaceOnUse">
          <Stop stopColor={color.coupon.ribbonFrom} />
          <Stop offset={1} stopColor={color.coupon.ribbonTo} />
        </LinearGradient>
      </Defs>
      <Path
        d="M4 0L105.5 0H105.371C102.122 0 99.1964 1.96434 97.9664 4.97094L94.8685 12.5436C93.0236 17.0535 88.6347 20 83.762 20H24.6229C19.5592 20 15.0404 16.8214 13.329 12.0555L10.6898 4.7058C9.67611 1.88283 6.99946 0 4 0Z"
        fill={`url(#${gid})`}
      />
    </Svg>
  );
}

/** The dark 12×2 sliver at each end of the ribbon, reading as a folded-back tail. */
export function RibbonFold() {
  return (
    <Svg width={12} height={2} viewBox="0 0 12 2">
      <Path d="M12 2C12 2 12 0 7.82609 0H0V2H12Z" fill={color.coupon.ribbonFold} />
    </Svg>
  );
}

export function ClockIcon({ stroke = color.coupon.ribbonText }: { stroke?: string }) {
  return (
    <Svg width={9.5} height={9.5} viewBox="0 0 9.5 9.5">
      <G fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4.75 0.5C7.09721 0.5 9 2.40279 9 4.75C9 7.09721 7.09721 9 4.75 9C2.40279 9 0.5 7.09721 0.5 4.75C0.5 2.40279 2.40279 0.5 4.75 0.5Z" />
        <Path d="M4.75002 2.66609V4.74942H6.83335" />
      </G>
    </Svg>
  );
}

/** tabler:copy. Figma draws the 15.157 artwork inside an 18.196 box (12.5% inset). */
export function CopyIcon({ stroke = color.coupon.codeText }: { stroke?: string }) {
  return (
    <Svg width={15.157} height={15.1619} viewBox="0 0 15.157 15.1619">
      <G fill="none" stroke={stroke} strokeWidth={1.51632} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M3.78462 5.81151C3.78462 5.27524 3.99765 4.76093 4.37685 4.38173C4.75605 4.00253 5.27036 3.7895 5.80663 3.7895H12.3768C12.6424 3.7895 12.9053 3.8418 13.1506 3.94342C13.396 4.04503 13.6189 4.19397 13.8066 4.38173C13.9944 4.56949 14.1433 4.7924 14.2449 5.03772C14.3466 5.28304 14.3989 5.54598 14.3989 5.81151V12.3817C14.3989 12.6473 14.3466 12.9102 14.2449 13.1555C14.1433 13.4008 13.9944 13.6237 13.8066 13.8115C13.6189 13.9993 13.396 14.1482 13.1506 14.2498C12.9053 14.3514 12.6424 14.4037 12.3768 14.4037H5.80663C5.54109 14.4037 5.27816 14.3514 5.03284 14.2498C4.78752 14.1482 4.56461 13.9993 4.37685 13.8115C4.18909 13.6237 4.04015 13.4008 3.93853 13.1555C3.83692 12.9102 3.78462 12.6473 3.78462 12.3817V5.81151Z" />
        <Path d="M1.52542 11.173C1.29266 11.0408 1.09907 10.8493 0.964304 10.6179C0.829542 10.3866 0.758418 10.1238 0.75816 9.85608V2.27448C0.75816 1.4405 1.4405 0.75816 2.27448 0.75816H9.85608C10.4247 0.75816 10.734 1.05005 10.9933 1.51632" />
      </G>
    </Svg>
  );
}

export function CheckTickIcon({ fill = color.coupon.copiedText }: { fill?: string }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        fill={fill}
        d="M17.9812 5.49842C18.3881 5.85804 18.4262 6.48017 18.0665 6.88967L10.5197 15.4209C10.4325 15.5195 10.3265 15.5995 10.2078 15.6564C10.0892 15.7133 9.96039 15.7458 9.82898 15.752C9.69757 15.7583 9.56624 15.7381 9.44276 15.6927C9.31927 15.6474 9.20614 15.5777 9.11003 15.4879L4.18816 10.8941C3.99881 10.7157 3.88781 10.4695 3.87942 10.2095C3.87103 9.94944 3.96592 9.69665 4.14337 9.50637C4.32081 9.31609 4.56637 9.2038 4.82636 9.19404C5.08635 9.18428 5.33964 9.27785 5.53085 9.45429L9.71772 13.3524L16.5952 5.58242C16.681 5.48541 16.785 5.40628 16.9014 5.34955C17.0178 5.29281 17.1442 5.25959 17.2734 5.25179C17.4027 5.24399 17.5322 5.26175 17.6545 5.30407C17.7769 5.34639 17.8897 5.41243 17.9865 5.49842H17.9812Z"
      />
    </Svg>
  );
}

/**
 * "See Details" affordance. Figma's layer is named chevron-**left** but the path
 * points right; the exported geometry is used as-is, only scaled.
 *
 * TWO REQUESTED DEVIATIONS from the spec (see D037): the design draws this at 18px
 * in flat `rgba(11,11,11,0.51)` grey; we draw it larger and in colour — a cobalt →
 * purple ramp taken from the ticket's own stub gradient, switching to the copied
 * green once the code is taken. Grey read as disabled next to a live coupon.
 */
export function SeeDetailsChevron({
  size = 22,
  tone = 'brand',
}: {
  size?: number;
  tone?: 'brand' | 'copied';
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Defs>
        <LinearGradient id={`chev-${tone}`} x1={8} y1={6} x2={11} y2={12} gradientUnits="userSpaceOnUse">
          {tone === 'copied'
            ? [
                <Stop key="a" stopColor={color.coupon.copiedText} />,
                <Stop key="b" offset={1} stopColor={color.coupon.stubCopiedFrom} />,
              ]
            : [
                <Stop key="a" stopColor={color.coupon.codeText} />,
                <Stop key="b" offset={1} stopColor={color.coupon.stubTo} />,
              ]}
        </LinearGradient>
      </Defs>
      <Path
        d="M10.9063 8.75694L8.50884 6.10417C8.39646 5.96528 8.20916 5.96528 8.08429 6.10417C7.9719 6.22917 7.9719 6.4375 8.08429 6.5625L10.282 8.99306L8.09677 11.4375C7.9719 11.5625 7.9719 11.7708 8.09677 11.8958C8.20916 12.0347 8.39646 12.0347 8.50884 11.8958L10.9063 9.22917C11.0312 9.10417 11.0312 8.89583 10.9063 8.75694Z"
        fill={`url(#chev-${tone})`}
      />
      <Path
        d="M8.30078 5.90039C8.40747 5.90039 8.5092 5.94826 8.58301 6.03711L10.9805 8.68945V8.69043C11.1375 8.86512 11.1431 9.13384 10.9775 9.2998L10.9766 9.29883L8.58594 11.958C8.51207 12.0493 8.40986 12.0996 8.30273 12.0996C8.19564 12.0996 8.09241 12.0503 8.01855 11.959V11.958C7.86388 11.7946 7.86512 11.5328 8.02246 11.3711L10.1465 8.99316L8.00977 6.62988V6.62891C7.8635 6.46586 7.8633 6.20002 8.00977 6.03711C8.08897 5.94902 8.19315 5.90053 8.30078 5.90039Z"
        fill={`url(#chev-${tone})`}
        stroke={`url(#chev-${tone})`}
        strokeWidth={0.9}
      />
    </Svg>
  );
}
