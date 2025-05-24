import { Alert, StyleSheet, View, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useNotifications } from "@/hooks/useNotifications";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedScrollView } from "@/components/ThemedScrollView";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { useDashboard } from "@/hooks/useDashboard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DashboardStatsSection from "@/components/dashboard/DashboardStatsSection";
import DashboardRecentEntriesSection from "@/components/dashboard/DashboardRecentEntriesSection";
import CAiRecommendationCard from "@/components/cards/CAiRecommendationCard";
import CUserProfileCard from "@/components/cards/CUserProfileCard";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import { Circle } from "@shopify/react-native-skia";
import { SharedValue } from "react-native-reanimated";
import { useStepsMeasurement } from "@/hooks/useStepsMeasurement";
import CurrentStepsDisplay from "@/components/dashboard/CurrentStepsDisplay";

const HomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { setStep } = useOnboardingStore();
  const { registerForPushNotifications } = useNotifications();

  const primaryColor = useThemeColor({}, "primary");
  const backgroundColor = useThemeColor({}, "surfaceContainerLow");

  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profile data using the hook
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useUserProfile(user?.id);

  // Fetch dashboard data using the hook
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch,
  } = useDashboard();

  const createRedirectDialog = () =>
    Alert.alert(t(TranslationKeys.account_setup), t(TranslationKeys.profile_incomplete), [
      {
        text: t(TranslationKeys.understand),
        onPress: () => {
          // Reset onboarding step and redirect
          setStep(1);
          router.push("/onboarding");
        },
      },
    ]);

  // Use the steps measurement hook
  const { steps, loading: stepsLoading, error: stepsError } = useStepsMeasurement();

  useEffect(() => {
    // Check if profile data exists and if onboarding is completed
    if (!profileLoading && (profileData == null || !profileData.onboarding_completed)) {
      createRedirectDialog();
    }
  }, [profileData, profileLoading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    // Also register for push notifications when refreshing
    await registerForPushNotifications();
    setRefreshing(false);
  }, [refetch, registerForPushNotifications]);

  // Register for push notifications when the component mounts
  useEffect(() => {
    registerForPushNotifications();
  }, [registerForPushNotifications]);

  // Handle navigation to AI recommendations detail screen
  const handleAiRecommendationPress = (recommendationId: string) => {
    router.push(`/ai-recommendation-detail-screen?id=${recommendationId}`);
  };

  // Handle navigation to food diary entry screen
  const handleFoodEntryPress = (entryId: string) => {
    //router.push(`/food-details-screen?id=${entryId}`);
  };

  // Handle navigation to activity diary entry screen
  const handleActivityEntryPress = (entryId: string) => {
    //router.push(`/gym-session-detail-screen?id=${entryId}`);
  };

  // Handle navigation to food diary screen
  const handleViewAllFoodPress = () => {
    router.push("/(tabs)/food-diary-screen");
  };

  // Handle navigation to activity diary screen
  const handleViewAllActivityPress = () => {
    router.push("/(tabs)/activity-diary-screen");
  };

  // Check if there are any unviewed AI recommendations
  const hasUnviewedRecommendations = dashboardData?.ai_recommendations.some((rec) => !rec.viewed);

  // Render loading state
  if (profileLoading || dashboardLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedStatusBar></ThemedStatusBar>
        <ThemedStackScreen
          options={{ title: t(TranslationKeys.home_screen_title) }}></ThemedStackScreen>
        <ActivityIndicator size="large" color={primaryColor} />
        <ThemedText style={styles.loadingText}>{t(TranslationKeys.loading)}</ThemedText>
      </ThemedView>
    );
  }

  // Render error state
  if (profileError || dashboardError) {
    return (
      <ThemedScrollView style={styles.container} refreshing={refreshing} onRefresh={onRefresh}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="red" />
          <ThemedText style={styles.errorText}>{t(TranslationKeys.error)}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <ThemedText style={styles.retryButtonText}>
              {t(TranslationKeys.home_screen_retry)}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedScrollView>
    );
  }

  return (
    <ThemedScrollView style={styles.container} refreshing={refreshing} onRefresh={onRefresh}>
      <ThemedStatusBar></ThemedStatusBar>
      <ThemedStackScreen
        options={{ title: t(TranslationKeys.home_screen_title) }}></ThemedStackScreen>
      {/* User Profile Card */}
      {profileData && (
        <View style={styles.profileCardContainer}>
          <CUserProfileCard userProfile={profileData} />
        </View>
      )}

      {/* AI Recommendations Notification */}
      {hasUnviewedRecommendations &&
        dashboardData &&
        dashboardData.ai_recommendations &&
        dashboardData.ai_recommendations.length > 0 && (
          <CAiRecommendationCard
            recommendation={
              dashboardData.ai_recommendations.find((rec) => !rec.viewed) ||
              dashboardData.ai_recommendations[0]
            }
            onPress={() => handleAiRecommendationPress(dashboardData.ai_recommendations[0].id)}
          />
        )}

      {/* Current Steps Display */}
      <CurrentStepsDisplay steps={steps} loading={stepsLoading} error={stepsError} />

      {/* Recent Entries Section */}
      {dashboardData && (
        <DashboardRecentEntriesSection
          recentFoodEntries={[...dashboardData.recent_food_entries].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )}
          recentActivityEntries={dashboardData.recent_activity_entries.map((entry) => ({
            ...entry,
            activity_name: "Exercise Session",
            activity_type: "Workout",
            duration_minutes: 45,
            calories_burned: entry.est_kcal,
          }))}
          onFoodEntryPress={(entry) => handleFoodEntryPress(entry.id)}
          onActivityEntryPress={(entry) => handleActivityEntryPress(entry.id)}
          onViewAllFoodPress={handleViewAllFoodPress}
          onViewAllActivityPress={handleViewAllActivityPress}
        />
      )}

      {/* Statistics Section */}
      {dashboardData && (
        <DashboardStatsSection
          weightHistory7Days={dashboardData.weight_history_7days}
          weightHistory30Days={dashboardData.weight_history_30days}
          stepsHistory7Days={dashboardData.steps_history_7days}
          stepsHistory30Days={dashboardData.steps_history_30days}
        />
      )}
    </ThemedScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileCardContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    position: "relative",
  },
  profileEditButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#0a7ea4",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  profileEditButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
    marginTop: 50,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0a7ea4",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  stepsStatContainer: {
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
});

export default HomeScreen;

const ToolTip = ({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) => {
  return <Circle cx={x} cy={y} r={8} color="black"></Circle>;
};
