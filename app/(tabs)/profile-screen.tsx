import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/translations/i18n";
import { useState, useEffect } from "react";
import { getLocales } from "expo-localization";
import { STORAGE_KEY_LANGUAGE, STORAGE_KEY_LANGUAGE_EXPLICITLY_SELECTED } from "@/constants/Global";
import { getStorageItem } from "@/utils/storage";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isSystemLanguage, setIsSystemLanguage] = useState(true);

  // Get the device language
  const deviceLanguage = getLocales()[0].languageCode || "en";

  useEffect(() => {
    // Check if the language was explicitly selected
    const checkLanguageSelection = async () => {
      const isExplicitlySelected = await getStorageItem<boolean>(
        STORAGE_KEY_LANGUAGE_EXPLICITLY_SELECTED
      );
      setIsSystemLanguage(!isExplicitlySelected);
    };

    checkLanguageSelection();
  }, []);

  // Handle language change
  const handleLanguageChange = async (lang: string) => {
    await changeLanguage(lang);
    setCurrentLanguage(lang);
    setIsSystemLanguage(false);
  };

  // Reset to system language
  const useSystemLanguage = async () => {
    if (deviceLanguage) {
      await changeLanguage(deviceLanguage);
      setCurrentLanguage(deviceLanguage);
      setIsSystemLanguage(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language Settings</Text>

        <View style={styles.languageInfo}>
          <Text>Current language: {currentLanguage}</Text>
          {isSystemLanguage && (
            <Text style={styles.systemLanguageNote}>Using system language ({deviceLanguage})</Text>
          )}
        </View>

        <View style={styles.languageButtons}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              currentLanguage === "en" && !isSystemLanguage && styles.activeLanguage,
            ]}
            onPress={() => handleLanguageChange("en")}>
            <Text style={styles.buttonText}>English</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageButton,
              currentLanguage === "cs" && !isSystemLanguage && styles.activeLanguage,
            ]}
            onPress={() => handleLanguageChange("cs")}>
            <Text style={styles.buttonText}>Čeština</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.languageButton, isSystemLanguage && styles.activeLanguage]}
            onPress={useSystemLanguage}>
            <Text style={styles.buttonText}>Use System Language</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  languageInfo: {
    marginBottom: 16,
  },
  systemLanguageNote: {
    fontStyle: "italic",
    marginTop: 4,
    color: "#666",
  },
  languageButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  activeLanguage: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    fontWeight: "500",
  },
});
