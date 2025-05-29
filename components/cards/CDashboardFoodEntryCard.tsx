import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { MealTypeEnum } from "@/models/enums/enums";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

interface CDashboardFoodEntryCardProps {
  entry: FoodDiaryEntryResponseDto;
  onPress?: () => void;
}

const CDashboardFoodEntryCard: React.FC<CDashboardFoodEntryCardProps> = ({ entry, onPress }) => {
  const backgroundColor = useThemeColor({}, "surfaceContainerLow");
  const primaryColor = useThemeColor({}, "primary");

  const { t } = useTranslation();

  // Get meal type icon
  const getMealTypeIcon = (mealType: MealTypeEnum) => {
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
        return "food-apple";
    }
  };

  const formattedDate = entry.created_at
    ? format(new Date(entry.created_at), "dd.MM.yyyy HH:mm")
    : t(TranslationKeys.ai_recommendation_unknown_date);

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <ThemedView style={styles.container} lightColor={backgroundColor} darkColor={backgroundColor}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getMealTypeIcon(entry.meal_type as MealTypeEnum)}
              size={24}
              color={primaryColor}
            />
          </View>
          <View style={styles.titleContainer}>
            <ThemedText type="defaultSemiBold" numberOfLines={1}>
              {entry.food_name}
            </ThemedText>
            <ThemedText type="default" style={styles.mealType}>
              {entry.meal_type}
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.nutritionItem}>
            <ThemedText type="default">{entry.calories} kcal</ThemedText>
          </View>
          <View style={styles.nutritionItem}>
            <ThemedText type="default">P: {entry.protein}g</ThemedText>
          </View>
          <View style={styles.nutritionItem}>
            <ThemedText type="default">C: {entry.carbs}g</ThemedText>
          </View>
          <View style={styles.nutritionItem}>
            <ThemedText type="default">F: {entry.fat}g</ThemedText>
          </View>
        </View>

        <ThemedText type="default" style={styles.date}>
          {formattedDate}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  mealType: {
    fontSize: 14,
    opacity: 0.7,
    textTransform: "capitalize",
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  nutritionItem: {
    marginRight: 12,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
    alignSelf: "flex-end",
  },
});

export default CDashboardFoodEntryCard;
