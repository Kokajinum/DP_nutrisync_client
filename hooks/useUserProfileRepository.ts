import { useRestManager } from "@/context/RestManagerProvider";
import { UserProfileRepository } from "@/utils/repositories/userProfileRepository";
import { useMemo } from "react";

/**
 * Hook for accessing the UserProfileRepository
 * @returns An instance of UserProfileRepository
 */
export const useUserProfileRepository = () => {
  const restManager = useRestManager();

  const userProfileRepository = useMemo(
    () => new UserProfileRepository(restManager),
    [restManager]
  );

  return userProfileRepository;
};
