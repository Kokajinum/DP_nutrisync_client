import { UserProfileData } from "../../../models/interfaces/UserProfileData";
import { UserProfileRepository } from "../../../models/interfaces/UserProfileDataRepository";
import { db, normalizeForSqlite } from "../../sqliteHelper";

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

      const withTimestamps: UserProfileData = {
        ...profile,
        created_at: created_at,
        updated_at: updated_at,
      };

      //const normalizedData = normalizeForSqlite(withTimestamps);
      await db.saveToSqlite("user_profiles", withTimestamps);

      return withTimestamps;
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
