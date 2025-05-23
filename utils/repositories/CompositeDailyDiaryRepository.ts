import { DailyDiaryRepository } from "@/models/interfaces/DailyDiaryRepository";
import { DailyDiaryResponseDto } from "@/models/interfaces/DailyDiaryResponseDto";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { CreateFoodDiaryEntryDto } from "@/models/interfaces/CreateFoodDiaryEntryDto";
import { UserProfileData } from "@/models/interfaces/UserProfileData";
import NetInfo from "@react-native-community/netinfo";
import { OfflineManager } from "../managers/OfflineManager";
import uuid from "react-native-uuid";
import { CREATE_DAILY_DIARY, CREATE_FOOD_DIARY_ENTRY } from "@/constants/Global";

export class CompositeDailyDiaryRepository implements DailyDiaryRepository {
  constructor(
    private localRepository: DailyDiaryRepository,
    private remoteRepository: DailyDiaryRepository
  ) {}

  /**
   * Get daily diary for a specific date
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns The daily diary from local/remote storage or null if not found
   */
  /**
   * Get daily diary for a specific date
   * @param date The date in ISO format (YYYY-MM-DD)
   * @param userProfile Optional user profile data to use for default values
   * @returns The daily diary from local/remote storage or null if not found
   */
  async getDailyDiary(
    date: string,
    userProfile?: UserProfileData | null
  ): Promise<DailyDiaryResponseDto | null> {
    try {
      const netState = await NetInfo.fetch();

      if (netState.isConnected && netState.isInternetReachable) {
        const remoteDiary = await this.remoteRepository.getDailyDiary(date);

        if (remoteDiary) {
          // Update local and return remote data
          await this.localRepository.saveDailyDiary(remoteDiary);
          return remoteDiary;
        }
      }

      // Get local data
      const localDiary = await this.localRepository.getDailyDiary(date);

      // Selected local diary is not existing yet and we are offline
      if (!localDiary) {
        // Implement point 2.2 - create a new diary entry when offline
        const newDiary: DailyDiaryResponseDto = {
          id: uuid.v4().toString(),
          user_id: userProfile?.user_id || "",
          day_date: date,
          calorie_goal: userProfile?.calorie_goal_value || 2000,
          calories_consumed: 0,
          calories_burned: 0,
          protein_goal_g: userProfile?.protein_goal_g || 150,
          carbs_goal_g: userProfile?.carbs_goal_g || 225,
          fat_goal_g: userProfile?.fat_goal_g || 67,
          protein_consumed_g: 0,
          carbs_consumed_g: 0,
          fat_consumed_g: 0,
          protein_ratio: userProfile?.protein_ratio || 0.3,
          carbs_ratio: userProfile?.carbs_ratio || 0.45,
          fat_ratio: userProfile?.fat_ratio || 0.25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          food_entries: [],
        };

        // Save to local database
        await this.localRepository.saveDailyDiary(newDiary);

        // Add to offline queue for later synchronization
        await OfflineManager.queueAction(CREATE_DAILY_DIARY, { date });

        return newDiary;
      }

      return localDiary;
    } catch (error) {
      console.error("Error in CompositeDailyDiaryRepository.getDailyDiary:", error);
      return null;
    }
  }

  //   /**
  //    * Fetch remote diary data and update local storage
  //    * @param date The date in ISO format (YYYY-MM-DD)
  //    */
  //   private async fetchRemoteDiaryAndUpdateLocal(date: string): Promise<void> {
  //     try {
  //       const netState = await NetInfo.fetch();

  //       // Only proceed if online
  //       if (netState.isConnected && netState.isInternetReachable !== false) {
  //         const remoteDiary = await this.remoteRepository.getDailyDiary(date);
  //         if (remoteDiary) {
  //           // Save remote data locally
  //           await this.localRepository.saveDailyDiary(remoteDiary);

  //           // Here we could emit an event to notify that data has been updated
  //           console.log("Remote diary fetched and local storage updated for date:", date);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching remote diary in background:", error);
  //     }
  //   }

  /**
   * Save daily diary
   * Saves to both local and remote repositories if possible
   * @param diary The daily diary to save
   * @returns The saved daily diary or null if failed
   */
  async saveDailyDiary(diary: DailyDiaryResponseDto): Promise<DailyDiaryResponseDto | null> {
    try {
      // Save locally first
      await this.localRepository.saveDailyDiary(diary);

      // Try to save remotely if online
      const netState = await NetInfo.fetch();
      if (netState.isConnected && netState.isInternetReachable !== false) {
        await this.remoteRepository.saveDailyDiary(diary);
      }

      return diary;
    } catch (error) {
      console.error("Error in CompositeDailyDiaryRepository.saveDailyDiary:", error);
      return null;
    }
  }

