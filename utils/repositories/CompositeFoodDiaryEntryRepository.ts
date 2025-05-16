// import { FoodDiaryEntry } from "@/models/interfaces/FoodDiaryEntry";
// import {
//   FoodDiaryEntryRepository,
//   SearchOptions,
//   SearchResult,
// } from "../../models/interfaces/FoodDiaryEntryDataRepository";
// import { LocalFoodDiaryEntryRepository } from "./local/LocalFoodDiaryEntryRepository";
// import { RemoteFoodDiaryEntryRepository } from "./remote/RemoteFoodDiaryEntryRepository";
// import NetInfo from "@react-native-community/netinfo";

// /**
//  * A composite repository that combines local and remote repositories for food diary entries
//  * Provides offline support and synchronization between local and remote data
//  */
// export class CompositeFoodDiaryEntryRepository implements FoodDiaryEntryRepository {
//   private localRepository: LocalFoodDiaryEntryRepository;
//   private remoteRepository: RemoteFoodDiaryEntryRepository;

//   constructor(
//     localRepository: LocalFoodDiaryEntryRepository,
//     remoteRepository: RemoteFoodDiaryEntryRepository
//   ) {
//     this.localRepository = localRepository;
//     this.remoteRepository = remoteRepository;
//   }

//   /**
//    * Retrieves a food diary entry by ID
//    * Tries remote first if online, falls back to local
//    * @param id The ID of the food diary entry to retrieve
//    * @returns The food diary entry or null if not found
//    */
//   async get(id: string): Promise<FoodDiaryEntry | null> {
//     try {
//       const netState = await NetInfo.fetch();

//       // If online, try remote first
//       if (netState.isConnected && netState.isInternetReachable) {
//         const remoteEntry = await this.remoteRepository.get(id);
//         if (remoteEntry) {
//           // Cache the remote entry locally
//           await this.localRepository.save(remoteEntry);
//           return remoteEntry;
//         }
//       }

//       // Fall back to local or if offline
//       return await this.localRepository.get(id);
//     } catch (error) {
//       console.error("Error in CompositeFoodDiaryEntryRepository.get:", error);
//       // Fall back to local in case of error
//       return await this.localRepository.get(id);
//     }
//   }

//   /**
//    * Retrieves all food diary entries for a specific date
//    * Uses local-first approach: returns local data immediately, then updates with remote data if available
//    * @param date The date in ISO format (YYYY-MM-DD)
//    * @returns Array of food diary entries for the specified date
//    */
//   async getByDate(date: string): Promise<FoodDiaryEntry[]> {
//     try {
//       // First get local data immediately
//       const localEntries = await this.localRepository.getByDate(date);

//       // Start fetching remote data in the background
//       this.fetchRemoteEntriesAndUpdateLocal(date);

//       // Return local data immediately
//       return localEntries;
//     } catch (error) {
//       console.error("Error in CompositeFoodDiaryEntryRepository.getByDate:", error);
//       return [];
//     }
//   }

//   /**
//    * Fetches remote entries for a specific date and updates local storage
//    * This is meant to be called without awaiting the result
//    * @param date The date in ISO format (YYYY-MM-DD)
//    */
//   private async fetchRemoteEntriesAndUpdateLocal(date: string): Promise<void> {
//     try {
//       const netState = await NetInfo.fetch();

//       // Only proceed if online
//       if (netState.isConnected && netState.isInternetReachable !== false) {
//         const remoteEntries = await this.remoteRepository.getByDate(date);
//         if (remoteEntries && remoteEntries.length > 0) {
//           // Cache the remote entries locally
//           for (const entry of remoteEntries) {
//             await this.localRepository.save(entry);
//           }

//           // Here you could emit an event to notify that data has been updated
//           // For example, using a global event emitter or a callback system
//           console.log("Remote data fetched and local storage updated for date:", date);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching remote entries in background:", error);
//     }
//   }

