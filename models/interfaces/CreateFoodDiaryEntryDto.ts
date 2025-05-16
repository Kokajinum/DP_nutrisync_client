import { MealTypeEnum } from "../enums/enums";

export interface CreateFoodDiaryEntryDto {
  food_id: string;
  food_name: string;
  brand?: string;
  meal_type: MealTypeEnum;
  serving_size: number;
  serving_unit: "g" | "ml";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entry_date?: string; // If not provided, current date will be used
}
