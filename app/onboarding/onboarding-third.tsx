import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from "expo-router";
import { TranslationKeys } from "@/translations/translations";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import CStepIndicator from "@/components/indicators/CStepIndicator";
import { ThemedText } from "@/components/ThemedText";
import CCard from "@/components/cards/CCard";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { globalStyles } from "@/utils/global-styles";
import CButton from "@/components/button/CButton";
import { ExperienceLevelEnum } from "@/models/enums/enums";
import { useOnboardingStore } from "@/stores/onboardingStore";

const OnboardingThird = () => {
  const { t } = useTranslation();
  const { updateData, setStep } = useOnboardingStore();

  const background = useThemeColor({}, "background");

  // Selected experience level (0 = beginner, 1 = experienced)
  const [selectedExperience, setSelectedExperience] = useState<number | null>(null);
  const [showError, setShowError] = useState<boolean>(false);

  const handleExperienceSelection = (index: number): void => {
    setSelectedExperience(index);
    setShowError(false);
  };

  const handleSubmit = (): void => {
    if (selectedExperience === null) {
      setShowError(true);
      return;
    }

    // Map the selected experience to an activity level
    // Beginner -> LIGHT or MODERATE
    // Experienced -> HIGH
    const experienceLevel =
      selectedExperience === 0 ? ExperienceLevelEnum.BEGINNER : ExperienceLevelEnum.INTERMEDIATE;

    // Save to store
    updateData({
      experience_level: experienceLevel,
    });

    setStep(4);

    // Navigate to next screen (assuming there will be a fourth screen)
    router.push("/onboarding/onboarding-fourth");
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.mainContainer,
        globalStyles.globalMainContent,
        { backgroundColor: background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.account_setup),
        }}></ThemedStackScreen>
      <ThemedStatusBar></ThemedStatusBar>

      {/* Step indicators */}
      <ThemedView style={styles.stepIndicatorContainer}>
        <CStepIndicator status="done"></CStepIndicator>
        <CStepIndicator status="done"></CStepIndicator>
        <CStepIndicator status="inProgress"></CStepIndicator>
        <CStepIndicator status="notStarted"></CStepIndicator>
      </ThemedView>

      <ScrollView>
        {/* Question heading */}
        <ThemedText type="subtitle" style={styles.questionHeading}>
          {t(TranslationKeys.onboarding_third_heading)}
        </ThemedText>

        {/* Experience options */}
        <ThemedView style={styles.optionsContainer}>
          {/* Beginner option */}
          <CCard
            title={t(TranslationKeys.beginner_title)}
            description={t(TranslationKeys.beginner_description)}
            leftIcon={<MaterialIcons name="fitness-center" size={24} />}
            isSelected={selectedExperience === 0}
            onPress={() => handleExperienceSelection(0)}
          />

          {/* Experienced option */}
          <CCard
            title={t(TranslationKeys.experienced_title)}
            description={t(TranslationKeys.experienced_description)}
            leftIcon={<MaterialIcons name="fitness-center" size={24} />}
            isSelected={selectedExperience === 1}
            onPress={() => handleExperienceSelection(1)}
          />
        </ThemedView>

        {/* Error message */}
        {showError && (
          <ThemedText style={styles.errorText}>{t(TranslationKeys.error_required)}</ThemedText>
        )}
      </ScrollView>

      {/* Next button */}
      <CButton
        style={styles.buttonContainer}
        icon={<MaterialIcons name="forward" size={24} />}
        title={t(TranslationKeys.onboarding_next_button)}
        onPress={handleSubmit}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  stepIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 20,
  },
  questionHeading: {
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  errorText: {
    color: "red",
    marginTop: 10,
    marginLeft: 16,
  },
  buttonContainer: {
    marginTop: "auto",
  },
});

export default OnboardingThird;
