import { FoodData } from "@/models/interfaces/FoodData";
import { FoodRepository, SearchOptions, SearchResult } from "./FoodDataRepository";
import { db } from "../sqliteHelper";

export class LocalFoodRepository implements FoodRepository {
  /**
   * Retrieves a food item by ID from the local SQLite database
   * @param id The ID of the food item to retrieve
   * @returns The food data or null if not found
   */
  async get(id: string): Promise<FoodData | null> {
    try {
      const result = await db.getFirstAsync<FoodData>(`SELECT * FROM foods WHERE id = ?`, [id]);

      if (!result) {
        return null;
      }

      return result;
    } catch (error) {
      console.error("Error retrieving food from local database:", error);
      return null;
    }
  }

  /**
   * Searches for food items in the local SQLite database
   * @param options Search options including pagination and query
   * @returns Search result with items and pagination info
   */
  async search(options: SearchOptions): Promise<SearchResult<FoodData>> {
    try {
      const { page = 1, limit = 10, query = "" } = options;
      const offset = (page - 1) * limit;

      let queryParams: any[] = [];
      let whereClause = "";

      if (query) {
        whereClause = "WHERE name LIKE ?";
        queryParams.push(`%${query}%`);
      }

      // Get total count for pagination
      const countResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM foods ${whereClause}`,
        queryParams
      );

      const totalCount = countResult?.count || 0;

      // Get paginated results
      const items = await db.getAllAsync<FoodData>(
        `SELECT * FROM foods ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      );

      return {
        items: items || [],
        totalCount,
        page,
        limit,
        hasMore: offset + items.length < totalCount,
      };
    } catch (error) {
      console.error("Error searching foods in local database:", error);
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
   * Retrieves all food items from the local SQLite database
   * Only for offline use when we need all items without pagination
   * @returns Array of food data
   */
  async getAllLocal(): Promise<FoodData[]> {
    try {
      const results = await db.getAllAsync<FoodData>(
        `SELECT * FROM foods ORDER BY created_at DESC`
      );

      return results || [];
    } catch (error) {
      console.error("Error retrieving all foods from local database:", error);
      return [];
    }
  }

  /**
   * Saves a food item to the local SQLite database
   * @param food The food data to save
   * @returns The saved food data with timestamps
   */
  async save(food: FoodData): Promise<FoodData | null> {
    try {
      // Ensure we have an ID
      if (!food.id) {
        throw new Error("Cannot save food without an ID");
      }

      // Set timestamps
      const now = new Date().toISOString();
      const created_at = food.created_at || now;
      const updated_at = now;

      const withTimestamps: FoodData = {
        ...food,
        created_at: created_at,
        updated_at: updated_at,
      };

      await db.saveToSqlite("foods", withTimestamps);

      return withTimestamps;
    } catch (error) {
      console.error("Error saving food to local database:", error);
      throw error;
    }
  }

  /**
   * Updates specific fields of a food item in the local SQLite database
   * @param id The ID of the food item to update
   * @param patch The partial food data to update
   */
  async update(id: string, patch: Partial<FoodData>): Promise<void> {
    try {
      // First get the existing food
      const existingFood = await this.get(id);
      if (!existingFood) {
        throw new Error(`Food with ID ${id} not found`);
      }

      // Merge the existing food with the patch
      const updatedFood: FoodData = {
        ...existingFood,
        ...patch,
        id, // Ensure ID remains the same
        updated_at: new Date().toISOString(), // Update the timestamp
      };

      // Save the updated food
      await this.save(updatedFood);
    } catch (error) {
      console.error("Error updating food in local database:", error);
      throw error;
    }
  }

  /**
   * Deletes a food item from the local SQLite database
   * @param id The ID of the food item to delete
   */
  async delete(id: string): Promise<void> {
    try {
      await db.runAsync(`DELETE FROM foods WHERE id = ?`, [id]);
    } catch (error) {
      console.error("Error deleting food from local database:", error);
      throw error;
    }
  }
}
