/**
 * HomeScreen — a clone of the PRODUCTION CashKaro app home, two scrolls deep.
 *
 * Every number, colour, font weight and nesting order below was read out of the
 * shipped iOS app (`/Applications/CashKaro.app`, Hermes bytecode v96) by
 * decompiling `main.jsbundle` — not eyeballed from a screenshot. The design system
 * it draws from lives in [theme/ckApp.ts](../theme/ckApp.ts) (`colors` = the app's
 * Metro module 897, `base` = its 204-entry utility StyleSheet from module 896,
 * `text` = its `<Text>` size scale, `metrics` = per-component geometry). Icons are
 * the app's own SVG path data — see [icons/ckAppIcons.tsx](../icons/ckAppIcons.tsx).
 *
 * Layer order and geometry, from Metro fn #19765 `Home`:
 *   z3  toolbar        absolute, top 0, height CONTAINER_HEIGHT_DEFAULT (40)
 *   z2  search band    top 40, SEARCH_HEIGHT_DEFAULT (64) tall — the band is the
 *                      app's, but what fills it is THIS prototype's search bar, not
 *                      the app's field (see the section below, and D034)
 *   —   the list       contentContainerStyle paddingTop = SEARCH_HEIGHT_DEFAULT + 8,
 *                      paddingBottom 16; a spacer of the toolbar's height stands in
 *                      for the app's animated `ListHeaderComponent`
 *   —   float          absolute, bottom 0 / right 16 ("Cashback missing?")
 *
 * Section order is what the app's `renderHomePageSections` (fn #19876) receives from
 * `getHomeAPIData`: BANNERS → HOME_CATEGORIES → the server's card sections. Section
 * *content* is server-driven, so it comes from this repo's real data
 * (`data/storeTiles.ts` brands, `assets/banners`, `assets/categories`) with the
 * app's own copy strings ("Top categories", "Highest Cashback Stores",
 * "Exclusive Offers", "Cashback missing? / Raise a ticket here.").
 *
 * Knowing deviations, each called out at its call site: the search bar is this
 * prototype's, by explicit request (D034); the banner rail is this project's paged
 * ScrollView rather than react-native-reanimated-carousel (identical
 * width/height/interval); and the bottom tab bar's five icons come from this repo's
 * icon set because the app's are separate SVG assets that were not extracted — its
 * metrics, labels, tints and type ARE the app's.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { base, colors, metrics, metropolis, text as textScale } from '../theme/ckApp';
import { CkArrowAltRight, CkBellIcon, CkLogo, CkMenuIcon } from '../icons/ckAppIcons';
import { Icon } from '../icons/Icon';
import { IconName } from '../icons/iconMap';
import { STORE_TILES } from '../data/storeTiles';

// ── The app's <Text> (Metro fn #12439) ───────────────────────────────────────
// One boolean prop picks the size; `lh` overrides only lineHeight; the default
// colour is colors.text and the default weight Metropolis-Medium.
type CkTextProps = {
  children: React.ReactNode;
  xs?: boolean;
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  xl?: boolean;
  lh?: number;
  color?: string;
  fonts?: { fontFamily: string };
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
};

function CkText({ children, xs, sm, md, lg, xl, lh, color, fonts, style, ...rest }: CkTextProps) {
  const size = xs ? textScale.xs : sm ? textScale.sm : md ? textScale.md : lg ? textScale.lg : xl ? textScale.xl : textScale.md;
  return (
    <Text
      {...rest}
      style={[
        { color: color ?? colors.text },
        fonts ?? metropolis.medium,
        { fontSize: size.fontSize, lineHeight: lh ?? size.lineHeight },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ── Toolbar (Metro fn #20001 `HomeToolbar` + its StyleSheet) ─────────────────
/** Unread app-inbox count — the app renders the badge only above zero, and caps
 *  the label at "99+" while dropping its fontSize from 10 to 8. */
const UNREAD_COUNT = 3;

