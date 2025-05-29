import React from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { UserProfileData } from "@/models/interfaces/UserProfileData";
import { ThemedView } from "@/components/ThemedView";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { HeightUnitEnum, WeightUnitEnum } from "@/models/enums/enums";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

interface CUserProfileCardProps {
  userProfile: UserProfileData | null;
  isLoading?: boolean;
}

const CUserProfileCard: React.FC<CUserProfileCardProps> = ({ userProfile, isLoading = false }) => {
  const backgroundColor = useThemeColor({}, "surfaceContainerHigh");
  const primaryColor = useThemeColor({}, "primary");

  const { t } = useTranslation();

  if (isLoading) {
    return (
      <ThemedView style={styles.container} lightColor={backgroundColor} darkColor={backgroundColor}>
        <ThemedText type="subtitle">{t(TranslationKeys.profile_loading)}</ThemedText>
      </ThemedView>
    );
  }

  if (!userProfile) {
    return (
      <ThemedView style={styles.container} lightColor={backgroundColor} darkColor={backgroundColor}>
        <ThemedText type="subtitle">{t(TranslationKeys.profile_not_available)}</ThemedText>
      </ThemedView>
    );
  }

  // Get weight in kg for calculations
  const weightInKg =
    userProfile.weight_value && userProfile.weight_unit
      ? userProfile.weight_unit === WeightUnitEnum.LBS
        ? userProfile.weight_value * 0.453592
        : userProfile.weight_value
      : null;

  // Get height in cm for calculations
  const heightInCm =
    userProfile.height_value && userProfile.height_unit
      ? userProfile.height_unit === HeightUnitEnum.INCH
        ? userProfile.height_value * 2.54
        : userProfile.height_value
      : null;

  // Calculate BMI if weight and height are available
  const bmi =
    weightInKg && heightInCm ? (weightInKg / Math.pow(heightInCm / 100, 2)).toFixed(1) : null;

  // Determine BMI category
  let bmiCategory = "";
  if (bmi) {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) bmiCategory = t(TranslationKeys.bmi_underweight);
    else if (bmiValue < 25) bmiCategory = t(TranslationKeys.bmi_normal);
    else if (bmiValue < 30) bmiCategory = t(TranslationKeys.bmi_overweight);
    else bmiCategory = t(TranslationKeys.bmi_obese);
  }

  // Format name from first and last name
  const fullName = [userProfile.first_name, userProfile.last_name].filter(Boolean).join(" ");

  return (
    <ThemedView style={styles.container} lightColor={backgroundColor} darkColor={backgroundColor}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={50} color={primaryColor} />
        </View>
        <View style={styles.nameContainer}>
          <ThemedText type="title">{fullName || t(TranslationKeys.profile_user)}</ThemedText>
          <ThemedText type="default">{userProfile.email}</ThemedText>
        </View>
      </View>

      <View style={styles.statsContainer}>
        {userProfile.weight_value && (
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{t(TranslationKeys.profile_weight)}</ThemedText>
            <ThemedText type="default">
              {userProfile.weight_value} {userProfile.weight_unit || "kg"}
            </ThemedText>
          </View>
        )}

        {userProfile.height_value && (
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{t(TranslationKeys.profile_height)}</ThemedText>
            <ThemedText type="default">
              {userProfile.height_value} {userProfile.height_unit || "cm"}
            </ThemedText>
          </View>
        )}

        {bmi && (
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{t(TranslationKeys.profile_bmi)}</ThemedText>
            <ThemedText type="default">
              {bmi} ({bmiCategory})
            </ThemedText>
          </View>
        )}

        {userProfile.age && (
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold">{t(TranslationKeys.profile_age)}</ThemedText>
            <ThemedText type="default">
              {userProfile.age} {t(TranslationKeys.profile_years)}
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  statItem: {
    width: "50%",
    marginBottom: 8,
  },
});

export default CUserProfileCard;
