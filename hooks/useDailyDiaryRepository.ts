import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DailyDiaryResponseDto } from "@/models/interfaces/DailyDiaryResponseDto";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";
import { CreateFoodDiaryEntryDto } from "@/models/interfaces/CreateFoodDiaryEntryDto";
import { useDailyDiaryRepository } from "@/context/RepositoriesProvider";
import { useAuth } from "@/context/AuthProvider";
import { useUserProfile } from "@/hooks/useUserProfile";

/**
 * Hook for fetching a daily diary
 * @param date The date in ISO format (YYYY-MM-DD)
 * @returns Query result containing the daily diary data
 */
export const useDailyDiary = (date: string) => {
  const dailyDiaryRepository = useDailyDiaryRepository();
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id);

  return useQuery({
    queryKey: ["dailyDiary", date],
    queryFn: async () => {
      if (!date) {
        console.error("useDailyDiary: No date provided");
        return null;
      }

      console.log(`useDailyDiary: Calling dailyDiaryRepository.getDailyDiary with date: ${date}`);
      const result = await dailyDiaryRepository.getDailyDiary(date, userProfile);
      return result;
    },
    enabled: !!date, // Only run the query if date is provided
    staleTime: 1000 * 60 * 5, // Data is stale after 5 minutes
  });
};

/**
 * Hook for creating a food diary entry
 * @returns Mutation function and state for creating a food diary entry
 */
export const useCreateFoodDiaryEntry = () => {
  const dailyDiaryRepository = useDailyDiaryRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: CreateFoodDiaryEntryDto) =>
      dailyDiaryRepository.createFoodDiaryEntry(entry),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      if (variables.entry_date) {
        const date = variables.entry_date.split("T")[0];
        queryClient.invalidateQueries({ queryKey: ["dailyDiary", date] });
      } else {
        // If no date provided, use current date
        const currentDate = new Date().toISOString().split("T")[0];
        queryClient.invalidateQueries({ queryKey: ["dailyDiary", currentDate] });
      }
    },
  });
};

/**
 * Hook for deleting a food diary entry
 * @returns Mutation function and state for deleting a food diary entry
 */
export const useDeleteFoodDiaryEntry = () => {
  const dailyDiaryRepository = useDailyDiaryRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, date }: { id: string; date: string }) =>
      dailyDiaryRepository.deleteFoodDiaryEntry(id),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["dailyDiary", variables.date] });
    },
  });
};
