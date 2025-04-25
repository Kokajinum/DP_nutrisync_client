import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserProfileData } from "../models/interfaces/UserProfileData";
import { useProfileRepository } from "../context/RepositoriesProvider";

/**
 * Hook for fetching a user profile
 * @param userId The ID of the user profile to fetch
 * @returns Query result containing the user profile data
 */
export const useUserProfile = (userId: string) => {
  const profileRepository = useProfileRepository();

  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => profileRepository.get(userId),
    enabled: !!userId, // Only run the query if userId is provided
  });
};

/**
 * Hook for saving a user profile
 * @returns Mutation function and state for saving a user profile
 */
export const useSaveUserProfile = () => {
  const profileRepository = useProfileRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: UserProfileData) => profileRepository.save(profile),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ["userProfile", variables.id] });
      }
    },
  });
};

/**
 * Hook for updating a user profile
 * @returns Mutation function and state for updating a user profile
 */
export const useUpdateUserProfile = () => {
  const profileRepository = useProfileRepository();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<UserProfileData> }) =>
      profileRepository.update(id, patch),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["userProfile", variables.id] });
    },
  });
};
