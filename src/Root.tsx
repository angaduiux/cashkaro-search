import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
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
import { HomeScreen } from './screens/HomeScreen';
import { SearchBody } from './screens/SearchBody';
import { Gallery } from './screens/Gallery';
import { CatalogViewAll } from './screens/CatalogViewAll';
import { ViewAll } from './screens/ViewAll';
import { ScreenNav, NavSection } from './components/ScreenNav';
import { Keyboard } from './os/Keyboard';
import { StatusBar } from './os/StatusBar';
import { NavChrome } from './os/NavChrome';
import { DEVICES, DEFAULT_DEVICE, Device } from './os/devices';
import { REAL_CASES, webResultsForWhey, buildSuggestions, ALL_DEALS, VIEW_ALL_VERTICALS } from './data/realData';
import { searchStores, buildSerp, buildStorePage, _setDealItems, Cat } from './data/catalog';

_setDealItems(ALL_DEALS);

const REST_Y = 64; // shared bar resting in the Home slot (just below the brand header)
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
  const [enterTick, setEnterTick] = useState(0); // bumps on search-bar tap → replays count-ups
  const [userType, setUserType] = useState<'new' | 'existing'>('new'); // drives new/existing flow
  const [kbH, setKbH] = useState(0); // measured on-screen keyboard height (web)
  const reduced = useReducedMotion();
  const g = useSharedValue(0); // 0 = Home, 1 = searching
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

  const focusSearch = () => {
    if (!active) {
      setActive(true);
      setMode('typing');
      glide(1);
    }
    setEnterTick((t) => t + 1); // replay Explore cashback count-ups on entry
  };
  const commit = (q: string) => {
    setText(q);
    setCommitted(q);
    setDirectStore(null);
    setMode('serp');
    setActive(true);
    setSerpLoading(true);
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
    glide(1);
    timers.current.push(setTimeout(() => setSerpLoading(false), 500));
  };
  const openFromHome = (q?: string) => (q ? commit(q) : (setText(''), focusSearch()));
  const back = () => {
    if (mode === 'serp') {
      setMode('typing');
      setText('');
      setCommitted('');
      setDirectStore(null);
    } else {
      setActive(false);
      setText('');
      setCommitted('');
      setDirectStore(null);
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
    return buildSerp(committed);
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
        { key: '₹5,00,000 personal loan', label: 'D · Amount loan', sub: '₹5,00,000 loan', onPress: () => goSerp('₹5,00,000 personal loan') },
        { key: 'zero balance savings account', label: 'E · Savings feature', sub: 'zero balance savings', onPress: () => goSerp('zero balance savings account') },
        { key: 'whey', label: 'G · Web expand', sub: 'whey → products', onPress: () => goSerp('whey') },
      ],
    },
    {
      title: 'Overview',
      items: [{ key: 'gallery', label: 'All layouts', sub: 'every SERP shape', onPress: () => { resetOverlays(); setGallery(true); } }],
    },
  ];

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(g.value, [0, 1], [REST_Y, TOP_Y], Extrapolation.CLAMP) }],
  }));
  const homeStyle = useAnimatedStyle(() => ({ opacity: interpolate(g.value, [0, 0.6], [1, 0], Extrapolation.CLAMP) }));
  const searchStyle = useAnimatedStyle(() => ({ opacity: interpolate(g.value, [0.35, 1], [0, 1], Extrapolation.CLAMP) }));

  const kbVisible = active && mode === 'typing' && Platform.OS === 'web';

  const app = (
    <>
      <StatusBar os={device.os} notch={device.notch} />
      <View style={styles.stageBody}>
        {/* Home layer */}
        <Animated.View style={[StyleSheet.absoluteFill, homeStyle]} pointerEvents={active ? 'none' : 'auto'}>
          <HomeScreen onPick={openFromHome} />
        </Animated.View>

        {/* Search layer — shrinks to sit above the on-screen keyboard so its
            content (deals etc.) can scroll fully clear of it */}
        <Animated.View
          style={[StyleSheet.absoluteFill, searchStyle, kbVisible && kbH ? { bottom: kbH } : null]}
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
            onClearRecents={() => setRecents([])}
            onRemoveRecent={(q) => setRecents((r) => r.filter((x) => x !== q))}
            webResults={committed.trim().toLowerCase() === 'whey' ? webResultsForWhey : []}
            onPick={commit}
            onOpenStore={openStore}
            onViewAllStores={openViewAll}
          />
        </Animated.View>

        {/* THE one search bar — hoisted here, glides between Home + Search */}
        <Animated.View style={[styles.barHost, barStyle]} pointerEvents="box-none">
          <SearchBar
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
            showBack={active}
            placeholder="Search stores, products, cards…"
          />
        </Animated.View>

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

        {/* Catalog "View all" grid — full-page overlay above the search bar */}
        {viewAllCat && (
          <View style={StyleSheet.absoluteFill}>
            <CatalogViewAll
              initialCategory={viewAllCat}
              onBack={() => setViewAllCat(null)}
              onSearch={() => {
                setViewAllCat(null);
                focusSearch();
              }}
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
              onSearch={() => {
                setViewAllKey(null);
                focusSearch();
              }}
            />
          </View>
        )}
      </View>
      <NavChrome os={device.os} />
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
