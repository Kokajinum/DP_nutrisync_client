import React, { useEffect } from "react";
import { useSaveActivityDiary } from "@/hooks/useActivityDiaryRepository";
import { useActivityDiaryStore } from "@/stores/activityDiaryStore";
import { CreateActivityDiaryDto } from "@/models/interfaces/ActivityDiary";
import { useAuth } from "@/context/AuthProvider";

/**
 * Component that handles syncing activity diary data with the server
 * This component doesn't render anything, it just provides the functionality
 * It only syncs data when a workout is completed (onSessionId changes)
 */
export const ActivityDiarySyncHandler: React.FC<{
  onSessionId: string | null;
}> = ({ onSessionId }) => {
  const { user } = useAuth();
  const { getSessionById } = useActivityDiaryStore();
  const { mutate: saveActivityDiary } = useSaveActivityDiary();

  // Function to convert local session to DTO for API
  const prepareActivityDiaryDto = async (
    sessionId: string
  ): Promise<CreateActivityDiaryDto | null> => {
    const session = await getSessionById(sessionId);
    if (!session) return null;

    return {
      //id: session.id,
      start_at: session.start_at,
      end_at: session.end_at || new Date().toISOString(),
      notes: session.notes,
      bodyweight_kg: session.bodyweight_kg,
      entries:
        session.entries?.map((entry) => ({
          //id: entry.id,
          exercise_id: entry.exercise_id,
          sets_json: JSON.parse(entry.sets_json || "[]"),
          est_kcal: entry.est_kcal,
          notes: entry.notes,
        })) || [],
    };
  };

  // Function to sync a completed session with the server
  const syncCompletedSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const dto = await prepareActivityDiaryDto(sessionId);
      if (!dto) {
        console.error("Failed to prepare activity diary DTO");
        return;
      }

      // Save to server and local DB via CompositeActivityDiaryRepository
      // The repository will handle saving to both remote and local storage
      saveActivityDiary(dto, {
        onSuccess: (response) => {
          console.log("Activity diary saved to server successfully", response);
        },
        onError: (error) => {
          console.error("Failed to save activity diary to server", error);
        },
      });
    } catch (error) {
      console.error("Error syncing completed session:", error);
    }
  };

  // When onSessionId changes and is not null, sync that session
  useEffect(() => {
    if (onSessionId) {
      syncCompletedSession(onSessionId);
    }
  }, [onSessionId]);

  // This component doesn't render anything
  return null;
};
