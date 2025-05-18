import { ActivityDiaryRepository } from "@/models/interfaces/ActivityDiary";
import {
  ActivityDiaryResponseDto,
  CreateActivityDiaryDto,
} from "@/models/interfaces/ActivityDiary";
import { db } from "../../sqliteHelper";

export class LocalActivityDiaryRepository implements ActivityDiaryRepository {
  /**
   * Save activity diary locally
   * @param diary The activity diary to save
   * @returns The saved activity diary or null if failed
   */
  async saveActivityDiary(diary: CreateActivityDiaryDto): Promise<ActivityDiaryResponseDto | null> {
    // This method is not needed for our implementation, because data is already saved in SQLite
    // when creating the workout and completing it
    console.warn("saveActivityDiary called on LocalActivityDiaryRepository - this is not needed");
    return null;
  }

  /**
   * Get activity diary by date
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns The activity diary or null if not found
   */
  async getActivityDiaryByDate(date: string): Promise<ActivityDiaryResponseDto | null> {
    // This method is not needed for our implementation, because data is already loaded
    // directly in activityDiaryStore.ts
    console.warn(
      "getActivityDiaryByDate called on LocalActivityDiaryRepository - this is not needed"
    );
    return null;
  }
}
