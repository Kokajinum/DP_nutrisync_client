import { FoodData } from "@/models/interfaces/FoodData";

export interface SearchOptions {
  page?: number;
  limit?: number;
  query?: string;
}

export interface SearchResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FoodRepository {
  get(id: string): Promise<FoodData | null>;
  search(options: SearchOptions): Promise<SearchResult<FoodData>>;
  getAllLocal(): Promise<FoodData[]>; // Only for offline use
  save(food: FoodData): Promise<FoodData | null>;
  update(id: string, patch: Partial<FoodData>): Promise<void>;
  delete(id: string): Promise<void>;
}
