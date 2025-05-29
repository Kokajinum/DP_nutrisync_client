import { FoodData } from "@/models/interfaces/FoodData";
import {
  FoodRepository,
  SearchOptions,
  SearchResult,
} from "../../models/interfaces/FoodDataRepository";
import { LocalFoodRepository } from "./local/LocalFoodRepository";
import { RemoteFoodRepository } from "./remote/RemoteFoodRepository";

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
      const remoteFood = await this.remoteRepository.get(id);

      if (remoteFood) {
        await this.localRepository.save(remoteFood);
        return remoteFood;
      }

      return this.localRepository.get(id);
    } catch (error) {
      console.error("Error in composite get:", error);
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
      const remoteResult = await this.remoteRepository.search(options);

      if (remoteResult && remoteResult.items.length > 0) {
        for (const food of remoteResult.items) {
          if (food.id) {
            await this.localRepository.save(food);
          }
        }
        return remoteResult;
      }

      return this.localRepository.search(options);
    } catch (error) {
      console.error("Error in composite search:", error);
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
      const savedFood = await this.remoteRepository.save(food);

      if (savedFood) {
        await this.localRepository.save(savedFood);
        return savedFood;
      }

      return this.localRepository.save(food);
    } catch (error) {
      console.error("Error in remote save:", error);
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
      await this.remoteRepository.update(id, patch);

      await this.localRepository.update(id, patch);
    } catch (error) {
      console.error("Error in remote update:", error);
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
      await this.remoteRepository.delete(id);

      await this.localRepository.delete(id);
    } catch (error) {
      console.error("Error in remote delete:", error);
      await this.localRepository.delete(id);
      throw error;
    }
  }
}
