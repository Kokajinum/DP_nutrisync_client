import { UserProfileData } from "@/models/interfaces/UserProfileData";

export interface UserProfileRepository {
  get(id: string): Promise<UserProfileData | null>;
  save(profile: UserProfileData): Promise<void>;
  update(id: string, patch: Partial<UserProfileData>): Promise<void>;
}
