import { MealTypeEnum } from "../enums/enums";

export interface FoodDiaryEntryResponseDto {
  id: string;
  user_id: string;
  day_id: string;
  food_id: string;
  food_name: string;
  brand: string;
  meal_type: MealTypeEnum;
  serving_size: number;
  serving_unit: "g" | "ml";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
  updated_at: string;
}
