import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useState } from "react";
import { useUserProfileRepository } from "@/hooks/useUserProfileRepository";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from "expo-router";
import { TranslationKeys } from "@/translations/translations";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import CStepIndicator from "@/components/indicators/CStepIndicator";
import { ThemedText } from "@/components/ThemedText";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { globalStyles } from "@/utils/global-styles";
import CButton from "@/components/button/CButton";
import CCard from "@/components/cards/CCard";
import { ActivityLevelEnum } from "@/models/enums/enums";
import { useOnboardingStore } from "@/stores/onboardingStore";

const OnboardingFourth = () => {
  const { t } = useTranslation();
  const { updateData, data } = useOnboardingStore();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const background = useThemeColor({}, "background");
  const userProfileRepository = useUserProfileRepository();

  const handleSelection = (index: number): void => {
    setSelectedLevel(index);
    setShowError(false);
  };

  const handleSubmit = async (): Promise<void> => {
    if (selectedLevel === null) {
      setShowError(true);
      return;
    }

    // Set loading state
    setIsSubmitting(true);
    setSubmitError(null);

    const levelEnumMap = [
      ActivityLevelEnum.SEDENTARY,
      ActivityLevelEnum.LIGHT,
      ActivityLevelEnum.MODERATE,
      ActivityLevelEnum.HIGH,
      ActivityLevelEnum.EXTREME,
    ];
    const activityLevel = levelEnumMap[selectedLevel];

    // Update local store
    updateData({ activity_level: activityLevel, onboarding_completed: true });

    // Get the complete profile data from the store
    const profileData = { ...data, activity_level: activityLevel, onboarding_completed: true };

    try {
      // Save profile to server and refresh
      const result = await userProfileRepository.saveAndRefreshProfile(profileData);

      if (result) {
        // Navigate to tabs screen on success
        router.push("/(tabs)");
      } else {
        // Handle error
        setSubmitError(t(TranslationKeys.error_saving_profile));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setSubmitError(t(TranslationKeys.error_saving_profile));
    } finally {
      setIsSubmitting(false);
    }
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
        }}
      />
      <ThemedStatusBar />

      <ThemedView style={styles.stepIndicatorContainer}>
        <CStepIndicator status="done" />
        <CStepIndicator status="done" />
        <CStepIndicator status="done" />
        <CStepIndicator status="inProgress" />
      </ThemedView>

      <ScrollView>
        <ThemedView style={styles.optionsContainer}>
          <CCard
            title={t(TranslationKeys.sedentary)}
            description={t(TranslationKeys.sedentary_description)}
            leftIcon={<MaterialIcons name="fitness-center" size={24} />}
            isSelected={selectedLevel === 0}
            onPress={() => handleSelection(0)}
          />
          <CCard
            title={t(TranslationKeys.lightly_active)}
            description={t(TranslationKeys.lightly_active_description)}
            leftIcon={<MaterialIcons name="fitness-center" size={24} />}
            isSelected={selectedLevel === 1}
            onPress={() => handleSelection(1)}
          />
          <CCard
            title={t(TranslationKeys.moderately_active)}
            description={t(TranslationKeys.moderately_active_description)}
            leftIcon={<MaterialIcons name="fitness-center" size={24} />}
            isSelected={selectedLevel === 2}
            onPress={() => handleSelection(2)}
          />
          <CCard
            title={t(TranslationKeys.very_active)}
            description={t(TranslationKeys.very_active_description)}
            leftIcon={<MaterialIcons name="fitness-center" size={24} />}
            isSelected={selectedLevel === 3}
            onPress={() => handleSelection(3)}
          />
          <CCard
            title={t(TranslationKeys.extremely_active)}
            description={t(TranslationKeys.extremely_active_description)}
            leftIcon={<MaterialIcons name="fitness-center" size={24} />}
            isSelected={selectedLevel === 4}
            onPress={() => handleSelection(4)}
          />
        </ThemedView>
        {showError && (
          <ThemedText style={styles.errorText}>{t(TranslationKeys.error_required)}</ThemedText>
        )}
      </ScrollView>

      <CButton
        style={styles.buttonContainer}
        icon={<MaterialIcons name="rocket-launch" size={24} />}
        title={t(TranslationKeys.finalize)}
        onPress={handleSubmit}
        loading={isSubmitting}
        disabled={isSubmitting}
      />
      {submitError && <ThemedText style={styles.errorText}>{submitError}</ThemedText>}
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
  heading: {
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 4,
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

export default OnboardingFourth;
