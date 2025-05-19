import { FoodDiaryEntryResponseDto } from "./FoodDiaryEntryResponseDto";
import { ActivityDiaryEntryResponseDto } from "./ActivityDiary";

export interface UserWeightDto {
  id: string;
  user_id: string;
  weight_kg: number;
  source: string;
  measured_at: string;
  created_at: string;
  updated_at: string;
}

export interface StepMeasurementResponseDto {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  step_count: number;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface AiRecommendationResponseDto {
  id: string;
  user_id: string;
  analyzed_date: string;
  prompt_version: number;
  prompt: string;
  response: string;
  model_used: string;
  error_message: string;
  created_at: string;
  viewed: boolean;
}

export interface DashboardResponseDto {
  recent_food_entries: FoodDiaryEntryResponseDto[];
  recent_activity_entries: ActivityDiaryEntryResponseDto[];
  weight_history_7days: UserWeightDto[];
  weight_history_30days: UserWeightDto[];
  steps_history_7days: StepMeasurementResponseDto[];
  steps_history_30days: StepMeasurementResponseDto[];
  ai_recommendations: AiRecommendationResponseDto[];
}
