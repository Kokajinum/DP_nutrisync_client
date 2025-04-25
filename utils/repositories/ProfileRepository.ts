import { UserProfileData } from "../../models/interfaces/UserProfileData";
import { UserProfileRepository } from "./UserProfileDataRepository";
import { LocalProfileRepository } from "./LocalProfileRepository";
import { RemoteProfileRepository } from "./RemoteProfileRepository";

/**
 * A composite repository that combines local and remote repositories
 * Provides offline support and synchronization between local and remote data
 */
export class ProfileRepository implements UserProfileRepository {
  private localRepository: LocalProfileRepository;
  private remoteRepository: RemoteProfileRepository;

  constructor(localRepository: LocalProfileRepository, remoteRepository: RemoteProfileRepository) {
    this.localRepository = localRepository;
    this.remoteRepository = remoteRepository;
  }

  /**
   * Retrieves a user profile by ID
   * Tries to get from remote first, then falls back to local if remote fails
   * @param id The ID of the user profile to retrieve
   * @returns The user profile data or null if not found
   */
  async get(id: string): Promise<UserProfileData | null> {
    try {
      // Try to get from remote first
      const remoteProfile = await this.remoteRepository.get(id);

      if (remoteProfile) {
        // If remote succeeds, update local and return remote data
        await this.localRepository.save(remoteProfile);
        return remoteProfile;
      }

      // If remote returns null, fall back to local
      return this.localRepository.get(id);
    } catch (error) {
      console.error("Error in composite get:", error);
      // Fall back to local on error
      return this.localRepository.get(id);
    }
  }

  /**
   * Saves a user profile to both remote and local repositories
   * @param profile The user profile data to save
   */
  async save(profile: UserProfileData): Promise<void> {
    try {
      // Save to remote first
      await this.remoteRepository.save(profile);

      // Then save to local regardless of remote success
      await this.localRepository.save(profile);
    } catch (error) {
      console.error("Error in remote save:", error);
      // Still try to save locally even if remote fails
      await this.localRepository.save(profile);
      throw error;
    }
  }

  /**
   * Updates specific fields of a user profile in both remote and local repositories
   * @param id The ID of the user profile to update
   * @param patch The partial user profile data to update
   */
  async update(id: string, patch: Partial<UserProfileData>): Promise<void> {
    try {
      // Update remote first
      await this.remoteRepository.update(id, patch);

      // Then update local
      await this.localRepository.update(id, patch);
    } catch (error) {
      console.error("Error in remote update:", error);
      // Still try to update locally even if remote fails
      await this.localRepository.update(id, patch);
      throw error;
    }
  }
}
