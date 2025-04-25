import {
  ActivityLevelEnum,
  CalorieUnitEnum,
  ExperienceLevelEnum,
  GoalEnum,
  HeightUnitEnum,
  WeightUnitEnum,
} from "../enums/enums";

export interface UserProfileData {
  id?: string;

  created_at?: string;

  updated_at?: string;

  user_id?: string;

  onboarding_completed?: boolean;

  first_name?: string;

  last_name?: string;

  age?: number;

  height_value?: number;

  height_unit?: HeightUnitEnum;

  weight_value?: number;

  weight_unit?: WeightUnitEnum;

  target_weight_value?: number;

  target_weight_unit?: WeightUnitEnum;

  activity_level?: ActivityLevelEnum;

  experience_level?: ExperienceLevelEnum;

  goal?: GoalEnum;

  calorie_goal_value?: number;

  calorie_goal_unit?: CalorieUnitEnum;

  protein_ratio?: number;

  fat_ratio?: number;

  carbs_ratio?: number;

  notifications_enabled?: boolean;
}
