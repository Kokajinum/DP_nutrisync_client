import { UserProfileData } from "../../models/interfaces/UserProfileData";
import { UserProfileRepository } from "./UserProfileDataRepository";
import { db, normalizeForSqlite } from "../sqliteHelper";

export class LocalProfileRepository implements UserProfileRepository {
  /**
   * Retrieves a user profile by ID from the local SQLite database
   * @param id The ID of the user profile to retrieve
   * @returns The user profile data or null if not found
   */
  async get(id: string): Promise<UserProfileData | null> {
    try {
      const result = await db.getFirstAsync<UserProfileData>(
        `SELECT * FROM user_profiles WHERE id = ?`,
        [id]
      );

      if (!result) {
        return null;
      }

      // Convert integer values to booleans
      return {
        ...result,
        onboarding_completed: result.onboarding_completed
          ? Boolean(result.onboarding_completed)
          : undefined,
        notifications_enabled: result.notifications_enabled
          ? Boolean(result.notifications_enabled)
          : undefined,
      };
    } catch (error) {
      console.error("Error retrieving user profile from local database:", error);
      return null;
    }
  }

  /**
   * Saves a user profile to the local SQLite database
   * @param profile The user profile data to save
   */
  async save(profile: UserProfileData): Promise<UserProfileData | null> {
    try {
      // Ensure we have an ID
      if (!profile.id) {
        throw new Error("Cannot save user profile without an ID");
      }

      // Set timestamps
      const now = new Date().toISOString();
      const created_at = profile.created_at || now;
      const updated_at = now;

      // Convert boolean values to integers for SQLite
      // const onboarding_completed =
      //   profile.onboarding_completed !== undefined ? (profile.onboarding_completed ? 1 : 0) : null;
      // const notifications_enabled =
      //   profile.notifications_enabled !== undefined
      //     ? profile.notifications_enabled
      //       ? 1
      //       : 0
      //     : null;

      const withTimestamps: UserProfileData = {
        ...profile,
        created_at: created_at,
        updated_at: updated_at,
      };

      //const normalizedData = normalizeForSqlite(withTimestamps);
      await db.saveToSqlite("user_profiles", withTimestamps);

      return withTimestamps;

      // Convert undefined values to null for SQLite
      // const params = [
      //   profile.id,
      //   created_at,
      //   updated_at,
      //   profile.user_id || null,
      //   onboarding_completed,
      //   profile.first_name || null,
      //   profile.last_name || null,
      //   profile.age || null,
      //   profile.height_value || null,
      //   profile.height_unit || null,
      //   profile.weight_value || null,
      //   profile.weight_unit || null,
      //   profile.target_weight_value || null,
      //   profile.target_weight_unit || null,
      //   profile.activity_level || null,
      //   profile.goal || null,
      //   profile.calorie_goal_value || null,
      //   profile.calorie_goal_unit || null,
      //   profile.protein_ratio || null,
      //   profile.fat_ratio || null,
      //   profile.carbs_ratio || null,
      //   notifications_enabled,
      // ];

      // const recordToSave: Record<string, any> = {
      //   id: profile.id,
      //   created_at: created_at,
      //   updated_at: updated_at,
      //   user_id: profile.user_id ?? null,
      //   onboarding_completed: onboarding_completed,
      //   first_name: profile.first_name ?? null,
      //   last_name: profile.last_name ?? null,
      //   age: profile.age ?? null,
      //   height_value: profile.height_value ?? null,
      //   height_unit: profile.height_unit ?? null,
      //   weight_value: profile.weight_value ?? null,
      //   weight_unit: profile.weight_unit ?? null,
      //   target_weight_value: profile.target_weight_value ?? null,
      //   target_weight_unit: profile.target_weight_unit ?? null,
      //   activity_level: profile.activity_level ?? null,
      //   experience_level: profile.experience_level ?? null,
      //   goal: profile.goal ?? null,
      //   calorie_goal_value: profile.calorie_goal_value ?? null,
      //   calorie_goal_unit: profile.calorie_goal_unit ?? null,
      //   protein_ratio: profile.protein_ratio ?? null,
      //   fat_ratio: profile.fat_ratio ?? null,
      //   carbs_ratio: profile.carbs_ratio ?? null,
      //   notifications_enabled: notifications_enabled,
      // };

      // await db.saveToSqlite("user_profiles", recordToSave);

      // Use INSERT OR REPLACE to handle both new and existing records
      // await db.runAsync(
      //   `INSERT OR REPLACE INTO user_profiles (
      //     id, created_at, updated_at, user_id, onboarding_completed,
      //     first_name, last_name, age, height_value, height_unit,
      //     weight_value, weight_unit, target_weight_value, target_weight_unit,
      //     activity_level, goal, calorie_goal_value, calorie_goal_unit,
      //     protein_ratio, fat_ratio, carbs_ratio, notifications_enabled
      //   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      //   params
      // );
    } catch (error) {
      console.error("Error saving user profile to local database:", error);
      throw error;
    }
  }

  /**
   * Updates specific fields of a user profile in the local SQLite database
   * @param id The ID of the user profile to update
   * @param patch The partial user profile data to update
   */
  async update(id: string, patch: Partial<UserProfileData>): Promise<void> {
    try {
      // First get the existing profile
      const existingProfile = await this.get(id);
      if (!existingProfile) {
        throw new Error(`User profile with ID ${id} not found`);
      }

      // Merge the existing profile with the patch
      const updatedProfile: UserProfileData = {
        ...existingProfile,
        ...patch,
        id, // Ensure ID remains the same
        updated_at: new Date().toISOString(), // Update the timestamp
      };

      // Save the updated profile
      await this.save(updatedProfile);
    } catch (error) {
      console.error("Error updating user profile in local database:", error);
      throw error;
    }
  }
}
