import { Text, ScrollView, Alert, StyleSheet, View, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRestManager } from "@/context/RestManagerProvider";
import { fetchUserProfile } from "@/utils/api/apiClient";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useDateStore } from "@/stores/dateStore";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

const HomeScreen = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { setStep } = useOnboardingStore();
  const { getDayName, getMonthName, getFormattedDate, goToNextDay, goToPreviousDay, resetToToday } =
    useDateStore();

  // Fetch user profile data using the hook
  const { data: profileData, isLoading, error } = useUserProfile(user?.id);

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

  useEffect(() => {
    // Check if profile data exists and if onboarding is completed
    if (!isLoading && (profileData == null || !profileData.onboarding_completed)) {
      createRedirectDialog();
    }
  }, [profileData, isLoading]);

  // Render loading state
  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <Text>{t(TranslationKeys.loading)}</Text>
      </ScrollView>
    );
  }

  // Render error state
  if (error) {
    return (
      <ScrollView style={styles.container}>
        <Text>{t(TranslationKeys.error)}</Text>
      </ScrollView>
    );
  }

  // Get date information from the date store

  return (
    <ScrollView style={styles.container}>
      {profileData ? (
        <View style={styles.profileSection}>
          <ThemedText type="title">
            {t(TranslationKeys.welcome)}, {profileData.first_name} {profileData.last_name}
          </ThemedText>
          {/* Additional profile information can be added here */}
        </View>
      ) : (
        <Text>{t(TranslationKeys.no_profile_data)}</Text>
      )}

      <View style={styles.dateSection}>
        <ThemedText type="subtitle">Today's Summary</ThemedText>

        <View style={styles.dateInfo}>
          <ThemedText type="defaultSemiBold">{getDayName()}</ThemedText>
          <ThemedText>{getFormattedDate("long")}</ThemedText>
        </View>

        <View style={styles.dateNavigation}>
          <TouchableOpacity style={styles.dateButton} onPress={goToPreviousDay}>
            <ThemedText>Previous Day</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton} onPress={resetToToday}>
            <ThemedText>Today</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dateButton} onPress={goToNextDay}>
            <ThemedText>Next Day</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  profileSection: {
    marginVertical: 20,
  },
  dateSection: {
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#fdfcf5",
  },
  dateInfo: {
    marginVertical: 8,
    alignItems: "center",
  },
  dateNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  dateButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
  },
});

export default HomeScreen;
