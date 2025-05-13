import React, { useState, useEffect, useCallback } from "react";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import CDatePicker from "@/components/pickers/CDatePicker";
import { useDateStore } from "@/stores/dateStore";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { useRouter } from "expo-router";
import CButton from "@/components/button/CButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useFoodDiaryEntryRepository } from "@/hooks/useFoodDiaryEntryRepository";
import { FoodDiaryEntry } from "@/models/interfaces/FoodDiaryEntry";
import { useUserProfile } from "@/hooks/useUserProfile";
import { format } from "date-fns";
import { MealTypeEnum } from "@/models/enums/enums";

// Helper function to get meal type icon
const getMealTypeIcon = (mealType: MealTypeEnum): any => {
  switch (mealType) {
    case MealTypeEnum.BREAKFAST:
      return "coffee";
    case MealTypeEnum.LUNCH:
      return "food";
    case MealTypeEnum.DINNER:
      return "food-variant";
    case MealTypeEnum.SNACK:
      return "cookie";
    default:
      return "food";
  }
};

export default function FoodDiaryScreen() {
  const { getFormattedDate, selectedDate } = useDateStore();
  const { t } = useTranslation();
  const router = useRouter();
  const { getByDate } = useFoodDiaryEntryRepository();
  const { data: userProfile } = useUserProfile("current_user");

  // Theme colors
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const tertiaryColor = useThemeColor({}, "tertiary");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "outline");

  // State
  const [entries, setEntries] = useState<FoodDiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nutritionSummary, setNutritionSummary] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // Calculate daily calorie goal
  const dailyCalorieGoal = userProfile?.calorie_goal_value || 2000;
  const burnedCalories = 0; // This would come from activity tracking
  const remainingCalories = dailyCalorieGoal - nutritionSummary.calories + burnedCalories;
  const calorieProgress = Math.min(nutritionSummary.calories / dailyCalorieGoal, 1);

  // Macro goals (approximate percentages)
  const proteinGoal = (dailyCalorieGoal * 0.3) / 4; // 30% of calories from protein, 4 calories per gram
  const carbsGoal = (dailyCalorieGoal * 0.45) / 4; // 45% of calories from carbs, 4 calories per gram
  const fatGoal = (dailyCalorieGoal * 0.25) / 9; // 25% of calories from fat, 9 calories per gram

  // Macro progress
  const proteinProgress = Math.min(nutritionSummary.protein / proteinGoal, 1);
  const carbsProgress = Math.min(nutritionSummary.carbs / carbsGoal, 1);
  const fatProgress = Math.min(nutritionSummary.fat / fatGoal, 1);

  // Load food diary entries
  useEffect(() => {
    loadEntries();
  }, [selectedDate]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const dateString = new Date(selectedDate).toISOString().split("T")[0];
      const fetchedEntries = await getByDate(dateString);
      setEntries(fetchedEntries);

      // Calculate nutrition summary
      const summary = fetchedEntries.reduce(
        (acc, entry) => {
          return {
            calories: acc.calories + entry.calories,
            protein: acc.protein + entry.protein,
            carbs: acc.carbs + entry.carbs,
            fat: acc.fat + entry.fat,
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setNutritionSummary(summary);
    } catch (error) {
      console.error("Error loading food diary entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time from ISO string
  const formatTime = (isoString: string | undefined) => {
    if (!isoString) return "--:--";
    return format(new Date(isoString), "HH:mm");
  };

  // Render food diary entry
  const renderFoodDiaryEntry = ({ item }: { item: FoodDiaryEntry }) => (
    <Pressable
      style={({ pressed }) => [
        styles.entryCard,
        { backgroundColor: surfaceColor, borderColor },
        pressed && { opacity: 0.7 },
      ]}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleContainer}>
          <MaterialCommunityIcons
            name={getMealTypeIcon(item.meal_type)}
            size={20}
            color={primaryColor}
            style={styles.mealIcon}
          />
          <ThemedText type="subtitle" style={styles.entryTitle}>
            {item.food_name}
          </ThemedText>
        </View>
        <ThemedText style={styles.entryTime}>{formatTime(item.created_at)}</ThemedText>
      </View>

      {item.brand && <ThemedText style={styles.entryBrand}>{item.brand}</ThemedText>}

      <View style={styles.entryDetails}>
        <View style={styles.entryServingInfo}>
          <ThemedText style={styles.entryServingText}>
            {item.servings} × {item.serving_size}
            {item.serving_unit}
          </ThemedText>
        </View>

        <View style={styles.entryNutrition}>
          <ThemedText style={styles.entryCalories}>{item.calories} kcal</ThemedText>
          <View style={styles.entryMacros}>
            <ThemedText style={styles.macroText}>P: {item.protein}g</ThemedText>
            <ThemedText style={styles.macroText}>C: {item.carbs}g</ThemedText>
            <ThemedText style={styles.macroText}>F: {item.fat}g</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedStatusBar />
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.food_diary_header),
        }}
      />

      <CDatePicker dateFormat="long" style={styles.datePicker} />

      <FlatList
        data={entries}
        renderItem={renderFoodDiaryEntry}
        keyExtractor={(item) => item.id || `entry-${item.food_id}-${item.created_at}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Calorie Summary Card */}
            <View style={[styles.summaryCard, { backgroundColor: surfaceColor, borderColor }]}>
              <View style={styles.calorieCircleContainer}>
                <Progress.Circle
                  size={120}
                  progress={calorieProgress}
                  thickness={10}
                  color={primaryColor}
                  unfilledColor="#F0F0F0"
                  borderWidth={0}
                  strokeCap="round"
                  showsText={false}
                  style={styles.calorieCircle}
                />
                <View style={styles.calorieTextContainer}>
                  <ThemedText style={styles.calorieValue}>{nutritionSummary.calories}</ThemedText>
                  <ThemedText style={styles.calorieLabel}>kcal</ThemedText>
                </View>
              </View>

              <View style={styles.calorieDetailsContainer}>
                <View style={styles.calorieDetailItem}>
                  <ThemedText style={styles.calorieDetailLabel}>
                    {t(TranslationKeys.food_diary_goal)}
                  </ThemedText>
                  <ThemedText style={styles.calorieDetailValue}>{dailyCalorieGoal}</ThemedText>
                </View>

                <View style={styles.calorieDetailItem}>
                  <ThemedText style={styles.calorieDetailLabel}>
                    {t(TranslationKeys.food_diary_food)}
                  </ThemedText>
                  <ThemedText style={styles.calorieDetailValue}>
                    {nutritionSummary.calories}
                  </ThemedText>
                </View>

                <View style={styles.calorieDetailItem}>
                  <ThemedText style={styles.calorieDetailLabel}>
                    {t(TranslationKeys.food_diary_exercise)}
                  </ThemedText>
                  <ThemedText style={styles.calorieDetailValue}>{burnedCalories}</ThemedText>
                </View>

                <View style={styles.calorieDetailItem}>
                  <ThemedText style={styles.calorieDetailLabel}>
                    {t(TranslationKeys.food_diary_remaining)}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.calorieDetailValue,
                      { color: remainingCalories < 0 ? "#FF6B6B" : undefined },
                    ]}>
                    {remainingCalories}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Macronutrients Card */}
            <View style={[styles.macroCard, { backgroundColor: surfaceColor, borderColor }]}>
              <ThemedText type="subtitle" style={styles.macroCardTitle}>
                {t(TranslationKeys.food_diary_macronutrients)}
              </ThemedText>

              <View style={styles.macroCirclesContainer}>
                {/* Protein */}
                <View style={styles.macroCircleItem}>
                  <Progress.Circle
                    size={70}
                    progress={proteinProgress}
                    thickness={7}
                    color="#FF6B6B"
                    unfilledColor="#F0F0F0"
                    borderWidth={0}
                    strokeCap="round"
                    showsText={false}
                  />
                  <View style={styles.macroCircleTextContainer}>
                    <ThemedText style={styles.macroCircleValue}>
                      {Math.round(nutritionSummary.protein)}
                    </ThemedText>
                    <ThemedText style={styles.macroCircleUnit}>g</ThemedText>
                  </View>
                  <ThemedText style={styles.macroCircleLabel}>
                    {t(TranslationKeys.food_diary_entry_protein)}
                  </ThemedText>
                </View>

                {/* Carbs */}
                <View style={styles.macroCircleItem}>
                  <Progress.Circle
                    size={70}
                    progress={carbsProgress}
                    thickness={7}
                    color="#4ECDC4"
                    unfilledColor="#F0F0F0"
                    borderWidth={0}
                    strokeCap="round"
                    showsText={false}
                  />
                  <View style={styles.macroCircleTextContainer}>
                    <ThemedText style={styles.macroCircleValue}>
                      {Math.round(nutritionSummary.carbs)}
                    </ThemedText>
                    <ThemedText style={styles.macroCircleUnit}>g</ThemedText>
                  </View>
                  <ThemedText style={styles.macroCircleLabel}>
                    {t(TranslationKeys.food_diary_entry_carbs)}
                  </ThemedText>
                </View>

                {/* Fat */}
                <View style={styles.macroCircleItem}>
                  <Progress.Circle
                    size={70}
                    progress={fatProgress}
                    thickness={7}
                    color="#FFD166"
                    unfilledColor="#F0F0F0"
                    borderWidth={0}
                    strokeCap="round"
                    showsText={false}
                  />
                  <View style={styles.macroCircleTextContainer}>
                    <ThemedText style={styles.macroCircleValue}>
                      {Math.round(nutritionSummary.fat)}
                    </ThemedText>
                    <ThemedText style={styles.macroCircleUnit}>g</ThemedText>
                  </View>
                  <ThemedText style={styles.macroCircleLabel}>
                    {t(TranslationKeys.food_diary_entry_fat)}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Food Entries Header */}
            <ThemedText type="subtitle" style={styles.entriesHeader}>
              {t(TranslationKeys.food_diary_entries)}
            </ThemedText>

            {entries.length === 0 && (
              <ThemedText style={styles.emptyText}>
                {t(TranslationKeys.food_diary_no_entries)} {getFormattedDate("medium")}
              </ThemedText>
            )}
          </View>
        }
      />

      {/* Add New Entry Button */}
      <View style={styles.buttonContainer}>
        <CButton
          title={t(TranslationKeys.food_diary_add_entry)}
          icon={<MaterialCommunityIcons name="plus" size={20} />}
          onPress={() => router.push("/food-diary-entry-screen")}
          style={styles.addButton}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  datePicker: {
    marginVertical: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for the button
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  calorieCircleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  calorieCircle: {
    marginBottom: 8,
  },
  calorieTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  calorieLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  calorieDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  calorieDetailItem: {
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  calorieDetailLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  calorieDetailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  macroCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  macroCardTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  macroCirclesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  macroCircleItem: {
    alignItems: "center",
  },
  macroCircleTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  macroCircleValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  macroCircleUnit: {
    fontSize: 12,
    marginLeft: 1,
  },
  macroCircleLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  entriesHeader: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
    marginTop: 20,
    marginBottom: 20,
  },
  entryCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  entryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mealIcon: {
    marginRight: 8,
  },
  entryTitle: {
    flex: 1,
  },
  entryTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  entryBrand: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  entryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  entryServingInfo: {
    flex: 1,
  },
  entryServingText: {
    fontSize: 14,
  },
  entryNutrition: {
    alignItems: "flex-end",
  },
  entryCalories: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  entryMacros: {
    flexDirection: "row",
  },
  macroText: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.8,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  addButton: {
    minWidth: 200,
  },
});