//   /**
//    * Searches for food diary entries with pagination
//    * Tries remote first if online, falls back to local
//    * @param options Search options including pagination, date, and meal type
//    * @returns Search result with items and pagination info
//    */
//   async search(options: SearchOptions): Promise<SearchResult<FoodDiaryEntry>> {
//     try {
//       const netState = await NetInfo.fetch();

//       // If online, try remote first
//       if (netState.isConnected && netState.isInternetReachable !== false) {
//         const remoteResult = await this.remoteRepository.search(options);
//         if (remoteResult && remoteResult.items.length > 0) {
//           // Cache the remote entries locally
//           for (const entry of remoteResult.items) {
//             await this.localRepository.save(entry);
//           }
//           return remoteResult;
//         }
//       }

//       // Fall back to local or if offline
//       return await this.localRepository.search(options);
//     } catch (error) {
//       console.error("Error in CompositeFoodDiaryEntryRepository.search:", error);
//       // Fall back to local in case of error
//       return await this.localRepository.search(options);
//     }
//   }

//   /**
//    * Retrieves all food diary entries from local storage
//    * Only for offline use when we need all items without pagination
//    * @returns Array of food diary entries
//    */
//   async getAllLocal(): Promise<FoodDiaryEntry[]> {
//     return await this.localRepository.getAllLocal();
//   }

//   /**
//    * Saves a food diary entry
//    * Saves to remote if online, always saves to local
//    * @param entry The food diary entry to save
//    * @returns The saved food diary entry
//    */
//   async save(entry: FoodDiaryEntry): Promise<FoodDiaryEntry | null> {
//     try {
//       const netState = await NetInfo.fetch();
//       let savedEntry: FoodDiaryEntry | null = null;

//       // If online, try to save to remote first
//       if (netState.isConnected && netState.isInternetReachable !== false) {
//         try {
//           savedEntry = await this.remoteRepository.save(entry);
//         } catch (error) {
//           console.error("Error saving to remote, falling back to local:", error);
//         }
//       }

//       // If remote save failed or offline, save to local
//       if (!savedEntry) {
//         savedEntry = await this.localRepository.save(entry);
//       } else {
//         // If remote save succeeded, also save to local for caching
//         await this.localRepository.save(savedEntry);
//       }

//       return savedEntry;
//     } catch (error) {
//       console.error("Error in CompositeFoodDiaryEntryRepository.save:", error);
//       throw error;
//     }
//   }

//   /**
//    * Updates a food diary entry
//    * Updates remote if online, always updates local
//    * @param id The ID of the food diary entry to update
//    * @param patch The partial food diary entry data to update
//    */
//   async update(id: string, patch: Partial<FoodDiaryEntry>): Promise<void> {
//     try {
//       const netState = await NetInfo.fetch();

//       // If online, try to update remote first
//       if (netState.isConnected && netState.isInternetReachable !== false) {
//         try {
//           await this.remoteRepository.update(id, patch);
//         } catch (error) {
//           console.error("Error updating remote, continuing with local update:", error);
//         }
//       }

//       // Always update local
//       await this.localRepository.update(id, patch);
//     } catch (error) {
//       console.error("Error in CompositeFoodDiaryEntryRepository.update:", error);
//       throw error;
//     }
//   }

//   /**
//    * Deletes a food diary entry
//    * Deletes from remote if online, always deletes from local
//    * @param id The ID of the food diary entry to delete
//    */
//   async delete(id: string): Promise<void> {
//     try {
//       const netState = await NetInfo.fetch();

//       // If online, try to delete from remote first
//       if (netState.isConnected && netState.isInternetReachable !== false) {
//         try {
//           await this.remoteRepository.delete(id);
//         } catch (error) {
//           console.error("Error deleting from remote, continuing with local delete:", error);
//         }
//       }

//       // Always delete from local
//       await this.localRepository.delete(id);
//     } catch (error) {
//       console.error("Error in CompositeFoodDiaryEntryRepository.delete:", error);
//       throw error;
//     }
//   }
// }
