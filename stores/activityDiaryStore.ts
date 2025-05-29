import { create } from "zustand";
import uuid from "react-native-uuid";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";
import { db } from "../utils/sqliteHelper";
import {
  ActivityDiary,
  ActivityDiaryEntry,
  ExerciseSet,
  CreateActivityDiaryDto,
  ActivityDiaryEntryDto,
  ActivityDiaryResponseDto,
} from "../models/interfaces/ActivityDiary";
import { format, isEqual, parseISO, startOfDay } from "date-fns";
import { ActivitySession } from "../components/cards/CActivitySessionCard";

interface ActivityDiaryState {
  // Current active session (only one can be active at a time)
  activeSession: ActivityDiary | null;
  // Sessions for the selected date
  sessions: ActivityDiary[];
  // Loading state
  loading: boolean;

  // Actions
  startNewSession: (userId: string) => Promise<boolean>;
  updateSessionNotes: (notes: string) => Promise<void>;
  addExercise: (exerciseId: string, exerciseName: string) => Promise<void>;
  addSet: (entryId: string, set: ExerciseSet) => Promise<void>;
  updateSet: (entryId: string, index: number, updatedSet: ExerciseSet) => Promise<void>;
  removeSet: (entryId: string, index: number) => Promise<void>;
  removeLastSet: (entryId: string) => Promise<void>;
  completeSession: () => Promise<string | false>;
  getSessionById: (id: string) => Promise<ActivityDiary | null>;
  loadActiveSession: (userId: string) => Promise<void>;

  // New methods
  getSessionsByDate: (userId: string, date: Date) => Promise<void>;
  getTotalCaloriesBurnedForDate: (date: Date) => number;
  transformToActivitySession: (diary: ActivityDiary) => ActivitySession;
}

