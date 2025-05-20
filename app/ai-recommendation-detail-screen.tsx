import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useRestManager } from "@/context/RestManagerProvider";
import { useAuth } from "@/context/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { AiRecommendationResponseDto } from "@/models/interfaces/DashboardResponseDto";
import { UpdateAiRecommendationViewedDto } from "@/models/interfaces/UpdateAiRecommendationViewedDto";

const AiRecommendationDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { session, user } = useAuth();
  const restManager = useRestManager();
  const queryClient = useQueryClient();
  const primaryColor = useThemeColor({}, "primary");
  const backgroundColor = useThemeColor({}, "surfaceContainerHigh");

  const [recommendation, setRecommendation] = useState<AiRecommendationResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the recommendation in the dashboard data cache
  useEffect(() => {
    if (!id) {
      setError("No recommendation ID provided");
      setLoading(false);
      return;
    }

    const dashboardData = queryClient.getQueryData<any>(["dashboard"]);
    if (dashboardData && dashboardData.ai_recommendations) {
      const foundRecommendation = dashboardData.ai_recommendations.find(
        (rec: AiRecommendationResponseDto) => rec.id === id
      );

      if (foundRecommendation) {
        setRecommendation(foundRecommendation);
      }
    }

    // Mark recommendation as viewed
    const markAsViewed = async () => {
      try {
        if (!session?.access_token || !user?.id) {
          console.error("No access token or user ID available");
          return;
        }

        const updateDto: UpdateAiRecommendationViewedDto = {
          id: id,
        };
        const response = await restManager.post("/ai-recommendations/viewed", updateDto);

        if (response.status === 200) {
          // Update the cache to mark this recommendation as viewed
          queryClient.setQueryData(["dashboard"], (oldData: any) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              ai_recommendations: oldData.ai_recommendations.map(
                (rec: AiRecommendationResponseDto) =>
                  rec.id === id ? { ...rec, viewed: true } : rec
              ),
            };
          });
        }
      } catch (err) {
        console.error("Error marking recommendation as viewed:", err);
      } finally {
        setLoading(false);
      }
    };

    markAsViewed();
  }, [id, queryClient, restManager, session, user]);

  // Format date
  const formattedDate = recommendation?.created_at
    ? format(new Date(recommendation.created_at), "dd.MM.yyyy")
    : t(TranslationKeys.ai_recommendation_unknown_date);

  // Render loading state
  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>{t(TranslationKeys.loading)}</ThemedText>
      </ThemedView>
    );
  }

  // Render error state
  if (error || !recommendation) {
    return (
      <ThemedView style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={48} color="red" />
        <ThemedText style={styles.errorText}>
          {error || t(TranslationKeys.ai_recommendation_no_available)}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedStatusBar />
      <ThemedStackScreen options={{ title: t(TranslationKeys.ai_recommendation_title) }} />

      <ThemedView style={styles.card} lightColor={backgroundColor} darkColor={backgroundColor}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="lightbulb-outline" size={24} color={primaryColor} />
          <ThemedText type="defaultSemiBold" style={styles.date}>
            {formattedDate}
          </ThemedText>
        </View>

        <View style={styles.contentContainer}>
          <ThemedText style={styles.content}>{recommendation.response}</ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  contentContainer: {
    marginBottom: 16,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default AiRecommendationDetailScreen;
