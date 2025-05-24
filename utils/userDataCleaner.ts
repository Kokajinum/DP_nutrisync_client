import { db } from "./sqliteHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEY_HAS_LAUNCHED } from "@/constants/Global";

export const clearUserData = async (): Promise<void> => {
  try {
    // Clear user-related tables
    await clearUserTables();

    // Clear AsyncStorage except for specific keys
    await clearAsyncStorage([STORAGE_KEY_HAS_LAUNCHED]);

    console.log("User data cleared successfully");
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

async function clearUserTables(): Promise<void> {
  // Delete data from user-related tables but keep the table structure
  const tables = [
    "user_profiles",
    "daily_diaries",
    "diary_food_entries",
    "activity_diary",
    "activity_diary_entry",
    "offline_queue",
  ];

  for (const table of tables) {
    await db.runAsync(`DELETE FROM ${table}`);
  }
}

async function clearAsyncStorage(keysToPreserve: string[]): Promise<void> {
  try {
    // Get all keys
    const allKeys = await AsyncStorage.getAllKeys();

    // Filter out keys to preserve
    const keysToRemove = allKeys.filter((key) => !keysToPreserve.includes(key));

    // Remove filtered keys
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.error("Error clearing AsyncStorage:", error);
    throw error;
  }
}
