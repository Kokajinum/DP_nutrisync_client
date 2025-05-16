import { DailyDiaryRepository } from "@/models/interfaces/DailyDiaryRepository";
import { DailyDiaryResponseDto } from "@/models/interfaces/DailyDiaryResponseDto";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { CreateFoodDiaryEntryDto } from "@/models/interfaces/CreateFoodDiaryEntryDto";
import NetInfo from "@react-native-community/netinfo";

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
  async getDailyDiary(date: string): Promise<DailyDiaryResponseDto | null> {
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
        // const newDiary: DailyDiaryResponseDto = {
        // }
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
   * Creates entry via remote API and updates local storage
   * @param entry The food diary entry to create
   * @returns The created food diary entry or null if failed
   */
  async createFoodDiaryEntry(
    entry: CreateFoodDiaryEntryDto
  ): Promise<FoodDiaryEntryResponseDto | null> {
    try {
      // Check if online
      const netState = await NetInfo.fetch();
      if (!netState.isConnected || netState.isInternetReachable === false) {
        console.error("Cannot create food diary entry while offline");
        return null;
      }

      // Create entry via remote API
      const createdEntry = await this.remoteRepository.createFoodDiaryEntry(entry);

      if (createdEntry) {
        // After successful creation, refresh the daily diary to update local storage
        const date = entry.entry_date
          ? entry.entry_date.split("T")[0]
          : new Date().toISOString().split("T")[0];
        //this.fetchRemoteDiaryAndUpdateLocal(date);
      }

      return createdEntry;
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
