import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFoodRepository } from "@/hooks/useFoodRepository";
import { ThemedView } from "@/components/ThemedView";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { _400Regular, _500Medium, _600SemiBold, _700Bold } from "@/constants/Global";
import { FoodCategoryEnum } from "@/models/enums/enums";
import { getFoodCategoryOptions } from "@/utils/foodCategories";
import CFoodAttributeInput from "@/components/input/CFoodAttributeInput";
import CDropdown from "@/components/input/CDropdown";
import CServingSizeInput from "@/components/input/CServingSizeInput";
import CDivider from "@/components/CDivider";

import { FoodData } from "@/models/interfaces/FoodData";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

// Constants for validation
const MAX_NAME_LENGTH = 100;
const MAX_SERVING_SIZE = 10000;
const MIN_SERVING_SIZE = 0.1;

// Max per 100g
const MAX_CALORIES = 900;
const MAX_FAT = 100;
const MAX_CARBS = 100;
const MAX_PROTEIN = 100;
const MAX_SUGAR = 100;
const MAX_FIBER = 50;
const MAX_SALT = 100;
const BARCODE_REGEX = /^[0-9]{8,14}$/;

export default function FoodCreationScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");
  const surfaceContainerHighest = useThemeColor({}, "surfaceContainerHighest");
  const borderColor = useThemeColor({}, "outline");

  interface FoodFormData {
    name: string;
    category: string;
    servingSizeValue: string;
    servingSizeUnit: "g" | "ml";
    brand: string;
    barcode: string;
    calories: string;
    fats: string;
    carbs: string;
    sugar: string;
    fiber: string;
    protein: string;
    salt: string;
  }

  const [foodData, setFoodData] = useState<FoodFormData>({
    name: "",
    category: FoodCategoryEnum.FRUIT,
    servingSizeValue: "",
    servingSizeUnit: "g",
    brand: "",
    barcode: "",
    calories: "",
    fats: "",
    carbs: "",
    sugar: "",
    fiber: "",
    protein: "",
    salt: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validFields, setValidFields] = useState<Record<string, boolean>>({});
  const [formTouched, setFormTouched] = useState<boolean>(false);

  const validateField = (field: keyof FoodData, value: string): string | null => {
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    switch (field) {
      case "name":
        if (!trimmedValue) return t(TranslationKeys.validation_name_required);
        if (trimmedValue.length > MAX_NAME_LENGTH)
          return t(TranslationKeys.validation_name_length, { max: MAX_NAME_LENGTH });
        return null;

      case "category":
        if (!trimmedValue) return t(TranslationKeys.validation_category_required);
        return null;

      case "servingSizeValue":
        if (!trimmedValue) return t(TranslationKeys.validation_serving_size_required);
        const servingSize = Number(trimmedValue);
        if (isNaN(servingSize)) return t(TranslationKeys.validation_valid_number);
        if (servingSize <= 0) return t(TranslationKeys.validation_positive_number);
        if (servingSize < MIN_SERVING_SIZE)
          return t(TranslationKeys.validation_min_value, { min: MIN_SERVING_SIZE });
        if (servingSize > MAX_SERVING_SIZE)
          return t(TranslationKeys.validation_max_value, { max: MAX_SERVING_SIZE });
        return null;

      case "servingSizeUnit":
        if (!trimmedValue) return t(TranslationKeys.validation_required);
        if (trimmedValue !== "g" && trimmedValue !== "ml")
          return t(TranslationKeys.validation_invalid_weight);
        return null;

      case "brand":
        return null;

      case "barcode":
        if (!trimmedValue) return null;
        if (!BARCODE_REGEX.test(trimmedValue)) return t(TranslationKeys.validation_invalid_barcode);
        return null;

      case "calories":
        if (!trimmedValue) return t(TranslationKeys.validation_required);
        const calories = Number(trimmedValue);
        if (isNaN(calories)) return t(TranslationKeys.validation_valid_number);
        if (calories < 0) return t(TranslationKeys.validation_non_negative);
        if (calories > MAX_CALORIES)
          return t(TranslationKeys.validation_max_value, { max: MAX_CALORIES });
        return null;

      case "fats":
        if (!trimmedValue) return t(TranslationKeys.validation_required);
        const fatValue = Number(trimmedValue);
        if (isNaN(fatValue)) return t(TranslationKeys.validation_valid_number);
        if (fatValue < 0) return t(TranslationKeys.validation_non_negative);
        if (fatValue > MAX_FAT) return t(TranslationKeys.validation_max_value, { max: MAX_FAT });
        return null;

      case "carbs":
        if (!trimmedValue) return t(TranslationKeys.validation_required);
        const carbsValue = Number(trimmedValue);
        if (isNaN(carbsValue)) return t(TranslationKeys.validation_valid_number);
        if (carbsValue < 0) return t(TranslationKeys.validation_non_negative);
        if (carbsValue > MAX_CARBS)
          return t(TranslationKeys.validation_max_value, { max: MAX_CARBS });
        return null;

      case "protein":
        if (!trimmedValue) return t(TranslationKeys.validation_required);
        const proteinValue = Number(trimmedValue);
        if (isNaN(proteinValue)) return t(TranslationKeys.validation_valid_number);
        if (proteinValue < 0) return t(TranslationKeys.validation_non_negative);
        if (proteinValue > MAX_PROTEIN)
          return t(TranslationKeys.validation_max_value, { max: MAX_PROTEIN });
        return null;

      case "sugar":
        if (!trimmedValue) return t(TranslationKeys.validation_required);
        const sugarValue = Number(trimmedValue);
        if (isNaN(sugarValue)) return t(TranslationKeys.validation_valid_number);
        if (sugarValue < 0) return t(TranslationKeys.validation_non_negative);
        if (sugarValue > MAX_SUGAR)
          return t(TranslationKeys.validation_max_value, { max: MAX_SUGAR });
        return null;

      case "fiber":
        if (!trimmedValue) return t(TranslationKeys.validation_required);
        const fiberValue = Number(trimmedValue);
        if (isNaN(fiberValue)) return t(TranslationKeys.validation_valid_number);
        if (fiberValue < 0) return t(TranslationKeys.validation_non_negative);
        if (fiberValue > MAX_FIBER)
          return t(TranslationKeys.validation_max_value, { max: MAX_FIBER });
        return null;

      case "salt":
        if (!trimmedValue) return t(TranslationKeys.validation_required);
        const saltValue = Number(trimmedValue);
        if (isNaN(saltValue)) return t(TranslationKeys.validation_valid_number);
        if (saltValue < 0) return t(TranslationKeys.validation_non_negative);
        if (saltValue > MAX_SALT) return t(TranslationKeys.validation_max_value, { max: MAX_SALT });
        return null;

      default:
        return null;
    }
  };

  const validateCrossFields = (): Record<string, string> => {
    const crossErrors: Record<string, string> = {};

    if (foodData.sugar && foodData.carbs) {
      const sugar = Number(foodData.sugar);
      const carbs = Number(foodData.carbs);
      if (!isNaN(sugar) && !isNaN(carbs) && sugar > carbs) {
        crossErrors.sugar = t(TranslationKeys.validation_sugar_exceeds_carbs);
      }
    }

    if (foodData.fiber && foodData.carbs) {
      const fiber = Number(foodData.fiber);
      const carbs = Number(foodData.carbs);
      if (!isNaN(fiber) && !isNaN(carbs) && fiber > carbs) {
        crossErrors.fiber = t(TranslationKeys.validation_fiber_exceeds_carbs);
      }
    }

    if (foodData.calories && foodData.fats && foodData.carbs && foodData.protein) {
      const calories = Number(foodData.calories);
      const fats = Number(foodData.fats);
      const carbs = Number(foodData.carbs);
      const protein = Number(foodData.protein);

      if (!isNaN(calories) && !isNaN(fats) && !isNaN(carbs) && !isNaN(protein)) {
        // Calculate calories from macros: 9 cal/g for fats, 4 cal/g for carbs and protein
        const calculatedCalories = fats * 9 + carbs * 4 + protein * 4;

        // 15% tolerance
        const lowerBound = calculatedCalories * 0.85;
        const upperBound = calculatedCalories * 1.15;

        if (calories < lowerBound || calories > upperBound) {
          crossErrors.calories = t(TranslationKeys.validation_calories_macros_mismatch);
        }
      }
    }

    return crossErrors;
  };

  const updateFoodData = (field: keyof FoodFormData, value: string) => {
    const processedValue = field === "name" || field === "brand" ? value : value;

    setFoodData((prev) => ({ ...prev, [field]: processedValue }));
    setFormTouched(true);

    const fieldError = validateField(field, processedValue);

    setErrors((prev) => {
      const newErrors = { ...prev };
      if (fieldError) {
        newErrors[field] = fieldError;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    setValidFields((prev) => ({
      ...prev,
      [field]: !fieldError && processedValue.trim() !== "",
    }));
  };

  useEffect(() => {
    if (!formTouched) return;

    const crossErrors = validateCrossFields();

    setErrors((prev) => {
      const newErrors = { ...prev };

      if (prev.sugar && crossErrors.sugar === undefined) delete newErrors.sugar;
      if (prev.fiber && crossErrors.fiber === undefined) delete newErrors.fiber;
      if (prev.calories && crossErrors.calories === undefined) delete newErrors.calories;

      return { ...newErrors, ...crossErrors };
    });
  }, [
    foodData.sugar,
    foodData.fiber,
    foodData.carbs,
    foodData.calories,
    foodData.fats,
    foodData.protein,
    formTouched,
  ]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const fields = Object.keys(foodData) as Array<keyof FoodFormData>;

    fields.forEach((field) => {
      const error = validateField(field, foodData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    const crossErrors = validateCrossFields();
    Object.assign(newErrors, crossErrors);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { saveFood: saveFoodToRepository } = useFoodRepository();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveFood = async () => {
    setFormTouched(true);
    if (validate()) {
      try {
        setIsSaving(true);
        const preparedData: Omit<FoodData, "id" | "created_at" | "updated_at"> = {
          ...foodData,
          name: foodData.name.trim(),
          brand: foodData.brand.trim(),
        };

        await saveFoodToRepository(preparedData);

        console.log("Food data saved successfully:", preparedData);
        resetFoodData();
        router.push("/(tabs)/food-diary-screen");
      } catch (error) {
        console.error("Error saving food:", error);
        Alert.alert(t(TranslationKeys.save_error), t(TranslationKeys.save_error_message), [
          { text: t(TranslationKeys.ok) },
        ]);
      } finally {
        setIsSaving(false);
      }
    } else {
      Alert.alert(
        t(TranslationKeys.validation_error),
        t(TranslationKeys.validation_error_message),
        [{ text: t(TranslationKeys.ok) }]
      );
    }
  };

  const resetFoodData = () => {
    setFoodData({
      name: "",
      category: FoodCategoryEnum.FRUIT,
      servingSizeValue: "",
      servingSizeUnit: "g",
      brand: "",
      barcode: "",
      calories: "",
      fats: "",
      carbs: "",
      sugar: "",
      fiber: "",
      protein: "",
      salt: "",
    });
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedStatusBar />
      {isSaving && (
        <View style={styles.loaderContainer}>
          <View style={[styles.loaderBackground, { backgroundColor: surfaceColor }]}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText style={styles.loaderText}>{t(TranslationKeys.loading)}</ThemedText>
          </View>
        </View>
      )}
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.food_creation_header),
        }}
      />

      <ScrollView style={{ flex: 1, marginBottom: 80 }}>
        {/* Main attributes section */}
        <View style={styles.sectionContainer}>
          <LinearGradient
            colors={[surfaceContainerHighest, surfaceColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientHeader}>
            <MaterialIcons name="info-outline" size={22} color={primaryColor} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t(TranslationKeys.food_creation_main_information_header)}
            </ThemedText>
          </LinearGradient>

          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <CFoodAttributeInput
              icon={<MaterialCommunityIcons name="food-apple" />}
              label={t(TranslationKeys.food_name)}
              value={foodData.name}
              onChangeText={(text) => updateFoodData("name", text)}
              isRequired={true}
              error={errors.name}
              maxLength={MAX_NAME_LENGTH}
              placeholder={t(TranslationKeys.food_name_placeholder)}
              style={styles.inputContainer}
            />

            <CDropdown
              icon={<MaterialIcons name="category" />}
              label={t(TranslationKeys.category)}
              options={getFoodCategoryOptions()}
              selectedValue={foodData.category}
              onValueChange={(value) => updateFoodData("category", value)}
              isRequired={true}
              error={errors.category}
              style={styles.inputContainer}
            />

            <CServingSizeInput
              value={foodData.servingSizeValue}
              unit={foodData.servingSizeUnit}
              onChangeText={(text) => updateFoodData("servingSizeValue", text)}
              onUnitChange={(unit) => updateFoodData("servingSizeUnit", unit)}
              isRequired={true}
              label={t(TranslationKeys.food_diary_entry_serving_size)}
              error={errors.servingSizeValue}
              style={styles.inputContainer}
            />

            <CDivider style={styles.divider} />

            <View style={styles.optionalFieldsContainer}>
              <ThemedText style={styles.optionalLabel}>
                {t(TranslationKeys.optional_information)}
              </ThemedText>

              <CFoodAttributeInput
                icon={<Ionicons name="pricetag-outline" />}
                label={t(TranslationKeys.brand)}
                value={foodData.brand}
                onChangeText={(text) => updateFoodData("brand", text)}
                isRequired={false}
                error={errors.brand}
                style={styles.inputContainer}
              />

              <CFoodAttributeInput
                icon={<MaterialCommunityIcons name="barcode" />}
                label={t(TranslationKeys.barcode)}
                value={foodData.barcode}
                onChangeText={(text) => updateFoodData("barcode", text)}
                keyboardType="number-pad"
                placeholder={t(TranslationKeys.barcode_placeholder)}
                error={errors.barcode}
                style={[styles.inputContainer, { marginTop: 8 }]}
              />
            </View>
          </View>
        </View>

        {/* Macronutrients section */}
        <View style={styles.sectionContainer}>
          <LinearGradient
            colors={[surfaceContainerHighest, surfaceColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientHeader}>
            <FontAwesome5 name="apple-alt" size={18} color={primaryColor} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {t(TranslationKeys.nutritional_information)}
            </ThemedText>
          </LinearGradient>

          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="fire" />}
                  label={t(TranslationKeys.calories)}
                  value={foodData.calories}
                  onChangeText={(text) => updateFoodData("calories", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="kcal"
                  isRequired={true}
                  error={errors.calories}
                  placeholder={t(TranslationKeys.calories_placeholder)}
                  style={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.macroGroupLabel}>
              <ThemedText style={styles.macroGroupText}>
                {t(TranslationKeys.macronutrients)}
              </ThemedText>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="oil" />}
                  label={t(TranslationKeys.fats)}
                  value={foodData.fats}
                  onChangeText={(text) => updateFoodData("fats", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="g"
                  isRequired={true}
                  error={errors.fats}
                  placeholder={t(TranslationKeys.fats_placeholder)}
                  style={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="grain" />}
                  label={t(TranslationKeys.carbs)}
                  value={foodData.carbs}
                  onChangeText={(text) => updateFoodData("carbs", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="g"
                  isRequired={true}
                  error={errors.carbs}
                  placeholder={t(TranslationKeys.carbs_placeholder)}
                  style={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.subMacroContainer}>
              <CFoodAttributeInput
                icon={<MaterialCommunityIcons name="cube-outline" />}
                label={t(TranslationKeys.sugar)}
                value={foodData.sugar}
                onChangeText={(text) => updateFoodData("sugar", text)}
                keyboardType="numeric"
                isNumeric={true}
                unit="g"
                isRequired={true}
                error={errors.sugar}
                placeholder={t(TranslationKeys.sugar_placeholder)}
                style={[styles.inputContainer, styles.subMacroInput]}
              />

              <CFoodAttributeInput
                icon={<MaterialCommunityIcons name="nutrition" />}
                label={t(TranslationKeys.fiber)}
                value={foodData.fiber}
                onChangeText={(text) => updateFoodData("fiber", text)}
                keyboardType="numeric"
                isNumeric={true}
                unit="g"
                isRequired={true}
                error={errors.fiber}
                placeholder={t(TranslationKeys.fiber_placeholder)}
                style={[styles.inputContainer, styles.subMacroInput]}
              />
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="food-steak" />}
                  label={t(TranslationKeys.protein)}
                  value={foodData.protein}
                  onChangeText={(text) => updateFoodData("protein", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="g"
                  isRequired={true}
                  error={errors.protein}
                  placeholder={t(TranslationKeys.protein_placeholder)}
                  style={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.macroGroupLabel}>
              <ThemedText style={styles.macroGroupText}>{t(TranslationKeys.other)}</ThemedText>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="shaker-outline" />}
                  label={t(TranslationKeys.salt)}
                  value={foodData.salt}
                  onChangeText={(text) => updateFoodData("salt", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="g"
                  isRequired={true}
                  error={errors.salt}
                  placeholder={t(TranslationKeys.salt_placeholder)}
                  style={styles.inputContainer}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Save button at bottom */}
        <Pressable
          onPress={handleSaveFood}
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: primaryColor,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}>
          <MaterialIcons name="save" size={24} color="#fff" />
          <ThemedText style={styles.saveButtonText} type="defaultSemiBold">
            {t(TranslationKeys.save_food)}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  loaderBackground: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loaderText: {
    marginTop: 10,
    fontFamily: _500Medium,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: -4,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  sectionTitle: {
    marginLeft: 8,
    fontFamily: _600SemiBold,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  inputContainer: {
    marginBottom: 0,
    borderRadius: 10,
  },
  divider: {
    marginVertical: 10,
  },
  optionalFieldsContainer: {
    marginTop: 4,
  },
  optionalLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: _500Medium,
    textAlign: "center",
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroColumn: {
    flex: 1,
  },
  subMacroContainer: {
    marginLeft: 24,
    marginBottom: 8,
  },
  subMacroInput: {
    marginBottom: 8,
  },
  macroGroupLabel: {
    marginVertical: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  macroGroupText: {
    fontSize: 14,
    fontFamily: _500Medium,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontFamily: _600SemiBold,
  },
});
