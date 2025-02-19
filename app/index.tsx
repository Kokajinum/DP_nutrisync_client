import { Router, useRouter } from "expo-router";
import { StyleSheet, Image, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import CButton from "@/components/button/CButton";
import { STORAGE_KEY_HAS_LAUNCHED, _500Medium, _600SemiBold } from "@/constants/Global";
import { setStorageItem } from "@/utils/storage";
import { useCallback, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/hooks/useThemeColor";
import { StatusBar } from "expo-status-bar";

const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <MaterialIcons name="check" size={24} color="green" />
    <ThemedText style={styles.featureText}>{text}</ThemedText>
  </View>
);

const WelcomeScreen = () => {
  const router: Router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const backgroundGradientStart = useThemeColor({}, "secondary");
  const backgroundGradientEnd = useThemeColor({}, "background");

  const handleLoginPress = async () => {
    await setStorageItem(STORAGE_KEY_HAS_LAUNCHED, "true");
    router.push("/login");
  };

  const handleSignUpPress = async () => {
    await setStorageItem(STORAGE_KEY_HAS_LAUNCHED, "true");
    router.push("/register");
  };

  const handleContinueWithoutAccount = () => {
    router.push("/(tabs)");
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[backgroundGradientStart, backgroundGradientEnd]}
        style={styles.gradient}>
        <StatusBar backgroundColor={backgroundGradientStart}></StatusBar>
        {/* <Image
        source={require("@/assets/images/welcome-page/welcome-page-background.svg")}
        style={styles.backgroundImage}
      /> */}

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.welcomeText}>
              Welcome to
            </ThemedText>
            <ThemedText type="title" style={styles.appName}>
              NutriSync
            </ThemedText>
          </View>

          <ThemedText style={styles.subtitle}>
            Your personal guide to a healthy lifestyle is here.
          </ThemedText>

          <View style={styles.features}>
            <FeatureItem text="Track calorie intake" />
            <FeatureItem text="Sync activity data" />
            <FeatureItem text="Create mindful eating habit" />
            <FeatureItem text="discover personalized recommendations for your ideal diet" />
          </View>

          <View style={styles.buttons}>
            <CButton
              title="Sign Up"
              onPress={handleSignUpPress}
              icon={<MaterialIcons name="person-add" />}
              style={styles.button}
            />
            <CButton
              title="Log In"
              onPress={handleLoginPress}
              icon={<MaterialIcons name="login" />}
              style={styles.button}
            />
            <CButton
              title="Continue Without Account"
              onPress={handleContinueWithoutAccount}
              icon={<MaterialIcons name="rocket-launch"></MaterialIcons>}
              style={styles.button}
            />
          </View>
        </View>
      </LinearGradient>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontFamily: _600SemiBold,
  },
  appName: {
    fontSize: 32,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
  },
  features: {
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  buttons: {
    marginTop: "auto",
  },
  button: {
    width: "100%",
    marginVertical: 6,
    borderRadius: 12,
  },
});

export default WelcomeScreen;
