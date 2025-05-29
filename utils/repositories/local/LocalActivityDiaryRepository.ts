import { ActivityDiaryRepository } from "@/models/interfaces/ActivityDiary";
import {
  ActivityDiary,
  ActivityDiaryEntry,
  ActivityDiaryResponseDto,
  ActivityDiaryEntryResponseDto,
  CreateActivityDiaryDto,
  ExerciseSet,
} from "@/models/interfaces/ActivityDiary";
import { db } from "../../sqliteHelper";
import { format, startOfDay } from "date-fns";

export class LocalActivityDiaryRepository implements ActivityDiaryRepository {
  /**
   * Save activity diary locally
   * @param diary The activity diary to save
   * @returns The saved activity diary or null if failed
   */
  async saveActivityDiary(diary: CreateActivityDiaryDto): Promise<ActivityDiaryResponseDto | null> {
    try {
      const isResponseDto = "user_id" in diary && "created_at" in diary;

      if (isResponseDto) {
        const responseDiary = diary as unknown as ActivityDiaryResponseDto;

        await db.runAsync(
          `INSERT OR REPLACE INTO activity_diary 
           (id, user_id, start_at, end_at, bodyweight_kg, notes, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            responseDiary.id,
            responseDiary.user_id,
            responseDiary.start_at,
            responseDiary.end_at || null,
            responseDiary.bodyweight_kg || null,
            responseDiary.notes || "",
            responseDiary.created_at,
            responseDiary.updated_at,
          ]
        );

        if (responseDiary.entries && responseDiary.entries.length > 0) {
          for (const entry of responseDiary.entries) {
            await db.runAsync(
              `INSERT OR REPLACE INTO activity_diary_entry 
               (id, diary_id, exercise_id, sets_json, est_kcal, notes, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                entry.id,
                responseDiary.id,
                entry.exercise_id,
                JSON.stringify(entry.sets_json),
                entry.est_kcal || 0,
                entry.notes || "",
                entry.created_at,
              ]
            );
          }
        }

        return responseDiary;
      } else if (diary.id) {
        const now = new Date().toISOString();
        const userId = "00000000-0000-0000-0000-000000000000"; // Default user ID for local storage

        await db.runAsync(
          `INSERT OR REPLACE INTO activity_diary 
           (id, user_id, start_at, end_at, bodyweight_kg, notes, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            diary.id,
            userId,
            diary.start_at,
            diary.end_at || null,
            diary.bodyweight_kg || null,
            diary.notes || "",
            now,
            now,
          ]
        );

        if (diary.entries && diary.entries.length > 0) {
          for (const entry of diary.entries) {
            const entryId =
              entry.id || `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            await db.runAsync(
              `INSERT OR REPLACE INTO activity_diary_entry 
               (id, diary_id, exercise_id, sets_json, est_kcal, notes, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                entryId,
                diary.id,
                entry.exercise_id,
                JSON.stringify(entry.sets_json),
                entry.est_kcal || 0,
                entry.notes || "",
                now,
              ]
            );
          }
        }

        return {
          id: diary.id,
          user_id: userId,
          start_at: diary.start_at,
          end_at: diary.end_at || now,
          bodyweight_kg: diary.bodyweight_kg || 0,
          notes: diary.notes || "",
          created_at: now,
          updated_at: now,
          entries: diary.entries.map((entry) => ({
            id: entry.id || `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            diary_id: diary.id!,
            exercise_id: entry.exercise_id,
            sets_json: entry.sets_json,
            est_kcal: entry.est_kcal || 0,
            notes: entry.notes || "",
            created_at: now,
          })),
        };
      } else {
        console.warn("Cannot save CreateActivityDiaryDto without an ID");
        return null;
      }
    } catch (error) {
      console.error("Error saving activity diary to SQLite:", error);
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
      const dateObj = new Date(date);
      const dateStart = startOfDay(dateObj).toISOString();
      const nextDay = new Date(dateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      const dateEnd = startOfDay(nextDay).toISOString();

      const diary = await db.getFirstAsync<ActivityDiary>(
        `SELECT * FROM activity_diary 
         WHERE start_at >= ? AND start_at < ? 
         ORDER BY start_at DESC LIMIT 1`,
        [dateStart, dateEnd]
      );

      if (!diary) return null;

      const entries = await db.getAllAsync<ActivityDiaryEntry>(
        `SELECT * FROM activity_diary_entry WHERE diary_id = ?`,
        [diary.id]
      );

      for (const entry of entries) {
        const exercise = await db.getFirstAsync<{ name: string }>(
          `SELECT name FROM exercises WHERE id = ?`,
          [entry.exercise_id]
        );

        if (exercise) {
          entry.exercise_name = exercise.name;
        }
      }

      const entriesDto: ActivityDiaryEntryResponseDto[] = entries.map((entry) => ({
        id: entry.id,
        diary_id: entry.diary_id,
        exercise_id: entry.exercise_id,
        sets_json: JSON.parse(entry.sets_json || "[]") as ExerciseSet[],
        est_kcal: entry.est_kcal || 0,
        notes: entry.notes || "",
        created_at: entry.created_at || new Date().toISOString(),
      }));

      return {
        id: diary.id,
        user_id: diary.user_id,
        start_at: diary.start_at,
        end_at: diary.end_at || new Date().toISOString(),
        bodyweight_kg: diary.bodyweight_kg || 0,
        notes: diary.notes || "",
        created_at: diary.created_at || new Date().toISOString(),
        updated_at: diary.updated_at || new Date().toISOString(),
        entries: entriesDto,
      };
    } catch (error) {
      console.error("Error getting activity diary from SQLite:", error);
      return null;
    }
  }
}
