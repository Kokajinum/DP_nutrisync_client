import { ScrollView, type ScrollViewProps, RefreshControl } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedScrollViewProps = ScrollViewProps & {
  lightColor?: string;
  darkColor?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function ThemedScrollView({
  style,
  lightColor,
  darkColor,
  refreshing,
  onRefresh,
  ...otherProps
}: ThemedScrollViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background");

  return (
    <ScrollView
      style={[{ backgroundColor }, style]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing || false}
            onRefresh={onRefresh}
            tintColor={useThemeColor({}, "primary")}
          />
        ) : undefined
      }
      {...otherProps}
    />
  );
}
