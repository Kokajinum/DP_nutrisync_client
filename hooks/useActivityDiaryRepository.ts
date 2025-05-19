import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ActivityDiaryResponseDto,
  CreateActivityDiaryDto,
} from "@/models/interfaces/ActivityDiary";
import { useActivityDiaryRepository } from "@/context/RepositoriesProvider";
import { format } from "date-fns";

/**
 * Hook for fetching an activity diary by date
 * This will first check local SQLite storage, and only if not found, will fetch from the server
 * @param date The date as a Date object
 * @returns Query result containing the activity diary data
 */
export const useActivityDiaryByDate = (date: Date) => {
  const activityDiaryRepository = useActivityDiaryRepository();
  const formattedDate = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["activityDiary", formattedDate],
    queryFn: async () => {
      if (!formattedDate) {
        console.error("useActivityDiaryByDate: No date provided");
        return null;
      }

      console.log(
        `useActivityDiaryByDate: Calling activityDiaryRepository.getActivityDiaryByDate with date: ${formattedDate}`
      );
      return await activityDiaryRepository.getActivityDiaryByDate(formattedDate);
    },
    enabled: !!formattedDate,
    staleTime: 1000 * 60 * 5, // Data is stale after 5 minutes
  });
};

/**
 * Hook for saving an activity diary
 * @returns Mutation function and state for saving an activity diary
 */
export const useSaveActivityDiary = () => {
  const activityDiaryRepository = useActivityDiaryRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (diary: CreateActivityDiaryDto) =>
      await activityDiaryRepository.saveActivityDiary(diary),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      if (variables.start_at) {
        const date = new Date(variables.start_at);
        const formattedDate = format(date, "yyyy-MM-dd");
        queryClient.invalidateQueries({ queryKey: ["activityDiary", formattedDate] });
      }
    },
  });
};
