import * as SQLite from "expo-sqlite";

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

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = this.initialize();
    }
    return this.dbPromise;
  }

  async runAsync(query: string, params: any[] = []): Promise<any> {
    const db = await this.getDb();
    return db.runAsync(query, params);
  }

  async getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
    const db = await this.getDb();
    return db.getFirstAsync<T>(query, params);
  }

  async getAllAsync<T>(query: string, params: any[] = []): Promise<T[]> {
    const db = await this.getDb();
    return db.getAllAsync<T>(query, params);
  }

  async execAsync(query: string): Promise<any> {
    const db = await this.getDb();
    return db.execAsync(query);
  }
}

// db singleton instance
export const db = new AsyncSQLiteDatabase("fitness.db");

// database schema
export async function initDb() {
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS user_profiles(
      id TEXT PRIMARY KEY NOT NULL,
      created_at TEXT,
      updated_at TEXT,
      user_id TEXT,
      onboarding_completed INTEGER,
      first_name TEXT,
      last_name TEXT,
      age INTEGER,
      height_value REAL,
      height_unit TEXT,
      weight_value REAL,
      weight_unit TEXT,
      target_weight_value REAL,
      target_weight_unit TEXT,
      activity_level TEXT,
      goal TEXT,
      calorie_goal_value REAL,
      calorie_goal_unit TEXT,
      protein_ratio REAL,
      fat_ratio REAL,
      carbs_ratio REAL,
      notifications_enabled INTEGER
    );`);
}
