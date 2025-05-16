import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { FoodData } from "@/models/interfaces/FoodData";
import { useThemeColor } from "@/hooks/useThemeColor";

interface CFoodSearchResultCardProps {
  item: FoodData;
  onPress: (food: FoodData) => void;
}

const CFoodSearchResultCard: React.FC<CFoodSearchResultCardProps> = ({ item, onPress }) => {
  // Theme colors
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "outline");
  const primaryColor = useThemeColor({}, "primary");

  return (
    <Pressable
      style={({ pressed }) => [
        styles.foodItem,
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
      onPress={() => onPress(item)}>
      <View style={styles.foodItemContent}>
        <ThemedText type="subtitle" style={styles.foodName} numberOfLines={1}>
          {item.name}
        </ThemedText>

        <View style={styles.foodInfoContainer}>
          <ThemedText style={styles.foodCalories}>
            {item.calories} kcal
            <Text style={styles.perServingText}>
              {" "}
              / {item.servingSizeValue}
              {item.servingSizeUnit}
            </Text>
          </ThemedText>

          {item.brand && (
            <>
              <View style={styles.separator} />
              <ThemedText style={styles.foodBrand} numberOfLines={1}>
                {item.brand}
              </ThemedText>
            </>
          )}
        </View>

        <View style={styles.macroContainer}>
          <View style={styles.macroItem}>
            <ThemedText style={styles.macroLabel}>P</ThemedText>
            <ThemedText style={styles.macroValue}>{item.protein}g</ThemedText>
          </View>
          <View style={styles.macroItem}>
            <ThemedText style={styles.macroLabel}>C</ThemedText>
            <ThemedText style={styles.macroValue}>{item.carbs}g</ThemedText>
          </View>
          <View style={styles.macroItem}>
            <ThemedText style={styles.macroLabel}>F</ThemedText>
            <ThemedText style={styles.macroValue}>{item.fats}g</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  foodItem: {
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  foodItemContent: {
    padding: 12,
  },
  foodName: {
    fontSize: 15,
    marginBottom: 4,
  },
  foodInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  foodBrand: {
    fontSize: 12,
    opacity: 0.7,
    flex: 1,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: "500",
  },
  perServingText: {
    fontSize: 12,
    opacity: 0.7,
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#000",
    opacity: 0.5,
    marginHorizontal: 8,
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

export default CFoodSearchResultCard;
