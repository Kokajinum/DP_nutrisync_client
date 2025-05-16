import { OfflineTask } from "@/models/interfaces/offline/OfflineTask";
import { formatISO } from "date-fns";
import uuid from "react-native-uuid";
import { db } from "../sqliteHelper";

type OfflineProcessor = (payload: any) => Promise<void>;

export class OfflineManager {
  private static processors: Record<string, OfflineProcessor> = {};

  static register(actionType: string, processor: OfflineProcessor) {
    this.processors[actionType] = processor;
  }

  static async queueAction(actionType: string, payload: any) {
    const task: OfflineTask = {
      id: uuid.v4(),
      action_type: actionType,
      payload: JSON.stringify(payload),
      created_at: formatISO(new Date()),
      status: "pending",
    };
    await this.insertIntoOfflineQueue(task);
  }

  static async processQueue() {
    const tasks = await this.getPendingTasks(); // načte ze SQLite

    for (const task of tasks) {
      const processor = this.processors[task.action_type];
      if (!processor) continue;

      try {
        await processor(task.payload);
        await this.markTaskAsCompleted(task.id);
      } catch (e) {
        console.error(`Failed to process task ${task.id}:`, e);
        await this.markTaskAsFailed(task.id);
      }
    }
  }

  static insertIntoOfflineQueue = (offlineTask: OfflineTask): Promise<void> => {
    return db.saveToSqlite("offline_queue", offlineTask);
  };

  static async getPendingTasks(): Promise<OfflineTask[]> {
    const rows = await db.getAllAsync<OfflineTask>(
      `SELECT * FROM offline_queue WHERE status = 'pending'`
    );
    return rows.map((task) => ({
      ...task,
      payload: JSON.parse(task.payload),
    }));
  }

  static async markTaskAsCompleted(taskId: string): Promise<void> {
    await db.runAsync(`UPDATE offline_queue SET status = 'completed' WHERE id = ?`, [taskId]);
  }

  static async markTaskAsFailed(taskId: string): Promise<void> {
    await db.runAsync(`UPDATE offline_queue SET status = 'failed' WHERE id = ?`, [taskId]);
  }
}
