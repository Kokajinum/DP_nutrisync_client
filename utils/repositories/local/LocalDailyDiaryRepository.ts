import { DailyDiaryRepository } from "@/models/interfaces/DailyDiaryRepository";
import { DailyDiaryResponseDto } from "@/models/interfaces/DailyDiaryResponseDto";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { CreateFoodDiaryEntryDto } from "@/models/interfaces/CreateFoodDiaryEntryDto";
import { UserProfileData } from "@/models/interfaces/UserProfileData";
import { db, normalizeForSqlite } from "../../sqliteHelper";

export class LocalDailyDiaryRepository implements DailyDiaryRepository {
  /**
   * Get daily diary for a specific date from local database
   * @param date The date in ISO format (YYYY-MM-DD)
   * @param userProfile Optional user profile data to use for default values
   * @returns The daily diary or null if not found
   */
  async getDailyDiary(
    date: string,
    userProfile?: UserProfileData | null
  ): Promise<DailyDiaryResponseDto | null> {
    try {
      // Get the diary for the specified date
      const diary = await db.getFirstAsync<DailyDiaryResponseDto>(
        `SELECT * FROM daily_diaries WHERE day_date = ?`,
        [date]
      );

      if (!diary) {
        return null;
      }

      // Get all food entries for this diary
      const foodEntries = await db.getAllAsync<FoodDiaryEntryResponseDto>(
        `SELECT * FROM diary_food_entries WHERE day_id = ? ORDER BY created_at DESC`,
        [diary.id]
      );

      // Return the diary with food entries
      return {
        ...diary,
        food_entries: foodEntries || [],
      };
    } catch (error) {
      console.error("Error retrieving daily diary from local database:", error);
      return null;
    }
  }

  /**
   * Save daily diary to local database
   * @param diary The daily diary to save
   * @returns The saved daily diary or null if failed
   */
  async saveDailyDiary(diary: DailyDiaryResponseDto): Promise<DailyDiaryResponseDto | null> {
    try {
      // First save the diary itself
      const diaryWithoutEntries: DailyDiaryResponseDto = { ...diary, food_entries: [] };
      const normalizedData = normalizeForSqlite(diaryWithoutEntries);
      await db.saveToSqlite("daily_diaries", normalizedData);

      // Then save all food entries if they exist
      if (diary.food_entries && diary.food_entries.length > 0) {
        for (const entry of diary.food_entries) {
          await db.saveToSqlite("diary_food_entries", normalizeForSqlite(entry));
        }
      }

      return diary;
    } catch (error) {
      console.error("Error saving daily diary to local database:", error);
      return null;
    }
  }

  /**
   * Save a food diary entry to local database
   * @param entry The food diary entry to save
   * @returns The saved food diary entry or null if failed
   */
  async saveFoodDiaryEntry(
    entry: FoodDiaryEntryResponseDto
  ): Promise<FoodDiaryEntryResponseDto | null> {
    try {
      const normalizedData = normalizeForSqlite(entry);
      await db.saveToSqlite("diary_food_entries", normalizedData);
      return entry;
    } catch (error) {
      console.error("Error saving food diary entry to local database:", error);
      return null;
    }
  }

  /**
   * Create a food diary entry in local database
   * This is now handled by the composite repository
   * @param entry The food diary entry to create
   * @returns The created food diary entry or null if failed
   */
  async createFoodDiaryEntry(
    entry: CreateFoodDiaryEntryDto
  ): Promise<FoodDiaryEntryResponseDto | null> {
    console.warn(
      "createFoodDiaryEntry called directly on LocalDailyDiaryRepository - this should be handled by the composite repository"
    );
    return null;
  }

  /**
   * Delete a food diary entry from local database
   * @param id The ID of the food diary entry to delete
   * @returns True if successful, false otherwise
   */
  async deleteFoodDiaryEntry(id: string): Promise<boolean> {
    try {
      await db.runAsync(`DELETE FROM diary_food_entries WHERE id = ?`, [id]);
      return true;
    } catch (error) {
      console.error("Error deleting food diary entry from local database:", error);
      return false;
    }
  }
}
