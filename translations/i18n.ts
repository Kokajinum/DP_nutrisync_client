import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { en } from "./en";
import { cs } from './cs';
import { LanguageDetectorAsyncModule } from "i18next";
import { STORAGE_KEY_LANGUAGE } from '@/constants/Global';
import { getStorageItem, setStorageItem } from '@/utils/storage';

//"Guaranteed to contain at least 1 element." according to docs
const DEVICE_SYSTEM_LANG = getLocales()[0].languageCode;

const languageDetectorPlugin: LanguageDetectorAsyncModule = {
    type: "languageDetector",
    async: true,
    init: () => {},
    detect: function (callback: (lang: string | readonly string[] | undefined) => void | undefined) {
      getStorageItem<string>(STORAGE_KEY_LANGUAGE)
        .then(language => {
          if (language) {
            // If language was stored before, use this language in the app
            callback(language);
          } else {
            // If language was not stored yet, use system language or English
            callback(DEVICE_SYSTEM_LANG || "en");
          }
        })
        .catch(error => {
          console.log("Error reading language", error);
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

const resources = {
    en: {
      translation: en,
    },
    cs: {
      translation: cs
    }
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