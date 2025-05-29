import { UserProfileData } from "../../models/interfaces/UserProfileData";
import { UserProfileRepository } from "../../models/interfaces/UserProfileDataRepository";
import { LocalProfileRepository } from "./local/LocalProfileRepository";
import { RemoteProfileRepository } from "./remote/RemoteProfileRepository";
import NetInfo from "@react-native-community/netinfo";

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
      const netState = await NetInfo.fetch();

      if (netState.isConnected && netState.isInternetReachable) {
        const remoteProfile = await this.remoteRepository.get(id);

        if (remoteProfile) {
          await this.localRepository.save(remoteProfile);
          return remoteProfile;
        }
      }

      const localProfile = await this.localRepository.get(id);
      return localProfile;
    } catch (error) {
      console.log("ProfileRepository: Error fetching from remote, falling back to local");
      const localProfile = await this.localRepository.get(id);
      return localProfile;
    }
  }

  /**
   * Saves a user profile to both remote and local repositories
   * @param profile The user profile data to save
   */
  async save(profile: UserProfileData): Promise<UserProfileData | null> {
    try {
      const newData: UserProfileData | null = await this.remoteRepository.save(profile);

      if (newData !== null) await this.localRepository.save(newData);

      return newData;
    } catch (error) {
      console.error("Error in remote save:", error);
      const newData: UserProfileData | null = await this.localRepository.save(profile);
      return newData;
    }
  }

  /**
   * Updates specific fields of a user profile in both remote and local repositories
   * @param id The ID of the user profile to update
   * @param patch The partial user profile data to update
   */
  async update(id: string, patch: Partial<UserProfileData>): Promise<void> {
    try {
      await this.remoteRepository.update(id, patch);

      await this.localRepository.update(id, patch);
    } catch (error) {
      console.error("Error in remote update:", error);
      await this.localRepository.update(id, patch);
      throw error;
    }
  }
}
