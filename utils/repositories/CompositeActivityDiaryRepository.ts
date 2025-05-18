import { ActivityDiaryRepository } from "@/models/interfaces/ActivityDiary";
import {
  ActivityDiaryResponseDto,
  CreateActivityDiaryDto,
} from "@/models/interfaces/ActivityDiary";
import NetInfo from "@react-native-community/netinfo";

export class CompositeActivityDiaryRepository implements ActivityDiaryRepository {
  constructor(
    private localRepository: ActivityDiaryRepository,
    private remoteRepository: ActivityDiaryRepository
  ) {}

  /**
   * Save activity diary
   * @param diary The activity diary to save
   * @returns The saved activity diary or null if failed
   */
  async saveActivityDiary(diary: CreateActivityDiaryDto): Promise<ActivityDiaryResponseDto | null> {
    try {
      // Check internet connectivity
      const netState = await NetInfo.fetch();
      if (!netState.isConnected || netState.isInternetReachable === false) {
        throw new Error("No internet connection");
      }

      // Save to server
      return await this.remoteRepository.saveActivityDiary(diary);
    } catch (error) {
      console.error("Error in CompositeActivityDiaryRepository.saveActivityDiary:", error);
      return null;
    }
  }

  /**
   * Get activity diary by date
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns The activity diary or null if not found
   */
  async getActivityDiaryByDate(date: string): Promise<ActivityDiaryResponseDto | null> {
    try {
      // Check internet connectivity
      const netState = await NetInfo.fetch();
      if (!netState.isConnected || netState.isInternetReachable === false) {
        return null;
      }

      // Get from server
      return await this.remoteRepository.getActivityDiaryByDate(date);
    } catch (error) {
      console.error("Error in CompositeActivityDiaryRepository.getActivityDiaryByDate:", error);
      return null;
    }
  }
}
