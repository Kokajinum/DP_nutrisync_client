import { DailyDiaryResponseDto } from "./DailyDiaryResponseDto";
import { FoodDiaryEntryResponseDto } from "./FoodDiaryEntryResponseDto";
import { CreateFoodDiaryEntryDto } from "./CreateFoodDiaryEntryDto";
import { UserProfileData } from "./UserProfileData";

export interface DailyDiaryRepository {
  /**
   * Get daily diary for a specific date
   * @param date The date in ISO format (YYYY-MM-DD)
   * @param userProfile Optional user profile data to use for default values
   * @returns The daily diary or null if not found
   */
  getDailyDiary(
    date: string,
    userProfile?: UserProfileData | null
  ): Promise<DailyDiaryResponseDto | null>;

  /**
   * Save daily diary
   * @param diary The daily diary to save
   * @returns The saved daily diary or null if failed
   */
  saveDailyDiary(diary: DailyDiaryResponseDto): Promise<DailyDiaryResponseDto | null>;

  /**
   * Create a food diary entry
   * @param entry The food diary entry to create
   * @returns The created food diary entry or null if failed
   */
  createFoodDiaryEntry(entry: CreateFoodDiaryEntryDto): Promise<FoodDiaryEntryResponseDto | null>;

  /**
   * Save a food diary entry to storage
   * @param entry The food diary entry to save
   * @returns The saved food diary entry or null if failed
   */
  saveFoodDiaryEntry?(entry: FoodDiaryEntryResponseDto): Promise<FoodDiaryEntryResponseDto | null>;

  /**
   * Delete a food diary entry
   * @param id The ID of the food diary entry to delete
   * @returns True if successful, false otherwise
   */
  deleteFoodDiaryEntry(id: string): Promise<boolean>;
}
