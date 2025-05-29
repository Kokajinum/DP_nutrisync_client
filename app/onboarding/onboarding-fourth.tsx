import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useState } from "react";
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
import { ActivityLevelEnum, CalorieUnitEnum, GenderEnum, GoalEnum } from "@/models/enums/enums";
import { useOnboardingStore } from "@/stores/onboardingStore";
// Import the new hooks
import { useSaveUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthProvider";
import { UserProfileData } from "@/models/interfaces/UserProfileData";
import {
  UserMetrics,
  CaloricGoalOptions,
  calculateCaloricGoal,
  calculateMacroGrams,
  MacroGrams,
} from "@/utils/calorieCalculator";

const OnboardingFourth = () => {
  const { t } = useTranslation();
  const { updateData, data } = useOnboardingStore();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get the user ID from auth context
  const { session } = useAuth();
  const userId = session?.user?.id;

  // Use the React Query mutation hook
  const { mutate: saveProfile, isPending: isSubmitting } = useSaveUserProfile();

  const background = useThemeColor({}, "background");

  const handleSelection = (index: number): void => {
    setSelectedLevel(index);
    setShowError(false);
  };

  const handleSubmit = async (): Promise<void> => {
    if (selectedLevel === null) {
      setShowError(true);
      return;
    }

    if (!userId) {
      setSubmitError(t(TranslationKeys.error_user_not_authenticated));
      return;
    }

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

    const userMetrics: UserMetrics = {
      age: data.age || 30,
      gender: data.gender || GenderEnum.OTHER,
      weight: data.weight_value || 70,
      height: data.height_value || 170,
      activityLevel: activityLevel,
    };

    // Create CaloricGoalOptions
    const goalOptions: CaloricGoalOptions = {
      goal: data.goal || GoalEnum.MAINTAIN_WEIGHT,
      adjustment: 0.2, // Default 20% adjustment
    };

    // Calculate calorie goal
    const calorieGoal = calculateCaloricGoal(userMetrics, goalOptions);

    // Set default macro ratios based on goal
    let proteinRatio = 30;
    let fatRatio = 30;
    let carbsRatio = 40;
    if (data.goal === GoalEnum.LOSE_FAT) {
      proteinRatio = 35;
      fatRatio = 30;
      carbsRatio = 35;
    } else if (data.goal === GoalEnum.GAIN_MUSCLE) {
      proteinRatio = 30;
      fatRatio = 25;
      carbsRatio = 45;
    }

    // Calculate macronutrients grams
    const macroGrams: MacroGrams = calculateMacroGrams(calorieGoal, {
      proteinPercent: proteinRatio,
      fatPercent: fatRatio,
      carbsPercent: carbsRatio,
    });

    const profileData: UserProfileData = {
      ...data,
      activity_level: activityLevel,
      onboarding_completed: true,
      calorie_goal_value: calorieGoal,
      calorie_goal_unit: CalorieUnitEnum.KCAL,
      protein_ratio: proteinRatio,
      fat_ratio: fatRatio,
      carbs_ratio: carbsRatio,
      protein_goal_g: macroGrams.protein,
      carbs_goal_g: macroGrams.carbs,
      fat_goal_g: macroGrams.fat,
    };

    saveProfile(profileData, {
      onSuccess: () => {
        router.push("/(tabs)/home-screen");
      },
      onError: (error) => {
        console.error("Error saving profile:", error);
        setSubmitError(t(TranslationKeys.error_saving_profile));
      },
    });
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
