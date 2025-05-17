import React, { useState } from "react";
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

// Dummy data for demonstration
const dummyGymSessions: ActivitySession[] = [
  {
    id: "1",
    startTime: "2025-05-17T14:30:00",
    caloriesBurned: 320,
    exerciseCount: 5,
    notes: "Trénink zaměřený na horní část těla",
  },
  {
    id: "2",
    startTime: "2025-05-16T16:00:00",
    caloriesBurned: 450,
    exerciseCount: 7,
    notes: "Kardio a nohy",
  },
];

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

  // Filter sessions by selected date (in a real app, this would come from API/database)
  const [sessions, setSessions] = useState<ActivitySession[]>(
    dummyGymSessions.filter(
      (session) =>
        new Date(session.startTime).toDateString() === new Date(selectedDate).toDateString()
    )
  );

  // Calculate total calories burned
  const totalCaloriesBurned = sessions.reduce(
    (total, session) => total + session.caloriesBurned,
    0
  );

  // Calorie goal (in a real app, this would come from user profile)
  const calorieGoal = 600;
  const calorieProgress = Math.min(totalCaloriesBurned / calorieGoal, 1);

  // Handle adding a new session
  const handleAddSession = () => {
    // In a real app, this would navigate to a form to create a new session
    console.log("Add new session");

    // For demonstration, add a dummy session
    const newSession: ActivitySession = {
      id: `${Date.now()}`,
      startTime: new Date().toISOString(),
      caloriesBurned: 150,
      exerciseCount: 3,
      notes: "Nový trénink",
    };

    setSessions([...sessions, newSession]);
  };

  // Handle session press
  const handleSessionPress = (session: ActivitySession) => {
    // In a real app, this would navigate to the session detail screen
    console.log("Session pressed:", session.id);
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
        dateFormat="full"
        showDayName={false}
        compact={true}
        arrowSize={20}
        style={styles.datePicker}
      />

      <FlatList
        data={sessions}
        renderItem={({ item }) => (
          <CActivitySessionCard session={item} onPress={handleSessionPress} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
                    <View style={styles.calorieDetailItem}>
                      <ThemedText style={styles.calorieDetailLabel}>
                        {t(TranslationKeys.food_diary_goal)}
                      </ThemedText>
                      <ThemedText style={styles.calorieDetailValue}>{calorieGoal}</ThemedText>
                    </View>

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

            {sessions.length === 0 && (
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
