/**
 * Preview-chrome side panel (web wide layout only) listing every screen type
 * the app can render, so any state is one tap away. Purely a dev/preview
 * navigator — lives outside the phone frame and matches the dark stage chrome.
 */
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { type as t, space, radius } from '../theme/tokens';


export type NavItem = { key: string; label: string; sub?: string; onPress: () => void };
export type NavSection = { title: string; items: NavItem[] };

export function ScreenNav({ sections, activeKey }: { sections: NavSection[]; activeKey: string }) {
  return (
    <View style={styles.panel}>
      <Text style={[t.body12Medium, styles.panelTitle]}>SCREENS</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {sections.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <Text style={[t.body12Medium, styles.sectionTitle]}>{sec.title}</Text>
            {sec.items.map((it) => {
              const on = it.key === activeKey;
              return (
                <Pressable key={it.key} onPress={it.onPress} style={[styles.item, on && styles.itemOn]}>
                  <Text style={[t.body12Medium, { color: on ? '#ffffff' : '#c7c7d1' }]} numberOfLines={1}>
                    {it.label}
                  </Text>
                  {it.sub ? (
                    <Text style={[t.body12Regular, { color: on ? '#9a9ab0' : '#6b6b78', fontSize: 11 }]} numberOfLines={1}>
                      {it.sub}
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ))}
        <View style={{ height: space.l }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 232,
    backgroundColor: '#14141b',
    borderRightWidth: 1,
    borderRightColor: '#26262e',
  },
  panelTitle: {
    color: '#6b6b78',
    letterSpacing: 1,
    paddingHorizontal: space.m,
    paddingTop: space.m,
    paddingBottom: space.s,
  },
  scroll: { flex: 1 },
  scrollBody: { paddingHorizontal: space.s },
  section: { marginBottom: space.m },
  sectionTitle: {
    color: '#8a8a98',
    letterSpacing: 0.5,
    paddingHorizontal: space.s,
    paddingVertical: space.xs,
  },
  item: {
    paddingHorizontal: space.s12,
    paddingVertical: space.s,
    borderRadius: radius.md,
    gap: 1,
  },
  itemOn: { backgroundColor: '#3a3a46' },
});
