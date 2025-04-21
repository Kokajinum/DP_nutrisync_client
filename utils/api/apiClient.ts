import { UserProfileData } from "@/models/interfaces/UserProfileData";
import RestManager from "./restManager";
import { ensureError } from "../methods";

export const fetchUserProfile = async (
  restManager: RestManager
): Promise<UserProfileData | null> => {
  try {
    const response = await restManager.get<UserProfileData>("/users/profile");
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error(error.message);
    return null;
  }
};

export const updateUserProfile = async (
  restManager: RestManager,
  updatedData: Partial<UserProfileData>
): Promise<UserProfileData | null> => {
  try {
    const response = await restManager.post<UserProfileData>("users/profile", updatedData);
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error(error.message);
    return null;
  }
};