function HomeToolbar() {
  return (
    <View style={[base.ph16, base.pt12, base.pb4, styles.toolbar]}>
      <View style={[base.cGap12, styles.toolbarLft]}>
        <Pressable accessibilityLabel="menu_link">
          <CkMenuIcon width={22} height={17} />
        </Pressable>
        <CkLogo width={88} height={18} />
      </View>
      <View style={[base.cGap16, base.rowHCenter]}>
        <View style={styles.toolbarRgt}>
          <Pressable accessibilityLabel="help_link" accessible>
            <Image source={require('../../assets/ck-app/help-icon.png')} style={styles.helpIcon} resizeMode="contain" />
          </Pressable>
        </View>
        <View style={styles.toolbarRgt}>
          <Pressable accessibilityLabel="notification_link" accessible style={base.relative}>
            <CkBellIcon width={24} height={23} fill={colors.black} />
            {UNREAD_COUNT > 0 && (
              <View style={styles.nCountWrp}>
                <CkText
                  xs
                  color={colors.white}
                  fonts={metropolis.bold}
                  style={[base.textXYCenter, { fontSize: UNREAD_COUNT > 99 ? 8 : 10, letterSpacing: -1 }]}
                >
                  {UNREAD_COUNT > 99 ? '99+' : String(UNREAD_COUNT)}
                </CkText>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── Search band (fn #19765's z2 layer) ───────────────────────────────
// The BAND is the app's: absolute, `top` = the toolbar's 40, and exactly
// SEARCH_HEIGHT_DEFAULT (64) tall. What sits IN it is deliberately NOT the app's
// own field — this prototype's `components/SearchBar` goes there instead, which is
// also 64 tall (paddingVertical 8 + a 48 field + 8), so it fills the band exactly.
//
// Nothing is rendered here on purpose: `Root.tsx` hoists ONE live SearchBar across
// every surface and rests it at `REST_Y` = this band's top. A second copy would
// stack two bars, and the live one is opaque (`wrap.backgroundColor`), so it
// already hides the list scrolling under it.


// ── Section header (fn #20115 `HomeTitleSection`) ─────────────────────────────
function HomeTitleSection({ title, viewAllText = 'View All' }: { title: string; viewAllText?: string }) {
  return (
    <View style={styles.homeCardsHdWrp}>
      <CkText
        lg
        fonts={metropolis.extrabold}
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[base.pb8, base.mb6, { color: colors.text, width: '70%' }]}
      >
        {title}
      </CkText>
      <Pressable accessibilityLabel="viewall_link" style={[base.pb16, styles.viewAllHit]}>
        <View style={[base.cGap8, base.rowCenter]}>
          <CkText sm color={colors.secondary} fonts={metropolis.semibold} numberOfLines={1} ellipsizeMode="tail">
            {viewAllText}
          </CkText>
          <CkArrowAltRight width={10} height={5} fill={colors.secondary} />
        </View>
      </Pressable>
    </View>
  );
}

// ── BANNERS (fn #19974 `Banner`) ─────────────────────────────────────────────
/**
 * Banner artwork. Drawn with `resizeMode="stretch"` into the app's own
 * 1.6649746192893402 box so each banner fills the full 16px-inset width — no crop, no
 * letterbox bands, no padded edge strips (D042, superseding D041). These sources are
 * 1.46–1.62, so the stretch is 3–14% horizontally; replace them with true 1.665 art
 * and it becomes a no-op with no code change.
 */
const BANNERS = [
  require('../../assets/banners/banner1.png'),
  require('../../assets/banners/banner2.png'),
  require('../../assets/banners/banner3.png'),
];

function HomeBanners({ onWidth }: { onWidth?: (w: number) => void }) {
  // Geometry, from fn #19974's module scope: it reads Dimensions.get('window')
  // twice — once raw (the carousel's `width`) and once minus 32 (what the `height`
  // divides by the aspect ratio). So the PAGE is the full screen width and the
  // ARTWORK is inset 16 inside it, which is why the height matches width − 32.
  // Putting that 16 on the scroll frame instead is the "banner clipped on the
  // right" bug AGENTS.md warns about: the frame then starts 16px in and runs 16px
  // past the screen edge. Page width, snap step and frame width are ONE integer.
  const [sw, setSw] = useState(0);
  const [page, setPage] = useState(0);
  const ref = useRef<ScrollView>(null);
  /** Artwork box: 16 off each screen edge at rest, 32 between banners mid-swipe. */
  const artH = sw ? Math.round((sw - 32) / metrics.bannerAspectRatio) : 0;

  // Autoplay on the app's own cadence. The app drives this through
  // react-native-reanimated-carousel (`loop`, autoPlayInterval 3000,
  // scrollAnimationDuration 1000); this project has no carousel dependency, so a
  // paged ScrollView stands in — same widths, same height, same interval. Per
  // AGENTS.md card width, snap step and paging frame are ONE rounded integer.
  useEffect(() => {
    if (!sw) return;
    const t = setInterval(() => {
      setPage((p) => {
        const next = (p + 1) % BANNERS.length;
        ref.current?.scrollTo({ x: next * sw, animated: true });
        return next;
      });
    }, metrics.bannerAutoPlayMs);
    return () => clearInterval(t);
  }, [sw]);

  return (
    <View
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width);
        setSw(w);
        onWidth?.(w);
      }}
    >
      <View style={styles.homeBanner}>
        {sw > 0 && (
          <ScrollView
            ref={ref}
            horizontal
            pagingEnabled
            disableIntervalMomentum
            snapToInterval={sw}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            style={[base.mb32, { width: sw, height: artH }]}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / sw))}
          >
            {BANNERS.map((src, i) => (
              <Pressable
                key={i}
                accessibilityLabel={`img_banner_select_link_${i}`}
                // The page MUST carry the explicit integer width — without it the
                // page sizes to the artwork's intrinsic width and paging drifts.
                style={[styles.bannerPage, { width: sw }]}
              >
                {/* `stretch`, not `cover`/`contain`: the box is the app's fixed ratio
                    and these sources are narrower, so cover would crop the top and
                    bottom and contain would leave side bands. Stretching fills the
                    16px-inset width edge to edge. */}
                <Image source={src} style={[styles.bannerImg, { width: sw - 32, height: artH }]} resizeMode="stretch" />
              </Pressable>
            ))}
          </ScrollView>
        )}
        {/* fn #19990 HomeBannerPaginationItem inside `styles.sliderIconMain` —
            4px dots, 5px when active, ink when active and gray_400 when not. */}
        <View style={styles.sliderIconMain}>
          {BANNERS.map((_, i) => (
            <View key={i} style={[styles.bannerDot, i === page ? styles.bannerDotActive : null]}>
              <View style={[base.main, { backgroundColor: i === page ? colors.text : colors.gray_400 }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ── HOME_CATEGORIES (fn `TopCategoryHorizontal` + #20141 `CategoryCard`) ──────
/** The circle wash. The app receives a per-category gradient from the API; these
 *  are the app's own section tints, cycled, so nothing here is invented colour. */
const CATEGORY_WASHES: [string, string][] = [
  [colors.section_orange, colors.light_orange],
  [colors.section_blue, colors.section_blue_two],
  [colors.light_purple, colors.white],
  [colors.light_teal, colors.white],
  [colors.light_sky_blue, colors.white],
  [colors.yellow_100, colors.white],
];

const CATEGORIES = [
  { name: 'Fashion', img: require('../../assets/categories/fashion.png') },
  { name: 'Electronics', img: require('../../assets/categories/electronics.png') },
  { name: 'Beauty', img: require('../../assets/categories/beauty.png') },
  { name: 'Mobiles', img: require('../../assets/categories/mobiles.png') },
  { name: 'Home & Kitchen', img: require('../../assets/categories/home-kitchen.png') },
  { name: 'Food & Grocery', img: require('../../assets/categories/food-grocery.png') },
  { name: 'Hotel & Flights', img: require('../../assets/categories/hotel-flights.png') },
  { name: 'Credit Cards', img: require('../../assets/categories/credit-cards.png') },
];

function CategoryCard({ name, img, index, onPress }: { name: string; img: number; index: number; onPress: () => void }) {
  return (
    <View accessibilityLabel="category_item_view" style={styles.homeListCategoryWrp}>
      <Pressable accessibilityLabel={`home_category_touch_${index}`} onPress={onPress}>
        <LinearGradient
          colors={CATEGORY_WASHES[index % CATEGORY_WASHES.length]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.homeListCategoryCard}
        >
          <Image source={img} style={styles.homeListCategoryImg} resizeMode="contain" />
        </LinearGradient>
        <CkText sm color={colors.text} fonts={metropolis.semibold} numberOfLines={2} style={[base.pt8, base.textCenter]}>
          {name}
        </CkText>
      </Pressable>
    </View>
  );
}

function TopCategoryHorizontal({ onPick }: { onPick: (q?: string) => void }) {
  return (
    <View style={styles.homeCategoryMain}>
      <CkText lg fonts={metropolis.extrabold} color={colors.text} style={base.ph16}>
        Top categories
      </CkText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
        {CATEGORIES.map((c, i) => (
          <CategoryCard key={c.name} name={c.name} img={c.img} index={i} onPress={() => onPick(c.name.toLowerCase())} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Store cards (fn #20200 `StoreCard`) ──────────────────────────────────────
type HomeStore = { key: string; name: string; logo: number; ribbon: string; cashback: string };

/** Brands come from data/storeTiles.ts — the only set a store card may show
 *  (AGENTS.md §Design-system rules) — reshaped into the app card's own fields. */
const storeRow = (keys: string[]): HomeStore[] =>
  keys
    .map((k) => STORE_TILES.find((b) => b.key === k))
    .filter((b): b is (typeof STORE_TILES)[number] => !!b)
    .map((b) => ({
      key: b.key,
      name: b.name,
      logo: b.logo,
      ribbon: b.offer,
      cashback:
        b.cashback.type === 'pct_single'
          ? `${b.cashback.prefix === 'flat' ? 'Flat' : 'Upto'} ${b.cashback.value}% ${b.caption === 'REWARDS' ? 'Rewards' : 'Cashback'}`
          : '',
    }));

const HIGHEST_CASHBACK = storeRow(['amazon', 'croma', 'ajio', 'nykaa', 'mamaearth', 'perfora']);
const EXCLUSIVE_OFFERS = storeRow(['hyugalife', 'muscleblaze', 'healthkart', 'nutrabay', 'nua', 'truebasics']);

function StoreCard({ store, width, position, onPress }: { store: HomeStore; width: number; position: number; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`vertical_store_card_item_${store.key}`}
      onPress={onPress}
      style={[styles.stCard, { width, marginRight: position % 3 !== 0 ? metrics.storeCardGutter : 0 }]}
    >
      {store.ribbon ? (
        <View style={[base.center, styles.stRibbonWrp]}>
          <CkText xs lh={14} color={colors.bk_ruby_red} numberOfLines={1}>
            {store.ribbon}
          </CkText>
        </View>
      ) : (
        <View style={[base.center, styles.stRibbonSpacer]} />
      )}
      <View style={[base.alignItemsCenter, styles.stLogoWrp]}>
        <Image source={store.logo} style={styles.stImg} resizeMode="contain" />
      </View>
      <View>
        <View style={styles.stCbWrp}>
          <CkText xs lh={20} color={colors.text} fonts={metropolis.semibold} style={base.textCenter}>
            {store.cashback}
          </CkText>
        </View>
        {/* The app's <Button color="secondary" size="md"> with buttonStyle
            {height:40,padding:0,paddingHorizontal:4} and titleStyle 10/14. Its
            radius comes from a Button prop we did not resolve; 8 is the app's own
            `base.rounded8`, which every other card edge on Home uses. */}
        <View style={styles.stCta}>
          <CkText color={colors.white} fonts={metropolis.semibold} style={styles.stCtaTxt}>
            Shop Now
          </CkText>
        </View>
      </View>
    </Pressable>
  );
}

function StoreCardGrid({ stores, cardW, onPick }: { stores: HomeStore[]; cardW: number; onPick: (q?: string) => void }) {
  return (
    <View style={styles.storeGrid}>
      {stores.map((s, i) => (
        <StoreCard key={s.key} store={s} width={cardW} position={i + 1} onPress={() => onPick(s.name.toLowerCase())} />
      ))}
    </View>
  );
}

// ── Footer + float (fn #19765 / #19876 ListFooterComponent) ──────────────────
function HomeFooter({ width }: { width: number }) {
  return (
    <View style={base.alignItemsEnd}>
      {/* `resizeMode="contain"` is ours: the artwork is 720×702, so at the app's
          own aspectRatio 1 the difference from the default `cover` is ~2%, but the
          web renderer was resolving the box off the intrinsic width and clipping
          the left third away. */}
      <Image
        source={require('../../assets/ck-app/home-footer.png')}
        style={[styles.footerImg, width ? { width, height: width } : null]}
        resizeMode="contain"
      />
    </View>
  );
}

/**
 * The app gates this float on the `showPostExitPopup` route param (fn #19765) — it
 * appears when you come *back* from a store, never on a cold home load. Flip to
 * true to see it; left false so it doesn't cover the store grid it would sit over.
 */
const SHOW_PRE_POST_FLOAT = false;

function PrePostFloat() {
  if (!SHOW_PRE_POST_FLOAT) return null;
  return (
    <View style={styles.prePostWrp}>
      <ImageBackground
        source={require('../../assets/ck-app/prepost-float.png')}
        resizeMode="contain"
        style={styles.prePostImg}
      >
        <View style={[base.rowHCenter, base.justifyContentBetween, base.rounded8, base.ph24, base.pv16]}>
          <CkText sm lh={16} color={colors.white} fonts={metropolis.semibold}>
            {'Cashback missing?\nRaise a ticket here.'}
          </CkText>
        </View>
      </ImageBackground>
    </View>
  );
}

// ── Bottom tabs (fn #5882 `BottomTabNavigator` screenOptions) ────────────────
/** Labels, tints, heights and 10px Metropolis-SemiBold label are the app's; the
 *  glyphs are this repo's (the app's tab icons are un-extracted SVG assets). */
const TABS: { icon: IconName; label: string; active?: boolean }[] = [
  { icon: 'home', label: 'Home', active: true },
  { icon: 'gift', label: 'Refer & Earn' },
  { icon: 'rupee', label: 'My Earnings' },
  { icon: 'search', label: 'Missing?' },
  { icon: 'user', label: 'Profile' },
];

/** The app's bottom tab bar, above the safe-area inset. Exported because anything
 *  floating over Home has to clear it (see Root's user-type switch, D102). */
export const APP_TAB_BAR_H = 52;

export function AppTabBar() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { height: APP_TAB_BAR_H + insets.bottom, paddingBottom: insets.bottom }]}>
      {TABS.map((t) => (
        <View key={t.label} style={styles.tabItem}>
          <Icon name={t.icon} size={18} color={t.active ? colors.secondary : colors.black} />
          <Text style={[styles.tabLabel, { color: t.active ? colors.secondary : colors.black }]} numberOfLines={1}>
            {t.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── The screen ───────────────────────────────────────────────────────────────
export function HomeScreen({ onPick }: { onPick: (q?: string) => void }) {
  const { width } = useWindowDimensions();
  // The stage's own width (the device frame on web is narrower than the window).
  // Measured by the banner block and reused by the footer — see D040.
  const [stageW, setStageW] = useState(0);
  // fn #20200: the 3-up grid card is (screenWidth - 2 - 24 - 16) / 3 wide.
  const cardW = Math.floor((width - 2 - 24 - 16) / 3);

  return (
    <View style={styles.screen}>
      <View style={styles.body}>
        <ScrollView
          testID="home_screen"
          keyboardShouldPersistTaps="always"
          style={base.main}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Stands in for the app's animated ListHeaderComponent, which is a
              collapsing spacer exactly the toolbar's height. */}
          <View style={styles.listHeaderSpacer} />

          <HomeBanners onWidth={setStageW} />
          <TopCategoryHorizontal onPick={onPick} />

          <HomeTitleSection title="Highest Cashback Stores" />
          <StoreCardGrid stores={HIGHEST_CASHBACK} cardW={cardW} onPick={onPick} />

          <HomeTitleSection title="Exclusive Offers" />
          <StoreCardGrid stores={EXCLUSIVE_OFFERS} cardW={cardW} onPick={onPick} />

          <HomeFooter width={stageW} />
        </ScrollView>

        <View style={styles.toolbarLayer}>
          <HomeToolbar />
        </View>
        {/* No search layer: Root.tsx's hoisted SearchBar rests in the band that
            starts at `metrics.toolbarHeight` and is opaque, so it IS this layer. */}
        <PrePostFloat />
      </View>

      <AppTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  body: { flex: 1, position: 'relative' },

  // list — fn #19876 contentContainerStyle
  listContent: { paddingTop: metrics.searchHeight + metrics.listTopGap, paddingBottom: 16, flexGrow: 1 },
  listHeaderSpacer: { height: metrics.toolbarHeight },

  // layers — fn #19765
  toolbarLayer: { position: 'absolute', top: 0, left: 0, right: 0, height: metrics.toolbarHeight, zIndex: 3 },

  // toolbar — fn #20001's own StyleSheet, verbatim
  toolbar: {
    backgroundColor: colors.white,
    height: metrics.toolbarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarLft: { flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  toolbarRgt: { height: metrics.toolbarHeight, justifyContent: 'center', position: 'relative' },
  nCountWrp: {
    position: 'absolute',
    top: 0,
    right: -6,
    backgroundColor: colors.secondary,
    width: 16,
    height: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: { width: 24, height: 24 },

  // banners — fn #19974 `styles.homeBanner`
  homeBanner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  // Each page spans the screen; the 16px is the artwork's inset, never the frame's.
  bannerPage: { paddingHorizontal: 16 },
  // Height is set explicitly at the call site, NOT via aspectRatio: on an RN-web
  // <Image> with a percentage width, `aspectRatio` is ignored and the asset's
  // intrinsic height wins — which made every page a different height (352/354/392
  // instead of 293) and clipped the taller ones against the paging frame. See D040.
  bannerImg: { borderRadius: 12 },
  sliderIconMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20,
  },
  bannerDot: { width: 4, height: 4, borderRadius: 6, marginHorizontal: 2, overflow: 'hidden' },
  bannerDotActive: { width: 5, height: 5 },

  // categories — Home.style `homeCategoryMain` + fn #20141's StyleSheet
  homeCategoryMain: { marginTop: 12 },
  categoryRail: { flexDirection: 'row', columnGap: 24, paddingTop: 16, paddingBottom: 16, paddingLeft: 16 },
  homeListCategoryWrp: { width: metrics.categoryTile.width, height: metrics.categoryTile.height },
  homeListCategoryCard: {
    borderRadius: metrics.categoryCircle,
    width: metrics.categoryCircle,
    height: metrics.categoryCircle,
  },
  homeListCategoryImg: { width: '100%', height: '100%', borderRadius: metrics.categoryCircle },

  // section header — Home.style `homeCardsHdWrp`
  homeCardsHdWrp: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  viewAllHit: { width: 100, paddingRight: 4, alignItems: 'flex-end', justifyContent: 'center' },

  // store cards — fn #20200's StyleSheet
  // 12 each side, not 16: fn #20200 derives the card from (W − 2 − 24 − 16) / 3,
  // i.e. W = 3·card + 2 gutters (16) + side padding (24) + the 1px borders (2).
  // Padding the grid to 16 would make the third card in every row overflow.
  storeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, rowGap: metrics.storeCardGutter },
  stCard: {
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderColor: metrics.storeCardBorder,
    height: metrics.storeCardHeight,
    overflow: 'hidden',
  },
  stRibbonWrp: { backgroundColor: metrics.storeRibbonBg, height: metrics.storeRibbonHeight, paddingHorizontal: 2 },
  stRibbonSpacer: { height: metrics.storeRibbonHeight },
  stLogoWrp: { paddingHorizontal: 3 },
  stImg: { width: metrics.storeLogo.width, height: metrics.storeLogo.height },
  stCbWrp: { alignItems: 'center', marginBottom: 1, height: 20 },
  stCta: {
    height: 40,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stCtaTxt: { fontSize: 10, lineHeight: 14 },

  // footer + float — fn #19876 / #19765
  // fn #19876 draws this `{width:'100%', aspectRatio: 1}` — a full-width square.
  // Both dimensions are set from the measured stage width for the same reason as
  // bannerImg: aspectRatio does not resolve here (D040).
  footerImg: { alignSelf: 'stretch' },
  prePostWrp: { position: 'absolute', bottom: 0, right: 16 },
  prePostImg: { width: metrics.prePostFloat.width, height: metrics.prePostFloat.height, justifyContent: 'center' },

  // bottom tabs — fn #5882 screenOptions
  tabBar: { flexDirection: 'row', backgroundColor: colors.white },
  tabItem: { flex: 1, padding: 0, height: 52, paddingBottom: 4, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, fontFamily: metropolis.semibold.fontFamily, marginTop: 2 },
});
