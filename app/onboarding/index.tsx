import { ScrollView, StyleSheet } from "react-native";
import React from "react";
import { router } from "expo-router";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import CButton from "@/components/button/CButton";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { _600SemiBold } from "@/constants/Global";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import CAccordion from "@/components/text/CAccordion";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { globalStyles } from "@/utils/global-styles";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { useOnboardingStore } from "@/stores/onboardingStore";

const index = () => {
  const { t } = useTranslation();
  const { setStep } = useOnboardingStore();

  const handleSubmit = () => {
    setStep(1);

    router.push("/onboarding/onboarding-first");
  };

  return (
    <ThemedView style={[styles.mainContainer, globalStyles.globalMainContent]}>
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.welcome),
        }}></ThemedStackScreen>
      <ThemedStatusBar></ThemedStatusBar>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">
          {t(TranslationKeys.onboarding_pre_onboarding_heading)}
        </ThemedText>
        <CAccordion
          title={t(TranslationKeys.onboarding_fitness_goals_title)}
          content={t(TranslationKeys.onboarding_fitness_goals_content)}
          leftIcon={<MaterialIcons name="outlined-flag" size={24} />}
        />
        <CAccordion
          title={t(TranslationKeys.onboarding_activity_level_title)}
          content={t(TranslationKeys.onboarding_activity_level_content)}
          leftIcon={<MaterialIcons name="directions-run" size={24} />}
        />
        <CAccordion
          title={t(TranslationKeys.onboarding_training_plan_title)}
          content={t(TranslationKeys.onboarding_training_plan_content)}
          leftIcon={<MaterialIcons name="fitness-center" size={24} />}
        />
        <CAccordion
          title={t(TranslationKeys.onboarding_body_stats_title)}
          content={t(TranslationKeys.onboarding_body_stats_content)}
          leftIcon={<MaterialIcons name="perm-contact-cal" size={24} />}
        />
      </ScrollView>
      <CButton
        style={styles.buttonContainer}
        icon={<MaterialIcons name="rocket-launch"></MaterialIcons>}
        title={t(TranslationKeys.onboarding_start_button)}
        onPress={handleSubmit}></CButton>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  content: {},
  buttonContainer: {
    marginTop: "auto",
  },
});

export default index;
