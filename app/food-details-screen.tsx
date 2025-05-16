import React, { useState, useMemo } from "react";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import CDivider from "@/components/CDivider";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import CButton from "@/components/button/CButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCreateFoodDiaryEntry } from "@/hooks/useDailyDiaryRepository";
import { FoodData } from "@/models/interfaces/FoodData";
import { MealTypeEnum } from "@/models/enums/enums";
import { CreateFoodDiaryEntryDto } from "@/models/interfaces/CreateFoodDiaryEntryDto";
import * as Progress from "react-native-progress";
import CNumberInput from "@/components/input/CNumberInput";
import CServingSizeInput from "@/components/input/CServingSizeInput";
import { useDateStore } from "@/stores/dateStore";
import { Pressable } from "react-native";

export default function FoodDetailsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const { selectedDate } = useDateStore();
  const { mutate: createFoodDiaryEntry } = useCreateFoodDiaryEntry();

  const iconColor = useThemeColor({}, "onBackground");
  const primaryColor = useThemeColor({}, "primary");

  // Parse food data from params
  const foodData: FoodData = {
    id: params.id as string,
    name: params.name as string,
    category: params.category as string,
    brand: params.brand as string,
    barcode: params.barcode as string,
    calories: params.calories as string,
    protein: params.protein as string,
    carbs: params.carbs as string,
    fats: params.fats as string,
    sugar: params.sugar as string,
    fiber: params.fiber as string,
    salt: params.salt as string,
    servingSizeValue: params.servingSizeValue as string,
    servingSizeUnit: (params.servingSizeUnit as "g" | "ml") || "g",
  };

  // Get meal type from params or use default
  const mealType = (params.mealType as MealTypeEnum) || MealTypeEnum.BREAKFAST;

  // State for serving inputs
  const [servings, setServings] = useState<number>(1);
  const [servingSize, setServingSize] = useState<number>(
    parseFloat(foodData.servingSizeValue) || 100
  );
  const [servingUnit, setServingUnit] = useState<"g" | "ml">(foodData.servingSizeUnit || "g");

  // Calculate nutrition values based on servings
  const calculatedValues = useMemo(() => {
    const servingSizeMultiplier =
      servings * (servingSize / (parseFloat(foodData.servingSizeValue) || 100));

    return {
      calories: Math.round(parseFloat(foodData.calories || "0") * servingSizeMultiplier),
      protein: Math.round(parseFloat(foodData.protein || "0") * servingSizeMultiplier * 10) / 10,
      carbs: Math.round(parseFloat(foodData.carbs || "0") * servingSizeMultiplier * 10) / 10,
      fat: Math.round(parseFloat(foodData.fats || "0") * servingSizeMultiplier * 10) / 10,
    };
  }, [foodData, servings, servingSize]);

  // Handle saving food diary entry
  const handleSaveFoodDiaryEntry = async () => {
    try {
      const entry: CreateFoodDiaryEntryDto = {
        food_id: foodData.id || "",
        food_name: foodData.name,
        brand: foodData.brand || "",
        meal_type: mealType,
        serving_size: servingSize,
        serving_unit: servingUnit,
        calories: calculatedValues.calories,
        protein: calculatedValues.protein,
        carbs: calculatedValues.carbs,
        fat: calculatedValues.fat,
        entry_date: new Date(selectedDate).toISOString(),
      };

      createFoodDiaryEntry(entry);
      router.back();
    } catch (error) {
      console.error("Error saving food diary entry:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedStatusBar />
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.food_diary_entry_header),
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.headerButton, { opacity: pressed ? 0.7 : 1 }]}>
              <MaterialIcons name="arrow-back" size={24} color={iconColor} />
            </Pressable>
          ),
        }}
      />

      <ScrollView style={styles.content}>
        {/* Food header */}
        <View style={styles.foodHeader}>
          <ThemedText style={styles.foodTitle}>{foodData.name}</ThemedText>
          {foodData.brand && <ThemedText style={styles.foodBrand}>{foodData.brand}</ThemedText>}
        </View>

        <CDivider />

        {/* Serving inputs */}
        <View style={styles.servingContainer}>
          <View style={styles.servingInputContainer}>
            <CNumberInput
              value={servings}
              onChange={setServings}
              min={0.25}
              max={10}
              step={0.25}
              label={t(TranslationKeys.food_diary_entry_servings)}
              style={styles.servingPicker}
            />
          </View>

          <View style={styles.servingInputContainer}>
            {/* <ThemedText style={styles.servingLabel}>
              {t(TranslationKeys.food_diary_entry_serving_size)}
            </ThemedText> */}
            <CServingSizeInput
              value={servingSize.toString()}
              unit={servingUnit}
              onChangeText={(text) => setServingSize(parseFloat(text) || 0)}
              onUnitChange={setServingUnit}
              style={styles.servingSizeInput}
            />
          </View>
        </View>

        <CDivider />

        {/* Nutrition summary */}
        <View style={styles.nutritionContainer}>
          <ThemedText type="subtitle" style={styles.nutritionTitle}>
            {t(TranslationKeys.food_diary_entry_nutrition)}
          </ThemedText>

          <View style={styles.calorieContainer}>
            <ThemedText style={styles.calorieValue}>{calculatedValues.calories} kcal</ThemedText>
          </View>

          <View style={styles.macroProgressContainer}>
            {/* Protein progress */}
            <View style={styles.macroProgress}>
              <View style={styles.macroLabelContainer}>
                <ThemedText style={styles.macroLabel}>
                  {t(TranslationKeys.food_diary_entry_protein)}
                </ThemedText>
                <ThemedText style={styles.macroValue}>{calculatedValues.protein}g</ThemedText>
              </View>
              <Progress.Bar
                progress={Math.min(calculatedValues.protein / 50, 1)}
                width={null}
                height={8}
                color="#FF6B6B"
                unfilledColor="#F0F0F0"
                borderWidth={0}
                style={styles.progressBar}
              />
            </View>

            {/* Carbs progress */}
            <View style={styles.macroProgress}>
              <View style={styles.macroLabelContainer}>
                <ThemedText style={styles.macroLabel}>
                  {t(TranslationKeys.food_diary_entry_carbs)}
                </ThemedText>
                <ThemedText style={styles.macroValue}>{calculatedValues.carbs}g</ThemedText>
              </View>
              <Progress.Bar
                progress={Math.min(calculatedValues.carbs / 100, 1)}
                width={null}
                height={8}
                color="#4ECDC4"
                unfilledColor="#F0F0F0"
                borderWidth={0}
                style={styles.progressBar}
              />
            </View>

            {/* Fat progress */}
            <View style={styles.macroProgress}>
              <View style={styles.macroLabelContainer}>
                <ThemedText style={styles.macroLabel}>
                  {t(TranslationKeys.food_diary_entry_fat)}
                </ThemedText>
                <ThemedText style={styles.macroValue}>{calculatedValues.fat}g</ThemedText>
              </View>
              <Progress.Bar
                progress={Math.min(calculatedValues.fat / 40, 1)}
                width={null}
                height={8}
                color="#FFD166"
                unfilledColor="#F0F0F0"
                borderWidth={0}
                style={styles.progressBar}
              />
            </View>
          </View>
        </View>

        {/* Add button */}
        <View style={styles.addButtonContainer}>
          <CButton
            title={t(TranslationKeys.food_diary_entry_add)}
            onPress={handleSaveFoodDiaryEntry}
            style={styles.addToEntryButton}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 8,
  },
  foodHeader: {
    marginBottom: 16,
  },
  foodTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 16,
    opacity: 0.7,
  },
  servingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  servingInputContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  servingLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  servingPicker: {
    width: "100%",
  },
  servingSizeInput: {
    width: "100%",
  },
  nutritionContainer: {
    marginBottom: 16,
  },
  nutritionTitle: {
    marginBottom: 12,
  },
  calorieContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  macroProgressContainer: {
    marginTop: 8,
  },
  macroProgress: {
    marginBottom: 12,
  },
  macroLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 14,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  progressBar: {
    width: "100%",
  },
  addButtonContainer: {
    marginTop: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  addToEntryButton: {
    minWidth: 200,
  },
});
