import { UserProfileData } from "@/models/interfaces/UserProfileData";
import { FoodData } from "@/models/interfaces/FoodData";
import { DailyDiaryResponseDto } from "@/models/interfaces/DailyDiaryResponseDto";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { CreateFoodDiaryEntryDto } from "@/models/interfaces/CreateFoodDiaryEntryDto";
import { SearchOptions, SearchResult } from "@/models/interfaces/FoodDataRepository";
import {
  ActivityDiaryResponseDto,
  CreateActivityDiaryDto,
} from "@/models/interfaces/ActivityDiary";
import { DashboardResponseDto } from "@/models/interfaces/DashboardResponseDto";
import {
  CreateStepMeasurementDto,
  StepMeasurementResponseDto,
} from "@/models/interfaces/CreateStepMeasurementDto";
import RestManager from "./restManager";
import { ensureError } from "../methods";

//#region User profile

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
    const response = await restManager.post<UserProfileData>("users/updateProfile", updatedData);
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error(error.message);
    return null;
  }
};

export const saveUserProfile = async (
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

//#endregion

//#region Dashboard

export const fetchDashboardData = async (
  restManager: RestManager
): Promise<DashboardResponseDto | null> => {
  try {
    const response = await restManager.get<DashboardResponseDto>("/dashboard");
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error fetching dashboard data:", error.message);
    return null;
  }
};

//#endregion

//#region Food

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

//#endregion

//#region Diary

// Daily Diary API functions
export const getDailyDiary = async (
  restManager: RestManager,
  date: string
): Promise<DailyDiaryResponseDto | null> => {
  try {
    const response = await restManager.get<DailyDiaryResponseDto>(`/diary?date=${date}`);
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error fetching daily diary:", error.message);
    return null;
  }
};

//#endregion

//#region Diary entries

export const createFoodDiaryEntry = async (
  restManager: RestManager,
  entry: CreateFoodDiaryEntryDto
): Promise<FoodDiaryEntryResponseDto | null> => {
  try {
    const response = await restManager.post<FoodDiaryEntryResponseDto>(
      "/diary/entries",
      entry as any
    );
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error creating food diary entry:", error.message);
    return null;
  }
};

export const deleteFoodDiaryEntry = async (
  restManager: RestManager,
  entryId: string
): Promise<boolean> => {
  try {
    await restManager.delete<{ success: boolean }>(`/diary/entries/${entryId}`);
    return true;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error deleting food diary entry:", error.message);
    return false;
  }
};

//#endregion

//#region Notifications

// Push token registration
export const registerPushToken = async (
  restManager: RestManager,
  pushToken: string,
  deviceId: string,
  deviceName: string
): Promise<boolean> => {
  try {
    await restManager.post("/notifications/register-token", {
      push_token: pushToken,
      device_id: deviceId,
      device_name: deviceName,
    });
    return true;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error registering push token:", error.message);
    return false;
  }
};

//#endregion

//#region Steps

// Step measurement API functions
export const saveStepMeasurement = async (
  restManager: RestManager,
  stepData: CreateStepMeasurementDto
): Promise<StepMeasurementResponseDto | null> => {
  try {
    const response = await restManager.post<StepMeasurementResponseDto>("/steps", stepData as any);
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error saving step measurement:", error.message);
    return null;
  }
};

//#endregion

//#region Activity Diary

// Activity Diary API functions
export const saveActivityDiary = async (
  restManager: RestManager,
  diary: CreateActivityDiaryDto
): Promise<ActivityDiaryResponseDto | null> => {
  try {
    const response = await restManager.post<ActivityDiaryResponseDto>(
      "/diary/activity",
      diary as any
    );
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error saving activity diary:", error.message);
    return null;
  }
};

export const getActivityDiaryByDate = async (
  restManager: RestManager,
  date: string
): Promise<ActivityDiaryResponseDto | null> => {
  try {
    const response = await restManager.get<ActivityDiaryResponseDto>(
      `/diary/activity/date?date=${date}`
    );
    return response.data;
  } catch (exception) {
    const error: Error = ensureError(exception);
    console.error("Error fetching activity diary by date:", error.message);
    return null;
  }
};

//#endregion
