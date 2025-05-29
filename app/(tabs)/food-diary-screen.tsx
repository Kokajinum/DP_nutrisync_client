import React, { useMemo } from "react";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { View, StyleSheet, FlatList, ActivityIndicator, Alert } from "react-native";
import CDatePicker from "@/components/pickers/CDatePicker";
import { useDateStore } from "@/stores/dateStore";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { useRouter } from "expo-router";
import CButton from "@/components/button/CButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useDailyDiary, useDeleteFoodDiaryEntry } from "@/hooks/useDailyDiaryRepository";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { format } from "date-fns";
import { MealTypeEnum } from "@/models/enums/enums";
import { useAuth } from "@/context/AuthProvider";
import CFoodDiaryEntryCard from "@/components/cards/CFoodDiaryEntryCard";

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
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);
  const dateString = new Date(selectedDate).toISOString().split("T")[0];
  const { data: dailyDiary, isLoading } = useDailyDiary(dateString);
  const deleteMutation = useDeleteFoodDiaryEntry();

  // Theme colors
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "outline");

  // Calculate nutrition summary from diary data
  const nutritionSummary = useMemo(() => {
    if (!dailyDiary) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    return {
      calories: dailyDiary.calories_consumed || 0,
      protein: dailyDiary.protein_consumed_g || 0,
      carbs: dailyDiary.carbs_consumed_g || 0,
      fat: dailyDiary.fat_consumed_g || 0,
    };
  }, [dailyDiary]);

  // Calculate daily calorie goal
  const dailyCalorieGoal = dailyDiary?.calorie_goal || userProfile?.calorie_goal_value || 2000;
  const burnedCalories = dailyDiary?.calories_burned || 0;
  const remainingCalories = dailyCalorieGoal - nutritionSummary.calories + burnedCalories;
  const calorieProgress = Math.min(nutritionSummary.calories / dailyCalorieGoal, 1);

  // Macro goals from diary or approximate percentages
  const proteinGoal = dailyDiary?.protein_goal_g || (dailyCalorieGoal * 0.3) / 4; // 30% of calories from protein, 4 calories per gram
  const carbsGoal = dailyDiary?.carbs_goal_g || (dailyCalorieGoal * 0.45) / 4; // 45% of calories from carbs, 4 calories per gram
  const fatGoal = dailyDiary?.fat_goal_g || (dailyCalorieGoal * 0.25) / 9; // 25% of calories from fat, 9 calories per gram

  // Macro progress
  const proteinProgress = Math.min(nutritionSummary.protein / proteinGoal, 1);
  const carbsProgress = Math.min(nutritionSummary.carbs / carbsGoal, 1);
  const fatProgress = Math.min(nutritionSummary.fat / fatGoal, 1);

  const entries = useMemo(() => {
    const foodEntries = dailyDiary?.food_entries || [];
    return [...foodEntries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [dailyDiary]);

  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      t(TranslationKeys.food_diary_delete_entry_title),
      t(TranslationKeys.food_diary_delete_entry_message),
      [
        {
          text: t(TranslationKeys.cancel),
          style: "cancel",
        },
        {
          text: t(TranslationKeys.delete),
          style: "destructive",
          onPress: () => {
            deleteMutation.mutate({ id, date: dateString });
          },
        },
      ]
    );
  };

  // Format time from ISO string
  const formatTime = (isoString: string | undefined) => {
    if (!isoString) return "--:--";
    return format(new Date(isoString), "HH:mm");
  };

  // Render food diary entry
  const renderFoodDiaryEntry = ({ item }: { item: FoodDiaryEntryResponseDto }) => (
    <CFoodDiaryEntryCard entry={item} onLongPress={handleDeleteEntry} />
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>
            {t(TranslationKeys.loading) || "Loading..."}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderFoodDiaryEntry}
          keyExtractor={(item) => item.id || `entry-${item.food_id}-${item.created_at}`}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              {/* Calorie Summary Card */}
              <View
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: surfaceColor,
                    borderColor,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}>
                <View style={styles.calorieCardContent}>
                  <View style={styles.calorieCircleContainer}>
                    <Progress.Circle
                      size={100}
                      progress={calorieProgress}
                      thickness={8}
                      color={primaryColor}
                      unfilledColor="#F0F0F0"
                      borderWidth={0}
                      strokeCap="round"
                      showsText={false}
                      style={styles.calorieCircle}
                    />
                    <View style={styles.calorieTextContainer}>
                      <ThemedText style={styles.calorieValue}>
                        {nutritionSummary.calories}
                      </ThemedText>
                      <ThemedText style={styles.calorieLabel}>kcal</ThemedText>
                    </View>
                  </View>

                  <View style={styles.calorieDetailsContainer}>
                    <View style={styles.calorieDetailRow}>
                      <View style={styles.calorieDetailItem}>
                        <ThemedText style={styles.calorieDetailLabel}>
                          {t(TranslationKeys.food_diary_goal)}
                        </ThemedText>
                        <ThemedText style={styles.calorieDetailValue}>
                          {dailyCalorieGoal}
                        </ThemedText>
                      </View>

                      <View style={styles.calorieDetailItem}>
                        <ThemedText style={styles.calorieDetailLabel}>
                          {t(TranslationKeys.food_diary_remaining)}
                        </ThemedText>
                        <ThemedText style={[styles.calorieDetailValue]}>
                          {remainingCalories}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.calorieDetailRow}>
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
                    </View>
                  </View>
                </View>
              </View>

              {/* Macronutrients Card */}
              <View
                style={[
                  styles.macroCard,
                  {
                    backgroundColor: surfaceColor,
                    borderColor,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}>
                <ThemedText type="subtitle" style={styles.macroCardTitle}>
                  {t(TranslationKeys.food_diary_macronutrients)}
                </ThemedText>

                <View style={styles.macroCirclesContainer}>
                  {/* Protein */}
                  <View style={styles.macroCircleItem}>
                    <Progress.Circle
                      size={60}
                      progress={proteinProgress}
                      thickness={6}
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
                      size={60}
                      progress={carbsProgress}
                      thickness={6}
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
                      size={60}
                      progress={fatProgress}
                      thickness={6}
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

              {entries.length === 0 && !isLoading && (
                <ThemedText style={styles.emptyText}>
                  {t(TranslationKeys.food_diary_no_entries)} {getFormattedDate("medium")}
                </ThemedText>
              )}
            </View>
          }
        />
      )}

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
    paddingBottom: 80,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  calorieCardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  calorieCircleContainer: {
    marginRight: 16,
  },
  calorieCircle: {
    marginBottom: 0,
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
    fontSize: 22,
    fontWeight: "bold",
  },
  calorieLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  calorieDetailsContainer: {
    flex: 1,
  },
  calorieDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  calorieDetailItem: {
    alignItems: "center",
    width: "48%",
  },
  calorieDetailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  calorieDetailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  macroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  macroCardTitle: {
    marginBottom: 12,
    textAlign: "center",
    fontSize: 16,
  },
  macroCirclesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 4,
  },
  macroCircleItem: {
    alignItems: "center",
  },
  macroCircleTextContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 30,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  macroCircleValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  macroCircleUnit: {
    fontSize: 10,
    marginLeft: 1,
  },
  macroCircleLabel: {
    fontSize: 12,
    marginTop: 6,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    opacity: 0.7,
  },
});
