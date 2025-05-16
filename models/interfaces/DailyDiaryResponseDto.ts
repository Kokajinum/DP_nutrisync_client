import { FoodDiaryEntryResponseDto } from "./FoodDiaryEntryResponseDto";

export interface DailyDiaryResponseDto {
  id: string;
  user_id: string;
  day_date: string;
  calorie_goal: number;
  calories_consumed: number;
  calories_burned: number;
  protein_goal_g: number;
  carbs_goal_g: number;
  fat_goal_g: number;
  protein_consumed_g: number;
  carbs_consumed_g: number;
  fat_consumed_g: number;
  protein_ratio: number;
  carbs_ratio: number;
  fat_ratio: number;
  created_at: string;
  updated_at: string;
  food_entries?: FoodDiaryEntryResponseDto[];
}
