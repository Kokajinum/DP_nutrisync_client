import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useState } from "react";
import { ThemedView } from "@/components/ThemedView";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { router, Stack } from "expo-router";
import { TranslationKeys } from "@/translations/translations";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import CStepIndicator from "@/components/indicators/CStepIndicator";
import { ThemedText } from "@/components/ThemedText";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import CTextInput from "@/components/input/CTextInput";
import { CSegmentedButton } from "@/components/button/CSegmentedButton";
import { globalStyles } from "@/utils/global-styles";
import CButton from "@/components/button/CButton";
import { HeightUnitEnum, WeightUnitEnum } from "@/models/enums/enums";
import { useOnboardingStore } from "@/stores/onboardingStore";

// Default validation ranges
const MIN_HEIGHT_CM = 100;
const MAX_HEIGHT_CM = 250;
const MIN_HEIGHT_FT = 3.28; // ~100cm
const MAX_HEIGHT_FT = 8.2; // ~250cm

const MIN_WEIGHT_KG = 30;
const MAX_WEIGHT_KG = 300;
const MIN_WEIGHT_LBS = 66; // ~30kg
const MAX_WEIGHT_LBS = 661; // ~300kg

const MIN_AGE = 13;
const MAX_AGE = 120;

const OnboardingFirst = () => {
  const { t } = useTranslation();
  const { updateData } = useOnboardingStore();

  const colorScheme = useColorScheme();
  const onBackground = useThemeColor({}, "onBackground");
  const background = useThemeColor({}, "background");

  // Form state
  const [height, setHeight] = useState<string>("");
  const [heightError, setHeightError] = useState<string>("");
  const [heightUnit, setHeightUnit] = useState<number>(0); // 0 = cm, 1 = ft

  const [weight, setWeight] = useState<string>("");
  const [weightError, setWeightError] = useState<string>("");
  const [weightUnit, setWeightUnit] = useState<number>(0); // 0 = kg, 1 = lbs

  const [age, setAge] = useState<string>("");
  const [ageError, setAgeError] = useState<string>("");
  const [ageType, setAgeType] = useState<number>(0); // 0 = Age, 1 = Birthday

  const [gender, setGender] = useState<number | null>(null);
  const [genderError, setGenderError] = useState<string>("");

  const sanitizeInput = (raw: string): string => {
    // only integers, dot and comma
    let s = raw.replace(/[^0-9.,]/g, "");
    // concatenate sequences of dots/commas to a single
    s = s.replace(/[.,]+/g, (match) => match[0]);
    // convert comma to dot
    s = s.replace(/,/g, ".");
    // limit to 2 decimal places
    const [intPart, decPart] = s.split(".");
    if (decPart !== undefined) {
      s = intPart + "." + decPart.slice(0, 2);
    }
    return s;
  };

  // Input handlers
  const handleHeightChange = (text: string): void => {
    const clean = sanitizeInput(text);
    setHeight(clean);
    setHeightError("");
  };

  const handleWeightChange = (text: string): void => {
    const clean = sanitizeInput(text);
    setWeight(clean);
    setWeightError("");
  };

  const handleAgeChange = (text: string): void => {
    // only integers for age
    const clean = text.replace(/[^0-9]/g, "");
    setAge(clean);
    setAgeError("");
  };

  // Validation functions
  const validateHeight = (): string => {
    const num = parseFloat(height);
    if (!height) {
      return t(TranslationKeys.error_required);
    }
    if (isNaN(num)) {
      return t(TranslationKeys.validation_invalid_height);
    }

    const min = heightUnit === 0 ? MIN_HEIGHT_CM : MIN_HEIGHT_FT;
    const max = heightUnit === 0 ? MAX_HEIGHT_CM : MAX_HEIGHT_FT;

    if (num < min || num > max) {
      return t(TranslationKeys.error_range, { min, max });
    }
    return "";
  };

  const validateWeight = (): string => {
    const num = parseFloat(weight);
    if (!weight) {
      return t(TranslationKeys.error_required);
    }
    if (isNaN(num)) {
      return t(TranslationKeys.validation_invalid_weight);
    }

    const min = weightUnit === 0 ? MIN_WEIGHT_KG : MIN_WEIGHT_LBS;
    const max = weightUnit === 0 ? MAX_WEIGHT_KG : MAX_WEIGHT_LBS;

    if (num < min || num > max) {
      return t(TranslationKeys.error_range, { min, max });
    }
    return "";
  };

  const validateAge = (): string => {
    if (ageType === 1) {
      // Birthday validation would go here
      return "";
    }

    const num = parseInt(age, 10);
    if (!age) {
      return t(TranslationKeys.error_required);
    }
    if (isNaN(num)) {
      return t(TranslationKeys.validation_invalid_age);
    }
    if (num < MIN_AGE || num > MAX_AGE) {
      return t(TranslationKeys.error_range, { min: MIN_AGE, max: MAX_AGE });
    }
    return "";
  };

  const validateGender = (): string => {
    if (gender === null) {
      return t(TranslationKeys.error_required);
    }
    return "";
  };

  const handleSubmit = (): void => {
    const heightValidationError = validateHeight();
    const weightValidationError = validateWeight();
    const ageValidationError = validateAge();
    const genderValidationError = validateGender();

    setHeightError(heightValidationError);
    setWeightError(weightValidationError);
    setAgeError(ageValidationError);
    setGenderError(genderValidationError);

    if (
      heightValidationError ||
      weightValidationError ||
      ageValidationError ||
      genderValidationError
    ) {
      return;
    }

    updateData({
      height_value: parseFloat(height),
      height_unit: heightUnit === 0 ? HeightUnitEnum.CM : HeightUnitEnum.INCH,
      weight_value: parseFloat(weight),
      weight_unit: weightUnit === 0 ? WeightUnitEnum.KG : WeightUnitEnum.LBS,
      age: parseInt(age, 10),
    });

    router.push("/onboarding/onboarding-second");
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
        <CStepIndicator status="inProgress"></CStepIndicator>
        <CStepIndicator status="notStarted"></CStepIndicator>
        <CStepIndicator status="notStarted"></CStepIndicator>
        <CStepIndicator status="notStarted"></CStepIndicator>
      </ThemedView>

      <ScrollView>
        <ThemedText type="subtitle" style={styles.formHeading}>
          {t(TranslationKeys.personal_info)}
        </ThemedText>

        {/* Height input */}
        <ThemedView style={styles.inputContainer}>
          <CTextInput
            containerStyle={styles.textInputContainer}
            keyboardType="numeric"
            value={height}
            onChangeText={handleHeightChange}
            rightIcon={
              height ? <MaterialIcons name="close" size={20} color={onBackground} /> : null
            }
            onRightIconPress={() => {
              setHeight("");
            }}
            placeholder={t(TranslationKeys.height)}
          />
          <CSegmentedButton
            containerStyle={styles.segmentedButtonContainer}
            segments={["cm", "ft"]}
            currentIndex={heightUnit}
            onChange={setHeightUnit}
          />
        </ThemedView>
        {!!heightError && <ThemedText style={styles.errorText}>{heightError}</ThemedText>}

        {/* Weight input */}
        <ThemedView style={styles.inputContainer}>
          <CTextInput
            containerStyle={styles.textInputContainer}
            keyboardType="numeric"
            value={weight}
            onChangeText={handleWeightChange}
            rightIcon={
              weight ? <MaterialIcons name="close" size={20} color={onBackground} /> : null
            }
            onRightIconPress={() => {
              setWeight("");
            }}
            placeholder={t(TranslationKeys.weight)}
          />
          <CSegmentedButton
            containerStyle={styles.segmentedButtonContainer}
            segments={["kg", "lbs"]}
            currentIndex={weightUnit}
            onChange={setWeightUnit}
          />
        </ThemedView>
        {!!weightError && <ThemedText style={styles.errorText}>{weightError}</ThemedText>}

        {/* Age input */}
        <ThemedView style={styles.inputContainer}>
          <CTextInput
            containerStyle={styles.textInputContainer}
            keyboardType="numeric"
            value={age}
            onChangeText={handleAgeChange}
            rightIcon={age ? <MaterialIcons name="close" size={20} color={onBackground} /> : null}
            onRightIconPress={() => {
              setAge("");
            }}
            placeholder={t(TranslationKeys.age)}
          />
          <CSegmentedButton
            containerStyle={styles.segmentedButtonContainer}
            segments={[t(TranslationKeys.age), t(TranslationKeys.birthday)]}
            currentIndex={ageType}
            onChange={setAgeType}
          />
        </ThemedView>
        {!!ageError && <ThemedText style={styles.errorText}>{ageError}</ThemedText>}

        {/* Gender selection */}
        <ThemedText style={styles.inputLabel} type="subtitle">
          {t(TranslationKeys.gender)}
        </ThemedText>
        <ThemedView style={styles.genderContainer}>
          <CSegmentedButton
            segments={[
              t(TranslationKeys.male),
              t(TranslationKeys.female),
              t(TranslationKeys.unknown),
            ]}
            currentIndex={gender !== null ? gender : -1}
            onChange={(index) => {
              setGender(index);
              setGenderError("");
            }}
          />
        </ThemedView>
        {!!genderError && <ThemedText style={styles.errorText}>{genderError}</ThemedText>}
      </ScrollView>

      {/* Continue button */}
      <CButton
        style={styles.buttonContainer}
        icon={<MaterialIcons name="forward" size={24} />}
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
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 20,
  },
  formHeading: {
    //marginBottom: 30,
  },
  inputLabel: {
    marginTop: 30,
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    gap: 10,
  },
  textInputContainer: {
    flex: 2,
    marginTop: 0,
  },
  segmentedButtonContainer: {
    flex: 1,
    alignSelf: "flex-end",
  },
  genderContainer: {
    marginBottom: 20,
  },
  errorText: {
    color: "red",
  },
  buttonContainer: {
    marginTop: "auto",
  },
});

export default OnboardingFirst;
