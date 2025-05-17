import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  Alert,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, MaterialCommunityIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFoodRepository } from "@/hooks/useFoodRepository";
import { ThemedView } from "@/components/ThemedView";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { GlobalColors, Colors } from "@/constants/Colors";
import { _400Regular, _500Medium, _600SemiBold, _700Bold } from "@/constants/Global";
import { FoodCategoryEnum } from "@/models/enums/enums";
import { foodCategoryOptions } from "@/utils/foodCategories";
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
const BARCODE_REGEX = /^[0-9]{8,14}$/; // basic types EAN-8, EAN-13, UPC-A, ...

export default function FoodCreationScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");
  const surfaceContainerHighest = useThemeColor({}, "surfaceContainerHighest");
  const borderColor = useThemeColor({}, "outline");
  //const sectionTitleColor = useThemeColor({}, "primary");
  const iconColor = useThemeColor({}, "onBackground");

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

  // Function to validate a single field
  const validateField = (field: keyof FoodData, value: string): string | null => {
    // Trim the value if it's a string
    const trimmedValue = typeof value === "string" ? value.trim() : value;

    switch (field) {
      case "name":
        if (!trimmedValue) return "Name is required";
        if (trimmedValue.length > MAX_NAME_LENGTH)
          return `Name must be ${MAX_NAME_LENGTH} characters or less`;
        return null;

      case "category":
        if (!trimmedValue) return "Category is required";
        return null;

      case "servingSizeValue":
        if (!trimmedValue) return "Serving size is required";
        const servingSize = Number(trimmedValue);
        if (isNaN(servingSize)) return "Must be a valid number";
        if (servingSize <= 0) return "Must be a positive number";
        if (servingSize < MIN_SERVING_SIZE) return `Must be at least ${MIN_SERVING_SIZE}`;
        if (servingSize > MAX_SERVING_SIZE) return `Must be ${MAX_SERVING_SIZE} or less`;
        return null;

      case "barcode":
        if (!trimmedValue) return null; // Optional field
        if (!BARCODE_REGEX.test(trimmedValue)) return "Invalid barcode format";
        return null;

      case "calories":
        if (!trimmedValue) return null; // Optional field
        const calories = Number(trimmedValue);
        if (isNaN(calories)) return "Must be a valid number";
        if (calories < 0) return "Cannot be negative";
        if (calories > MAX_CALORIES) return `Must be ${MAX_CALORIES} or less`;
        return null;

      case "fats":
        if (!trimmedValue) return null; // Optional field
        const fatValue = Number(trimmedValue);
        if (isNaN(fatValue)) return "Must be a valid number";
        if (fatValue < 0) return "Cannot be negative";
        if (fatValue > MAX_FAT) return `Must be ${MAX_FAT}g or less`;
        return null;

      case "carbs":
        if (!trimmedValue) return null; // Optional field
        const carbsValue = Number(trimmedValue);
        if (isNaN(carbsValue)) return "Must be a valid number";
        if (carbsValue < 0) return "Cannot be negative";
        if (carbsValue > MAX_CARBS) return `Must be ${MAX_CARBS}g or less`;
        return null;

      case "protein":
        if (!trimmedValue) return null; // Optional field
        const proteinValue = Number(trimmedValue);
        if (isNaN(proteinValue)) return "Must be a valid number";
        if (proteinValue < 0) return "Cannot be negative";
        if (proteinValue > MAX_PROTEIN) return `Must be ${MAX_PROTEIN}g or less`;
        return null;

      case "sugar":
        if (!trimmedValue) return null; // Optional field
        const sugarValue = Number(trimmedValue);
        if (isNaN(sugarValue)) return "Must be a valid number";
        if (sugarValue < 0) return "Cannot be negative";
        if (sugarValue > MAX_SUGAR) return `Must be ${MAX_SUGAR}g or less`;
        return null;

      case "fiber":
        if (!trimmedValue) return null; // Optional field
        const fiberValue = Number(trimmedValue);
        if (isNaN(fiberValue)) return "Must be a valid number";
        if (fiberValue < 0) return "Cannot be negative";
        if (fiberValue > MAX_FIBER) return `Must be ${MAX_FIBER}g or less`;
        return null;

      case "salt":
        if (!trimmedValue) return null; // Optional field
        const saltValue = Number(trimmedValue);
        if (isNaN(saltValue)) return "Must be a valid number";
        if (saltValue < 0) return "Cannot be negative";
        if (saltValue > MAX_SALT) return `Must be ${MAX_SALT}g or less`;
        return null;

      default:
        return null;
    }
  };

  const validateCrossFields = (): Record<string, string> => {
    const crossErrors: Record<string, string> = {};

    // Check if sugar exceeds carbs
    if (foodData.sugar && foodData.carbs) {
      const sugar = Number(foodData.sugar);
      const carbs = Number(foodData.carbs);
      if (!isNaN(sugar) && !isNaN(carbs) && sugar > carbs) {
        crossErrors.sugar = "Sugar cannot exceed total carbs";
      }
    }

    // Check if fiber exceeds carbs
    if (foodData.fiber && foodData.carbs) {
      const fiber = Number(foodData.fiber);
      const carbs = Number(foodData.carbs);
      if (!isNaN(fiber) && !isNaN(carbs) && fiber > carbs) {
        crossErrors.fiber = "Fiber cannot exceed total carbs";
      }
    }

    // Check if macronutrients make sense with calories
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
          crossErrors.calories = "Calories don't match macronutrients (±15% expected)";
        }
      }
    }

    return crossErrors;
  };

  const updateFoodData = (field: keyof FoodFormData, value: string) => {
    // For text fields, trim the input
    const processedValue = field === "name" || field === "brand" ? value : value; // For numeric fields, we will keep the original input for better UX

    setFoodData((prev) => ({ ...prev, [field]: processedValue }));
    setFormTouched(true);

    // Validate the field
    const fieldError = validateField(field, processedValue);

    // Update errors state
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (fieldError) {
        newErrors[field] = fieldError;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });

    // Update valid fields state
    setValidFields((prev) => ({
      ...prev,
      [field]: !fieldError && processedValue.trim() !== "",
    }));
  };

  // Effect to run cross-field validations when relevant fields change
  useEffect(() => {
    if (!formTouched) return;

    const crossErrors = validateCrossFields();

    setErrors((prev) => {
      const newErrors = { ...prev };

      // Remove any previous cross-field errors
      if (prev.sugar && crossErrors.sugar === undefined) delete newErrors.sugar;
      if (prev.fiber && crossErrors.fiber === undefined) delete newErrors.fiber;
      if (prev.calories && crossErrors.calories === undefined) delete newErrors.calories;

      // Add new cross-field errors
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

    // Validate each field
    fields.forEach((field) => {
      const error = validateField(field, foodData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Add cross-field validations
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
        // Prepare data for save
        const preparedData: Omit<FoodData, "id" | "created_at" | "updated_at"> = {
          ...foodData,
          name: foodData.name.trim(),
          brand: foodData.brand.trim(),
        };

        // Save to repository (which handles both remote and local storage)
        await saveFoodToRepository(preparedData);

        console.log("Food data saved successfully:", preparedData);
        resetFoodData();
        router.push("/(tabs)/food-diary-screen");
      } catch (error) {
        console.error("Error saving food:", error);
        Alert.alert("Save Error", "There was a problem saving your food. Please try again.", [
          { text: "OK" },
        ]);
      } finally {
        setIsSaving(false);
      }
    } else {
      Alert.alert("Validation Error", "Please correct the errors before saving.", [{ text: "OK" }]);
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
          headerLeft: () => (
            <Pressable
              onPress={() => router.push("/(tabs)/food-diary-screen")}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}>
              <MaterialIcons name="arrow-back" size={24} color={iconColor} />
            </Pressable>
          ),
          // headerRight: () => (
          //   <Pressable
          //     onPress={handleSaveFood}
          //     style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}>
          //     <MaterialIcons name="check" size={28} color={GlobalColors.checkGreen} />
          //   </Pressable>
          // ),
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
              label="Food Name"
              value={foodData.name}
              onChangeText={(text) => updateFoodData("name", text)}
              isRequired={true}
              error={errors.name}
              maxLength={MAX_NAME_LENGTH}
              placeholder="Enter food name"
              style={styles.inputContainer}
            />

            <CDropdown
              icon={<MaterialIcons name="category" />}
              label="Category"
              options={foodCategoryOptions}
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
              error={errors.servingSizeValue}
              style={styles.inputContainer}
            />

            <CDivider style={styles.divider} />

            <View style={styles.optionalFieldsContainer}>
              <ThemedText style={styles.optionalLabel}>Optional Information</ThemedText>

              <CFoodAttributeInput
                icon={<Ionicons name="pricetag-outline" />}
                label="Brand"
                value={foodData.brand}
                onChangeText={(text) => updateFoodData("brand", text)}
                style={styles.inputContainer}
              />

              <CFoodAttributeInput
                icon={<MaterialCommunityIcons name="barcode" />}
                label="Barcode"
                value={foodData.barcode}
                onChangeText={(text) => updateFoodData("barcode", text)}
                keyboardType="number-pad"
                placeholder="Enter 8-14 digit barcode"
                error={errors.barcode}
                style={styles.inputContainer}
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
              Nutritional Information (100g)
            </ThemedText>
          </LinearGradient>

          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="fire" />}
                  label="Calories"
                  value={foodData.calories}
                  onChangeText={(text) => updateFoodData("calories", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="kcal"
                  error={errors.calories}
                  placeholder="0-900"
                  style={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.macroGroupLabel}>
              <ThemedText style={styles.macroGroupText}>Macronutrients</ThemedText>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="oil" />}
                  label="Fats"
                  value={foodData.fats}
                  onChangeText={(text) => updateFoodData("fats", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="g"
                  error={errors.fats}
                  placeholder="0-100"
                  style={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="grain" />}
                  label="Carbs"
                  value={foodData.carbs}
                  onChangeText={(text) => updateFoodData("carbs", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="g"
                  error={errors.carbs}
                  placeholder="0-100"
                  style={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.subMacroContainer}>
              <CFoodAttributeInput
                icon={<MaterialCommunityIcons name="cube-outline" />}
                label="Sugar"
                value={foodData.sugar}
                onChangeText={(text) => updateFoodData("sugar", text)}
                keyboardType="numeric"
                isNumeric={true}
                unit="g"
                error={errors.sugar}
                placeholder="0-100"
                style={[styles.inputContainer, styles.subMacroInput]}
              />

              <CFoodAttributeInput
                icon={<MaterialCommunityIcons name="nutrition" />}
                label="Fiber"
                value={foodData.fiber}
                onChangeText={(text) => updateFoodData("fiber", text)}
                keyboardType="numeric"
                isNumeric={true}
                unit="g"
                error={errors.fiber}
                placeholder="0-50"
                style={[styles.inputContainer, styles.subMacroInput]}
              />
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="food-steak" />}
                  label="Protein"
                  value={foodData.protein}
                  onChangeText={(text) => updateFoodData("protein", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="g"
                  error={errors.protein}
                  placeholder="0-100"
                  style={styles.inputContainer}
                />
              </View>
            </View>

            <View style={styles.macroGroupLabel}>
              <ThemedText style={styles.macroGroupText}>Other</ThemedText>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroColumn}>
                <CFoodAttributeInput
                  icon={<MaterialCommunityIcons name="shaker-outline" />}
                  label="Salt"
                  value={foodData.salt}
                  onChangeText={(text) => updateFoodData("salt", text)}
                  keyboardType="numeric"
                  isNumeric={true}
                  unit="g"
                  error={errors.salt}
                  placeholder="0-100"
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
            Save Food
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
    marginBottom: 8,
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
    marginBottom: 12,
    borderRadius: 10,
  },
  divider: {
    marginVertical: 16,
  },
  optionalFieldsContainer: {
    marginTop: 4,
  },
  optionalLabel: {
    fontSize: 14,
    marginBottom: 12,
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
    marginBottom: 24,
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
