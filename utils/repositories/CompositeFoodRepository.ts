import { FoodData } from "@/models/interfaces/FoodData";
import {
  FoodRepository,
  SearchOptions,
  SearchResult,
} from "../../models/interfaces/FoodDataRepository";
import { LocalFoodRepository } from "./local/LocalFoodRepository";
import { RemoteFoodRepository } from "./remote/RemoteFoodRepository";

/**
 * A composite repository that combines local and remote repositories for food data
 * Provides offline support and synchronization between local and remote data
 */
export class CompositeFoodRepository implements FoodRepository {
  private localRepository: LocalFoodRepository;
  private remoteRepository: RemoteFoodRepository;

  constructor(localRepository: LocalFoodRepository, remoteRepository: RemoteFoodRepository) {
    this.localRepository = localRepository;
    this.remoteRepository = remoteRepository;
  }

  /**
   * Retrieves a food item by ID
   * Tries to get from remote first, then falls back to local if remote fails
   * @param id The ID of the food item to retrieve
   * @returns The food data or null if not found
   */
  async get(id: string): Promise<FoodData | null> {
    try {
      // Try to get from remote first
      const remoteFood = await this.remoteRepository.get(id);

      if (remoteFood) {
        // If remote succeeds, update local and return remote data
        await this.localRepository.save(remoteFood);
        return remoteFood;
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
   * Searches for food items with pagination
   * Tries to search from remote first, then falls back to local if remote fails
   * @param options Search options including pagination and query
   * @returns Search result with items and pagination info
   */
  async search(options: SearchOptions): Promise<SearchResult<FoodData>> {
    try {
      // Try to search from remote first
      const remoteResult = await this.remoteRepository.search(options);

      if (remoteResult && remoteResult.items.length > 0) {
        // If remote succeeds, update local for each food item
        for (const food of remoteResult.items) {
          if (food.id) {
            await this.localRepository.save(food);
          }
        }
        return remoteResult;
      }

      // If remote returns empty result, fall back to local
      return this.localRepository.search(options);
    } catch (error) {
      console.error("Error in composite search:", error);
      // Fall back to local on error
      return this.localRepository.search(options);
    }
  }

  /**
   * Retrieves all food items from local storage
   * This is only for offline use when we need all items without pagination
   * @returns Array of food data from local storage
   */
  async getAllLocal(): Promise<FoodData[]> {
    return this.localRepository.getAllLocal();
  }

  /**
   * Saves a food item to both remote and local repositories
   * @param food The food data to save
   * @returns The saved food data with any server-side modifications
   */
  async save(food: FoodData): Promise<FoodData | null> {
    try {
      // Save to remote first
      const savedFood = await this.remoteRepository.save(food);

      if (savedFood) {
        // If remote succeeds, save to local with the data returned from remote
        await this.localRepository.save(savedFood);
        return savedFood;
      }

      // If remote returns null, still try to save locally
      return this.localRepository.save(food);
    } catch (error) {
      console.error("Error in remote save:", error);
      // Still try to save locally even if remote fails
      return this.localRepository.save(food);
    }
  }

  /**
   * Updates specific fields of a food item in both remote and local repositories
   * @param id The ID of the food item to update
   * @param patch The partial food data to update
   */
  async update(id: string, patch: Partial<FoodData>): Promise<void> {
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

  /**
   * Deletes a food item from both remote and local repositories
   * @param id The ID of the food item to delete
   */
  async delete(id: string): Promise<void> {
    try {
      // Delete from remote first
      await this.remoteRepository.delete(id);

      // Then delete from local
      await this.localRepository.delete(id);
    } catch (error) {
      console.error("Error in remote delete:", error);
      // Still try to delete locally even if remote fails
      await this.localRepository.delete(id);
      throw error;
    }
  }
}
