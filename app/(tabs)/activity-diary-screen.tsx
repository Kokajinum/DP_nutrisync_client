import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Pressable } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedStatusBar } from "@/components/ThemedStatusBar";
import { ThemedStackScreen } from "@/components/ThemedStackScreen";
import CDatePicker from "@/components/pickers/CDatePicker";
import { useDateStore } from "@/stores/dateStore";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";
import { useRouter } from "expo-router";
import CButton from "@/components/button/CButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import { useThemeColor } from "@/hooks/useThemeColor";
import CActivitySessionCard, { ActivitySession } from "@/components/cards/CActivitySessionCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/context/AuthProvider";
import { useActivityDiaryStore } from "@/stores/activityDiaryStore";
import { useActivityDiaryByDate } from "@/hooks/useActivityDiaryRepository";
import { format } from "date-fns";

export default function ActivityDiaryScreen() {
  const { getFormattedDate, selectedDate } = useDateStore();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);

  // Theme colors
  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const tertiaryColor = useThemeColor({}, "tertiary");
  const surfaceColor = useThemeColor({}, "surface");
  const borderColor = useThemeColor({}, "outline");

  // Activity diary store
  const {
    sessions: diaryEntries,
    loading,
    getSessionsByDate,
    getTotalCaloriesBurnedForDate,
    transformToActivitySession,
    startNewSession,
    loadActiveSession,
  } = useActivityDiaryStore();

  // Use the hook to fetch activity diary data
  // This will first check local SQLite storage, and only if not found, will fetch from the server
  const { data: remoteActivityDiary, isLoading: isRemoteLoading } = useActivityDiaryByDate(
    new Date(selectedDate)
  );

  // Transform ActivityDiary entries to ActivitySession format for UI
  const sessions: ActivitySession[] = diaryEntries.map(transformToActivitySession);

  // Fetch sessions when selected date changes and load active session
  useEffect(() => {
    if (user?.id) {
      getSessionsByDate(user.id, new Date(selectedDate));
      // Load any active (uncompleted) session
      loadActiveSession(user.id);
    }
  }, [user?.id, selectedDate, getSessionsByDate, loadActiveSession]);

  // If there are no local sessions and we have remote data, transform and use it
  useEffect(() => {
    if (sessions.length === 0 && remoteActivityDiary && !loading) {
      console.log("No local sessions found, using remote data:", remoteActivityDiary);

      // Create a session from the remote data
      const remoteSession: ActivitySession = {
        id: remoteActivityDiary.id,
        startTime: remoteActivityDiary.start_at,
        endTime: remoteActivityDiary.end_at,
        caloriesBurned:
          remoteActivityDiary.entries?.reduce((total, entry) => total + (entry.est_kcal || 0), 0) ||
          0,
        exerciseCount: remoteActivityDiary.entries?.length || 0,
        notes: remoteActivityDiary.notes || "",
      };

      // We don't modify the store directly, but we can add the remote session to our UI
      sessions.push(remoteSession);
    }
  }, [sessions.length, remoteActivityDiary, loading]);

  // Calculate total calories burned
  const totalCaloriesBurned = getTotalCaloriesBurnedForDate(new Date(selectedDate));

  // Calorie goal from user profile or default
  const calorieGoal = userProfile?.calorie_goal_value || 600;
  const calorieProgress = Math.min(totalCaloriesBurned / calorieGoal, 1);

  // Handle adding a new session
  const handleAddSession = async () => {
    if (!user?.id) {
      console.warn("User not logged in");
      return;
    }

    const success = await startNewSession(user.id);
    if (success) {
      // Navigate to the session detail screen with the active session
      router.push({
        pathname: "/gym-session-detail-screen",
      });
    }
  };

  // Handle session press
  const handleSessionPress = (session: ActivitySession) => {
    // Navigate to the session detail screen
    router.push({
      pathname: "/gym-session-detail-screen",
      params: { id: session.id },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedStatusBar />
      <ThemedStackScreen
        options={{
          title: t(TranslationKeys.activity_diary_header),
        }}
      />

      <CDatePicker
        dateFormat="long"
        // showDayName={false}
        // compact={true}
        // arrowSize={20}
        style={styles.datePicker}
      />

      <FlatList
        data={sessions}
        renderItem={({ item }) => (
          <CActivitySessionCard session={item} onPress={handleSessionPress} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => user?.id && getSessionsByDate(user.id, new Date(selectedDate))}
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
                    <ThemedText style={styles.calorieValue}>{totalCaloriesBurned}</ThemedText>
                    <ThemedText style={styles.calorieLabel}>kcal</ThemedText>
                  </View>
                </View>

                <View style={styles.calorieDetailsContainer}>
                  <View style={styles.calorieDetailRow}>
                    {/* <View style={styles.calorieDetailItem}>
                      <ThemedText style={styles.calorieDetailLabel}>
                        {t(TranslationKeys.food_diary_goal)}
                      </ThemedText>
                      <ThemedText style={styles.calorieDetailValue}>{calorieGoal}</ThemedText>
                    </View> */}

                    <View style={styles.calorieDetailItem}>
                      <ThemedText style={styles.calorieDetailLabel}>
                        {t(TranslationKeys.activity_diary_calories_burned)}
                      </ThemedText>
                      <ThemedText style={styles.calorieDetailValue}>
                        {totalCaloriesBurned}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Gym Sessions Header */}
            <View style={styles.sessionsHeaderContainer}>
              <ThemedText type="subtitle" style={styles.sessionsHeader}>
                {t(TranslationKeys.activity_diary_sessions)}
              </ThemedText>
              <Pressable style={styles.addButton} onPress={handleAddSession}>
                <MaterialCommunityIcons name="plus" size={24} color={primaryColor} />
              </Pressable>
            </View>

            {sessions.length === 0 && !remoteActivityDiary && (
              <ThemedText style={styles.emptyText}>
                {t(TranslationKeys.activity_diary_no_sessions)} {getFormattedDate("medium")}
              </ThemedText>
            )}
          </View>
        }
      />

      {/* Add New Session Button (fixed at bottom) */}
      <View style={styles.buttonContainer}>
        <CButton
          title={t(TranslationKeys.activity_diary_add_session)}
          icon={<MaterialCommunityIcons name="plus" size={20} />}
          onPress={handleAddSession}
          style={styles.addButtonLarge}
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
    paddingBottom: 80, // Extra padding for the button
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
  sessionsHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sessionsHeader: {
    fontSize: 18,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
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
  addButtonLarge: {
    minWidth: 200,
  },
});
