import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface RestManagerOptions {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class RestManager {
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;

  /**
   *
   * @param options
   */
  constructor(options: RestManagerOptions) {
    const { baseURL, timeout = 90_000, headers } = options;
    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers,
    });

    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          //config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`, config);
        return config;
      },
      (error) => {
        console.error(`[API REQUEST ERROR]`, error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(
          `[API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url}`,
          response
        );
        return response;
      },
      (error) => {
        if (error.response) {
          // Server vrátil odpověď s chybovým kódem
          console.error(
            `[API RESPONSE ERROR] ${error.response.status} ${error.config?.url}`,
            error.response.data
          );
          // Tady by se mohlo implementovat přesměrování uživatele na login
          if (error.response.status === 401) {
            console.warn(
              "Neautorizováno – uživatel bude odhlášen nebo přesměrován na přihlašovací stránku."
            );
          }
        } else if (error.request) {
          // Požadavek byl odeslán, ale odpověď nebyla obdržena
          console.error("[API NO RESPONSE]", error.request);
        } else {
          // Nastala chyba při nastavování požadavku
          console.error("[API ERROR]", error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  public setToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   *
   * @param url
   * @param config
   * @returns
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.get<T>(url, config);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param url
   * @param data
   * @param config
   * @returns
   */
  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.post<T>(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param url
   * @param data
   * @param config
   * @returns
   */
  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.put<T>(url, data, config);
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param url
   * @param config
   * @returns
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.delete<T>(url, config);
    } catch (error) {
      throw error;
    }
  }
}

export default RestManager;
