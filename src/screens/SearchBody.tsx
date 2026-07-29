import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { color, space, duration } from '../theme/tokens';
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
 * floating bar.
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
    <View style={styles.body}>
      {mode === 'typing' &&
        (query.trim().length === 0 ? (
          <ExploreHome recents={recents} enterTick={enterTick} userType={userType} onPick={onPick} onOpenStore={onOpenStore} onClearRecents={onClearRecents} onRemoveRecent={onRemoveRecent} />
        ) : (
          <Suggestions query={query} groups={groups} onPick={onPick} onOpenCategory={onOpenCategory} />
        ))}

      {mode === 'serp' &&
        (model ? (
          <Animated.View style={{ flex: 1 }} entering={FadeIn.duration(duration.base)}>
            <SerpShell
              model={model}
              loading={serpLoading}
              webResults={webResults}
              userType={userType}
              onViewAllStores={onViewAllStores}
              onOpenCategory={onOpenCategory}
            />
          </Animated.View>
        ) : (
          <RecoveryScreen query={committed} onExpand={() => {}} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // room for the floating shared bar (~64) hoisted at the app root
  body: { flex: 1, paddingTop: 64, backgroundColor: color.surface },
});
