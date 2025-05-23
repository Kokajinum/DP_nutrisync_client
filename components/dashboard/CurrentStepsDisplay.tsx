import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

interface CurrentStepsDisplayProps {
  steps: number | null;
  loading: boolean;
  error: Error | null;
}

const CurrentStepsDisplay: React.FC<CurrentStepsDisplayProps> = ({ steps, loading, error }) => {
  const backgroundColor = useThemeColor({}, "surfaceContainerLow");
  const primaryColor = useThemeColor({}, "primary");
  const { t } = useTranslation();

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="shoe-print" size={32} color={primaryColor} />
      </View>
      <View style={styles.textContainer}>
        <ThemedText type="title">{t(TranslationKeys.dashboard_steps_history)}</ThemedText>
        {loading ? (
          <ThemedText style={styles.stepsText}>{t(TranslationKeys.loading)}</ThemedText>
        ) : error ? (
          <ThemedText style={styles.errorText}>{t(TranslationKeys.error)}</ThemedText>
        ) : (
          <ThemedText style={styles.stepsText}>{steps || 0}</ThemedText>
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
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  stepsText: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 4,
  },
  errorText: {
    color: "red",
    marginTop: 4,
  },
});

export default CurrentStepsDisplay;
