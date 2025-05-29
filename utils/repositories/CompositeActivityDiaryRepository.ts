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
   * Save activity diary to the server
   * This is used when a workout is completed
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

      const remoteSaved = await this.remoteRepository.saveActivityDiary(diary);

      // If saved successfully to remote, also save to local
      if (remoteSaved) {
        try {
          const localSaveDto: CreateActivityDiaryDto = {
            id: remoteSaved.id,
            start_at: remoteSaved.start_at,
            end_at: remoteSaved.end_at,
            bodyweight_kg: remoteSaved.bodyweight_kg,
            notes: remoteSaved.notes,
            entries:
              remoteSaved.entries?.map((entry) => ({
                id: entry.id,
                exercise_id: entry.exercise_id,
                sets_json: entry.sets_json,
                est_kcal: entry.est_kcal,
                notes: entry.notes,
              })) || [],
          };

          await this.localRepository.saveActivityDiary(localSaveDto);
          console.log("Activity diary saved to local database after remote save");
        } catch (localError) {
          console.error("Error saving remote activity diary to local database:", localError);
        }
      }

      return remoteSaved;
    } catch (error) {
      console.error("Error in CompositeActivityDiaryRepository.saveActivityDiary:", error);
      return null;
    }
  }

  /**
   * Get activity diary by date
   * First tries to get from local database, if not found, gets from server
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns The activity diary or null if not found
   */
  async getActivityDiaryByDate(date: string): Promise<ActivityDiaryResponseDto | null> {
    try {
      const localData = await this.localRepository.getActivityDiaryByDate(date);
      if (localData) {
        console.log("Found activity diary in local database for date:", date);
        return localData;
      }

      const netState = await NetInfo.fetch();
      if (!netState.isConnected || netState.isInternetReachable === false) {
        console.log("No internet connection and no local data available for date:", date);
        return null;
      }

      const remoteData = await this.remoteRepository.getActivityDiaryByDate(date);

      if (remoteData) {
        try {
          await this.localRepository.saveActivityDiary(
            remoteData as unknown as CreateActivityDiaryDto
          );
          console.log("Remote activity diary saved to local database for date:", date);
        } catch (localError) {
          console.error("Error saving remote activity diary to local database:", localError);
        }
      }

      return remoteData;
    } catch (error) {
      console.error("Error in CompositeActivityDiaryRepository.getActivityDiaryByDate:", error);
      return null;
    }
  }
}
