import { useQuery } from "@tanstack/react-query";
import { DashboardResponseDto } from "@/models/interfaces/DashboardResponseDto";
import { fetchDashboardData } from "@/utils/api/apiClient";
import { useRestManager } from "@/context/RestManagerProvider";

/**
 * Hook for fetching dashboard data
 * @returns Query result containing the dashboard data
 */
export const useDashboard = () => {
  const restManager = useRestManager();

  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const result = await fetchDashboardData(restManager);
      return result;
    },
    staleTime: 1000 * 60 * 5, // Data is stale after 5 minutes
  });
};
