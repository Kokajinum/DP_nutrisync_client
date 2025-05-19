import React from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { ActivityDiaryEntryResponseDto } from "@/models/interfaces/ActivityDiary";
import CDashboardFoodEntryCard from "@/components/cards/CDashboardFoodEntryCard";
import CDashboardActivityEntryCard from "@/components/cards/CDashboardActivityEntryCard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

// Extended interface for dashboard display
interface DashboardActivityEntry extends ActivityDiaryEntryResponseDto {
  activity_name?: string;
  activity_type?: string;
  duration_minutes?: number;
  calories_burned?: number;
  distance_km?: number;
}

interface DashboardRecentEntriesSectionProps {
  recentFoodEntries: FoodDiaryEntryResponseDto[];
  recentActivityEntries: DashboardActivityEntry[];
  onFoodEntryPress?: (entry: FoodDiaryEntryResponseDto) => void;
  onActivityEntryPress?: (entry: DashboardActivityEntry) => void;
  onViewAllFoodPress?: () => void;
  onViewAllActivityPress?: () => void;
}

const DashboardRecentEntriesSection: React.FC<DashboardRecentEntriesSectionProps> = ({
  recentFoodEntries,
  recentActivityEntries,
  onFoodEntryPress,
  onActivityEntryPress,
  onViewAllFoodPress,
  onViewAllActivityPress,
}) => {
  const backgroundColor = useThemeColor({}, "surfaceContainerLow");
  const primaryColor = useThemeColor({}, "primary");
  const { t } = useTranslation();

  const renderFoodEntry = ({ item }: { item: FoodDiaryEntryResponseDto }) => (
    <CDashboardFoodEntryCard entry={item} onPress={() => onFoodEntryPress?.(item)} />
  );

  const renderActivityEntry = ({ item }: { item: DashboardActivityEntry }) => (
    <CDashboardActivityEntryCard entry={item} onPress={() => onActivityEntryPress?.(item)} />
  );

  return (
    <View style={styles.container}>
      {/* Food Entries Section */}
      <ThemedView
        style={styles.sectionContainer}
        lightColor={backgroundColor}
        darkColor={backgroundColor}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons
              name="food-apple"
              size={24}
              color={primaryColor}
              style={styles.titleIcon}
            />
            <ThemedText type="title">{t(TranslationKeys.dashboard_recent_food)}</ThemedText>
          </View>
          {onViewAllFoodPress && (
            <TouchableOpacity onPress={onViewAllFoodPress}>
              <ThemedText type="defaultSemiBold" style={styles.viewAllText}>
                {t(TranslationKeys.dashboard_view_all)}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {recentFoodEntries.length > 0 ? (
          <FlatList
            data={recentFoodEntries.slice(0, 3)} // Show only the first 3 entries
            renderItem={renderFoodEntry}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText>{t(TranslationKeys.dashboard_no_recent_food)}</ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Activity Entries Section */}
      <ThemedView
        style={styles.sectionContainer}
        lightColor={backgroundColor}
        darkColor={backgroundColor}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleContainer}>
            <MaterialCommunityIcons
              name="run"
              size={24}
              color={primaryColor}
              style={styles.titleIcon}
            />
            <ThemedText type="title">{t(TranslationKeys.dashboard_recent_activity)}</ThemedText>
          </View>
          {onViewAllActivityPress && (
            <TouchableOpacity onPress={onViewAllActivityPress}>
              <ThemedText type="defaultSemiBold" style={styles.viewAllText}>
                {t(TranslationKeys.dashboard_view_all)}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {recentActivityEntries.length > 0 ? (
          <FlatList
            data={recentActivityEntries.slice(0, 3)} // Show only the first 3 entries
            renderItem={renderActivityEntry}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText>{t(TranslationKeys.dashboard_recent_activity)}</ThemedText>
          </View>
        )}
      </ThemedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionContainer: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  titleIcon: {
    marginRight: 8,
  },
  viewAllText: {
    color: "#0a7ea4",
  },
  emptyContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DashboardRecentEntriesSection;
