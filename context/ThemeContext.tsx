import { STORAGE_KEY_THEME } from "@/constants/Global";
import { getStorageItem, setStorageItem } from "@/utils/storage";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  //default theme is system
  const [theme, setThemeState] = useState<Theme>("system");

  const persistTheme = useCallback(async (newTheme: Theme) => {
    try {
      await setStorageItem(STORAGE_KEY_THEME, newTheme);
    } catch (error) {
      console.error("Error saving theme to AsyncStorage: ", error);
    }
  }, []);

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await getStorageItem<Theme>(STORAGE_KEY_THEME);
      if (
        savedTheme &&
        (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")
      ) {
        setThemeState(savedTheme as Theme);
      } else {
        setThemeState("system");
      }
    } catch (error) {
      console.error("Error loading theme from AsyncStorage: ", error);
      setThemeState("system");
    }
  }, []);

  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      persistTheme(newTheme);
    },
    [persistTheme]
  );

  const value: ThemeContextProps = {
    theme,
    setTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
