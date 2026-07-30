import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn, SharedValue } from 'react-native-reanimated';
import { color, duration } from '../theme/tokens';
import { Suggestions } from '../components/Suggestions';
import { SerpShell } from '../components/SerpShell';
import { RecoveryScreen } from './Recovery';
import { ExploreHome } from './ExploreHome';
import { SuggestGroup } from '../components/Suggestions';
import { SerpModel, ResultItem } from '../data/dataContract';

/**
 * Search screen body — everything BELOW the shared search bar (which is hoisted
 * to the app root and glides in). Empty query → explore landing; typing → grouped
 * suggestions; committed → SERP (or recovery). Top padding leaves room for the
 * floating bar. On a store-hero SERP (`heroBleed`, D069) the page fill drops away
 * so Root's full-bleed wash — mounted above the status bar, behind everything —
 * shows through.
 */
export function SearchBody({
  mode,
  query,
  committed,
  groups,
  model,
  serpLoading,
  recents,
  enterTick,
  userType,
  scrollY,
  heroBleed = false,
  onClearRecents,
  onRemoveRecent,
  webResults,
  onPick,
  onOpenStore,
  onViewAllStores,
  onOpenCategory,
}: {
  mode: 'typing' | 'serp';
  query: string;
  committed: string;
  groups: SuggestGroup[];
  model?: SerpModel;
  serpLoading: boolean;
  recents: string[];
  enterTick: number;
  userType: 'new' | 'existing';
  /** SERP scroll offset, written by SerpShell — drives Root's HeroBleed backdrop
   *  and the search bar's white underlay (D069). */
  scrollY?: SharedValue<number>;
  /** Root's full-bleed store-hero wash is showing behind this screen (D069). */
  heroBleed?: boolean;
  onClearRecents: () => void;
  onRemoveRecent: (q: string) => void;
  webResults: ResultItem[];
  onPick: (q: string) => void;
  onOpenStore: (q: string) => void;
  onViewAllStores?: () => void;
  /** A category row/chip anywhere in search → that product category page. */
  onOpenCategory?: (title: string) => void;
}) {
  return (
    <View style={[styles.body, heroBleed && styles.bodyBleed]}>
      {mode === 'typing' &&
        (query.trim().length === 0 ? (
          <ExploreHome recents={recents} enterTick={enterTick} userType={userType} onPick={onPick} onOpenStore={onOpenStore} onClearRecents={onClearRecents} onRemoveRecent={onRemoveRecent} />
        ) : (
          <Suggestions query={query} groups={groups} onPick={onPick} onOpenCategory={onOpenCategory} />
        ))}

      {mode === 'serp' &&
        (model ? (
          <Animated.View style={styles.serp} entering={FadeIn.duration(duration.base)}>
            <SerpShell
              model={model}
              loading={serpLoading}
              webResults={webResults}
              userType={userType}
              heroBleed={heroBleed}
              scrollY={scrollY}
              onViewAllStores={onViewAllStores}
              onOpenCategory={onOpenCategory}
            />
          </Animated.View>
        ) : (
          /* Nothing resolved → recovery, which offers the spelling correction (D112). */
          <RecoveryScreen query={committed} onExpand={() => {}} onPick={onPick} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // room for the floating shared bar (~64) hoisted at the app root
  body: { flex: 1, paddingTop: 64, backgroundColor: color.surface },
  // Root's wash is painting the page behind this screen (D069).
  bodyBleed: { backgroundColor: 'transparent' },
  serp: { flex: 1 },
});
