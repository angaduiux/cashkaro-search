import React from 'react';
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
    // Font Awesome 6 Pro (licensed .otf, bundled from desktop install)
    'FA6Pro-Solid': require('./assets/fonts/FontAwesome6Pro-Solid.otf'),
    'FA6Pro-Regular': require('./assets/fonts/FontAwesome6Pro-Regular.otf'),
    'FA6Pro-Light': require('./assets/fonts/FontAwesome6Pro-Light.otf'),
    'FA6Brands': require('./assets/fonts/FontAwesome6Brands-Regular.otf'),
    'FA6Duotone-Solid': require('./assets/fonts/FontAwesome6Duotone-Solid.otf'),
  });

  if (!loaded) {
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
