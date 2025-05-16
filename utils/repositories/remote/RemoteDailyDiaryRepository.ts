import { DailyDiaryRepository } from "@/models/interfaces/DailyDiaryRepository";
import { DailyDiaryResponseDto } from "@/models/interfaces/DailyDiaryResponseDto";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { CreateFoodDiaryEntryDto } from "@/models/interfaces/CreateFoodDiaryEntryDto";
import RestManager from "../../api/restManager";
import { getDailyDiary, createFoodDiaryEntry, deleteFoodDiaryEntry } from "../../api/apiClient";

export class RemoteDailyDiaryRepository implements DailyDiaryRepository {
  private restManager: RestManager;

  constructor(restManager: RestManager) {
    this.restManager = restManager;
  }

  /**
   * Get daily diary for a specific date from the remote API
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns The daily diary or null if not found
   */
  async getDailyDiary(date: string): Promise<DailyDiaryResponseDto | null> {
    try {
      return await getDailyDiary(this.restManager, date);
    } catch (error) {
      console.error("Error retrieving daily diary from remote API:", error);
      return null;
    }
  }

  /**
   * Save daily diary to the remote API
   * This is not directly implemented as the backend handles this automatically
   * @param diary The daily diary to save
   * @returns The saved daily diary or null if failed
   */
  async saveDailyDiary(diary: DailyDiaryResponseDto): Promise<DailyDiaryResponseDto | null> {
    console.warn("saveDailyDiary called on RemoteDailyDiaryRepository - this is not supported");
    return diary; // Just return the diary as is, since we don't directly save it
  }

  /**
   * Create a food diary entry via the remote API
   * @param entry The food diary entry to create
   * @returns The created food diary entry or null if failed
   */
  async createFoodDiaryEntry(
    entry: CreateFoodDiaryEntryDto
  ): Promise<FoodDiaryEntryResponseDto | null> {
    try {
      return await createFoodDiaryEntry(this.restManager, entry);
    } catch (error) {
      console.error("Error creating food diary entry via remote API:", error);
      return null;
    }
  }

  /**
   * Delete a food diary entry via the remote API
   * @param id The ID of the food diary entry to delete
   * @returns True if successful, false otherwise
   */
  async deleteFoodDiaryEntry(id: string): Promise<boolean> {
    try {
      return await deleteFoodDiaryEntry(this.restManager, id);
    } catch (error) {
      console.error("Error deleting food diary entry via remote API:", error);
      return false;
    }
  }
}