  /**
   * Create a food diary entry
   * Creates entry via remote API when online, or locally when offline
   * @param entry The food diary entry to create
   * @returns The created food diary entry or null if failed
   */
  async createFoodDiaryEntry(
    entry: CreateFoodDiaryEntryDto
  ): Promise<FoodDiaryEntryResponseDto | null> {
    try {
      // Check if online
      const netState = await NetInfo.fetch();
      const isOnline = netState.isConnected && netState.isInternetReachable !== false;

      if (isOnline) {
        // ONLINE SCENARIO
        // Create entry via remote API
        const createdEntry = await this.remoteRepository.createFoodDiaryEntry(entry);

        if (createdEntry) {
          // Save to local database
          if (this.localRepository.saveFoodDiaryEntry) {
            await this.localRepository.saveFoodDiaryEntry(createdEntry);
          }

          // Get the date from entry or use current date
          const date = entry.entry_date
            ? entry.entry_date.split("T")[0]
            : new Date().toISOString().split("T")[0];

          // Fetch updated daily diary to refresh local storage
          const updatedDiary = await this.remoteRepository.getDailyDiary(date);
          if (updatedDiary) {
            await this.localRepository.saveDailyDiary(updatedDiary);
          }
        }

        return createdEntry;
      } else {
        // OFFLINE SCENARIO
        // Generate temporary ID for the entry
        const tempId = uuid.v4().toString();

        // Get the date from entry or use current date
        const date = entry.entry_date
          ? entry.entry_date.split("T")[0]
          : new Date().toISOString().split("T")[0];

        // Get current daily diary from local storage
        let diary = await this.localRepository.getDailyDiary(date);

        if (!diary) {
          // Create a new diary if it doesn't exist
          diary = {
            id: uuid.v4().toString(),
            user_id: "", // Will be filled on sync
            day_date: date,
            calorie_goal: 2000, // Default values
            calories_consumed: 0,
            calories_burned: 0,
            protein_goal_g: 150,
            carbs_goal_g: 225,
            fat_goal_g: 67,
            protein_consumed_g: 0,
            carbs_consumed_g: 0,
            fat_consumed_g: 0,
            protein_ratio: 0.3,
            carbs_ratio: 0.45,
            fat_ratio: 0.25,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            food_entries: [],
          };

          await this.localRepository.saveDailyDiary(diary);
        }

        // Create a temporary response object
        const tempResponse: FoodDiaryEntryResponseDto = {
          id: tempId,
          user_id: "temp_user_id", // Will be replaced on sync
          day_id: diary.id,
          food_id: entry.food_id,
          food_name: entry.food_name,
          brand: entry.brand || "",
          meal_type: entry.meal_type,
          serving_size: entry.serving_size,
          serving_unit: entry.serving_unit,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Save to local database
        if (this.localRepository.saveFoodDiaryEntry) {
          await this.localRepository.saveFoodDiaryEntry(tempResponse);
        }

        // Update daily diary with new values
        diary.calories_consumed += entry.calories;
        diary.protein_consumed_g += entry.protein;
        diary.carbs_consumed_g += entry.carbs;
        diary.fat_consumed_g += entry.fat;
        diary.updated_at = new Date().toISOString();

        if (!diary.food_entries) {
          diary.food_entries = [];
        }
        diary.food_entries.push(tempResponse);

        await this.localRepository.saveDailyDiary(diary);

        // Queue for later synchronization
        await OfflineManager.queueAction(CREATE_FOOD_DIARY_ENTRY, entry);

        return tempResponse;
      }
    } catch (error) {
      console.error("Error in CompositeDailyDiaryRepository.createFoodDiaryEntry:", error);
      return null;
    }
  }

  /**
   * Delete a food diary entry
   * Deletes entry via remote API and updates local storage
   * @param id The ID of the food diary entry to delete
   * @returns True if successful, false otherwise
   */
  async deleteFoodDiaryEntry(id: string): Promise<boolean> {
    try {
      // Check if online
      const netState = await NetInfo.fetch();
      if (!netState.isConnected || netState.isInternetReachable === false) {
        console.error("Cannot delete food diary entry while offline");
        return false;
      }

      // Delete via remote API
      const success = await this.remoteRepository.deleteFoodDiaryEntry(id);

      if (success) {
        // Also delete locally
        await this.localRepository.deleteFoodDiaryEntry(id);
      }

      return success;
    } catch (error) {
      console.error("Error in CompositeDailyDiaryRepository.deleteFoodDiaryEntry:", error);
      return false;
    }
  }
}
