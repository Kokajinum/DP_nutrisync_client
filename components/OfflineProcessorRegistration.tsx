import React, { useEffect } from "react";
import { useDailyDiary } from "@/hooks/useDailyDiaryRepository";
import { useDailyDiaryRepository } from "@/context/RepositoriesProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { OfflineManager } from "@/utils/managers/OfflineManager";
import { useAuth } from "@/context/AuthProvider";
import { CREATE_DAILY_DIARY } from "@/constants/Global";

/**
 * Component for registering offline processors
 * This component doesn't render anything visible, it just registers processors for offline actions
 */
export const OfflineProcessorRegistration: React.FC = () => {
  const dailyDiaryRepository = useDailyDiaryRepository();
  //const { user } = useAuth();
  //const { data: userProfile } = useUserProfile(user?.id);

  useEffect(() => {
    // Register processor for CREATE_DAILY_DIARY
    OfflineManager.register(CREATE_DAILY_DIARY, async (payload) => {
      const { date } = payload;
      // Pass userProfile to getDailyDiary
      await dailyDiaryRepository.getDailyDiary(date);
    });

    // Cleanup when component unmounts
    return () => {
      // If OfflineManager supports unregistering, we could do it here
      // For now, we'll just log that we're cleaning up
      console.log("Cleaning up OfflineProcessorRegistration");
    };
  }, [dailyDiaryRepository]);

  // This component doesn't render anything visible
  return null;
};

export default OfflineProcessorRegistration;
