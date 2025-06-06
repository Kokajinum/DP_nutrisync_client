import { Router, Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import CButton from "@/components/button/CButton";
import { STORAGE_KEY_HAS_LAUNCHED, _500Medium, _600SemiBold } from "@/constants/Global";
import { setStorageItem } from "@/utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <MaterialIcons name="check" size={24} color="green" />
    <ThemedText style={styles.featureText}>{text}</ThemedText>
  </View>
);

const WelcomeScreen = () => {
  const router: Router = useRouter();
  const { t } = useTranslation();
  const backgroundGradientStart = useThemeColor({}, "secondary");
  const backgroundGradientEnd = useThemeColor({}, "background");

  const handleLoginPress = async () => {
    await setStorageItem(STORAGE_KEY_HAS_LAUNCHED, "true");
    router.push("/login-screen");
  };

  const handleSignUpPress = async () => {
    await setStorageItem(STORAGE_KEY_HAS_LAUNCHED, "true");
    router.push("/register-screen");
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[backgroundGradientStart, backgroundGradientEnd]}
        locations={[0, 0.47]}
        style={styles.gradient}>
        <ScrollView>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.welcomeText}>
              {t(TranslationKeys.welcome)}
            </ThemedText>
            <ThemedText type="title" style={styles.appName}>
              {t(TranslationKeys.app_name)}
            </ThemedText>
            <Image
              source={require("../assets/images/welcome-page/welcome-page-background.svg")}
              transition={1000}
              style={styles.headerImage}
              contentFit="contain"
            />
          </View>

          <ThemedText style={styles.subtitle}>{t(TranslationKeys.personal_guide)}</ThemedText>

          <View style={styles.features}>
            <FeatureItem text={t(TranslationKeys.track_calories)} />
            <FeatureItem text={t(TranslationKeys.sync_activity)} />
            <FeatureItem text={t(TranslationKeys.mindful_eating)} />
            <FeatureItem text={t(TranslationKeys.personalized_recommendations)} />
          </View>
        </ScrollView>

        <View style={styles.buttons}>
          <CButton
            title={t(TranslationKeys.sign_up)}
            onPress={handleSignUpPress}
            icon={<MaterialIcons name="person-add" />}
            style={styles.button}
          />
          <CButton
            title={t(TranslationKeys.log_in)}
            onPress={handleLoginPress}
            icon={<MaterialIcons name="login" />}
            style={styles.button}
          />
        </View>
      </LinearGradient>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: "space-between",
  },
  header: {
    marginTop: 60,
    height: 250,
  },
  welcomeText: {
    fontFamily: _600SemiBold,
    zIndex: 1, //pro ios
    elevation: 1, //pro android
  },
  appName: {
    fontSize: 30,
    marginTop: 10,
    zIndex: 1, //pro ios
    elevation: 1, //pro android
  },
  subtitle: {
    fontSize: 18,
    fontFamily: _600SemiBold,
    marginTop: 15,
    marginBottom: 20,
  },
  features: {},
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
    marginTop: "auto", //buttons will stick on bottom
  },
  button: {
    width: "100%",
    marginVertical: 6,
    borderRadius: 12,
  },
  headerContent: {
    position: "absolute",
    top: 50,
    left: 20,
    fontSize: 24,
    fontWeight: "bold",
    zIndex: 1,
  },
  headerImage: {
    position: "absolute",
    top: 20,
    right: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    elevation: 0,
    opacity: 0.6,
  },
});

export default WelcomeScreen;
