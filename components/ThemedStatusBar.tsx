import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/useColorScheme";

export const ThemedStatusBar = () => {
  const colorScheme = useColorScheme();
  return (
    <StatusBar
      style="auto" //{colorScheme === "dark" ? "light" : "dark"}
      backgroundColor={colorScheme === "dark" ? "black" : "white"}
    />
  );
};
