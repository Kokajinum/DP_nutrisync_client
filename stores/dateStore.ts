import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, addDays, startOfDay, isSameDay, isAfter } from "date-fns";
import { enUS, cs } from "date-fns/locale";
import i18n from "@/translations/i18n";

const locales = {
  en: enUS,
  cs: cs,
};

const getCurrentLocale = () => {
  const language = i18n.language;
  return locales[language as keyof typeof locales] || enUS;
};

export interface DateState {
  selectedDate: string;

  getSelectedDate: () => Date;

  setSelectedDate: (date: Date) => void;
  resetToToday: () => void;
  goToNextDay: () => void;
  goToPreviousDay: () => void;

  // Utility functions
  formatSelectedDate: (formatString: string) => string;
  isSelectedDate: (date: Date) => boolean;

  getDayName: () => string;
  getShortDayName: () => string;

  getMonthName: () => string;
  getShortMonthName: () => string;

  getFormattedDate: (style?: "full" | "long" | "medium" | "short") => string;
}

export const useDateStore = create<DateState>((set, get) => ({
  selectedDate: new Date().toISOString(),

  getSelectedDate: () => new Date(get().selectedDate),

  setSelectedDate: (date: Date) => set({ selectedDate: startOfDay(date).toISOString() }),

  resetToToday: () => set({ selectedDate: startOfDay(new Date()).toISOString() }),

  goToNextDay: () => {
    const current = new Date(get().selectedDate);
    const nextDay = startOfDay(addDays(current, 1));
    const today = startOfDay(new Date());

    if (!isAfter(nextDay, today)) {
      set({ selectedDate: nextDay.toISOString() });
    }
  },

  goToPreviousDay: () => {
    const current = new Date(get().selectedDate);
    set({ selectedDate: addDays(current, -1).toISOString() });
  },

  // Format the selected date using date-fns
  formatSelectedDate: (fmt: string) =>
    format(new Date(get().selectedDate), fmt, {
      locale: getCurrentLocale(),
    }),

  isSelectedDate: (date: Date) => isSameDay(new Date(get().selectedDate), date),

  getDayName: () =>
    format(new Date(get().selectedDate), "EEEE", {
      locale: getCurrentLocale(),
    }),

  // Short day name ("Mon", ...)
  getShortDayName: () =>
    format(new Date(get().selectedDate), "EEE", {
      locale: getCurrentLocale(),
    }),

  // Full month name ("January", ...)
  getMonthName: () =>
    format(new Date(get().selectedDate), "LLLL", {
      locale: getCurrentLocale(),
    }),

  // Short month name ("Jan", ...)
  getShortMonthName: () =>
    format(new Date(get().selectedDate), "LLL", {
      locale: getCurrentLocale(),
    }),

  // Fully formatted date
  getFormattedDate: (style = "medium") => {
    const formats = {
      full: "PPPP",
      long: "PPP",
      medium: "PP",
      short: "P",
    } as const;
    return format(new Date(get().selectedDate), formats[style], {
      locale: getCurrentLocale(),
    });
  },
}));
