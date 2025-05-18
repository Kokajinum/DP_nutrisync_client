// Local model aligned with SQLite schema
export interface ActivityDiary {
  id: string;
  user_id: string;
  start_at: string;
  end_at?: string;
  bodyweight_kg?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  entries?: ActivityDiaryEntry[];
}

export interface ActivityDiaryEntry {
  id: string;
  diary_id: string;
  exercise_id: string;
  exercise_name?: string; // Not in DB, for UI display
  sets_json: string; // JSON string of sets
  est_kcal?: number;
  notes?: string;
  created_at?: string;
}

export interface ExerciseSet {
  reps: number;
  weight_kg: number;
}

// DTOs for API communication
export interface CreateActivityDiaryDto {
  id?: string;
  start_at: string;
  end_at: string;
  bodyweight_kg?: number;
  notes?: string;
  entries: ActivityDiaryEntryDto[];
}

export interface ActivityDiaryEntryDto {
  id?: string;
  exercise_id: string;
  sets_json: ExerciseSet[];
  est_kcal?: number;
  notes?: string;
}

// Response DTOs
export interface ActivityDiaryResponseDto {
  id: string;
  user_id: string;
  start_at: string;
  end_at: string;
  bodyweight_kg: number;
  notes: string;
  created_at: string;
  updated_at: string;
  entries?: ActivityDiaryEntryResponseDto[];
}

export interface ActivityDiaryEntryResponseDto {
  id: string;
  diary_id: string;
  exercise_id: string;
  sets_json: ExerciseSet[];
  est_kcal: number;
  notes: string;
  created_at: string;
}

// Repository interface for activity diary
export interface ActivityDiaryRepository {
  /**
   * Save activity diary to the server
   * @param diary The activity diary to save
   * @returns The saved activity diary or null if failed
   */
  saveActivityDiary(diary: CreateActivityDiaryDto): Promise<ActivityDiaryResponseDto | null>;

  /**
   * Get activity diary by date
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns The activity diary or null if not found
   */
  getActivityDiaryByDate(date: string): Promise<ActivityDiaryResponseDto | null>;
}
