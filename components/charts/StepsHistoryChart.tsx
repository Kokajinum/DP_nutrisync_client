import React from "react";
import { View, StyleSheet } from "react-native";
import { CartesianChart, Bar, useChartPressState } from "victory-native";
import { format, isValid } from "date-fns";
import { StepMeasurementResponseDto } from "@/models/interfaces/DashboardResponseDto";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/ThemedText";
import { SharedValue } from "react-native-reanimated";
import { Circle, LinearGradient, useFont, vec } from "@shopify/react-native-skia";
import {
  useFonts,
  Quicksand_300Light,
  Quicksand_400Regular,
  Quicksand_500Medium,
  Quicksand_600SemiBold,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";

interface StepsHistoryChartProps {
  data: StepMeasurementResponseDto[];
  title: string;
  timeRange?: "7d" | "30d";
}

const StepsHistoryChart: React.FC<StepsHistoryChartProps> = ({ data, title, timeRange = "7d" }) => {
  //#region colors
  const primaryColor = useThemeColor({}, "primary");
  //#endregion

  const font = useFont(Quicksand_500Medium, 12);
  const { state, isActive } = useChartPressState({ x: "", y: { steps: 0 } });

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

  // Filter out invalid dates
  const validData = data.filter((item) => isValid(new Date(item.start_time)));

  // Sort data by date before formatting for display
  const sortedData = [...validData].sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  // Create chart data with sorted dates
  const sortedChartData = sortedData.map((item) => {
    const date = new Date(item.start_time);
    return {
      x: format(date, "dd.MM"),
      steps: item.step_count,
    };
  });

  // Debugging logs
  console.log("Raw data length:", data.length);
  console.log("Valid data length:", validData.length);
  console.log("Chart data:", sortedChartData);

  return (
    <View style={styles.container}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <View style={styles.chartContainer}>
        <CartesianChart
          data={sortedChartData}
          xKey="x"
          yKeys={["steps"]}
          domainPadding={{ left: 20, right: 20, top: 30 }}
          axisOptions={{
            font,
            tickCount: Math.min(5, sortedChartData.length),
            formatXLabel: (value) => value || "", // Explicitly handle undefined values
          }}
          chartPressState={state}>
          {({ points, chartBounds }) => (
            <>
              <Bar
                points={points.steps}
                chartBounds={chartBounds}
                roundedCorners={{ topLeft: 5, topRight: 5 }}
                barWidth={timeRange === "7d" ? 25 : 10}>
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, 400)}
                  colors={[primaryColor, "#a78bfa50"]}></LinearGradient>
              </Bar>
              {isActive && <ToolTip x={state.x.position} y={state.y.steps.position}></ToolTip>}
            </>
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
    height: 300,
    marginTop: 10,
  },
  emptyContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
});

const ToolTip = ({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) => {
  return <Circle cx={x} cy={y} r={8} color="black"></Circle>;
};

export default StepsHistoryChart;
