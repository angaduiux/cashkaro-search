import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { color } from './src/theme/tokens';
import { Root } from './src/Root';

export default function App() {
  const [loaded] = useFonts({
    // Outfit — CashKaro primary type family
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    'Outfit-Bold': Outfit_700Bold,
    'Outfit-ExtraBold': Outfit_800ExtraBold,
    // Font Awesome 6 Pro (licensed .otf, subset to the ~34 glyphs used — §iconMap).
    // Brands + Duotone are not referenced by any icon and are intentionally not
    // bundled (they added ~9MB to the render-blocking font payload).
    'FA6Pro-Solid': require('./assets/fonts/FontAwesome6Pro-Solid.otf'),
    'FA6Pro-Regular': require('./assets/fonts/FontAwesome6Pro-Regular.otf'),
    'FA6Pro-Light': require('./assets/fonts/FontAwesome6Pro-Light.otf'),
  });

  // Fail-safe render gate. On some CDNs (observed on Cloudflare Pages) the
  // aggregate FontFace.load() promises behind `useFonts` stall and never
  // resolve, leaving the app stuck on this spinner forever. We therefore render
  // as soon as fonts are ready OR after a short cap — whichever comes first.
  // Mounting the tree also triggers on-demand FontFace loading, so any glyphs
  // that hadn't loaded swap in within a moment (brief FOUT at worst).
  const [gateOpen, setGateOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGateOpen(true), 1200);
    return () => clearTimeout(t);
  }, []);

  if (!loaded && !gateOpen) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={color.actionPrimary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Root />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: color.surface },
});
