import { useColorScheme as useNativeColorScheme } from "react-native";
import { useTheme } from "@/context/ThemeContext";
export const useColorScheme = (): "light" | "dark" => {
    const systemColorTheme = useNativeColorScheme();
    const {theme} = useTheme();

    if (theme === "system"){
        return systemColorTheme === "dark" ? "dark" : "light";
    }
    return theme;
}