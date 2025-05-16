import React, { createContext, useContext, useMemo } from "react";
import { useRestManager } from "./RestManagerProvider";
import { ProfileRepository } from "../utils/repositories/CompositeProfileRepository";
import { LocalProfileRepository } from "../utils/repositories/local/LocalProfileRepository";
import { RemoteProfileRepository } from "../utils/repositories/remote/RemoteProfileRepository";
import { CompositeFoodRepository } from "../utils/repositories/CompositeFoodRepository";
import { LocalFoodRepository } from "../utils/repositories/local/LocalFoodRepository";
import { RemoteFoodRepository } from "../utils/repositories/remote/RemoteFoodRepository";
import { FoodRepository } from "../models/interfaces/FoodDataRepository";
import { DailyDiaryRepository } from "../models/interfaces/DailyDiaryRepository";
import { LocalDailyDiaryRepository } from "../utils/repositories/local/LocalDailyDiaryRepository";
import { RemoteDailyDiaryRepository } from "../utils/repositories/remote/RemoteDailyDiaryRepository";
import { CompositeDailyDiaryRepository } from "../utils/repositories/CompositeDailyDiaryRepository";

interface RepositoriesContextType {
  profileRepository: ProfileRepository;
  foodRepository: FoodRepository;
  dailyDiaryRepository: DailyDiaryRepository;
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
    // const localFoodDiaryEntryRepository = new LocalFoodDiaryEntryRepository();
    // const remoteFoodDiaryEntryRepository = new RemoteFoodDiaryEntryRepository(restManager);
    // const foodDiaryEntryRepository = new CompositeFoodDiaryEntryRepository(
    //   localFoodDiaryEntryRepository,
    //   remoteFoodDiaryEntryRepository
    // );

    // Create daily diary repositories
    const localDailyDiaryRepository = new LocalDailyDiaryRepository();
    const remoteDailyDiaryRepository = new RemoteDailyDiaryRepository(restManager);
    const dailyDiaryRepository = new CompositeDailyDiaryRepository(
      localDailyDiaryRepository,
      remoteDailyDiaryRepository
    );

    return {
      profileRepository,
      foodRepository,
      dailyDiaryRepository,
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

export const useDailyDiaryRepository = () => {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error("useDailyDiaryRepository must be used within a RepositoriesProvider");
  }
  return context.dailyDiaryRepository;
};
