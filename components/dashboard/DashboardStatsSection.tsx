import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { CSegmentedButton } from "@/components/button/CSegmentedButton";
import WeightHistoryChart from "@/components/charts/WeightHistoryChart";
import StepsHistoryChart from "@/components/charts/StepsHistoryChart";
import {
  UserWeightDto,
  StepMeasurementResponseDto,
} from "@/models/interfaces/DashboardResponseDto";
import { useTranslation } from "react-i18next";
import { TranslationKeys } from "@/translations/translations";

interface DashboardStatsSectionProps {
  weightHistory7Days: UserWeightDto[];
  weightHistory30Days: UserWeightDto[];
  stepsHistory7Days: StepMeasurementResponseDto[];
  stepsHistory30Days: StepMeasurementResponseDto[];
}

type TimeRange = "7d" | "30d";

const DashboardStatsSection: React.FC<DashboardStatsSectionProps> = ({
  weightHistory7Days,
  weightHistory30Days,
  stepsHistory7Days,
  stepsHistory30Days,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const backgroundColor = useThemeColor({}, "surfaceContainerLow");

  const { t } = useTranslation();

  const handleTimeRangeChange = (index: number) => {
    setTimeRange(index === 0 ? "7d" : "30d");
  };

  const weightData = timeRange === "7d" ? weightHistory7Days : weightHistory30Days;
  const stepsData = timeRange === "7d" ? stepsHistory7Days : stepsHistory30Days;

  return (
    <ThemedView style={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText type="title">{t(TranslationKeys.dashboard_statistics)}</ThemedText>
        <View style={styles.timeRangeSelector}>
          <CSegmentedButton
            segments={[t(TranslationKeys.dashboard_days_7), t(TranslationKeys.dashboard_days_30)]}
            currentIndex={timeRange === "7d" ? 0 : 1}
            onChange={handleTimeRangeChange}
          />
        </View>
      </View>

      <View style={styles.chartsContainer}>
        <StepsHistoryChart
          data={stepsData}
          timeRange={timeRange}
          title={`${t(TranslationKeys.dashboard_steps_history)} (${timeRange === "7d" ? t(TranslationKeys.dashboard_last_days, { days: 7 }) : t(TranslationKeys.dashboard_last_days, { days: 30 })})`}
        />

        <WeightHistoryChart
          data={weightData}
          title={`${t(TranslationKeys.dashboard_weight_history)} (${timeRange === "7d" ? t(TranslationKeys.dashboard_last_days, { days: 7 }) : t(TranslationKeys.dashboard_last_days, { days: 30 })})`}
        />
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
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timeRangeSelector: {
    width: 160,
  },
  chartsContainer: {
    marginTop: 8,
  },
});

export default DashboardStatsSection;
