import * as SQLite from "expo-sqlite";
import { ensureError } from "./methods";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";

type ColumnDefinition =
  | "TEXT"
  | "TEXT NOT NULL"
  | "INTEGER"
  | "INTEGER NOT NULL"
  | "REAL"
  | "REAL NOT NULL"
  | "BOOLEAN"
  | "BOOLEAN NOT NULL"
  | "TEXT PRIMARY KEY"
  | "TEXT PRIMARY KEY NOT NULL";

type TableSchema = {
  name: string;
  columns: Record<string, ColumnDefinition>;
};

// Create a wrapper class for the database
class AsyncSQLiteDatabase {
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;
  private dbInstance: SQLite.SQLiteDatabase | null = null;

  constructor(private dbName: string) {}

  private async initialize(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbInstance) {
      this.dbInstance = await SQLite.openDatabaseAsync(this.dbName);
    }
    return this.dbInstance;
  }

  async getDbAsync(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = this.initialize();
    }
    return this.dbPromise;
  }

  async runAsync(query: string, params: any[] = []): Promise<any> {
    const db = await this.getDbAsync();
    return db.runAsync(query, params);
  }

  async getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
    const db = await this.getDbAsync();
    return db.getFirstAsync<T>(query, params);
  }

  async getAllAsync<T>(query: string, params: any[] = []): Promise<T[]> {
    const db = await this.getDbAsync();
    return db.getAllAsync<T>(query, params);
  }

  async execAsync(query: string): Promise<any> {
    const db = await this.getDbAsync();
    return db.execAsync(query);
  }

  async saveToSqlite(tableName: string, data: Record<string, any>): Promise<void> {
    try {
      const keys = Object.keys(data);
      const columns = keys.join(", ");
      const placeholders = keys.map(() => "?").join(", ");
      const values = keys.map((key) => {
        const val = data[key];
        if (typeof val === "boolean") return val ? 1 : 0;
        if (val === undefined) return null;
        return val;
      });
      const sql = `INSERT OR REPLACE INTO ${tableName} (${columns}) VALUES (${placeholders})`;
      await db.runAsync(sql, values);
    } catch (err) {
      const error: Error = ensureError(err);
      console.error(`Failed to save data to SQLite table "${tableName}":`, error.message);
      throw err;
    }
  }

  async createTableIfNotExists(schema: TableSchema): Promise<void> {
    const db = await this.getDbAsync();
    const columnsSql = Object.entries(schema.columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(", ");

    const sql = `CREATE TABLE IF NOT EXISTS ${schema.name} (${columnsSql});`;
    await db.runAsync(sql);
  }
}

// db singleton instance
export const db = new AsyncSQLiteDatabase("nutrisync_fitness.db");

// database schema
export async function initDb() {
  await db.createTableIfNotExists(userProfilesSchema);
  await db.createTableIfNotExists(foodSchema);
  //await db.createTableIfNotExists(foodDiaryEntrySchema);
  await db.createTableIfNotExists(dailyDiarySchema);
  await db.createTableIfNotExists(diaryFoodEntrySchema);
  await db.createTableIfNotExists(offlineQueueSchema);
}

export const userProfilesSchema: TableSchema = {
  name: "user_profiles",
  columns: {
    id: "TEXT PRIMARY KEY NOT NULL",
    created_at: "TEXT",
    updated_at: "TEXT",
    user_id: "TEXT",
    onboarding_completed: "INTEGER",
    first_name: "TEXT",
    last_name: "TEXT",
    age: "INTEGER",
    height_value: "REAL",
    height_unit: "TEXT",
    weight_value: "REAL",
    weight_unit: "TEXT",
    target_weight_value: "REAL",
    target_weight_unit: "TEXT",
    activity_level: "TEXT",
    experience_level: "TEXT",
    goal: "TEXT",
    gender: "TEXT",
    calorie_goal_value: "REAL",
    calorie_goal_unit: "TEXT",
    protein_ratio: "REAL",
    fat_ratio: "REAL",
    carbs_ratio: "REAL",
    protein_goal_g: "REAL",
    carbs_goal_g: "REAL",
    fat_goal_g: "REAL",
    notifications_enabled: "INTEGER",
    email: "TEXT",
  },
};

export const foodSchema: TableSchema = {
  name: "foods",
  columns: {
    id: "TEXT PRIMARY KEY NOT NULL",
    created_at: "TEXT",
    updated_at: "TEXT",
    name: "TEXT NOT NULL",
    category: "TEXT NOT NULL",
    servingSizeValue: "TEXT NOT NULL",
    servingSizeUnit: "TEXT NOT NULL",
    brand: "TEXT",
    barcode: "TEXT",
    calories: "TEXT",
    fats: "TEXT",
    carbs: "TEXT",
    sugar: "TEXT",
    fiber: "TEXT",
    protein: "TEXT",
    salt: "TEXT",
  },
};

export const dailyDiarySchema: TableSchema = {
  name: "daily_diaries",
  columns: {
    id: "TEXT PRIMARY KEY",
    user_id: "TEXT NOT NULL",
    day_date: "TEXT NOT NULL",
    calorie_goal: "REAL",
    calories_consumed: "REAL",
    calories_burned: "REAL",
    protein_goal_g: "REAL",
    carbs_goal_g: "REAL",
    fat_goal_g: "REAL",
    protein_consumed_g: "REAL",
    carbs_consumed_g: "REAL",
    fat_consumed_g: "REAL",
    protein_ratio: "REAL",
    carbs_ratio: "REAL",
    fat_ratio: "REAL",
    created_at: "TEXT",
    updated_at: "TEXT",
  },
};

export const diaryFoodEntrySchema: TableSchema = {
  name: "diary_food_entries",
  columns: {
    id: "TEXT PRIMARY KEY",
    user_id: "TEXT NOT NULL",
    day_id: "TEXT NOT NULL",
    food_id: "TEXT NOT NULL",
    food_name: "TEXT NOT NULL",
    brand: "TEXT",
    meal_type: "TEXT NOT NULL",
    serving_size: "REAL NOT NULL",
    serving_unit: "TEXT NOT NULL",
    calories: "REAL NOT NULL",
    protein: "REAL NOT NULL",
    carbs: "REAL NOT NULL",
    fat: "REAL NOT NULL",
    created_at: "TEXT",
    updated_at: "TEXT",
  },
};

export const offlineQueueSchema: TableSchema = {
  name: "offline_queue",
  columns: {
    id: "TEXT PRIMARY KEY",
    created_at: "TEXT",
    action_type: "TEXT", //-- např. "create_food_entry", "create_activity_entry"
    payload: "TEXT", //-- serializovaný JSON objekt
    status: "TEXT", //'pending', 'processing', 'failed', 'completed'
  },
};

/**
 * Normalizuje hodnoty objektu pro SQLite:
 */
export function normalizeForSqlite<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value.length !== 0) {
      result[key] = value;
    }
  }

  return result;
}
