// import { FoodDiaryEntry } from "@/models/interfaces/FoodDiaryEntry";
// import {
//   FoodDiaryEntryRepository,
//   SearchOptions,
//   SearchResult,
// } from "../../../models/interfaces/FoodDiaryEntryDataRepository";
// import RestManager from "../../api/restManager";
// import {
//   fetchFoodDiaryEntry,
//   fetchFoodDiaryEntriesByDate,
//   searchFoodDiaryEntries,
//   saveFoodDiaryEntry,
//   updateFoodDiaryEntry,
//   deleteFoodDiaryEntry,
// } from "../../api/apiClient";

// export class RemoteFoodDiaryEntryRepository implements FoodDiaryEntryRepository {
//   private restManager: RestManager;

//   constructor(restManager: RestManager) {
//     this.restManager = restManager;
//   }

//   /**
//    * Retrieves a food diary entry by ID from the remote API
//    * @param id The ID of the food diary entry to retrieve
//    * @returns The food diary entry or null if not found
//    */
//   async get(id: string): Promise<FoodDiaryEntry | null> {
//     try {
//       return await fetchFoodDiaryEntry(this.restManager, id);
//     } catch (error) {
//       console.error("Error retrieving food diary entry from remote API:", error);
//       return null;
//     }
//   }

//   /**
//    * Retrieves all food diary entries for a specific date from the remote API
//    * @param date The date in ISO format (YYYY-MM-DD)
//    * @returns Array of food diary entries for the specified date
//    */
//   async getByDate(date: string): Promise<FoodDiaryEntry[]> {
//     try {
//       return await fetchFoodDiaryEntriesByDate(this.restManager, date);
//     } catch (error) {
//       console.error("Error retrieving food diary entries by date from remote API:", error);
//       return [];
//     }
//   }

//   /**
//    * Searches for food diary entries in the remote API with pagination
//    * @param options Search options including pagination, date, and meal type
//    * @returns Search result with items and pagination info
//    */
//   async search(options: SearchOptions): Promise<SearchResult<FoodDiaryEntry>> {
//     try {
//       return await searchFoodDiaryEntries(this.restManager, options);
//     } catch (error) {
//       console.error("Error searching food diary entries from remote API:", error);
//       return {
//         items: [],
//         totalCount: 0,
//         page: options.page || 1,
//         limit: options.limit || 10,
//         hasMore: false,
//       };
//     }
//   }

//   /**
//    * This method is primarily for the local repository
//    * In the remote repository, it's implemented as a fallback
//    * @returns Empty array as this should not be used in remote context
//    */
//   async getAllLocal(): Promise<FoodDiaryEntry[]> {
//     console.warn("getAllLocal called on RemoteFoodDiaryEntryRepository - this is not recommended");
//     return [];
//   }

//   /**
//    * Saves a food diary entry to the remote API
//    * @param entry The food diary entry to save
//    * @returns The saved food diary entry with any server-side modifications
//    */
//   async save(entry: FoodDiaryEntry): Promise<FoodDiaryEntry | null> {
//     try {
//       // Create a new object without the fields not expected by the backend
//       const { id, created_at, updated_at, ...entryForBackend } = entry;

//       // Send only the expected fields to the backend
//       return await saveFoodDiaryEntry(this.restManager, entryForBackend as FoodDiaryEntry);
//     } catch (error) {
//       console.error("Error saving food diary entry to remote API:", error);
//       throw error;
//     }
//   }

//   /**
//    * Updates specific fields of a food diary entry in the remote API
//    * @param id The ID of the food diary entry to update
//    * @param patch The partial food diary entry data to update
//    */
//   async update(id: string, patch: Partial<FoodDiaryEntry>): Promise<void> {
//     try {
//       // Create a new object without the fields not expected by the backend
//       const { id: patchId, created_at, updated_at, ...patchForBackend } = patch;

//       // Send only the expected fields to the backend
//       await updateFoodDiaryEntry(this.restManager, id, patchForBackend);
//     } catch (error) {
//       console.error("Error updating food diary entry in remote API:", error);
//       throw error;
//     }
//   }

//   /**
//    * Deletes a food diary entry from the remote API
//    * @param id The ID of the food diary entry to delete
//    */
//   async delete(id: string): Promise<void> {
//     try {
//       await deleteFoodDiaryEntry(this.restManager, id);
//     } catch (error) {
//       console.error("Error deleting food diary entry from remote API:", error);
//       throw error;
//     }
//   }
// }
