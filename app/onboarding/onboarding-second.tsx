import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router, Stack } from "expo-router";
import { TranslationKeys } from "@/translations/translations";
import { _600SemiBold } from "@/constants/Global";
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

//default values in kgs
const MIN_WEIGHT = 20;
const MAX_WEIGHT = 300;

const OnboardingSecond = () => {
  const { t } = useTranslation();

  const colorScheme = useColorScheme();
  const onBackground = useThemeColor({}, "onBackground");
  const background = useThemeColor({}, "background");

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showSelectedIndexError, setShowSelectedIndexError] = useState<boolean>(false);

  const [selectedSegmentedIndex, setSelectedSegmentedIndex] = useState(0);
  const segments = ["Kg", "Lbs"];

  const [weight, setWeight] = useState<string>("");
  const [weightError, setWeightError] = useState<string>("");
  const [showWeightError, setShowWeightError] = useState<boolean>(false);

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
    if (num < MIN_WEIGHT || num > MAX_WEIGHT) {
      return t(TranslationKeys.error_range, { min: MIN_WEIGHT, max: MAX_WEIGHT });
    }
    return "";
  };

  const handleSelectedIndexChange = (index: number): void => {
    setSelectedIndex(index);
    setShowSelectedIndexError(false);
  };

  const handleSubmit = (): void => {
    if (selectedIndex == null) {
      setShowSelectedIndexError(true);
    }

    if (!currentWeightError && !showSelectedIndexError) {
      router.push("/onboarding/onboarding-second");
    }
  };

  const currentWeightError = weightError || validateWeight();

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
          title: t(TranslationKeys.onboarding_first_header),
        }}></ThemedStackScreen>
      <ThemedStatusBar></ThemedStatusBar>
      <ThemedView style={styles.stepIndicatorContainer}>
        <CStepIndicator status="inProgress"></CStepIndicator>
        <CStepIndicator status="notStarted"></CStepIndicator>
        <CStepIndicator status="notStarted"></CStepIndicator>
        <CStepIndicator status="notStarted"></CStepIndicator>
      </ThemedView>

      <ScrollView>
        <ThemedText type="subtitle" style={styles.goalHeadingContainer}>
          {t(TranslationKeys.onboarding_first_heading)}
        </ThemedText>

        <ThemedView style={styles.fitnessGoalsOptionsContainer}>
          <CCheckCard
            icon={<MaterialIcons name="monitor-weight" size={24}></MaterialIcons>}
            label="Lose fat"
            checked={selectedIndex === 0}
            onPress={() => {
              handleSelectedIndexChange(0);
            }}></CCheckCard>
          <CCheckCard
            icon={<MaterialIcons name="balance" size={24}></MaterialIcons>}
            label="Maintain weight"
            checked={selectedIndex === 1}
            onPress={() => {
              handleSelectedIndexChange(1);
            }}></CCheckCard>
          <CCheckCard
            icon={<MaterialCommunityIcons name="weight-lifter" size={24}></MaterialCommunityIcons>}
            label="Gain muscle"
            checked={selectedIndex === 2}
            onPress={() => {
              handleSelectedIndexChange(2);
            }}></CCheckCard>
        </ThemedView>

        {showSelectedIndexError && (
          <ThemedText style={styles.errorText} type="default">
            {"This section is required."}
          </ThemedText>
        )}

        <ThemedText type="subtitle" style={styles.targetHeadingContainer}>
          {t(TranslationKeys.onboarding_first_heading2)}
        </ThemedText>

        <ThemedView style={[styles.targetWeightContainer]}>
          <CTextInput
            containerStyle={{ flex: 2 }}
            keyboardType="numeric"
            value={weight}
            onChangeText={handleWeightChange}
            rightIcon={
              weight ? <MaterialIcons name="close" size={20} color={onBackground} /> : null
            }
            onRightIconPress={() => {
              setWeight("");
            }}
            placeholder={t(TranslationKeys.onboarding_first_placeholder_weight)}></CTextInput>
          <CSegmentedButton
            containerStyle={{
              flex: 1,
              alignSelf: "flex-end",
            }}
            segments={segments}
            currentIndex={selectedSegmentedIndex}
            onChange={setSelectedSegmentedIndex}></CSegmentedButton>
        </ThemedView>
        {!!currentWeightError && (
          <ThemedText style={styles.errorText} type="default">
            {currentWeightError}
          </ThemedText>
        )}
      </ScrollView>
      <CButton
        style={styles.buttonContainer}
        icon={<MaterialIcons name="forward"></MaterialIcons>}
        title="Next step"
        onPress={handleSubmit}></CButton>
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
  goalButtonsContainer: {},
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
