import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { color } from './src/theme/tokens';
import { Root } from './src/Root';

export default function App() {
  const [loaded] = useFonts({
    // Outfit — CashKaro primary type family. Self-hosted .ttf (NOT the
    // @expo-google-fonts package): Cloudflare Pages excludes node_modules/ from
    // deploys, so package-path fonts 404 to the SPA fallback and text renders
    // in serif fallback. Bundling under assets/fonts keeps them in the deploy.
    'Outfit-Regular': require('./assets/fonts/Outfit-400Regular.ttf'),
    'Outfit-Medium': require('./assets/fonts/Outfit-500Medium.ttf'),
    'Outfit-SemiBold': require('./assets/fonts/Outfit-600SemiBold.ttf'),
    'Outfit-Bold': require('./assets/fonts/Outfit-700Bold.ttf'),
    'Outfit-ExtraBold': require('./assets/fonts/Outfit-800ExtraBold.ttf'),
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
