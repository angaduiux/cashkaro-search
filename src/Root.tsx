/**
 * Root — the app's single controller. It owns ONE search state machine (active,
 * text, committed, mode: typing | serp) that every surface reads, so the one hoisted
 * search bar glides Home → Explore → Typing → results instead of each screen owning
 * a field of its own (D034). It also owns the overlay stack (product category page,
 * per-vertical View-all, catalog grid, gallery), the query → `SerpModel` resolution
 * order (`REAL_CASES` → `financeSerp` → `buildSerp`, D052), and the web preview
 * chrome: device frame, mock status bar, mock keyboard and the screen navigator.
 *
 * Edited ADDITIVELY by convention — several chats work in this file (AGENTS
 * "Parallel-work boundaries"), and test scaffolding never survives a turn (D011).
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, TextInput, useWindowDimensions, Keyboard as OSKeyboard } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color, type as t, space, radius, elevation } from './theme/tokens';
import { EASE } from './motion/motion';
import { SearchBar } from './components/SearchBar';
import { isBleedHeroItem } from './components/SerpShell';
import { HeroBleed } from './components/HeroBleed';
import { HomeScreen, APP_TAB_BAR_H } from './screens/HomeScreen';
import { SearchBody } from './screens/SearchBody';
import { Gallery } from './screens/Gallery';
import { CatalogViewAll } from './screens/CatalogViewAll';
import { ViewAll } from './screens/ViewAll';
import { ProductCategory } from './screens/ProductCategory';
import { ScreenNav, NavSection } from './components/ScreenNav';
import { Keyboard } from './os/Keyboard';
import { VoiceSheet } from './components/VoiceSheet';
import { UserTypeSwitch } from './components/UserTypeToggle';
import { StatusBar, STATUS_BAR_H } from './os/StatusBar';
import { NavChrome, NAV_CHROME_H } from './os/NavChrome';
import { DEVICES, DEFAULT_DEVICE, Device } from './os/devices';
import { REAL_CASES, financeSerp, webResultsForWhey, buildSuggestions, ALL_DEALS, VIEW_ALL_VERTICALS } from './data/realData';
import { searchStores, buildSerp, buildStorePage, _setDealItems, Cat } from './data/catalog';
import { productCategories, categoryByKey, resolveCategoryTarget, categoryStats, CategoryTarget } from './data/productCategories';

_setDealItems(ALL_DEALS);

// Shared bar's resting Y — 40, the height of the production app toolbar that Home
// now clones (`CONTAINER_HEIGHT_DEFAULT`). The app reserves a 64px band directly
// under that toolbar for search, and THIS bar is exactly 64 tall (8 + a 48 field +
// 8), so resting it at 40 fills that band precisely. Home deliberately draws no
// field of its own — this is the one search bar, on every surface (D034).
const REST_Y = 40;
const TOP_Y = 6; // shared bar docked position while searching
// Seed history — a realistic mix: some resolve to exact store/card matches
// (surfaced as "Jump back in" tiles), some are free-text queries (Recent pills).
const INITIAL_RECENTS = ['flip', 'sbi cashback card', 'nike shoes', 'phar', 'croma', 'iphone 16 case'];

export function Root() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isWide = Platform.OS === 'web' && width > 520;
  const [device, setDevice] = useState<Device>(DEFAULT_DEVICE);
  const [gallery, setGallery] = useState(false);

  // ── Single search controller (drives the one hoisted bar) ──────────────────
  const [active, setActive] = useState(false); // false = Home, true = searching
  const [text, setText] = useState('');
  const [committed, setCommitted] = useState('');
  const [mode, setMode] = useState<'typing' | 'serp'>('typing');
  const [debounced, setDebounced] = useState('');
  const [serpLoading, setSerpLoading] = useState(false);
  const [recents, setRecents] = useState<string[]>(INITIAL_RECENTS);
  const [directStore, setDirectStore] = useState<string | null>(null); // Jump-back-in → store page
  const [viewAllCat, setViewAllCat] = useState<Cat | null>(null); // catalog View-all grid overlay
  const [viewAllKey, setViewAllKey] = useState<string | null>(null); // generic per-vertical View-all overlay
  const [catPage, setCatPage] = useState<CategoryTarget | null>(null); // product category page overlay
  const [enterTick, setEnterTick] = useState(0); // bumps on search-bar tap → replays count-ups
  // Defaults to EXISTING (D100). The only control that flips this is in the wide
  // web-preview toolbar below, which does not exist on a device — so at 'new' the
  // simulator could never show "Jump back in" or Recent searches at all, even
  // though INITIAL_RECENTS seeds six queries precisely so they can be seen. Web
  // keeps both flows one tap apart.
  const [userType, setUserType] = useState<'new' | 'existing'>('existing');
  const [kbH, setKbH] = useState(0); // measured mock on-screen keyboard height (web)
  const [voice, setVoice] = useState(false); // voice sheet owns the keyboard slot
  const [osKbH, setOsKbH] = useState(0); // real OS keyboard height (native)
  const reduced = useReducedMotion();
  const g = useSharedValue(0); // 0 = Home, 1 = searching
  const serpScrollY = useSharedValue(0); // SERP scroll — HeroBleed parallax + bar underlay (D069)
  const inputRef = useRef<TextInput | null>(null); // the one search field, for imperative focus
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebounced(text), 200);
    return () => clearTimeout(debounceRef.current);
  }, [text]);

  const glide = (to: number) => {
    g.value = reduced ? to : withTiming(to, { duration: 560, easing: EASE.emphasized });
  };

  // Track the REAL keyboard on a device. The mock tray below is web-only chrome,
  // so without this the native keyboard covers the bottom of the search layer and
  // its last section (Top Stores) can never be scrolled into view. iOS gets the
  // `will` events so the resize rides the keyboard rise; Android only reports
  // `did`. Web is driven by the mock tray's own onLayout instead.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const ios = Platform.OS === 'ios';
    const show = OSKeyboard.addListener(ios ? 'keyboardWillShow' : 'keyboardDidShow', (e) =>
      setOsKbH(e.endCoordinates.height),
    );
    const hide = OSKeyboard.addListener(ios ? 'keyboardWillHide' : 'keyboardDidHide', () => setOsKbH(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Raise the OS keyboard. On web the tap focuses the field itself, but every other
  // entry point (chip, nav item, back-out of the SERP) only flips state, so the
  // persistent field has to be focused imperatively. Deferred a frame: focusing in
  // the same tick as the state change gets swallowed by the re-render.
  const raiseKeyboard = () => {
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // A search tap ALWAYS means "let me type", even when results are already on
  // screen. Re-asserting typing mode is what was missing: `active` is already true
  // on a SERP, so the old early-exit left `mode: 'serp'` in place — and since the
  // mock keyboard is gated on `mode === 'typing'`, the search icon on a full-page
  // overlay (category page, View-all, catalog grid) dropped the user back on the
  // results with no keyboard. Tapping the field on a SERP was the same dead end.
  const focusSearch = () => {
    setActive(true);
    setMode('typing');
    glide(1);
    raiseKeyboard();
    setEnterTick((t) => t + 1); // replay Explore cashback count-ups on entry
  };
  const commit = (q: string) => {
    setText(q);
    setCommitted(q);
    setDirectStore(null);
    setMode('serp');
    setActive(true);
    setSerpLoading(true);
    serpScrollY.value = 0; // fresh page → HeroBleed fully visible again
    inputRef.current?.blur(); // results are showing — get the keyboard out of the way
    glide(1);
    timers.current.push(setTimeout(() => setSerpLoading(false), 650));
  };
  // Jump-back-in on a store → its store page directly (not the search results).
  const openStore = (q: string) => {
    const s = searchStores(q)[0];
    if (!s) return commit(q);
    setText(s.name);
    setCommitted(q);
    setDirectStore(q);
    setMode('serp');
    setActive(true);
    setSerpLoading(true);
    serpScrollY.value = 0; // fresh page → HeroBleed fully visible again
    inputRef.current?.blur();
    glide(1);
    timers.current.push(setTimeout(() => setSerpLoading(false), 500));
  };
  /** Mic tap from the one search bar. Search becomes active (so the sheet has a
   *  field to fill), the keyboard steps aside, and the sheet takes its slot. */
  const openVoice = () => {
    if (!active) {
      setActive(true);
      setMode('typing');
      glide(1);
    }
    inputRef.current?.blur(); // hand the slot over from the keyboard
    setVoice(true);
  };
  const closeVoice = (committed?: string) => {
    setVoice(false);
    if (committed) commit(committed);
    else raiseKeyboard(); // cancelled → the keyboard comes back
  };

  const openFromHome = (q?: string) => (q ? commit(q) : (setText(''), focusSearch()));
  const back = () => {
    if (mode === 'serp') {
      setMode('typing');
      setText('');
      setCommitted('');
      setDirectStore(null);
      raiseKeyboard(); // back into typing → keyboard returns
    } else {
      setActive(false);
      setText('');
      setCommitted('');
      setDirectStore(null);
      inputRef.current?.blur(); // leaving search → drop the keyboard
      glide(0);
    }
  };

  const groups = useMemo(() => buildSuggestions(debounced), [debounced]);
  const model = useMemo(() => {
    if (directStore) {
      const ds = searchStores(directStore)[0];
      return ds ? buildStorePage(ds) : undefined;
    }
    if (!committed) return undefined;
    const key = committed.trim().toLowerCase();
    if (REAL_CASES[key]) return REAL_CASES[key];
    // Finance verticals resolve by intent ("loans" → the loans page, "cards" →
    // the credit-cards page); the catalog has no store or product to match them
    // with, so this sits ahead of buildSerp (D052).
    return financeSerp(key) ?? buildSerp(committed);
  }, [committed, directStore]);

  // Category of the currently resolved store — drives the "View all" catalog grid.
  const openViewAll = () => {
    const q = directStore ?? committed;
    const s = q ? searchStores(q)[0] : undefined;
    if (s) setViewAllCat(s.category);
  };

  // ── Screen navigator (web preview chrome) ──────────────────────────────────
  // Jump helpers drive the same controller the app uses, so every target lands
  // in a real, interactive state — not a static snapshot.
  const resetOverlays = () => {
    setGallery(false);
    setViewAllCat(null);
    setViewAllKey(null);
    setCatPage(null);
  };

  /** Search icon on any full-page browse overlay: close it, start a fresh query. */
  const searchFromOverlay = () => {
    resetOverlays();
    setText('');
    focusSearch();
  };

  // Any "category" surface (SERP category chip, suggestions Categories row, nav)
  // opens the product category page. A label with no page — a store category like
  // Pharmacy, say — falls back to searching it, so no tap is ever a dead end.
  const openCategory = (label: string) => {
    const target = resolveCategoryTarget(label);
    if (target) setCatPage(target);
    else commit(label);
  };
  const goHome = () => {
    resetOverlays();
    setActive(false);
    setMode('typing');
    setText('');
    setCommitted('');
    setDirectStore(null);
    glide(0);
  };
  const goTyping = (seed: string) => {
    resetOverlays();
    setCommitted('');
    setDirectStore(null);
    setActive(true);
    setMode('typing');
    setText(seed);
    setEnterTick((n) => n + 1);
    glide(1);
  };
  const goSerp = (q: string) => {
    resetOverlays();
    commit(q);
  };
  const goStore = (q: string) => {
    resetOverlays();
    openStore(q);
  };
  const activeScreen = gallery
    ? 'gallery'
    : catPage
    ? `prodcat:${catPage.key}`
    : viewAllKey
      ? `viewall:${viewAllKey}`
      : viewAllCat
        ? `catalog:${viewAllCat}`
        : !active
        ? 'home'
        : directStore
          ? 'store'
          : mode === 'serp'
            ? committed.trim().toLowerCase()
            : text.trim()
              ? 'suggestions'
              : 'search-empty';

  const navSections: NavSection[] = [
    {
      title: 'App',
      items: [
        { key: 'home', label: 'Home', sub: 'Explore landing', onPress: goHome },
        { key: 'search-empty', label: 'Search — empty', sub: 'recents + jump back in', onPress: () => goTyping('') },
        { key: 'suggestions', label: 'Suggestions', sub: 'flip', onPress: () => goTyping('flip') },
        { key: 'store', label: 'Store page', sub: 'croma', onPress: () => goStore('croma') },
      ],
    },
    {
      title: 'Product categories',
      items: productCategories().map((c) => {
        const s = categoryStats(c.cat);
        return {
          key: `prodcat:${c.key}`,
          label: c.title,
          sub: `${s.products} products · up to ${Math.round(s.maxCbPct)}%`,
          onPress: () => { resetOverlays(); setCatPage({ key: c.key }); },
        };
      }),
    },
    {
      title: 'View all',
      items: VIEW_ALL_VERTICALS.map((v) => ({
        key: `viewall:${v.key}`,
        label: v.title,
        sub: `${v.items.length} ${v.items.length === 1 ? 'result' : 'results'}`,
        onPress: () => { resetOverlays(); setViewAllKey(v.key); },
      })),
    },
    {
      title: 'Result pages (A–G)',
      items: [
        { key: 'flip', label: 'A · Resolved store', sub: 'flip → Flipkart', onPress: () => goSerp('flip') },
        { key: 'body', label: 'A · Store + categories', sub: 'body → Body Shop', onPress: () => goSerp('body') },
        { key: 'phar', label: 'A · Store + pharmacy', sub: 'phar → PharmEasy', onPress: () => goSerp('phar') },
        { key: 'mobile', label: 'A · Category-led', sub: 'mobile', onPress: () => goSerp('mobile') },
        { key: 'tira', label: 'A · Thin store', sub: 'tira', onPress: () => goSerp('tira') },
        { key: 'sbi cashback card', label: 'B · Resolved card', sub: 'sbi cashback card', onPress: () => goSerp('sbi cashback card') },
        { key: 'credit', label: 'C · Cards category', sub: 'credit', onPress: () => goSerp('credit') },
        { key: 'cards', label: 'C · Cards vertical', sub: 'cards → all credit cards', onPress: () => goSerp('cards') },
        { key: '₹5,00,000 personal loan', label: 'D · Amount loan', sub: '₹5,00,000 loan', onPress: () => goSerp('₹5,00,000 personal loan') },
        { key: 'loans', label: 'D · Loans vertical', sub: 'loans → all personal loans', onPress: () => goSerp('loans') },
        { key: 'zero balance savings account', label: 'E · Savings feature', sub: 'zero balance savings', onPress: () => goSerp('zero balance savings account') },
        { key: 'whey', label: 'G · Web expand', sub: 'whey → products', onPress: () => goSerp('whey') },
      ],
    },
    {
      title: 'Overview',
      items: [{ key: 'gallery', label: 'All layouts', sub: 'every SERP shape', onPress: () => { resetOverlays(); setGallery(true); } }],
    },
  ];

  // Full-bleed hero SERP — store heroes (D069) and card heroes (D104). The layer is mounted HERE, as a
  // sibling ABOVE the mock status bar rather than inside the stage — `stageBody`
  // clips (`overflow: hidden`) and starts below the status bar, so a wash mounted
  // inside it could only ever be cut off at that line. From here one gradient
  // runs from the physical top of the device, and every chrome layer over it goes
  // transparent: the status bar, the search bar wrap (whose white underlay fades
  // back in on scroll), and the search body's page fill.
  // Any full-page overlay (category, View-all, gallery) covers the stage, so the
  // scene must not keep tinting the status bar above it.
  const overlayOpen = !!catPage || !!viewAllCat || !!viewAllKey || gallery;
  const heroBleed =
    active && mode === 'serp' && !!model?.hero && isBleedHeroItem(model.hero) && !overlayOpen;
  // White comes back under BOTH chrome strips together as the page scrolls: the
  // search bar (from inside the stage, so it also hides content passing beneath
  // it) and the status bar (from outside it, since `stageBody` can't paint up
  // there). One opacity drives both, or they desync into a white bar under a
  // still-tinted status bar. Nearly immediate — 16px of travel is all the slack
  // there is before hero content reaches the underside of the field.
  const chromeVeilStyle = useAnimatedStyle(
    () => ({
      opacity: heroBleed ? interpolate(serpScrollY.value, [16, 96], [0, 1], Extrapolation.CLAMP) : 0,
    }),
    [heroBleed],
  );

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(g.value, [0, 1], [REST_Y, TOP_Y], Extrapolation.CLAMP) }],
  }));
  const homeStyle = useAnimatedStyle(() => ({ opacity: interpolate(g.value, [0, 0.6], [1, 0], Extrapolation.CLAMP) }));
  const searchStyle = useAnimatedStyle(() => ({ opacity: interpolate(g.value, [0.35, 1], [0, 1], Extrapolation.CLAMP) }));

  // The voice sheet takes the keyboard's place, so the two are mutually exclusive.
  const kbVisible = active && mode === 'typing' && Platform.OS === 'web' && !voice;

  // How far a raised keyboard eats into the stage. Web: the mock tray, which sits
  // inside the stage already. Native: the real keyboard, measured from the screen
  // bottom — so it also covers the mock nav chrome that sits below the stage.
  // Web: the mock tray, which sits inside the stage. Native: the real keyboard,
  // measured from the screen bottom — and since the mock bottom affordance no longer
  // renders there, nothing has to be subtracted from it.
  const kbInset = kbVisible
    ? kbH
    : Math.max(0, osKbH - (Platform.OS === 'web' ? NAV_CHROME_H[device.os] : 0));

  const app = (
    <>
      {/* The store hero's living wash, from the physical top of the device (D069).
          First child → every layer below paints over it. */}
      {heroBleed && model?.hero && <HeroBleed item={model.hero} scrollY={serpScrollY} />}

      {/* White for the status-bar strip, fading in on scroll in lockstep with the
          search bar's underlay. It is NOT inside the web-only branch below: on a
          device there is no mock bar to tint, but the wash still runs up into
          `insets.top`, so without this the real OS status bar kept its tint while
          the search bar under it had already gone white (D069). */}
      <Animated.View
        pointerEvents="none"
        style={[styles.statusVeil, { height: Platform.OS === 'web' ? STATUS_BAR_H : insets.top }, chromeVeilStyle]}
      />

      {/* Mock OS chrome is for the web device frame only — on a real device the
          OS draws its own status bar and `insets.top` already reserves its space. */}
      {Platform.OS === 'web' && <StatusBar os={device.os} notch={device.notch} transparent={heroBleed} />}
      <View style={styles.stageBody}>
        {/* Home layer */}
        <Animated.View style={[StyleSheet.absoluteFill, homeStyle]} pointerEvents={active ? 'none' : 'auto'}>
          <HomeScreen onPick={openFromHome} />
          {/* Showcase-only: flips the whole flow between a new and an existing user
              from inside the phone (D102). Declared AFTER HomeScreen so it paints
              over it, and inside the Home layer so it fades out with Home and stops
              taking taps the moment search opens. */}
          <UserTypeSwitch
            value={userType}
            onChange={setUserType}
            bottom={APP_TAB_BAR_H + insets.bottom + space.s12}
          />
        </Animated.View>

        {/* Search layer — shrinks to sit above the on-screen keyboard so its
            content (deals etc.) can scroll fully clear of it */}
        <Animated.View
          style={[StyleSheet.absoluteFill, searchStyle, kbInset ? { bottom: kbInset } : null]}
          pointerEvents={active ? 'auto' : 'none'}
        >
          <SearchBody
            mode={mode}
            query={debounced}
            committed={committed}
            groups={groups}
            model={model}
            serpLoading={serpLoading}
            recents={recents}
            enterTick={enterTick}
            userType={userType}
            scrollY={serpScrollY}
            heroBleed={heroBleed}
            onClearRecents={() => setRecents([])}
            onRemoveRecent={(q) => setRecents((r) => r.filter((x) => x !== q))}
            webResults={committed.trim().toLowerCase() === 'whey' ? webResultsForWhey : []}
            onPick={commit}
            onOpenStore={openStore}
            onViewAllStores={openViewAll}
            onOpenCategory={openCategory}
          />
        </Animated.View>

        {/* THE one search bar — hoisted here, glides between Home + Search */}
        <Animated.View style={[styles.barHost, barStyle]} pointerEvents="box-none">
          {/* White comes back under the transparent bar as the SERP scrolls, so
              content never slides visibly beneath the naked field (D069). */}
          <Animated.View pointerEvents="none" style={[styles.barUnderlay, chromeVeilStyle]} />
          <SearchBar
            onWash={heroBleed}
            value={text}
            onChangeText={(s) => {
              setText(s);
              setMode('typing');
            }}
            onFocus={focusSearch}
            onSubmit={() => text.trim() && commit(text)}
            onBack={back}
            onClear={() => {
              setText('');
              setMode('typing');
            }}
            onVoice={openVoice}
            showBack={active}
            inputRef={inputRef}
            placeholder="Search stores, products, cards…"
          />
        </Animated.View>

        {/* Voice sheet — takes over from the keyboard (kbVisible is gated on !voice)
            and owns the whole stage, because it dims the page behind itself. */}
        {voice && (
          <VoiceSheet visible={voice} onCancel={() => closeVoice()} onCommit={(q) => closeVoice(q)} />
        )}

        {kbVisible && (
          <View style={styles.keyboardWrap} onLayout={(e) => setKbH(e.nativeEvent.layout.height)}>
            <Keyboard
              os={device.os}
              onKey={(c) => {
                setText((v) => v + c);
                setMode('typing');
              }}
              onBackspace={() => setText((v) => v.slice(0, -1))}
              onSpace={() => setText((v) => v + ' ')}
              onSubmit={() => text.trim() && commit(text)}
            />
          </View>
        )}

        {/* Product category page — full-page overlay above the search bar */}
        {catPage && (
          <View style={StyleSheet.absoluteFill}>
            <ProductCategory
              categoryKey={catPage.key}
              initialSub={catPage.sub}
              onBack={() => setCatPage(null)}
              onSearch={searchFromOverlay}
              onOpenStore={(q) => {
                setCatPage(null);
                openStore(q);
              }}
              onFindStores={(q) => {
                setCatPage(null);
                commit(q);
              }}
              onViewAllStores={() => {
                const c = categoryByKey(catPage.key);
                if (c) {
                  setCatPage(null);
                  setViewAllCat(c.cat);
                }
              }}
            />
          </View>
        )}

        {/* Catalog "View all" grid — full-page overlay above the search bar */}
        {viewAllCat && (
          <View style={StyleSheet.absoluteFill}>
            <CatalogViewAll
              initialCategory={viewAllCat}
              onBack={() => setViewAllCat(null)}
              onSearch={searchFromOverlay}
            />
          </View>
        )}

        {/* Per-vertical "View all" list — full-page overlay above the search bar */}
        {viewAllKey && (
          <View style={StyleSheet.absoluteFill}>
            <ViewAll
              verticals={VIEW_ALL_VERTICALS}
              activeKey={viewAllKey}
              onSelect={setViewAllKey}
              onBack={() => setViewAllKey(null)}
              onSearch={searchFromOverlay}
            />
          </View>
        )}
      </View>
      {/* Mock bottom affordance is web-frame chrome ONLY. On a device iOS/Android
          draws its own home indicator, so rendering ours put two of them on screen
          and stole 24px from the stage. Matches the StatusBar gate above. */}
      {Platform.OS === 'web' && <NavChrome os={device.os} />}
    </>
  );

  if (!isWide) return <View style={[styles.device, { paddingTop: insets.top }]}>{app}</View>;

  const frameH = Math.min(device.h, height - 132);
  return (
    <View style={styles.stage}>
      <View style={styles.toolbar}>
        <Text style={[t.body14SemiBold, { color: color.textInverse }]}>CashKaro Search</Text>
        <View style={styles.toolbarGroup}>
          {DEVICES.map((d) => {
            const on = !gallery && d.key === device.key;
            return (
              <Pressable key={d.key} onPress={() => { setDevice(d); setGallery(false); }} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[t.body12Medium, { color: on ? color.textInverse : '#9a9aa6' }]}>{d.name}</Text>
              </Pressable>
            );
          })}
          <View style={styles.sep} />
          <Pressable onPress={() => setGallery((v) => !v)} style={[styles.chip, gallery && styles.chipOn]}>
            <Text style={[t.body12Medium, { color: gallery ? color.textInverse : '#9a9aa6' }]}>▦ All layouts</Text>
          </Pressable>
          {/* User-type control — preview chrome, outside the phone design */}
          <View style={styles.sep} />
          <Text style={[t.body12Medium, { color: '#6b6b78', marginRight: space.xs }]}>User</Text>
          {(['new', 'existing'] as const).map((u) => {
            const on = userType === u;
            return (
              <Pressable key={u} onPress={() => setUserType(u)} style={[styles.chip, on && styles.chipOn]}>
                <Text style={[t.body12Medium, { color: on ? color.textInverse : '#9a9aa6' }]}>{u === 'new' ? 'New' : 'Existing'}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.workspace}>
        <ScreenNav sections={navSections} activeKey={activeScreen} />
        <View style={styles.workspaceMain}>
          {gallery ? (
            <View style={styles.galleryWrap}>
              <Gallery />
            </View>
          ) : (
            <View style={styles.frameWrap}>
              <View style={[styles.deviceFramed, { width: device.w, height: frameH, borderRadius: device.radius || radius.md }]}>
                {app}
              </View>
              <Text style={[t.body12Regular, styles.caption]}>
                {device.name} · {device.w}×{device.h} · {device.os.toUpperCase()} — tap search, then try amazon · flipkart · croma · credit
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: '#0f0f14' },
  stageBody: { flex: 1, overflow: 'hidden' },
  barHost: { position: 'absolute', top: 0, left: 0, right: 0 },
  // Reaches TOP_Y above the bar so it also covers the sliver between the docked
  // bar and the status bar once the HeroBleed wash has faded out (D069).
  barUnderlay: { position: 'absolute', top: -TOP_Y, left: 0, right: 0, bottom: 0, backgroundColor: color.surface },
  // No zIndex: it is declared after HeroBleed (so it covers the wash) and before
  // the status bar (so the clock and icons still paint on top of it).
  statusVeil: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: color.surface },
  keyboardWrap: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.l, paddingVertical: space.s12, gap: space.m, flexWrap: 'wrap',
  },
  toolbarGroup: { flexDirection: 'row', alignItems: 'center', gap: space.s, flexWrap: 'wrap' },
  chip: { paddingHorizontal: space.s12, paddingVertical: space.s, borderRadius: radius.full, backgroundColor: '#1c1c24' },
  chipOn: { backgroundColor: '#3a3a46' },
  sep: { width: 1, height: 20, backgroundColor: '#2a2a34', marginHorizontal: space.xs },
  workspace: { flex: 1, flexDirection: 'row' },
  workspaceMain: { flex: 1 },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.s12 },
  caption: { color: '#6b6b78' },
  galleryWrap: { flex: 1, marginHorizontal: space.l, marginBottom: space.l, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: '#26262e' },
  device: { flex: 1, backgroundColor: color.surface },
  deviceFramed: { backgroundColor: color.surface, overflow: 'hidden', borderWidth: 6, borderColor: '#000000', ...elevation.lg },
});
