import { Text, ScrollView, Alert, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useRestManager } from "@/context/RestManagerProvider";
import { fetchUserProfile } from "@/utils/api/apiClient";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

const HomeScreen = () => {
  const { session, user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const restManager = useRestManager();
  const { t } = useTranslation();
  const { setStep } = useOnboardingStore();

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
      // Show dialog before redirecting
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
});

export default HomeScreen;
