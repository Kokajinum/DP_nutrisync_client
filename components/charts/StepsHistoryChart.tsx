import React from "react";
import { View, StyleSheet } from "react-native";
import { CartesianChart, Bar } from "victory-native";
import { format } from "date-fns";
import { StepMeasurementResponseDto } from "@/models/interfaces/DashboardResponseDto";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";

interface StepsHistoryChartProps {
  data: StepMeasurementResponseDto[];
  title: string;
}

const StepsHistoryChart: React.FC<StepsHistoryChartProps> = ({ data, title }) => {
  const primaryColor = useThemeColor({}, "primary");

  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <View style={styles.emptyContainer}>
          <ThemedText>No steps data available</ThemedText>
        </View>
      </View>
    );
  }

  // Sort data by date before formatting for display
  const sortedData = [...data].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  // Create chart data with sorted dates
  const sortedChartData = sortedData.map((item) => ({
    x: format(new Date(item.start_time), "dd.MM"),
    steps: item.step_count,
  }));

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <View style={styles.chartContainer}>
        <CartesianChart
          data={sortedChartData}
          xKey="x"
          yKeys={["steps"]}
          axisOptions={{
            tickCount: Math.min(5, sortedChartData.length),
          }}
          padding={{ left: 40, bottom: 30, right: 20, top: 20 }}>
          {({ points, chartBounds }) => (
            <Bar points={points.steps} color={primaryColor} chartBounds={chartBounds} />
          )}
        </CartesianChart>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  chartContainer: {
    height: 200,
    marginTop: 10,
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default StepsHistoryChart;
