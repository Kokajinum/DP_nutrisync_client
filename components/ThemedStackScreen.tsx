import { _600SemiBold } from "@/constants/Global";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ScreenProps, Stack } from "expo-router";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export type ThemedStackScreenProps = ScreenProps & {
  options?: NativeStackNavigationOptions;
};

export const ThemedStackScreen = ({ options, ...rest }: ThemedStackScreenProps) => {
  const colorScheme = useColorScheme();
  const onBackground = useThemeColor({}, "onBackground");

  const defaultOptions = {
    headerTitleAlign: "center" as "center",
    headerTintColor: onBackground,
    headerTitleStyle: { fontFamily: _600SemiBold, fontSize: 20 },
    headerStyle: { backgroundColor: colorScheme === "dark" ? "black" : "white" },
  };

  return <Stack.Screen options={{ ...defaultOptions, ...options }} {...rest}></Stack.Screen>;
};
