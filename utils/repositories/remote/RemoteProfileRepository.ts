import { UserProfileData } from "../../../models/interfaces/UserProfileData";
import { UserProfileRepository } from "../../../models/interfaces/UserProfileDataRepository";
import RestManager from "../../api/restManager";
import { fetchUserProfile, updateUserProfile } from "../../api/apiClient";

export class RemoteProfileRepository implements UserProfileRepository {
  private restManager: RestManager;

  constructor(restManager: RestManager) {
    this.restManager = restManager;
  }

  /**
   * Retrieves a user profile by ID from the remote API
   * @param id The ID of the user profile to retrieve (not used in current API implementation)
   * @returns The user profile data or null if not found
   */
  async get(id: string): Promise<UserProfileData | null> {
    try {
      // Note: The current fetchUserProfile doesn't use the id parameter
      // but we're keeping the interface consistent
      return await fetchUserProfile(this.restManager);
    } catch (error) {
      console.error("Error retrieving user profile from remote API:", error);
      return null;
    }
  }

  /**
   * Saves a user profile to the remote API
   * @param profile The user profile data to save
   */
  async save(profile: UserProfileData): Promise<UserProfileData | null> {
    try {
      const data: UserProfileData | null = await updateUserProfile(this.restManager, profile);
      return data;
    } catch (error) {
      console.error("Error saving user profile to remote API:", error);
      throw error;
    }
  }

  /**
   * Updates specific fields of a user profile in the remote API
   * @param id The ID of the user profile to update (not used in current API implementation)
   * @param patch The partial user profile data to update
   */
  async update(id: string, patch: Partial<UserProfileData>): Promise<void> {
    try {
      await updateUserProfile(this.restManager, patch);
    } catch (error) {
      console.error("Error updating user profile in remote API:", error);
      throw error;
    }
  }
}
