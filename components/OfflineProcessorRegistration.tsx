import React, { useEffect } from "react";
import { useDailyDiary } from "@/hooks/useDailyDiaryRepository";
import { useDailyDiaryRepository } from "@/context/RepositoriesProvider";
import { useUserProfile } from "@/hooks/useUserProfile";
import { OfflineManager } from "@/utils/managers/OfflineManager";
import { useAuth } from "@/context/AuthProvider";
import { CREATE_DAILY_DIARY, CREATE_FOOD_DIARY_ENTRY } from "@/constants/Global";
import { db } from "@/utils/sqliteHelper";
import { FoodDiaryEntryResponseDto } from "@/models/interfaces/FoodDiaryEntryResponseDto";

export const OfflineProcessorRegistration: React.FC = () => {
  const dailyDiaryRepository = useDailyDiaryRepository();

  useEffect(() => {
    OfflineManager.register(CREATE_DAILY_DIARY, async (payload) => {
      const { date } = payload;
      await dailyDiaryRepository.getDailyDiary(date);
    });

    OfflineManager.register(CREATE_FOOD_DIARY_ENTRY, async (payload) => {
      try {
        const remoteRepository = (dailyDiaryRepository as any).remoteRepository;

        if (!remoteRepository) {
          throw new Error("Remote repository not available");
        }

        const createdEntry = await remoteRepository.createFoodDiaryEntry(payload);

        if (createdEntry) {
          const localEntries = await db.getAllAsync<FoodDiaryEntryResponseDto>(
            `SELECT * FROM diary_food_entries WHERE food_id = ? AND food_name = ? AND meal_type = ?`,
            [payload.food_id, payload.food_name, payload.meal_type]
          );

          if (localEntries.length > 0) {
            await db.runAsync(
              `UPDATE diary_food_entries SET id = ?, user_id = ?, day_id = ? WHERE id = ?`,
              [createdEntry.id, createdEntry.user_id, createdEntry.day_id, localEntries[0].id]
            );
          }

          const date = payload.entry_date
            ? payload.entry_date.split("T")[0]
            : new Date().toISOString().split("T")[0];

          const updatedDiary = await remoteRepository.getDailyDiary(date);
          if (updatedDiary) {
            const localRepository = (dailyDiaryRepository as any).localRepository;
            if (localRepository) {
              await localRepository.saveDailyDiary(updatedDiary);

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

    return () => {
      console.log("Cleaning up OfflineProcessorRegistration");
    };
  }, [dailyDiaryRepository]);

  return null;
};

export default OfflineProcessorRegistration;
