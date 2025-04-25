import React, { createContext, useContext, useMemo } from "react";
import { useRestManager } from "./RestManagerProvider";
import { ProfileRepository } from "../utils/repositories/ProfileRepository";
import { LocalProfileRepository } from "../utils/repositories/LocalProfileRepository";
import { RemoteProfileRepository } from "../utils/repositories/RemoteProfileRepository";

interface RepositoriesContextType {
  profileRepository: ProfileRepository;
  // other repositories
}

const RepositoriesContext = createContext<RepositoriesContextType | undefined>(undefined);

/**
 * Provider component for accessing all repositories
 */
export const RepositoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const restManager = useRestManager();

  const repositories = useMemo(() => {
    // Create repositories
    const localProfileRepository = new LocalProfileRepository();
    const remoteProfileRepository = new RemoteProfileRepository(restManager);
    const profileRepository = new ProfileRepository(
      localProfileRepository,
      remoteProfileRepository
    );

    return {
      profileRepository,
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
