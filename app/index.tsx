import { useRouter } from "expo-router";
import { STORAGE_KEY_HAS_LAUNCHED, _500Medium, _600SemiBold } from "@/constants/Global";
import { getStorageItem } from "@/utils/storage";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { ActivityIndicator, View, StyleSheet } from "react-native";

const IndexPage = () => {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkFirstLaunchAndAuth = async () => {
      try {
        if (loading) {
          <View style={styles.center}>
            <ActivityIndicator size="large" />
          </View>;
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

export default IndexPage;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
