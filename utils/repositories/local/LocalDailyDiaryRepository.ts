import { DailyDiaryRepository } from "@/models/interfaces/DailyDiaryRepository";
import { DailyDiaryResponseDto } from "@/models/interfaces/DailyDiaryResponseDto";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { CreateFoodDiaryEntryDto } from "@/models/interfaces/CreateFoodDiaryEntryDto";
import { db, normalizeForSqlite } from "../../sqliteHelper";

export class LocalDailyDiaryRepository implements DailyDiaryRepository {
  /**
   * Get daily diary for a specific date from local database
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns The daily diary or null if not found
   */
  async getDailyDiary(date: string): Promise<DailyDiaryResponseDto | null> {
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
      const normalizedData = normalizeForSqlite(diary);
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
   * Create a food diary entry in local database
   * This is a placeholder as entries are typically created via the remote API
   * @param entry The food diary entry to create
   * @returns The created food diary entry or null if failed
   */
  async createFoodDiaryEntry(
    entry: CreateFoodDiaryEntryDto
  ): Promise<FoodDiaryEntryResponseDto | null> {
    console.warn(
      "createFoodDiaryEntry called on LocalDailyDiaryRepository - this should be handled by the remote repository"
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
