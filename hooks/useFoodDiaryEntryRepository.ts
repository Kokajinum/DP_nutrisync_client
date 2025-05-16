// import { useFoodDiaryEntryRepository as useRepositoryContext } from "@/context/RepositoriesProvider";
// import { FoodDiaryEntry } from "@/models/interfaces/FoodDiaryEntry";
// import { SearchOptions, SearchResult } from "@/models/interfaces/FoodDiaryEntryDataRepository";
// import { useCallback } from "react";

// /**
//  * Hook for accessing and manipulating food diary entry data
//  * Provides methods for CRUD operations on food diary entries
//  */
// export const useFoodDiaryEntryRepository = () => {
//   const foodDiaryEntryRepository = useRepositoryContext();

//   /**
//    * Get a food diary entry by ID
//    */
//   const get = useCallback(
//     async (id: string) => {
//       return await foodDiaryEntryRepository.get(id);
//     },
//     [foodDiaryEntryRepository]
//   );

//   /**
//    * Get all food diary entries for a specific date
//    */
//   const getByDate = useCallback(
//     async (date: string) => {
//       return await foodDiaryEntryRepository.getByDate(date);
//     },
//     [foodDiaryEntryRepository]
//   );

//   /**
//    * Search for food diary entries with pagination
//    */
//   const search = useCallback(
//     async (options: SearchOptions) => {
//       return await foodDiaryEntryRepository.search(options);
//     },
//     [foodDiaryEntryRepository]
//   );

//   /**
//    * Get all food diary entries from local storage (offline use only)
//    */
//   const getAllLocal = useCallback(async () => {
//     return await foodDiaryEntryRepository.getAllLocal();
//   }, [foodDiaryEntryRepository]);

//   /**
//    * Save a new food diary entry
//    * If ID is not provided, a temporary one will be generated
//    */
//   const save = useCallback(
//     async (entry: FoodDiaryEntry) => {
//       const now = new Date().toISOString();
//       const entryWithTimestamps: FoodDiaryEntry = {
//         ...entry,
//         id: entry.id || `entry_${Date.now()}`, // Use provided ID or generate a temporary one
//         created_at: entry.created_at || now,
//         updated_at: now,
//       };

//       return await foodDiaryEntryRepository.save(entryWithTimestamps);
//     },
//     [foodDiaryEntryRepository]
//   );

//   /**
//    * Update specific fields of a food diary entry
//    */
//   const update = useCallback(
//     async (id: string, patch: Partial<FoodDiaryEntry>) => {
//       await foodDiaryEntryRepository.update(id, {
//         ...patch,
//         updated_at: new Date().toISOString(),
//       });
//     },
//     [foodDiaryEntryRepository]
//   );

//   /**
//    * Delete a food diary entry
//    */
//   const deleteEntry = useCallback(
//     async (id: string) => {
//       await foodDiaryEntryRepository.delete(id);
//     },
//     [foodDiaryEntryRepository]
//   );

//   return {
//     get,
//     getByDate,
//     search,
//     getAllLocal,
//     save,
//     update,
//     delete: deleteEntry,
//   };
// };
