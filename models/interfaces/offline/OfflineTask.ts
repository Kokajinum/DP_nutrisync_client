export interface OfflineTask {
  id: string; // UUID
  action_type: string;
  payload: any; // libovolný JSON
  created_at: string;
  status: "pending" | "processing" | "failed" | "completed";
}
