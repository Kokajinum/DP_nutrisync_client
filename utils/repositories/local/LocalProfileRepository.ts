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
      console.log(`LocalProfileRepository: Attempting to get profile with ID ${id} from SQLite`);

      const result = await db.getFirstAsync<UserProfileData>(
        `SELECT * FROM user_profiles WHERE user_id = ?`,
        [id]
      );

      if (!result) {
        console.log(`LocalProfileRepository: No profile found with ID ${id} in SQLite`);
        return null;
      }

      console.log(`LocalProfileRepository: Profile found in SQLite:`, JSON.stringify(result));

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
      console.log(`LocalProfileRepository: Attempting to save profile with ID ${profile.id}`);

      if (!profile.id) {
        console.error("LocalProfileRepository: Cannot save user profile without an ID");
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

      console.log(
        `LocalProfileRepository: Saving profile to SQLite:`,
        JSON.stringify(withTimestamps)
      );

      await db.saveToSqlite("user_profiles", withTimestamps);
      console.log(`LocalProfileRepository: Profile saved successfully to SQLite`);

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
      const existingProfile = await this.get(id);
      if (!existingProfile) {
        throw new Error(`User profile with ID ${id} not found`);
      }

      const updatedProfile: UserProfileData = {
        ...existingProfile,
        ...patch,
        id, // Ensure ID remains the same
        updated_at: new Date().toISOString(), // Update the timestamp
      };

      await this.save(updatedProfile);
    } catch (error) {
      console.error("Error updating user profile in local database:", error);
      throw error;
    }
  }
}
