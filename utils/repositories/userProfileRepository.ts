import { UserProfileData } from "@/models/interfaces/UserProfileData";
import { fetchUserProfile, updateUserProfile } from "@/utils/api/apiClient";
import RestManager from "@/utils/api/restManager";
import { useOnboardingStore } from "@/stores/onboardingStore";

export class UserProfileRepository {
  private restManager: RestManager;

  constructor(restManager: RestManager) {
    this.restManager = restManager;
  }

  /**
   * Saves the user profile data to the server
   * @param profileData The profile data to save
   * @returns The saved profile data or null if there was an error
   */
  async saveProfile(profileData: Partial<UserProfileData>): Promise<UserProfileData | null> {
    return updateUserProfile(this.restManager, profileData);
  }

  /**
   * Fetches the user profile data from the server
   * @returns The user profile data or null if there was an error
   */
  async fetchProfile(): Promise<UserProfileData | null> {
    return fetchUserProfile(this.restManager);
  }

  /**
   * Saves the user profile data to the server and then refreshes it
   * This is useful when the server might transform the data (e.g., calculate macros)
   * @param profileData The profile data to save
   * @returns The refreshed profile data or null if there was an error
   */
  async saveAndRefreshProfile(
    profileData: Partial<UserProfileData>
  ): Promise<UserProfileData | null> {
    // First save the profile
    const savedProfile = await this.saveProfile(profileData);
    if (!savedProfile) {
      return null;
    }

    // Then refresh the profile data
    const refreshedProfile = await this.fetchProfile();

    // Update the store with the refreshed data
    if (refreshedProfile) {
      const { updateData } = useOnboardingStore.getState();
      updateData(refreshedProfile);
    }

    return refreshedProfile;
  }
}
