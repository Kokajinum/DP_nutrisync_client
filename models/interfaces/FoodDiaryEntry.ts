import { MealTypeEnum } from "../enums/enums";

export interface FoodDiaryEntry {
  id?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  date: string; // ISO string for the day
  food_id: string;
  food_name: string;
  brand?: string;
  meal_type: MealTypeEnum;
  serving_size: number;
  serving_unit: "g" | "ml";
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
