import React, { createContext, useContext, useMemo } from "react";
import { useRestManager } from "./RestManagerProvider";
import { ProfileRepository } from "../utils/repositories/ProfileRepository";
import { LocalProfileRepository } from "../utils/repositories/local/LocalProfileRepository";
import { RemoteProfileRepository } from "../utils/repositories/remote/RemoteProfileRepository";
import { CompositeFoodRepository } from "../utils/repositories/FoodRepository";
import { LocalFoodRepository } from "../utils/repositories/local/LocalFoodRepository";
import { RemoteFoodRepository } from "../utils/repositories/remote/RemoteFoodRepository";
import { FoodRepository } from "../models/interfaces/FoodDataRepository";
import { CompositeFoodDiaryEntryRepository } from "../utils/repositories/CompositeFoodDiaryEntryRepository";
import { FoodDiaryEntryRepository } from "../models/interfaces/FoodDiaryEntryDataRepository";
import { LocalFoodDiaryEntryRepository } from "../utils/repositories/local/LocalFoodDiaryEntryRepository";
import { RemoteFoodDiaryEntryRepository } from "../utils/repositories/remote/RemoteFoodDiaryEntryRepository";

interface RepositoriesContextType {
  profileRepository: ProfileRepository;
  foodRepository: FoodRepository;
  foodDiaryEntryRepository: FoodDiaryEntryRepository;
  // other repositories
}

export const RepositoriesContext = createContext<RepositoriesContextType | undefined>(undefined);

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

    // Create food diary entry repositories
    const localFoodDiaryEntryRepository = new LocalFoodDiaryEntryRepository();
    const remoteFoodDiaryEntryRepository = new RemoteFoodDiaryEntryRepository(restManager);
    const foodDiaryEntryRepository = new CompositeFoodDiaryEntryRepository(
      localFoodDiaryEntryRepository,
      remoteFoodDiaryEntryRepository
    );

    return {
      profileRepository,
      foodRepository,
      foodDiaryEntryRepository,
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

export const useFoodDiaryEntryRepository = () => {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error("useFoodDiaryEntryRepository must be used within a RepositoriesProvider");
  }
  return context.foodDiaryEntryRepository;
};
