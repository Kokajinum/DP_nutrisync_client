import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router } from "expo-router";
import { TranslationKeys } from "@/translations/translations";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import CStepIndicator from "@/components/indicators/CStepIndicator";
import { ThemedText } from "@/components/ThemedText";
import { CCheckCard } from "@/components/cards/CCheckCard";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import CTextInput from "@/components/input/CTextInput";
import { CSegmentedButton } from "@/components/button/CSegmentedButton";
import { globalStyles } from "@/utils/global-styles";
import CButton from "@/components/button/CButton";
import { useOnboardingStore } from "@/stores/onboardingStore"; // Import Zustand store
import { GoalEnum, WeightUnitEnum } from "@/models/enums/enums";

//default values in kgs
const MIN_WEIGHT = 40;
const MAX_WEIGHT = 300;

const OnboardingSecond = () => {
  const { data, updateData, setStep } = useOnboardingStore();
  const { t } = useTranslation();
  const onBackground = useThemeColor({}, "onBackground");
  const background = useThemeColor({}, "background");

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showSelectedIndexError, setShowSelectedIndexError] = useState<boolean>(false);
  const [selectedSegmentedIndex, setSelectedSegmentedIndex] = useState(0);
  const segments = ["Kg", "Lbs"];
  const [weight, setWeight] = useState<string>("");
  const [weightError, setWeightError] = useState<string>("");

  const sanitizeInput = (raw: string): string => {
    // 1) povolit jen číslice, tečku a čárku
    let s = raw.replace(/[^0-9.,]/g, "");
    // 2) zřetězit sekvence teček/čárek na jediný znak
    s = s.replace(/[.,]+/g, (match) => match[0]);
    // 3) převod čárky na tečku
    s = s.replace(/,/g, ".");
    // 4) limit na 2 desetinná místa
    const [intPart, decPart] = s.split(".");
    if (decPart !== undefined) {
      s = intPart + "." + decPart.slice(0, 2);
    }
    return s;
  };

  const handleWeightChange = (text: string): void => {
    const clean = sanitizeInput(text);
    setWeight(clean);
    setWeightError("");
  };

  const validateWeight = (): string => {
    const num = parseFloat(weight);
    if (!weight) {
      return t(TranslationKeys.error_required);
    }
    if (isNaN(num)) {
      return t(TranslationKeys.error_invalid_number);
    }

    if (data.weight_value !== undefined) {
      if (selectedIndex === 0 && num > data.weight_value) {
        return t(TranslationKeys.error_range_less, { max: data.weight_value });
      }
      if (selectedIndex === 2 && num < data.weight_value) {
        return t(TranslationKeys.error_range_more, { min: data.weight_value });
      }
    }

    if (num < MIN_WEIGHT || num > MAX_WEIGHT) {
      return t(TranslationKeys.error_range_between, { min: MIN_WEIGHT, max: MAX_WEIGHT });
    }
    return "";
  };

  const handleSelectedIndexChange = (index: number): void => {
    setSelectedIndex(index);
    setShowSelectedIndexError(false);
  };

  const handleSubmit = (): void => {
    // Validate goal selection
    if (selectedIndex === null) {
      setShowSelectedIndexError(true);
      return;
    }

    // Validate weight if needed (not for maintain weight)
    if (selectedIndex !== 1) {
      const weightValidationError = validateWeight();
      if (weightValidationError) {
        setWeightError(weightValidationError);
        return;
      }
    }

    // Map selected index to GoalEnum
    const goalMap: Record<number, GoalEnum> = {
      0: GoalEnum.LOSE_FAT,
      1: GoalEnum.MAINTAIN_WEIGHT,
      2: GoalEnum.GAIN_MUSCLE,
    };

    // Prepare data to update in the store
    const updatePayload: any = {
      goal: goalMap[selectedIndex],
    };

    // Add target weight data if not maintaining weight
    if (selectedIndex !== 1 && weight) {
      updatePayload.target_weight_value = parseFloat(weight);
      updatePayload.target_weight_unit =
        selectedSegmentedIndex === 0 ? WeightUnitEnum.KG : WeightUnitEnum.LBS;
    }

    // Update the store with new data
    updateData(updatePayload);

    setStep(3);

    // Navigate to the next onboarding step
    router.push("/onboarding/onboarding-third");
  };

  const currentWeightError = weightError || validateWeight();

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={[
        styles.mainContainer,
        globalStyles.globalMainContent,
        { backgroundColor: background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ThemedStackScreen options={{ title: t(TranslationKeys.onboarding_first_header) }} />
      <ThemedStatusBar />
      <ThemedView style={styles.stepIndicatorContainer}>
        <CStepIndicator status="done" />
        <CStepIndicator status="inProgress" />
        <CStepIndicator status="notStarted" />
        <CStepIndicator status="notStarted" />
      </ThemedView>

      <ScrollView>
        <ThemedText type="subtitle" style={styles.goalHeadingContainer}>
          {t(TranslationKeys.onboarding_first_heading)}
        </ThemedText>

        <ThemedView style={styles.fitnessGoalsOptionsContainer}>
          <CCheckCard
            icon={<MaterialIcons name="monitor-weight" size={24} />}
            label="Lose fat"
            checked={selectedIndex === 0}
            onPress={() => handleSelectedIndexChange(0)}
          />
          <CCheckCard
            icon={<MaterialIcons name="balance" size={24} />}
            label="Maintain weight"
            checked={selectedIndex === 1}
            onPress={() => handleSelectedIndexChange(1)}
          />
          <CCheckCard
            icon={<MaterialCommunityIcons name="weight-lifter" size={24} />}
            label="Gain muscle"
            checked={selectedIndex === 2}
            onPress={() => handleSelectedIndexChange(2)}
          />
        </ThemedView>

        {showSelectedIndexError && (
          <ThemedText style={styles.errorText} type="default">
            {"This section is required."}
          </ThemedText>
        )}

        <ThemedView>
          {selectedIndex !== 1 && (
            <ThemedText type="subtitle" style={styles.targetHeadingContainer}>
              {t(TranslationKeys.onboarding_first_heading2)}
            </ThemedText>
          )}
          {selectedIndex !== 1 && (
            <ThemedView style={[styles.targetWeightContainer]}>
              <CTextInput
                containerStyle={{ flex: 2 }}
                keyboardType="numeric"
                value={weight}
                onChangeText={handleWeightChange}
                rightIcon={
                  weight ? <MaterialIcons name="close" size={20} color={onBackground} /> : null
                }
                onRightIconPress={() => setWeight("")}
                placeholder={t(TranslationKeys.onboarding_first_placeholder_weight)}
              />
              <CSegmentedButton
                containerStyle={{ flex: 1, alignSelf: "flex-end" }}
                segments={segments}
                currentIndex={selectedSegmentedIndex}
                onChange={setSelectedSegmentedIndex}
              />
            </ThemedView>
          )}
          {!!currentWeightError && (
            <ThemedText style={styles.errorText} type="default">
              {currentWeightError}
            </ThemedText>
          )}
        </ThemedView>
      </ScrollView>
      <CButton
        style={styles.buttonContainer}
        icon={<MaterialIcons name="forward" />}
        title="Next step"
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
    gap: "15",
    flexDirection: "row",
    alignSelf: "center",
  },
  goalHeadingContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  fitnessGoalsOptionsContainer: {
    gap: "10",
  },
  targetHeadingContainer: {
    marginTop: 30,
    marginBottom: 10,
  },
  targetWeightContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  buttonContainer: {
    marginTop: "auto",
  },
  errorText: { color: "red", marginTop: 4, marginHorizontal: 16 },
});

export default OnboardingSecond;
