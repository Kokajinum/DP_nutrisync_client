import RestManager from "./restManager";

const API_BASE_URL = process.env.EXPO_API_BASE_URL || "";

const apiClient = new RestManager({ baseURL: API_BASE_URL });

export default apiClient;
