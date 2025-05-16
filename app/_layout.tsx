import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { AuthProvider, useAuth } from "@/context/AuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import { I18nextProvider } from "react-i18next";
import i18n from "@/translations/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RestManagerProvider } from "@/context/RestManagerProvider";
import { RepositoriesProvider } from "@/context/RepositoriesProvider";
import { initDb } from "@/utils/sqliteHelper";
import { OfflineManager } from "utils/managers/OfflineManager";
import NetInfo from "@react-native-community/netinfo";

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
  const queryClient = new QueryClient();

  useEffect(() => {
    async function prepareApp() {
      try {
        // Initialize database schema
        await initDb();
      } catch (e) {
        console.warn("Error initializing app:", e);
      } finally {
        setAppReady(true);
      }
    }
    prepareApp();

    // Initialize offline manager
    registerOfflineProcessors();
    // Initialize cleanup function
    const unsubscribe = setupOfflineSync();
    return () => unsubscribe();
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
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RestManagerProvider>
          <RepositoriesProvider>
            <ThemeProvider>
              <I18nextProvider i18n={i18n}>
                <Stack>
                  <Stack.Screen name="index" options={{ headerShown: false }}></Stack.Screen>
                  <Stack.Screen
                    name="WelcomeScreen"
                    options={{ headerShown: false }}></Stack.Screen>
                  <Stack.Screen
                    name="RegisterScreen"
                    options={
                      {
                        //headerStyle: { backgroundColor: "transparent" },
                        //headerTransparent: true,
                      }
                    }></Stack.Screen>
                  <Stack.Screen name="LoginScreen"></Stack.Screen>
                  <Stack.Screen
                    name="food-creation-screen"
                    options={{ headerShown: true }}></Stack.Screen>
                </Stack>
                <ThemedStatusBar />
              </I18nextProvider>
            </ThemeProvider>
          </RepositoriesProvider>
        </RestManagerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export const registerOfflineProcessors = () => {
  OfflineManager.register("create_food_entry", async (payload) => {
    //await foodDiaryRepository.remote.create(payload);
  });

  OfflineManager.register("create_activity_entry", async (payload) => {
    //await activityDiaryRepository.remote.create(payload);
  });
};

export const setupOfflineSync = () => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      OfflineManager.processQueue();
    }
  });

  return unsubscribe;
};
