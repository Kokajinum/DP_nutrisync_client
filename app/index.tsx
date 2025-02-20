import { Router, Slot, useRouter } from "expo-router";
import { StyleSheet, Image, View, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import CButton from "@/components/button/CButton";
import { STORAGE_KEY_HAS_LAUNCHED, _500Medium, _600SemiBold } from "@/constants/Global";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import { useCallback, useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "@/context/AuthProvider";

const IndexPage = () => {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkFirstLaunchAndAuth = async () => {
      try {
        if (loading) {
          return;
        }

        const hasLaunchedBefore = await getStorageItem(STORAGE_KEY_HAS_LAUNCHED);

        if (!loading) {
          if (session) {
            router.replace("/(tabs)/HomeScreen");
          } else if (hasLaunchedBefore) {
            router.replace("/LoginScreen");
          } else {
            router.replace("/WelcomeScreen");
          }
        }
      } catch (e) {
        console.error("Error in checkFirstLaunchAndAuth:", e);
        router.replace("/LoginScreen");
      }
    };

    checkFirstLaunchAndAuth();
  }, [session, loading, router]);
};

const AuthCheck = () => {
  const { session, loading, isInitialAuthCheckComplete } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkFirstLaunchAndAuth = async () => {
      try {
        if (loading) {
          return;
        }

        const hasLaunchedBefore = await getStorageItem(STORAGE_KEY_HAS_LAUNCHED);

        if (!loading) {
          if (session) {
            router.replace("/(tabs)/HomeScreen");
          } else if (hasLaunchedBefore) {
            router.push("/LoginScreen");
          } else {
          }
        }
      } catch (e) {
        console.error("Error in checkFirstLaunchAndAuth:", e);
      }
    };

    checkFirstLaunchAndAuth();
  }, [session, loading, router]);

  // Only render content when initial auth check is complete
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
};

export default IndexPage;
