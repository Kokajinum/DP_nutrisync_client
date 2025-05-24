import { StyleSheet, TouchableOpacity, Alert, TextInput, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/translations/i18n";
import { useState, useEffect, useCallback, useMemo } from "react";
import { getLocales } from "expo-localization";
import { STORAGE_KEY_LANGUAGE_EXPLICITLY_SELECTED } from "@/constants/Global";
import { getStorageItem } from "@/utils/storage";
import { useTheme } from "@/context/ThemeProvider";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedScrollView } from "@/components/ThemedScrollView";
import CButton from "@/components/button/CButton";
import { UpdateUserProfileDto } from "@/models/interfaces/UpdateUserProfileDto";
import { ActivityLevelEnum, GoalEnum, HeightUnitEnum, WeightUnitEnum } from "@/models/enums/enums";
import NetInfo from "@react-native-community/netinfo";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { TranslationKeys } from "@/translations/translations";
import { calculateCaloricGoal, UserMetrics } from "@/utils/calorieCalculator";

export default function ProfileScreen() {
  // Helper functions for dynamic calculations

  /**
   * Converts height from inches to centimeters if needed
   */
  const convertHeight = (value: number, unit: HeightUnitEnum): number => {
    if (unit === HeightUnitEnum.INCH) {
      return value * 2.54; // Convert inches to cm
    }
    return value;
  };

  /**
   * Converts weight from pounds to kilograms if needed
   */
  const convertWeight = (value: number, unit: WeightUnitEnum): number => {
    if (unit === WeightUnitEnum.LBS) {
      return value * 0.453592; // Convert lbs to kg
    }
    return value;
  };

  /**
   * Determines the appropriate goal state based on current and target weight
   */
  const determineGoalState = (currentWeight: number, targetWeight: number): GoalEnum => {
    if (Math.abs(currentWeight - targetWeight) < 0.1) {
      return GoalEnum.MAINTAIN_WEIGHT;
    } else if (currentWeight > targetWeight) {
      return GoalEnum.LOSE_FAT;
    } else {
      return GoalEnum.GAIN_MUSCLE;
    }
  };

  /**
   * Recalculates caloric goal based on user metrics
   */
  const recalculateCaloricGoal = (data: UpdateUserProfileDto): number => {
    // Check if we have all required data
    if (
      !data.age ||
      !data.gender ||
      !data.height_value ||
      !data.weight_value ||
      !data.activity_level
    ) {
      return data.calorie_goal_value || 0;
    }

    // Convert height and weight if needed
    const heightInCm = convertHeight(data.height_value, data.height_unit || HeightUnitEnum.CM);
    const weightInKg = convertWeight(data.weight_value, data.weight_unit || WeightUnitEnum.KG);

    // Create user metrics object
    const userMetrics: UserMetrics = {
      age: data.age,
      gender: data.gender,
      height: heightInCm,
      weight: weightInKg,
      activityLevel: data.activity_level,
    };

    // Determine goal based on current and target weight
    let goal = data.goal;
    if (data.weight_value && data.target_weight_value) {
      const currentWeightInKg = convertWeight(
        data.weight_value,
        data.weight_unit || WeightUnitEnum.KG
      );
      const targetWeightInKg = convertWeight(
        data.target_weight_value,
        data.target_weight_unit || WeightUnitEnum.KG
      );
      goal = determineGoalState(currentWeightInKg, targetWeightInKg);
    }

    // Calculate caloric goal
    return calculateCaloricGoal(userMetrics, { goal: goal || GoalEnum.MAINTAIN_WEIGHT });
  };
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useUserProfile(user?.id || "");
  const updateUserProfile = useUpdateUserProfile();
  const secondaryColor = useThemeColor({}, "secondary");
  const cardColor = useThemeColor({}, "surfaceContainer");
  const inputBorderColor = useThemeColor({}, "outline");
  const onBackgroundColor = useThemeColor({}, "onBackground");
  const onPrimaryColor = useThemeColor({}, "onPrimary");
  const primaryContainerColor = useThemeColor({}, "primaryContainer");
  const onPrimaryContainerColor = useThemeColor({}, "onPrimaryContainer");

  // Form state
  const [formData, setFormData] = useState<UpdateUserProfileDto>({});
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Language settings
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isSystemLanguage, setIsSystemLanguage] = useState(true);
  const deviceLanguage = getLocales()[0].languageCode || "en";

  // Initialize form data from profile
  useEffect(() => {
    if (profile) {
      const initialFormData = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        age: profile.age,
        gender: profile.gender,
        height_value: profile.height_value,
        height_unit: profile.height_unit,
        weight_value: profile.weight_value,
        weight_unit: profile.weight_unit,
        target_weight_value: profile.target_weight_value,
        target_weight_unit: profile.target_weight_unit,
        activity_level: profile.activity_level,
        experience_level: profile.experience_level,
        goal: profile.goal,
        calorie_goal_value: profile.calorie_goal_value,
        protein_ratio: profile.protein_ratio,
        fat_ratio: profile.fat_ratio,
        carbs_ratio: profile.carbs_ratio,
        notifications_enabled: profile.notifications_enabled,
      };

      // Set the initial form data
      setFormData(initialFormData);
    }
  }, [profile]);

  // Ensure goal state and caloric goal are consistent with current data
  useEffect(() => {
    if (
      formData.weight_value &&
      formData.target_weight_value &&
      formData.age &&
      formData.gender &&
      formData.height_value &&
      formData.activity_level
    ) {
      setFormData((prev) => {
        // Calculate goal state based on current and target weight
        const currentWeightInKg = convertWeight(
          prev.weight_value!,
          prev.weight_unit || WeightUnitEnum.KG
        );
        const targetWeightInKg = convertWeight(
          prev.target_weight_value!,
          prev.target_weight_unit || WeightUnitEnum.KG
        );

        const calculatedGoal = determineGoalState(currentWeightInKg, targetWeightInKg);

        // Only update if different from current goal
        if (prev.goal !== calculatedGoal) {
          const newData = { ...prev, goal: calculatedGoal };

          // Recalculate caloric goal with the new goal state
          const newCaloricGoal = recalculateCaloricGoal(newData);
          if (newCaloricGoal > 0) {
            newData.calorie_goal_value = newCaloricGoal;
          }

          return newData;
        }

        // If goal didn't change, still check if caloric goal needs updating
        const newCaloricGoal = recalculateCaloricGoal(prev);
        if (newCaloricGoal > 0 && newCaloricGoal !== prev.calorie_goal_value) {
          return { ...prev, calorie_goal_value: newCaloricGoal };
        }

        return prev;
      });
    }
  }, [
    formData.weight_value,
    formData.target_weight_value,
    formData.age,
    formData.gender,
    formData.height_value,
    formData.activity_level,
  ]);

  // Check if language was explicitly selected
  useEffect(() => {
    const checkLanguageSelection = async () => {
      const isExplicitlySelected = await getStorageItem<boolean>(
        STORAGE_KEY_LANGUAGE_EXPLICITLY_SELECTED
      );
      setIsSystemLanguage(!isExplicitlySelected);
    };

    checkLanguageSelection();
  }, []);

  // Handle form field changes
  const handleChange = useCallback(
    (field: keyof UpdateUserProfileDto, value: string | number | boolean) => {
      setFormData((prev) => {
        // Create new data object with the updated field
        const newData = { ...prev, [field]: value };

        // Fields that affect caloric goal calculation
        const caloricGoalFields: (keyof UpdateUserProfileDto)[] = [
          "age",
          "gender",
          "height_value",
          "height_unit",
          "weight_value",
          "weight_unit",
          "activity_level",
        ];

        // Fields that affect goal state determination
        const goalStateFields: (keyof UpdateUserProfileDto)[] = [
          "weight_value",
          "weight_unit",
          "target_weight_value",
          "target_weight_unit",
        ];

        // Check if we need to recalculate caloric goal
        if (caloricGoalFields.includes(field)) {
          const newCaloricGoal = recalculateCaloricGoal(newData);
          if (newCaloricGoal > 0) {
            newData.calorie_goal_value = newCaloricGoal;
          }
        }

        // Check if we need to update goal state
        if (
          goalStateFields.includes(field) &&
          newData.weight_value &&
          newData.target_weight_value
        ) {
          const currentWeightInKg = convertWeight(
            newData.weight_value,
            newData.weight_unit || WeightUnitEnum.KG
          );
          const targetWeightInKg = convertWeight(
            newData.target_weight_value,
            newData.target_weight_unit || WeightUnitEnum.KG
          );

          newData.goal = determineGoalState(currentWeightInKg, targetWeightInKg);

          // After goal state change, recalculate caloric goal again if needed
          if (
            newData.age &&
            newData.gender &&
            newData.height_value &&
            newData.weight_value &&
            newData.activity_level
          ) {
            const newCaloricGoal = recalculateCaloricGoal(newData);
            if (newCaloricGoal > 0) {
              newData.calorie_goal_value = newCaloricGoal;
            }
          }
        }

        return newData;
      });
      setIsFormDirty(true);
    },
    []
  );

  // Handle language change
  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
    setCurrentLanguage(lang);
    setIsSystemLanguage(false);
  };

  // Reset to system language
  const useSystemLanguage = async () => {
    if (deviceLanguage) {
      await changeLanguage(deviceLanguage);
      setCurrentLanguage(deviceLanguage);
      setIsSystemLanguage(true);
    }
  };

  // Handle theme change
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user?.id) {
      Alert.alert(t("error"), t(TranslationKeys.error_user_not_authenticated));
      return;
    }

    // Check internet connection
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      Alert.alert(t(TranslationKeys.error), t(TranslationKeys.profile_internet_required));
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile.mutateAsync({
        id: user.id,
        patch: formData,
      });
      setIsFormDirty(false);
      Alert.alert(t(TranslationKeys.success), t(TranslationKeys.profile_save_success));
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(t(TranslationKeys.error), t(TranslationKeys.profile_save_error));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedStatusBar></ThemedStatusBar>
        <ThemedStackScreen
          options={{ title: t(TranslationKeys.profile_settings_title) }}></ThemedStackScreen>
        <ThemedText style={styles.loadingText}>{t(TranslationKeys.profile_loading)}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedStatusBar></ThemedStatusBar>
      <ThemedStackScreen
        options={{ title: t(TranslationKeys.profile_settings_title) }}></ThemedStackScreen>
      <ThemedText style={styles.title}>{t(TranslationKeys.profile_settings_title)}</ThemedText>

      {/* User Profile Section */}
      <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
        <ThemedText style={styles.sectionTitle}>
          {t(TranslationKeys.profile_personal_info)}
        </ThemedText>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>{t(TranslationKeys.profile_age)}</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: inputBorderColor, color: onBackgroundColor }]}
            value={formData.age?.toString() || ""}
            onChangeText={(text: string) => handleChange("age", parseInt(text) || 0)}
            keyboardType="numeric"
          />
        </View>
      </ThemedView>

      {/* Body Measurements Section */}
      <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
        <ThemedText style={styles.sectionTitle}>
          {t(TranslationKeys.profile_measurements)}
        </ThemedText>

        <View style={[styles.inputContainer, styles.flex1]}>
          <ThemedText style={styles.label}>{t(TranslationKeys.profile_height)}</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: inputBorderColor, color: onBackgroundColor }]}
            value={formData.height_value?.toString() || ""}
            onChangeText={(text: string) => handleChange("height_value", parseFloat(text) || 0)}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputContainer, styles.flex1]}>
          <ThemedText style={styles.label}>{t(TranslationKeys.profile_weight)}</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: inputBorderColor, color: onBackgroundColor }]}
            value={formData.weight_value?.toString() || ""}
            onChangeText={(text: string) => handleChange("weight_value", parseFloat(text) || 0)}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputContainer, styles.flex1]}>
          <ThemedText style={styles.label}>{t(TranslationKeys.profile_target_weight)}</ThemedText>
          <TextInput
            style={[styles.input, { borderColor: inputBorderColor, color: onBackgroundColor }]}
            value={formData.target_weight_value?.toString() || ""}
            onChangeText={(text: string) =>
              handleChange("target_weight_value", parseFloat(text) || 0)
            }
            keyboardType="numeric"
          />
        </View>
      </ThemedView>

      {/* Fitness Goals Section */}
      <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
        <ThemedText style={styles.sectionTitle}>
          {t(TranslationKeys.profile_fitness_goals)}
        </ThemedText>

        {/* Display current goal state */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>{t(TranslationKeys.profile_goal)}</ThemedText>
          <View style={styles.inputRow}>
            <ThemedText style={styles.valueText}>
              {formData.goal === GoalEnum.LOSE_FAT && t(TranslationKeys.lose_fat)}
              {formData.goal === GoalEnum.MAINTAIN_WEIGHT && t(TranslationKeys.maintain_weight)}
              {formData.goal === GoalEnum.GAIN_MUSCLE && t(TranslationKeys.gain_muscle)}
            </ThemedText>
            <ThemedText style={styles.noteText}>
              {t("Automaticky určeno podle aktuální a cílové váhy")}
            </ThemedText>
          </View>
        </View>

        {/* Display caloric goal */}
        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>{t(TranslationKeys.profile_calorie_goal)}</ThemedText>
          <View style={styles.inputRow}>
            <ThemedText style={styles.valueText}>{formData.calorie_goal_value} kcal</ThemedText>
            <ThemedText style={styles.noteText}>
              {t("Automaticky vypočítáno na základě vašich údajů")}
            </ThemedText>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>{t(TranslationKeys.profile_activity_level)}</ThemedText>
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: inputBorderColor },
                formData.activity_level === ActivityLevelEnum.SEDENTARY && {
                  backgroundColor: primaryContainerColor,
                },
              ]}
              onPress={() => handleChange("activity_level", ActivityLevelEnum.SEDENTARY)}>
              <ThemedText
                style={[
                  styles.optionText,
                  formData.activity_level === ActivityLevelEnum.SEDENTARY && {
                    color: onPrimaryContainerColor,
                  },
                ]}>
                {t(TranslationKeys.sedentary)}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: inputBorderColor },
                formData.activity_level === ActivityLevelEnum.LIGHT && {
                  backgroundColor: primaryContainerColor,
                },
              ]}
              onPress={() => handleChange("activity_level", ActivityLevelEnum.LIGHT)}>
              <ThemedText
                style={[
                  styles.optionText,
                  formData.activity_level === ActivityLevelEnum.LIGHT && {
                    color: onPrimaryContainerColor,
                  },
                ]}>
                {t(TranslationKeys.lightly_active)}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: inputBorderColor },
                formData.activity_level === ActivityLevelEnum.MODERATE && {
                  backgroundColor: primaryContainerColor,
                },
              ]}
              onPress={() => handleChange("activity_level", ActivityLevelEnum.MODERATE)}>
              <ThemedText
                style={[
                  styles.optionText,
                  formData.activity_level === ActivityLevelEnum.MODERATE && {
                    color: onPrimaryContainerColor,
                  },
                ]}>
                {t(TranslationKeys.moderately_active)}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: inputBorderColor },
                formData.activity_level === ActivityLevelEnum.HIGH && {
                  backgroundColor: primaryContainerColor,
                },
              ]}
              onPress={() => handleChange("activity_level", ActivityLevelEnum.HIGH)}>
              <ThemedText
                style={[
                  styles.optionText,
                  formData.activity_level === ActivityLevelEnum.HIGH && {
                    color: onPrimaryContainerColor,
                  },
                ]}>
                {t(TranslationKeys.very_active)}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                { borderColor: inputBorderColor },
                formData.activity_level === ActivityLevelEnum.EXTREME && {
                  backgroundColor: primaryContainerColor,
                },
              ]}
              onPress={() => handleChange("activity_level", ActivityLevelEnum.EXTREME)}>
              <ThemedText
                style={[
                  styles.optionText,
                  formData.activity_level === ActivityLevelEnum.EXTREME && {
                    color: onPrimaryContainerColor,
                  },
                ]}>
                {t(TranslationKeys.extremely_active)}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>

      {/* System Settings Section */}
      <View style={[styles.section, { backgroundColor: cardColor }]}>
        <ThemedText style={styles.sectionTitle}>{t(TranslationKeys.settings_system)}</ThemedText>

        {/* Theme Settings */}
        <ThemedText style={styles.subsectionTitle}>{t(TranslationKeys.settings_theme)}</ThemedText>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { borderColor: inputBorderColor },
              theme === "light" && { backgroundColor: primaryContainerColor },
            ]}
            onPress={() => handleThemeChange("light")}>
            <ThemedText
              style={[styles.optionText, theme === "light" && { color: onPrimaryContainerColor }]}>
              {t(TranslationKeys.settings_theme_light)}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              { borderColor: inputBorderColor },
              theme === "dark" && { backgroundColor: primaryContainerColor },
            ]}
            onPress={() => handleThemeChange("dark")}>
            <ThemedText
              style={[styles.optionText, theme === "dark" && { color: onPrimaryContainerColor }]}>
              {t(TranslationKeys.settings_theme_dark)}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              { borderColor: inputBorderColor },
              theme === "system" && { backgroundColor: primaryContainerColor },
            ]}
            onPress={() => handleThemeChange("system")}>
            <ThemedText
              style={[styles.optionText, theme === "system" && { color: onPrimaryContainerColor }]}>
              {t(TranslationKeys.settings_theme_system)}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Language Settings */}
        <ThemedText style={styles.subsectionTitle}>
          {t(TranslationKeys.settings_language)}
        </ThemedText>
        <View style={styles.languageInfo}>
          <ThemedText>
            {t(TranslationKeys.settings_language)}: {currentLanguage}
          </ThemedText>
          {isSystemLanguage && (
            <ThemedText style={styles.systemLanguageNote}>
              {t(TranslationKeys.using_system_language, { language: deviceLanguage })}
            </ThemedText>
          )}
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionButton,
              { borderColor: inputBorderColor },
              currentLanguage === "en" &&
                !isSystemLanguage && { backgroundColor: primaryContainerColor },
            ]}
            onPress={() => handleLanguageChange("en")}>
            <ThemedText
              style={[
                styles.optionText,
                currentLanguage === "en" && !isSystemLanguage && { color: onPrimaryContainerColor },
              ]}>
              English
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              { borderColor: inputBorderColor },
              currentLanguage === "cs" &&
                !isSystemLanguage && { backgroundColor: primaryContainerColor },
            ]}
            onPress={() => handleLanguageChange("cs")}>
            <ThemedText
              style={[
                styles.optionText,
                currentLanguage === "cs" && !isSystemLanguage && { color: onPrimaryContainerColor },
              ]}>
              Čeština
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionButton,
              { borderColor: inputBorderColor },
              isSystemLanguage && { backgroundColor: primaryContainerColor },
            ]}
            onPress={useSystemLanguage}>
            <ThemedText
              style={[styles.optionText, isSystemLanguage && { color: onPrimaryContainerColor }]}>
              {t(TranslationKeys.use_system_language)}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <ThemedText style={styles.subsectionTitle}>{t("logout")}</ThemedText>
        <CButton
          title={t("logout")}
          onPress={() => signOut()}
          icon={<MaterialIcons name="logout" size={24} color={onPrimaryColor} />}
          style={{ marginTop: 8, backgroundColor: secondaryColor }}
        />
      </View>

      {/* Save Button */}
      <CButton
        title={t(TranslationKeys.profile_save)}
        onPress={handleSaveProfile}
        disabled={!isFormDirty || isSaving}
        loading={isSaving}
        style={styles.saveButton}
      />
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "column",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: "#ccc",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  valueText: {
    fontSize: 16,
    fontWeight: "500",
  },
  noteText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
    opacity: 0.7,
  },
  label: {
    marginBottom: 8,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
    marginHorizontal: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
  },
  languageInfo: {
    marginBottom: 16,
  },
  systemLanguageNote: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 4,
  },
  saveButton: {
    marginTop: 24,
  },
});
