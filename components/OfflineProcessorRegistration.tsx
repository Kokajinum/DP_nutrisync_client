import React, { useEffect } from "react";
import { useDailyDiary } from "@/hooks/useDailyDiaryRepository";
import { useDailyDiaryRepository } from "@/context/RepositoriesProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { OfflineManager } from "@/utils/managers/OfflineManager";
import { useAuth } from "@/context/AuthProvider";
import { CREATE_DAILY_DIARY, CREATE_FOOD_DIARY_ENTRY } from "@/constants/Global";
import { db } from "@/utils/sqliteHelper";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";

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

    // Register processor for CREATE_FOOD_DIARY_ENTRY
    OfflineManager.register(CREATE_FOOD_DIARY_ENTRY, async (payload) => {
      try {
        // Get the remote repository from the composite repository
        const remoteRepository = (dailyDiaryRepository as any).remoteRepository;

        if (!remoteRepository) {
          throw new Error("Remote repository not available");
        }

        // Create the entry on the server
        const createdEntry = await remoteRepository.createFoodDiaryEntry(payload);

        if (createdEntry) {
          // Find the local entry with matching food_id, food_name, and meal_type
          const localEntries = await db.getAllAsync<FoodDiaryEntryResponseDto>(
            `SELECT * FROM diary_food_entries WHERE food_id = ? AND food_name = ? AND meal_type = ?`,
            [payload.food_id, payload.food_name, payload.meal_type]
          );

          if (localEntries.length > 0) {
            // Update the entry with the correct ID and user_id
            await db.runAsync(
              `UPDATE diary_food_entries SET id = ?, user_id = ?, day_id = ? WHERE id = ?`,
              [createdEntry.id, createdEntry.user_id, createdEntry.day_id, localEntries[0].id]
            );
          }

          // Refresh the daily diary
          const date = payload.entry_date
            ? payload.entry_date.split("T")[0]
            : new Date().toISOString().split("T")[0];

          const updatedDiary = await remoteRepository.getDailyDiary(date);
          if (updatedDiary) {
            // Get the local repository from the composite repository
            const localRepository = (dailyDiaryRepository as any).localRepository;
            if (localRepository) {
              await localRepository.saveDailyDiary(updatedDiary);

              // Also update any local entries that might have been created
              if (updatedDiary.food_entries && updatedDiary.food_entries.length > 0) {
                for (const entry of updatedDiary.food_entries) {
                  if (localRepository.saveFoodDiaryEntry) {
                    await localRepository.saveFoodDiaryEntry(entry);
                  }
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error processing offline food diary entry creation:", error);
        throw error;
      }
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
