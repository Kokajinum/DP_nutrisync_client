import {
  ActivityLevelEnum,
  ExperienceLevelEnum,
  GenderEnum,
  GoalEnum,
  HeightUnitEnum,
  WeightUnitEnum,
} from "../enums/enums";

/**
 * Data transfer object for updating user profile
 * All fields are optional to allow partial updates
 */
export interface UpdateUserProfileDto {
  first_name?: string;
  last_name?: string;
  age?: number;
  gender?: GenderEnum;
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
  protein_ratio?: number;
  fat_ratio?: number;
  carbs_ratio?: number;
  notifications_enabled?: boolean;
}
