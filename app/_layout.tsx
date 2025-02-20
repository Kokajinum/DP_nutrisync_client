import { Slot, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Quicksand_300Light,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import { delay } from "@/utils/methods";
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { getStorageItem } from "@/utils/storage";
import { STORAGE_KEY_HAS_LAUNCHED } from "@/constants/Global";
import { ThemeProvider } from "@/context/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: '(tabs)',
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  const [loaded] = useFonts({
    Quicksand_300Light,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
  });
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
      } catch (e) {
        console.warn("Error loading fonts:", e);
      } finally {
        setAppReady(true);
      }
    }
    prepareApp();
  }, []);

  useEffect(() => {
    if (loaded && appReady) {
      SplashScreen.hideAsync();
    }
  }, [loaded, appReady]);

  if (!loaded || !appReady) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <ThemedStatusBar />
          <Slot></Slot>
        </SafeAreaView>
      </ThemeProvider>
    </AuthProvider>
  );
}
