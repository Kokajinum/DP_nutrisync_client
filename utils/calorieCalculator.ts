import { ActivityLevelEnum, GenderEnum, GoalEnum } from "@/models/enums/enums";

export const ActivityLevelMultiplier: Record<ActivityLevelEnum, number> = {
  [ActivityLevelEnum.SEDENTARY]: 1.2,
  [ActivityLevelEnum.LIGHT]: 1.375,
  [ActivityLevelEnum.MODERATE]: 1.55,
  [ActivityLevelEnum.HIGH]: 1.725,
  [ActivityLevelEnum.EXTREME]: 1.9,
};

export function getActivityMultiplier(level: ActivityLevelEnum): number {
  const multiplier = ActivityLevelMultiplier[level];
  if (!multiplier) {
    throw new Error(`Neznámá hodnota activity level: ${level}`);
  }
  return multiplier;
}

/**
 * Basic user metrics required for calculations.
 * Weight in kilograms.
 * Height in centimeters.
 */
export interface UserMetrics {
  age: number;
  gender: GenderEnum;
  weight: number; // in kilograms
  height: number; // in centimeters
  activityLevel: ActivityLevelEnum;
}

/**
 * Options for deriving a caloric goal
 */
export interface CaloricGoalOptions {
  goal: GoalEnum;
  /**
   * Adjustment fraction for weight loss or gain (default 0.2 = 20%).
   * How much you lower or raise your intake.
   */
  adjustment?: number;
}

/**
 * Percentage distribution of macronutrients.
 */
export interface MacroDistribution {
  proteinPercent: number;
  fatPercent: number;
  carbsPercent: number;
}

/**
 * Output grams for each macronutrient.
 */
export interface MacroGrams {
  protein: number;
  fat: number;
  carbs: number;
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 * @param metrics - User's age, gender, weight, and height.
 * @returns BMR in kcal/day.
 */
export function calculateBMR(metrics: UserMetrics): number {
  const { age, gender, weight, height } = metrics;
  const base = 10 * weight + 6.25 * height - 5 * age;
  return gender === "male" ? base + 5 : base - 161;
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 * @param metrics - UserMetrics including activity level.
 * @returns TDEE in kcal/day.
 */
export function calculateTDEE(metrics: UserMetrics): number {
  const bmr = calculateBMR(metrics);
  const multiplier = getActivityMultiplier(metrics.activityLevel);
  return Math.round(bmr * multiplier);
}

/**
 * Derives daily caloric goal by calculating TDEE and applying user objective.
 * @param metrics - UserMetrics including activity level.
 * @param options - Goal type and optional adjustment fraction.
 * @returns Daily calorie target in kcal.
 */
export function calculateCaloricGoal(metrics: UserMetrics, options: CaloricGoalOptions): number {
  const tdee = calculateTDEE(metrics);
  const { goal, adjustment = 0.2 } = options;
  switch (goal) {
    case GoalEnum.LOSE_FAT:
      return Math.round(tdee * (1 - adjustment));
    case GoalEnum.GAIN_MUSCLE:
      return Math.round(tdee * (1 + adjustment));
    case GoalEnum.MAINTAIN_WEIGHT:
    default:
      return tdee;
  }
}

/**
 * Converts caloric goal and macro percentages into grams.
 * @param caloricGoal - Daily calorie target.
 * @param distribution - Percentage of calories from protein, fat, carbs.
 * @returns MacroGrams with protein, fat, and carbs in grams.
 * @throws Error if percentages do not sum to 100.
 */
export function calculateMacroGrams(
  caloricGoal: number,
  distribution: MacroDistribution
): MacroGrams {
  const { proteinPercent, fatPercent, carbsPercent } = distribution;
  const total = proteinPercent + fatPercent + carbsPercent;
  if (total !== 100) {
    throw new Error(`Macro percentages must sum to 100 (currently ${total}).`);
  }

  const proteinCalories = (proteinPercent / 100) * caloricGoal;
  const fatCalories = (fatPercent / 100) * caloricGoal;
  const carbsCalories = (carbsPercent / 100) * caloricGoal;

  return {
    protein: Math.round(proteinCalories / 4),
    fat: Math.round(fatCalories / 9),
    carbs: Math.round(carbsCalories / 4),
  };
}
