import { FoodData } from "@/models/interfaces/FoodData";
import {
  FoodRepository,
  SearchOptions,
  SearchResult,
} from "../../../models/interfaces/FoodDataRepository";
import RestManager from "../../api/restManager";
import { fetchFood, searchFoods, saveFood, updateFood, deleteFood } from "../../api/apiClient";

export class RemoteFoodRepository implements FoodRepository {
  private restManager: RestManager;

  constructor(restManager: RestManager) {
    this.restManager = restManager;
  }

  /**
   * Retrieves a food item by ID from the remote API
   * @param id The ID of the food item to retrieve
   * @returns The food data or null if not found
   */
  async get(id: string): Promise<FoodData | null> {
    try {
      return await fetchFood(this.restManager, id);
    } catch (error) {
      console.error("Error retrieving food from remote API:", error);
      return null;
    }
  }

  /**
   * Searches for food items in the remote API with pagination
   * @param options Search options including pagination and query
   * @returns Search result with items and pagination info
   */
  async search(options: SearchOptions): Promise<SearchResult<FoodData>> {
    try {
      return await searchFoods(this.restManager, options);
    } catch (error) {
      console.error("Error searching foods from remote API:", error);
      return {
        items: [],
        totalCount: 0,
        page: options.page || 1,
        limit: options.limit || 10,
        hasMore: false,
      };
    }
  }

  /**
   * This method is primarily for the local repository
   * In the remote repository, it's implemented as a fallback
   * @returns Empty array as this should not be used in remote context
   */
  async getAllLocal(): Promise<FoodData[]> {
    console.warn("getAllLocal called on RemoteFoodRepository - this is not recommended");
    return [];
  }

  /**
   * Saves a food item to the remote API
   * @param food The food data to save
   * @returns The saved food data with any server-side modifications
   */
  async save(food: FoodData): Promise<FoodData | null> {
    try {
      // Create a new object without the fields not expected by the backend
      const { id, created_at, updated_at, ...foodForBackend } = food;

      return await saveFood(this.restManager, foodForBackend as FoodData);
    } catch (error) {
      console.error("Error saving food to remote API:", error);
      throw error;
    }
  }

  /**
   * Updates specific fields of a food item in the remote API
   * @param id The ID of the food item to update
   * @param patch The partial food data to update
   */
  async update(id: string, patch: Partial<FoodData>): Promise<void> {
    try {
      // Create a new object without the fields not expected by the backend
      const { id: patchId, created_at, updated_at, ...patchForBackend } = patch;

      await updateFood(this.restManager, id, patchForBackend);
    } catch (error) {
      console.error("Error updating food in remote API:", error);
      throw error;
    }
  }

  /**
   * Deletes a food item from the remote API
   * @param id The ID of the food item to delete
   */
  async delete(id: string): Promise<void> {
    try {
      await deleteFood(this.restManager, id);
    } catch (error) {
      console.error("Error deleting food from remote API:", error);
      throw error;
    }
  }
}
