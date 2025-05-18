import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

// Format time from ISO string
const formatTime = (isoString: string | undefined) => {
  if (!isoString) return "--:--";
  return format(new Date(isoString), "HH:mm");
};

export interface ActivitySession {
  id: string;
  startTime: string;
  endTime?: string; // Added for tracking completion status
  caloriesBurned: number;
  exerciseCount: number;
  notes?: string;
}

interface CActivitySessionCardProps {
  session: ActivitySession;
  onLongPress?: (id: string) => void;
  onPress?: (session: ActivitySession) => void;
}

const CActivitySessionCard: React.FC<CActivitySessionCardProps> = ({
  session,
  onLongPress,
  onPress,
}) => {
  // Theme colors
  const primaryColor = useThemeColor({}, "primary");
  const tertiaryColor = useThemeColor({}, "tertiary");
  const surfaceColor = useThemeColor({}, "surface");
  const { t } = useTranslation();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.sessionCard,
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
      onLongPress={() => onLongPress && onLongPress(session.id)}
      onPress={() => onPress && onPress(session)}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionTitleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: `${primaryColor}20` }]}>
            <MaterialCommunityIcons name="dumbbell" size={16} color={primaryColor} />
          </View>
          <View style={styles.titleContainer}>
            <ThemedText type="subtitle" style={styles.sessionTitle} numberOfLines={1}>
              {t(TranslationKeys.activity_diary_sessions)}
            </ThemedText>
          </View>
        </View>
        <View style={styles.statusContainer}>
          {!session.endTime ? (
            <View style={[styles.statusBadge, { backgroundColor: `${primaryColor}20` }]}>
              <ThemedText style={[styles.statusText, { color: primaryColor }]}>
                {t(TranslationKeys.activity_diary_in_progress)}
              </ThemedText>
            </View>
          ) : (
            <View style={[styles.statusBadge, { backgroundColor: `${tertiaryColor}20` }]}>
              <ThemedText style={[styles.statusText, { color: tertiaryColor }]}>
                {t(TranslationKeys.activity_diary_completed)}
              </ThemedText>
            </View>
          )}
          <ThemedText style={styles.sessionTime}>{formatTime(session.startTime)}</ThemedText>
        </View>
      </View>

      <View style={styles.sessionDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="fire"
              size={16}
              color={primaryColor}
              style={styles.detailIcon}
            />
            <ThemedText style={styles.detailText}>{session.caloriesBurned} kcal</ThemedText>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="weight-lifter"
              size={16}
              color={primaryColor}
              style={styles.detailIcon}
            />
            <ThemedText style={styles.detailText}>
              {session.exerciseCount} {t(TranslationKeys.activity_diary_exercise_count)}
            </ThemedText>
          </View>
        </View>

        {session.notes && (
          <View style={styles.notesContainer}>
            <MaterialCommunityIcons
              name="note-text-outline"
              size={16}
              color={primaryColor}
              style={styles.detailIcon}
            />
            <ThemedText style={styles.notesText} numberOfLines={2}>
              {session.notes}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sessionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  sessionTitle: {
    fontSize: 15,
  },
  sessionTime: {
    fontSize: 13,
    opacity: 0.7,
  },
  sessionDetails: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 4,
  },
  detailText: {
    fontSize: 14,
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#00000010",
  },
  notesText: {
    fontSize: 13,
    flex: 1,
    opacity: 0.8,
  },
});

export default CActivitySessionCard;
