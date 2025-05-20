import React from "react";
import { View, StyleSheet } from "react-native";
import { CartesianChart, Line } from "victory-native";
import { format } from "date-fns";
import { UserWeightDto } from "@/models/interfaces/DashboardResponseDto";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";

interface WeightHistoryChartProps {
  data: UserWeightDto[];
  title: string;
}

const WeightHistoryChart: React.FC<WeightHistoryChartProps> = ({ data, title }) => {
  const primaryColor = useThemeColor({}, "primary");

  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <View style={styles.emptyContainer}>
          <ThemedText>No weight data available</ThemedText>
        </View>
      </View>
    );
  }

  // Format the data for the chart
  const chartData = data.map((item) => ({
    x: format(new Date(item.measured_at), "dd.MM"),
    weight: item.weight_kg,
  }));

  // Sort data by date before formatting for display
  const sortedData = [...data].sort(
    (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
  );

  // Create chart data with sorted dates
  const sortedChartData = sortedData.map((item) => ({
    x: format(new Date(item.measured_at), "dd.MM"),
    weight: item.weight_kg,
  }));

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <View style={styles.chartContainer}>
        <CartesianChart
          data={sortedChartData}
          xKey="x"
          yKeys={["weight"]}
          axisOptions={{
            tickCount: Math.min(5, sortedChartData.length),
          }}
          padding={{ left: 40, bottom: 30, right: 20, top: 20 }}>
          {({ points }) => <Line points={points.weight} color={primaryColor} strokeWidth={2} />}
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

export default WeightHistoryChart;
