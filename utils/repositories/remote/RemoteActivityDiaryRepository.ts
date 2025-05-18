import { ActivityDiaryRepository } from "@/models/interfaces/ActivityDiary";
import {
  ActivityDiaryResponseDto,
  CreateActivityDiaryDto,
} from "@/models/interfaces/ActivityDiary";
import RestManager from "../../api/restManager";
import { saveActivityDiary, getActivityDiaryByDate } from "../../api/apiClient";

export class RemoteActivityDiaryRepository implements ActivityDiaryRepository {
  private restManager: RestManager;

  constructor(restManager: RestManager) {
    this.restManager = restManager;
  }

  /**
   * Save activity diary to the server
   * @param diary The activity diary to save
   * @returns The saved activity diary or null if failed
   */
  async saveActivityDiary(diary: CreateActivityDiaryDto): Promise<ActivityDiaryResponseDto | null> {
    try {
      return await saveActivityDiary(this.restManager, diary);
    } catch (error) {
      console.error("Error saving activity diary to remote API:", error);
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
      return await getActivityDiaryByDate(this.restManager, date);
    } catch (error) {
      console.error("Error retrieving activity diary by date from remote API:", error);
      return null;
    }
  }
}
