import RestManager from "@/utils/api/restManager";
import { createContext, useContext, useEffect, useMemo } from "react";
import { useAuth } from "./AuthProvider";
import { useTranslation } from "react-i18next";

interface RestManagerContextProps {
  restManager: RestManager;
}

const RestManagerContext = createContext<RestManagerContextProps | undefined>(undefined);

export const RestManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const { i18n } = useTranslation();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

  const restManager = useMemo(
    () =>
      new RestManager({
        baseURL: API_BASE_URL,
        language: i18n.language,
      }),
    []
  );

  useEffect(() => {
    restManager.setToken(session?.access_token);
  }, [session, restManager]);

  useEffect(() => {
    restManager.setLanguage(i18n.language);
  }, [i18n.language, restManager]);

  return (
    <RestManagerContext.Provider value={{ restManager }}>{children}</RestManagerContext.Provider>
  );
};

export const useRestManager = (): RestManager => {
  const context = useContext(RestManagerContext);
  if (!context) {
    throw new Error("useRestManager must be used within a RestManagerProvider");
  }
  return context.restManager;
};
