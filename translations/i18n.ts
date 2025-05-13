import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { en } from "./en";
import { cs } from "./cs";
import { LanguageDetectorAsyncModule } from "i18next";
import { STORAGE_KEY_LANGUAGE, STORAGE_KEY_LANGUAGE_EXPLICITLY_SELECTED } from "@/constants/Global";
import { getStorageItem, setStorageItem } from "@/utils/storage";

//"Guaranteed to contain at least 1 element." according to docs
const getDeviceLanguage = () => getLocales()[0].languageCode;

const languageDetectorPlugin: LanguageDetectorAsyncModule = {
  type: "languageDetector",
  async: true,
  init: () => {},
  detect: function (callback: (lang: string | readonly string[] | undefined) => void | undefined) {
    Promise.all([
      getStorageItem<string>(STORAGE_KEY_LANGUAGE),
      getStorageItem<boolean>(STORAGE_KEY_LANGUAGE_EXPLICITLY_SELECTED),
    ])
      .then(([language, isExplicitlySelected]) => {
        if (language && isExplicitlySelected) {
          // If language was explicitly selected by the user, use that language
          callback(language);
        } else {
          // Otherwise, always use the current device language or fallback to English
          const deviceLang = getDeviceLanguage();
          callback(deviceLang || "en");

          // Store the device language for reference, but don't mark it as explicitly selected
          if (deviceLang) {
            setStorageItem(STORAGE_KEY_LANGUAGE, deviceLang);
          }
        }
      })
      .catch((error) => {
        console.log("Error reading language settings", error);
        callback("en"); // In case of error, callback with english
      });
  },
  cacheUserLanguage: async function (language: string) {
    try {
      // Save a user's language choice in Async storage
      await setStorageItem(STORAGE_KEY_LANGUAGE, language);
    } catch (error) {
      console.log("Error saving language", error);
    }
  },
};

// Function to explicitly change the language
export const changeLanguage = async (language: string) => {
  try {
    // Set the language
    await setStorageItem(STORAGE_KEY_LANGUAGE, language);
    // Mark it as explicitly selected by the user
    await setStorageItem(STORAGE_KEY_LANGUAGE_EXPLICITLY_SELECTED, true);
    // Change the language in i18n
    await i18n.changeLanguage(language);
  } catch (error) {
    console.log("Error changing language", error);
  }
};

const resources = {
  en: {
    translation: en,
  },
  cs: {
    translation: cs,
  },
};

i18n
  .use(initReactI18next)
  .use(languageDetectorPlugin)
  .init({
    resources,
    //compatibilityJSON: "v4",
    // fallback language is set to english
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, //react is automatically escaping
    },
  });

export default i18n;
