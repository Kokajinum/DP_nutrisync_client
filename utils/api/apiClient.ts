import { UserProfileData } from "@/models/interfaces/UserProfileData";
import { FoodData } from "@/models/interfaces/FoodData";
import { SearchOptions, SearchResult } from "@/utils/repositories/FoodDataRepository";
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

export const fetchFood = async (restManager: RestManager, id: string): Promise<FoodData | null> => {
  try {
    const response = await restManager.get<FoodData>(`/foods/${id}`);
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error fetching food:", error.message);
    return null;
  }
};

export const searchFoods = async (
  restManager: RestManager,
  options: SearchOptions
): Promise<SearchResult<FoodData>> => {
  try {
    const { page = 1, limit = 10, query = "" } = options;
    const queryParams = new URLSearchParams();

    queryParams.append("page", page.toString());
    queryParams.append("limit", limit.toString());
    if (query) {
      queryParams.append("query", query);
    }

    const response = await restManager.get<SearchResult<FoodData>>(
      `/foods/search?${queryParams.toString()}`
    );
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error searching foods:", error.message);
    return {
      items: [],
      totalCount: 0,
      page: options.page || 1,
      limit: options.limit || 10,
      hasMore: false,
    };
  }
};

export const saveFood = async (
  restManager: RestManager,
  food: FoodData
): Promise<FoodData | null> => {
  try {
    const response = await restManager.post<FoodData>("/foods", food);
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error saving food:", error.message);
    return null;
  }
};

export const updateFood = async (
  restManager: RestManager,
  id: string,
  patch: Partial<FoodData>
): Promise<void> => {
  try {
    await restManager.put<any>(`/foods/${id}`, patch);
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error updating food:", error.message);
    throw error;
  }
};

export const deleteFood = async (restManager: RestManager, id: string): Promise<void> => {
  try {
    await restManager.delete<void>(`/foods/${id}`);
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error deleting food:", error.message);
    throw error;
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
