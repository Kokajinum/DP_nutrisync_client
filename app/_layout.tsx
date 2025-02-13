import { Slot, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, Text } from "react-native";
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
        //await delay(4000);
        console.log("test log after splash screen hide");
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
          <AuthCheck />
        </SafeAreaView>
      </ThemeProvider>
    </AuthProvider>
  );
}

const AuthCheck = () => {
  const { session, loading } = useAuth();
  const router = useRouter();
  const [isFirstLaunchChecked, setIsFirstLaunchChecked] = useState(false);

  useEffect(() => {
    const checkFirstLaunchAndAuth = async () => {
      try {
        if (loading) return;

        const hasLaunchedBefore = await getStorageItem(STORAGE_KEY_HAS_LAUNCHED);

        if (!loading) {
          setIsFirstLaunchChecked(true);
          if (session) {
            router.replace("/(tabs)/home");
          } else if (hasLaunchedBefore) {
            router.push("/login");
          }
        }
      } catch (e) {
        console.error("Error in checkFirstLaunchAndAuth:", e);
      }
    };

    checkFirstLaunchAndAuth();
  }, [session, loading, router]);

  // Always render Slot to ensure proper navigation
  return <Slot />;
};
