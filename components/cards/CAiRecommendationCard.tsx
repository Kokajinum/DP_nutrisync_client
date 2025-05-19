import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AiRecommendationResponseDto } from "@/models/interfaces/DashboardResponseDto";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

interface CAiRecommendationCardProps {
  recommendation: AiRecommendationResponseDto;
  onPress?: () => void;
}

const CAiRecommendationCard: React.FC<CAiRecommendationCardProps> = ({
  recommendation,
  onPress,
}) => {
  const backgroundColor = useThemeColor({}, "surfaceContainerHigh");
  const primaryColor = useThemeColor({}, "primary");
  const accentColor = useThemeColor({}, "tertiary");

  const { t } = useTranslation();

  // Format date
  const formattedDate = recommendation.created_at
    ? format(new Date(recommendation.created_at), "dd.MM.yyyy")
    : t(TranslationKeys.ai_recommendation_unknown_date);

  // Get a preview of the recommendation text
  const getPreviewText = (text: string, maxLength = 100) => {
    if (!text) return t(TranslationKeys.ai_recommendation_no_available);
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <ThemedView
        style={[styles.container, !recommendation.viewed && styles.unviewedContainer]}
        lightColor={backgroundColor}
        darkColor={backgroundColor}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={recommendation.viewed ? "lightbulb-outline" : "lightbulb-on"}
              size={24}
              color={recommendation.viewed ? primaryColor : accentColor}
            />
          </View>
          <View style={styles.titleContainer}>
            <ThemedText type="defaultSemiBold">
              {t(TranslationKeys.ai_recommendation_title)}
            </ThemedText>
            <ThemedText type="default" style={styles.date}>
              {formattedDate}
            </ThemedText>
          </View>
          {!recommendation.viewed && (
            <View style={styles.badge}>
              <ThemedText style={styles.badgeText}>
                {t(TranslationKeys.ai_recommendation_new)}
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.contentContainer}>
          <ThemedText type="default" numberOfLines={3}>
            {getPreviewText(recommendation.response)}
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <ThemedText type="default" style={styles.tapToView}>
            {t(TranslationKeys.ai_recommendation_tap_to_view)}
          </ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  unviewedContainer: {
    borderLeftWidth: 4,
    borderLeftColor: "#6200ee", // Accent color
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  badge: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  contentContainer: {
    marginBottom: 12,
  },
  footer: {
    alignItems: "flex-end",
  },
  tapToView: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
  },
});

export default CAiRecommendationCard;
