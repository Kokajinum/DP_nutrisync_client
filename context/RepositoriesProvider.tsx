import React, { createContext, useContext, useMemo } from "react";
import { useRestManager } from "./RestManagerProvider";
import { ProfileRepository } from "../utils/repositories/ProfileRepository";
import { LocalProfileRepository } from "../utils/repositories/LocalProfileRepository";
import { RemoteProfileRepository } from "../utils/repositories/RemoteProfileRepository";
import { CompositeFoodRepository } from "../utils/repositories/FoodRepository";
import { LocalFoodRepository } from "../utils/repositories/LocalFoodRepository";
import { RemoteFoodRepository } from "../utils/repositories/RemoteFoodRepository";
import { FoodRepository } from "../utils/repositories/FoodDataRepository";

interface RepositoriesContextType {
  profileRepository: ProfileRepository;
  foodRepository: FoodRepository;
  // other repositories
}

const RepositoriesContext = createContext<RepositoriesContextType | undefined>(undefined);

/**
 * Provider component for accessing all repositories
 */
export const RepositoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const restManager = useRestManager();

  const repositories = useMemo(() => {
    // Create profile *repositories
    const localProfileRepository = new LocalProfileRepository();
    const remoteProfileRepository = new RemoteProfileRepository(restManager);
    const profileRepository = new ProfileRepository(
      localProfileRepository,
      remoteProfileRepository
    );

    // Create food repositories
    const localFoodRepository = new LocalFoodRepository();
    const remoteFoodRepository = new RemoteFoodRepository(restManager);
    const foodRepository = new CompositeFoodRepository(localFoodRepository, remoteFoodRepository);

    return {
      profileRepository,
      foodRepository,
      // other repositories
    };
  }, [restManager]);

  return (
    <RepositoriesContext.Provider value={repositories}>{children}</RepositoriesContext.Provider>
  );
};

export const useProfileRepository = () => {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error("useProfileRepository must be used within a RepositoriesProvider");
  }
  return context.profileRepository;
};

export const useFoodRepository = () => {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error("useFoodRepository must be used within a RepositoriesProvider");
  }
  return context.foodRepository;
};
