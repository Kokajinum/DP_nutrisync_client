// import { FoodDiaryEntry } from "@/models/interfaces/FoodDiaryEntry";
// import {
//   FoodDiaryEntryRepository,
//   SearchOptions,
//   SearchResult,
// } from "../../../models/interfaces/FoodDiaryEntryDataRepository";
// import { db, foodDiaryEntrySchema } from "../../sqliteHelper";

// export class LocalFoodDiaryEntryRepository implements FoodDiaryEntryRepository {
//   // constructor() {
//   //   this.initializeDatabase();
//   // }

//   // private async initializeDatabase(): Promise<void> {
//   //   try {
//   //     await db.createTableIfNotExists(foodDiaryEntrySchema);
//   //   } catch (error) {
//   //     console.error("Error initializing food diary entries database:", error);
//   //     throw error;
//   //   }
//   // }

//   async get(id: string): Promise<FoodDiaryEntry | null> {
//     try {
//       const result = await db.getFirstAsync<FoodDiaryEntry>(
//         `SELECT * FROM food_diary_entries WHERE id = ?`,
//         [id]
//       );

//       return result || null;
//     } catch (error) {
//       console.error("Error retrieving food diary entry from local database:", error);
//       return null;
//     }
//   }

//   async getByDate(date: string): Promise<FoodDiaryEntry[]> {
//     try {
//       const results = await db.getAllAsync<FoodDiaryEntry>(
//         `SELECT * FROM food_diary_entries WHERE date = ? ORDER BY created_at DESC`,
//         [date]
//       );

//       return results || [];
//     } catch (error) {
//       console.error("Error retrieving food diary entries by date from local database:", error);
//       return [];
//     }
//   }

//   async search(options: SearchOptions): Promise<SearchResult<FoodDiaryEntry>> {
//     try {
//       const { page = 1, limit = 10, date, meal_type } = options;
//       const offset = (page - 1) * limit;

//       let whereClause = "";
//       const whereParams: any[] = [];

//       if (date) {
//         whereClause += "date = ?";
//         whereParams.push(date);
//       }

//       if (meal_type) {
//         if (whereClause) whereClause += " AND ";
//         whereClause += "meal_type = ?";
//         whereParams.push(meal_type);
//       }

//       const whereStatement = whereClause ? `WHERE ${whereClause}` : "";

//       // Get total count for pagination
//       const countResult = await db.getFirstAsync<{ count: number }>(
//         `SELECT COUNT(*) as count FROM food_diary_entries ${whereStatement}`,
//         whereParams
//       );

//       const totalCount = countResult?.count || 0;

//       // Get paginated results
//       const items = await db.getAllAsync<FoodDiaryEntry>(
//         `SELECT * FROM food_diary_entries ${whereStatement} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
//         [...whereParams, limit, offset]
//       );

//       return {
//         items: items || [],
//         totalCount,
//         page,
//         limit,
//         hasMore: offset + items.length < totalCount,
//       };
//     } catch (error) {
//       console.error("Error searching food diary entries in local database:", error);
//       return {
//         items: [],
//         totalCount: 0,
//         page: options.page || 1,
//         limit: options.limit || 10,
//         hasMore: false,
//       };
//     }
//   }

//   async getAllLocal(): Promise<FoodDiaryEntry[]> {
//     try {
//       const results = await db.getAllAsync<FoodDiaryEntry>(
//         `SELECT * FROM food_diary_entries ORDER BY created_at DESC`
//       );

//       return results || [];
//     } catch (error) {
//       console.error("Error retrieving all food diary entries from local database:", error);
//       return [];
//     }
//   }

//   async save(entry: FoodDiaryEntry): Promise<FoodDiaryEntry | null> {
//     try {
//       // Ensure we have an ID
//       const id = entry.id || `local_${Date.now()}`;

//       // Set timestamps
//       const now = new Date().toISOString();
//       const created_at = entry.created_at || now;
//       const updated_at = now;

//       const entryWithTimestamps: FoodDiaryEntry = {
//         ...entry,
//         id,
//         created_at,
//         updated_at,
//       };

//       await db.saveToSqlite("food_diary_entries", entryWithTimestamps);

//       return entryWithTimestamps;
//     } catch (error) {
//       console.error("Error saving food diary entry to local database:", error);
//       throw error;
//     }
//   }

//   async update(id: string, patch: Partial<FoodDiaryEntry>): Promise<void> {
//     try {
//       // First get the existing entry
//       const existingEntry = await this.get(id);
//       if (!existingEntry) {
//         throw new Error(`Food diary entry with ID ${id} not found`);
//       }

//       // Merge the existing entry with the patch
//       const updatedEntry: FoodDiaryEntry = {
//         ...existingEntry,
//         ...patch,
//         id, // Ensure ID remains the same
//         updated_at: new Date().toISOString(), // Update the timestamp
//       };

//       // Save the updated entry
//       await this.save(updatedEntry);
//     } catch (error) {
//       console.error("Error updating food diary entry in local database:", error);
//       throw error;
//     }
//   }

//   async delete(id: string): Promise<void> {
//     try {
//       await db.runAsync(`DELETE FROM food_diary_entries WHERE id = ?`, [id]);
//     } catch (error) {
//       console.error("Error deleting food diary entry from local database:", error);
//       throw error;
//     }
//   }
// }