export const useActivityDiaryStore = create<ActivityDiaryState>((set, get) => ({
  activeSession: null,
  sessions: [],
  loading: false,

  startNewSession: async (userId: string) => {
    // Check if there's already an active session
    const { activeSession } = get();

    if (activeSession) {
      // Check if the active session is from the current day
      const today = startOfDay(new Date());
      const sessionDate = startOfDay(new Date(activeSession.start_at));

      // Only block new session creation if the active session is from today
      if (isEqual(today, sessionDate)) {
        console.warn(
          "There is already an active session for today. Complete it before starting a new one."
        );
        return false;
      }

      // If the active session is from a previous day, we'll allow creating a new one
      console.log(
        "Found an uncompleted session from a previous day. Allowing new session creation."
      );
    }

    const newSession: ActivityDiary = {
      id: uuid.v4() as string,
      user_id: userId,
      start_at: new Date().toISOString(),
      notes: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      entries: [],
    };

    try {
      await db.runAsync(
        `INSERT INTO activity_diary (id, user_id, start_at, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          newSession.id,
          newSession.user_id,
          newSession.start_at,
          newSession.notes || "",
          newSession.created_at,
          newSession.updated_at,
        ]
      );

      set({ activeSession: newSession });
      return true;
    } catch (error) {
      console.error("Failed to start new session:", error);
      return false;
    }
  },

  updateSessionNotes: async (notes: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    try {
      await db.runAsync(`UPDATE activity_diary SET notes = ?, updated_at = ? WHERE id = ?`, [
        notes,
        new Date().toISOString(),
        activeSession.id,
      ]);

      set({
        activeSession: {
          ...activeSession,
          notes,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to update session notes:", error);
    }
  },

  addExercise: async (exerciseId: string, exerciseName: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const newEntry: ActivityDiaryEntry = {
      id: uuid.v4() as string,
      diary_id: activeSession.id,
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      sets_json: JSON.stringify([]),
      est_kcal: 0,
      notes: "",
      created_at: new Date().toISOString(),
    };

    try {
      await db.runAsync(
        `INSERT INTO activity_diary_entry (id, diary_id, exercise_id, sets_json, est_kcal, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newEntry.id,
          newEntry.diary_id,
          newEntry.exercise_id,
          newEntry.sets_json,
          newEntry.est_kcal,
          newEntry.notes,
          newEntry.created_at,
        ]
      );

      const updatedEntries = [...(activeSession.entries || []), newEntry];

      set({
        activeSession: {
          ...activeSession,
          entries: updatedEntries,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to add exercise:", error);
    }
  },

  addSet: async (entryId: string, exerciseSet: ExerciseSet) => {
    const { activeSession } = get();
    if (!activeSession || !activeSession.entries) return;

    try {
      const updatedEntries = activeSession.entries.map((entry) => {
        if (entry.id === entryId) {
          const currentSets: ExerciseSet[] = JSON.parse(entry.sets_json || "[]");
          const updatedSets = [...currentSets, exerciseSet];

          // Calculate estimated calories
          const estKcal = updatedSets.reduce((total, currentSet) => {
            return total + currentSet.reps * currentSet.weight_kg * 0.1; // Simple formula
          }, 0);

          return {
            ...entry,
            sets_json: JSON.stringify(updatedSets),
            est_kcal: estKcal,
          };
        }
        return entry;
      });

      const updatedEntry = updatedEntries.find((e) => e.id === entryId);
      if (updatedEntry) {
        await db.runAsync(
          `UPDATE activity_diary_entry SET sets_json = ?, est_kcal = ? WHERE id = ?`,
          [updatedEntry.sets_json, updatedEntry.est_kcal, updatedEntry.id]
        );
      }

      set({
        activeSession: {
          ...activeSession,
          entries: updatedEntries,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to add set:", error);
    }
  },

  updateSet: async (entryId: string, index: number, updatedSet: ExerciseSet) => {
    const { activeSession } = get();
    if (!activeSession || !activeSession.entries) return;

    try {
      const updatedEntries = activeSession.entries.map((entry) => {
        if (entry.id === entryId) {
          const currentSets: ExerciseSet[] = JSON.parse(entry.sets_json || "[]");
          const updatedSets = currentSets.map((s, i) => (i === index ? updatedSet : s));

          const estKcal = updatedSets.reduce((total, currentSet) => {
            return total + currentSet.reps * currentSet.weight_kg * 0.1;
          }, 0);

          return {
            ...entry,
            sets_json: JSON.stringify(updatedSets),
            est_kcal: estKcal,
          };
        }
        return entry;
      });

      const updatedEntry = updatedEntries.find((e) => e.id === entryId);
      if (updatedEntry) {
        await db.runAsync(
          `UPDATE activity_diary_entry SET sets_json = ?, est_kcal = ? WHERE id = ?`,
          [updatedEntry.sets_json, updatedEntry.est_kcal, updatedEntry.id]
        );
      }

      set({
        activeSession: {
          ...activeSession,
          entries: updatedEntries,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to update set:", error);
    }
  },

  removeSet: async (entryId: string, index: number) => {
    const { activeSession } = get();
    if (!activeSession || !activeSession.entries) return;

    try {
      const updatedEntries = activeSession.entries.map((entry) => {
        if (entry.id === entryId) {
          const currentSets: ExerciseSet[] = JSON.parse(entry.sets_json || "[]");
          const updatedSets = currentSets.filter((_, i) => i !== index);

          const estKcal = updatedSets.reduce((total, currentSet) => {
            return total + currentSet.reps * currentSet.weight_kg * 0.1;
          }, 0);

          return {
            ...entry,
            sets_json: JSON.stringify(updatedSets),
            est_kcal: estKcal,
          };
        }
        return entry;
      });

      const updatedEntry = updatedEntries.find((e) => e.id === entryId);
      if (updatedEntry) {
        await db.runAsync(
          `UPDATE activity_diary_entry SET sets_json = ?, est_kcal = ? WHERE id = ?`,
          [updatedEntry.sets_json, updatedEntry.est_kcal, updatedEntry.id]
        );
      }

      set({
        activeSession: {
          ...activeSession,
          entries: updatedEntries,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to remove set:", error);
    }
  },

  removeLastSet: async (entryId: string) => {
    const { activeSession } = get();
    if (!activeSession || !activeSession.entries) return;

    try {
      const updatedEntries = activeSession.entries.map((entry) => {
        if (entry.id === entryId) {
          const currentSets: ExerciseSet[] = JSON.parse(entry.sets_json || "[]");

          // Only proceed if there are sets to remove
          if (currentSets.length === 0) return entry;

          // Remove the last set
          const updatedSets = currentSets.slice(0, -1);

          const estKcal = updatedSets.reduce((total, currentSet) => {
            return total + currentSet.reps * currentSet.weight_kg * 0.1; // Simple formula
          }, 0);

          return {
            ...entry,
            sets_json: JSON.stringify(updatedSets),
            est_kcal: estKcal,
          };
        }
        return entry;
      });

      const updatedEntry = updatedEntries.find((e) => e.id === entryId);
      if (updatedEntry) {
        await db.runAsync(
          `UPDATE activity_diary_entry SET sets_json = ?, est_kcal = ? WHERE id = ?`,
          [updatedEntry.sets_json, updatedEntry.est_kcal, updatedEntry.id]
        );
      }

      set({
        activeSession: {
          ...activeSession,
          entries: updatedEntries,
          updated_at: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to remove last set:", error);
    }
  },

  completeSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return false;

    try {
      const endTime = new Date().toISOString();
      const sessionId = activeSession.id;

      await db.runAsync(`UPDATE activity_diary SET end_at = ?, updated_at = ? WHERE id = ?`, [
        endTime,
        new Date().toISOString(),
        sessionId,
      ]);

      const completedSession = {
        ...activeSession,
        end_at: endTime,
        updated_at: new Date().toISOString(),
      };

      set({ activeSession: null });

      return sessionId;
    } catch (error) {
      console.error("Failed to complete session:", error);
      return false;
    }
  },

  getSessionById: async (id: string) => {
    try {
      const session = await db.getFirstAsync<ActivityDiary>(
        `SELECT * FROM activity_diary WHERE id = ?`,
        [id]
      );

      if (!session) return null;

      const entries = await db.getAllAsync<ActivityDiaryEntry>(
        `SELECT * FROM activity_diary_entry WHERE diary_id = ?`,
        [id]
      );

      for (const entry of entries) {
        const exercise = await db.getFirstAsync<{ name: string }>(
          `SELECT name FROM exercises WHERE id = ?`,
          [entry.exercise_id]
        );

        if (exercise) {
          entry.exercise_name = exercise.name;
        }
      }

      return {
        ...session,
        entries,
      };
    } catch (error) {
      console.error("Failed to get session by ID:", error);
      return null;
    }
  },

  loadActiveSession: async (userId: string) => {
    try {
      const session = await db.getFirstAsync<ActivityDiary>(
        `SELECT * FROM activity_diary WHERE user_id = ? AND end_at IS NULL ORDER BY start_at DESC LIMIT 1`,
        [userId]
      );

      if (!session) {
        set({ activeSession: null });
        return;
      }

      const today = startOfDay(new Date());
      const sessionDate = startOfDay(new Date(session.start_at));

      if (!isEqual(today, sessionDate)) {
        console.log(
          `Loading active session from ${format(sessionDate, "yyyy-MM-dd")}. This won't prevent creating a new session today.`
        );
      }

      const entries = await db.getAllAsync<ActivityDiaryEntry>(
        `SELECT * FROM activity_diary_entry WHERE diary_id = ?`,
        [session.id]
      );

      for (const entry of entries) {
        const exercise = await db.getFirstAsync<{ name: string }>(
          `SELECT name FROM exercises WHERE id = ?`,
          [entry.exercise_id]
        );

        if (exercise) {
          entry.exercise_name = exercise.name;
        }
      }

      set({
        activeSession: {
          ...session,
          entries,
        },
      });
    } catch (error) {
      console.error("Failed to load active session:", error);
    }
  },

  getSessionsByDate: async (userId: string, date: Date) => {
    try {
      set({ loading: true });

      // Format date to match SQLite storage format (YYYY-MM-DD)
      const dateStart = startOfDay(date).toISOString();
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const dateEnd = startOfDay(nextDay).toISOString();

      const sessions = await db.getAllAsync<ActivityDiary>(
        `SELECT * FROM activity_diary 
         WHERE user_id = ? 
         AND start_at >= ? 
         AND start_at < ? 
         ORDER BY start_at DESC`,
        [userId, dateStart, dateEnd]
      );

      for (const session of sessions) {
        const entries = await db.getAllAsync<ActivityDiaryEntry>(
          `SELECT * FROM activity_diary_entry WHERE diary_id = ?`,
          [session.id]
        );

        for (const entry of entries) {
          const exercise = await db.getFirstAsync<{ name: string }>(
            `SELECT name FROM exercises WHERE id = ?`,
            [entry.exercise_id]
          );

          if (exercise) {
            entry.exercise_name = exercise.name;
          }
        }

        session.entries = entries;
      }

      set({ sessions, loading: false });
    } catch (error) {
      console.error("Failed to get sessions by date:", error);
      set({ loading: false });
    }
  },

  getTotalCaloriesBurnedForDate: (date: Date) => {
    const { sessions } = get();

    return sessions.reduce((total, session) => {
      const sessionCalories =
        session.entries?.reduce((entryTotal, entry) => {
          return entryTotal + (entry.est_kcal || 0);
        }, 0) || 0;

      return total + sessionCalories;
    }, 0);
  },

  transformToActivitySession: (diary: ActivityDiary): ActivitySession => {
    const exerciseCount = diary.entries?.length || 0;

    const caloriesBurned =
      diary.entries?.reduce((total, entry) => {
        return total + (entry.est_kcal || 0);
      }, 0) || 0;

    return {
      id: diary.id,
      startTime: diary.start_at,
      endTime: diary.end_at,
      caloriesBurned,
      exerciseCount,
      notes: diary.notes,
    };
  },
}));
