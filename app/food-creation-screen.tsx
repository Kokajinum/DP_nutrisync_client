import React, { useState, useEffect } from "react";
import { ScrollView, View, StyleSheet, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { GlobalColors } from "@/constants/Colors";
import { _400Regular, _500Medium, _600SemiBold } from "@/constants/Global";
import { FoodCategoryEnum } from "@/models/enums/enums";
import { foodCategoryOptions } from "@/utils/foodCategories";
import CFoodAttributeInput from "@/components/input/CFoodAttributeInput";
import CDropdown from "@/components/input/CDropdown";
import CServingSizeInput from "@/components/input/CServingSizeInput";

interface FoodData {
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
  const cardBackgroundColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "outline");
  const sectionTitleColor = useThemeColor({}, "primary");
  const iconColor = useThemeColor({}, "onBackground");

  const [foodData, setFoodData] = useState<FoodData>({
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

  const updateFoodData = (field: keyof FoodData, value: string) => {
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
    const fields = Object.keys(foodData) as Array<keyof FoodData>;

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

  const handleSaveFood = () => {
    setFormTouched(true);
    if (validate()) {
      // Prepare data for save
      const preparedData = {
        ...foodData,
        name: foodData.name.trim(),
        brand: foodData.brand.trim(),
      };

      //todo save to database (remote and local)
      console.log("Food data to save:", preparedData);
      resetFoodData();
      router.push("/(tabs)/food-diary-screen");
    } else {
      // Scroll to the first error
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
      <ThemedStackScreen
        options={{
          title: "Create Food",
          headerLeft: () => (
            <Pressable
              // Modified: Navigate directly to food-diary-screen instead of using router.back()
              onPress={() => router.push("/(tabs)/food-diary-screen")}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}>
              <MaterialIcons name="arrow-back" size={24} color={iconColor} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={handleSaveFood}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}>
              <MaterialIcons name="check" size={24} color={GlobalColors.checkGreen} />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={{ flex: 1 }}>
        {/* Main attributes section */}
        <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: sectionTitleColor }]}>
            Main Information
          </ThemedText>

          <CFoodAttributeInput
            icon={<MaterialCommunityIcons name="food-apple" />}
            label="Food Name"
            value={foodData.name}
            onChangeText={(text) => updateFoodData("name", text)}
            isRequired={true}
            error={errors.name}
            maxLength={MAX_NAME_LENGTH}
            placeholder="Enter food name"
          />

          <CDropdown
            icon={<MaterialIcons name="category" />}
            label="Category"
            options={foodCategoryOptions}
            selectedValue={foodData.category}
            onValueChange={(value) => updateFoodData("category", value)}
            isRequired={true}
            error={errors.category}
          />

          <CServingSizeInput
            value={foodData.servingSizeValue}
            unit={foodData.servingSizeUnit}
            onChangeText={(text) => updateFoodData("servingSizeValue", text)}
            onUnitChange={(unit) => updateFoodData("servingSizeUnit", unit)}
            isRequired={true}
            error={errors.servingSizeValue}
          />

          <CFoodAttributeInput
            icon={<Ionicons name="pricetag-outline" />}
            label="Brand (optional)"
            value={foodData.brand}
            onChangeText={(text) => updateFoodData("brand", text)}
          />

          <CFoodAttributeInput
            icon={<MaterialCommunityIcons name="barcode" />}
            label="Barcode (optional)"
            value={foodData.barcode}
            onChangeText={(text) => updateFoodData("barcode", text)}
            keyboardType="number-pad"
            placeholder="Enter 8-14 digit barcode"
            error={errors.barcode}
          />
        </View>

        {/* Macronutrients section */}
        <View style={[styles.section, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: sectionTitleColor }]}>
            Nutritional Information (100g)
          </ThemedText>

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
          />

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
          />

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
          />

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
          />

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
          />

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
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 8,
  },
});
