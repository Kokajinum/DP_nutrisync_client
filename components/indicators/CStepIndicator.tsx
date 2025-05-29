import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GlobalColors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

type Status = "done" | "inProgress" | "notStarted";

interface CStepIndicatorProps {
  status: Status;

  size?: number;

  style?: StyleProp<ViewStyle>;
}

const CStepIndicator: React.FC<CStepIndicatorProps> = ({ status, size = 40, style }) => {
  const primaryColor = useThemeColor({}, "primary");
  const outlineColor = useThemeColor({}, "outline");

  const getBackgroundColor = (st: Status): string => {
    switch (st) {
      case "done":
        return GlobalColors.checkGreen;
      case "inProgress":
        return primaryColor;
      case "notStarted":
      default:
        return outlineColor;
    }
  };

  const renderIcon = (st: Status) => {
    if (st === "done") {
      return <MaterialCommunityIcons name="check" size={size * 0.7} color="#fff" />;
    } else if (st === "inProgress") {
      return <MaterialCommunityIcons name="progress-check" size={size * 0.8} color="#fff" />;
    }
    return null;
  };

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size * 0.2,
          backgroundColor: getBackgroundColor(status),
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}>
      {renderIcon(status)}
    </View>
  );
};

export default CStepIndicator;
