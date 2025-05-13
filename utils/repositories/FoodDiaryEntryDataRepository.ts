import { FoodDiaryEntry } from "@/models/interfaces/FoodDiaryEntry";

export interface SearchOptions {
  page?: number;
  limit?: number;
  date?: string;
  meal_type?: string;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FoodDiaryEntryRepository {
  get(id: string): Promise<FoodDiaryEntry | null>;
  getByDate(date: string): Promise<FoodDiaryEntry[]>;
  search(options: SearchOptions): Promise<SearchResult<FoodDiaryEntry>>;
  getAllLocal(): Promise<FoodDiaryEntry[]>; // Only for offline use
  save(entry: FoodDiaryEntry): Promise<FoodDiaryEntry | null>;
  update(id: string, patch: Partial<FoodDiaryEntry>): Promise<void>;
  delete(id: string): Promise<void>;
}
