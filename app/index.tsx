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
        const hasLaunchedBefore = await getStorageItem(STORAGE_KEY_HAS_LAUNCHED);

        if (!loading) {
          if (session) {
            router.replace("/home-screen");
          } else if (hasLaunchedBefore) {
            router.replace("/login-screen");
          } else {
            router.replace("/welcome-screen");
          }
        }
      } catch (e) {
        console.error("Error in checkFirstLaunchAndAuth:", e);
        router.replace("/login-screen");
      }
    };

    checkFirstLaunchAndAuth();
  }, [loading, session]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else {
    null;
  }
};

export default IndexPage;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
