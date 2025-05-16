import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type CDividerProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  height?: number;
  marginVertical?: number;
};

export default function CDivider({
  style,
  lightColor,
  darkColor,
  height = 1,
  marginVertical = 16,
  ...otherProps
}: CDividerProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "outlineVariant");

  return (
    <View
      style={[
        {
          height,
          backgroundColor,
          marginVertical,
        },
        style,
      ]}
      {...otherProps}
    />
  );
}
