import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ActivityDiaryEntryResponseDto } from "@/models/interfaces/ActivityDiary";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
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

interface CDashboardActivityEntryCardProps {
  entry: DashboardActivityEntry;
  onPress?: () => void;
}

const CDashboardActivityEntryCard: React.FC<CDashboardActivityEntryCardProps> = ({
  entry,
  onPress,
}) => {
  const backgroundColor = useThemeColor({}, "surfaceContainerLow");
  const primaryColor = useThemeColor({}, "primary");

  const { t } = useTranslation();

  // Format date
  const formattedDate = entry.created_at
    ? format(new Date(entry.created_at), "dd.MM.yyyy HH:mm")
    : t(TranslationKeys.ai_recommendation_unknown_date);

  // Format duration
  const formatDuration = (durationMinutes: number) => {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
    }
    return `${minutes}m`;
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <ThemedView style={styles.container} lightColor={backgroundColor} darkColor={backgroundColor}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="run" size={24} color={primaryColor} />
          </View>
          <View style={styles.titleContainer}>
            <ThemedText type="defaultSemiBold" numberOfLines={1}>
              {entry.activity_name}
            </ThemedText>
            <ThemedText type="default" style={styles.activityType}>
              {entry.activity_type}
            </ThemedText>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {entry.duration_minutes && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={primaryColor}
                style={styles.detailIcon}
              />
              <ThemedText type="default">{formatDuration(entry.duration_minutes)}</ThemedText>
            </View>
          )}

          {entry.calories_burned && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="fire"
                size={16}
                color={primaryColor}
                style={styles.detailIcon}
              />
              <ThemedText type="default">{entry.calories_burned} kcal</ThemedText>
            </View>
          )}

          {entry.distance_km && (
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={16}
                color={primaryColor}
                style={styles.detailIcon}
              />
              <ThemedText type="default">{entry.distance_km} km</ThemedText>
            </View>
          )}
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
  activityType: {
    fontSize: 14,
    opacity: 0.7,
    textTransform: "capitalize",
  },
  detailsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  detailIcon: {
    marginRight: 4,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
    alignSelf: "flex-end",
  },
});

export default CDashboardActivityEntryCard;
