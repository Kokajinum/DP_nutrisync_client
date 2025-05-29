import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { MealTypeEnum } from "@/models/enums/enums";
import { format } from "date-fns";
import { useThemeColor } from "@/hooks/useThemeColor";

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

// Format time from ISO string
const formatTime = (isoString: string | undefined) => {
  if (!isoString) return "--:--";
  return format(new Date(isoString), "HH:mm");
};

interface CFoodDiaryEntryCardProps {
  entry: FoodDiaryEntryResponseDto;
  onLongPress?: (id: string) => void;
  onPress?: (entry: FoodDiaryEntryResponseDto) => void;
}

const CFoodDiaryEntryCard: React.FC<CFoodDiaryEntryCardProps> = ({
  entry,
  onLongPress,
  onPress,
}) => {
  // Theme colors
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");

  return (
    <Pressable
      style={({ pressed }) => [
        styles.entryCard,
        {
          backgroundColor: surfaceColor,
          borderLeftColor: primaryColor,
          borderLeftWidth: 4,
          borderColor: "transparent",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        },
        pressed && { opacity: 0.7 },
      ]}
      onLongPress={() => onLongPress && onLongPress(entry.id)}
      onPress={() => onPress && onPress(entry)}>
      <View style={styles.entryHeader}>
        <View style={styles.entryTitleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}20` }]}>
            <MaterialCommunityIcons
              name={getMealTypeIcon(entry.meal_type)}
              size={16}
              color={primaryColor}
            />
          </View>
          <View style={styles.titleAndBrandContainer}>
            <ThemedText type="subtitle" style={styles.entryTitle} numberOfLines={1}>
              {entry.food_name}
            </ThemedText>
            {entry.brand && (
              <ThemedText style={styles.entryBrand} numberOfLines={1}>
                {entry.brand}
              </ThemedText>
            )}
          </View>
        </View>
        <ThemedText style={styles.entryTime}>{formatTime(entry.created_at)}</ThemedText>
      </View>

      <View style={styles.entryDetails}>
        <ThemedText style={styles.entryServingText}>
          {entry.serving_size}
          {entry.serving_unit}
        </ThemedText>

        <View style={styles.entryNutrition}>
          <ThemedText style={styles.entryCalories}>{entry.calories} kcal</ThemedText>
        </View>
      </View>

      <View style={styles.macroContainer}>
        <View style={styles.macroItem}>
          <ThemedText style={styles.macroLabel}>P</ThemedText>
          <ThemedText style={styles.macroValue}>{entry.protein}g</ThemedText>
        </View>
        <View style={styles.macroItem}>
          <ThemedText style={styles.macroLabel}>C</ThemedText>
          <ThemedText style={styles.macroValue}>{entry.carbs}g</ThemedText>
        </View>
        <View style={styles.macroItem}>
          <ThemedText style={styles.macroLabel}>F</ThemedText>
          <ThemedText style={styles.macroValue}>{entry.fat}g</ThemedText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  entryCard: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    overflow: "hidden",
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  titleAndBrandContainer: {
    flex: 1,
    justifyContent: "center",
  },
  entryTitle: {
    fontSize: 15,
    flex: 1,
  },
  entryTime: {
    fontSize: 13,
    opacity: 0.7,
  },
  entryBrand: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: -2,
  },
  entryDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 6,
  },
  entryServingText: {
    fontSize: 13,
    opacity: 0.8,
  },
  entryNutrition: {
    alignItems: "flex-end",
  },
  entryCalories: {
    fontSize: 15,
    fontWeight: "500",
  },
  macroContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#00000010",
    paddingTop: 6,
    marginTop: 2,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: "bold",
    opacity: 0.6,
    marginRight: 3,
  },
  macroValue: {
    fontSize: 13,
  },
});

export default CFoodDiaryEntryCard;
