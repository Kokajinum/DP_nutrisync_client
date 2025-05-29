import { useFoodRepository as useRepositoryContext } from "@/context/RepositoriesProvider";
import { FoodData } from "@/models/interfaces/FoodData";
import { SearchOptions, SearchResult } from "@/models/interfaces/FoodDataRepository";
import { useCallback } from "react";

/**
 * Hook for accessing and manipulating food data
 * Provides methods for CRUD operations on food items
 */
export const useFoodRepository = () => {
  const foodRepository = useRepositoryContext();

  const getFood = useCallback(
    async (id: string) => {
      return await foodRepository.get(id);
    },
    [foodRepository]
  );

  const searchFoods = useCallback(
    async (options: SearchOptions) => {
      return await foodRepository.search(options);
    },
    [foodRepository]
  );

  const getAllLocalFoods = useCallback(async () => {
    return await foodRepository.getAllLocal();
  }, [foodRepository]);

  const saveFood = useCallback(
    async (food: Omit<FoodData, "id" | "created_at" | "updated_at">) => {
      const now = new Date().toISOString();
      const foodWithTimestamps: FoodData = {
        ...food,
        id: `temp_${Date.now()}`,
        created_at: now,
        updated_at: now,
      };

      return await foodRepository.save(foodWithTimestamps);
    },
    [foodRepository]
  );

  const updateFood = useCallback(
    async (id: string, patch: Partial<FoodData>) => {
      await foodRepository.update(id, {
        ...patch,
        updated_at: new Date().toISOString(),
      });
    },
    [foodRepository]
  );

  const deleteFood = useCallback(
    async (id: string) => {
      await foodRepository.delete(id);
    },
    [foodRepository]
  );

  return {
    getFood,
    searchFoods,
    getAllLocalFoods,
    saveFood,
    updateFood,
    deleteFood,
  };
};
