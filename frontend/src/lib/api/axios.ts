import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/config/env";
import { ACTION_CONFIG } from "@/config/action.config";
import { authCookies } from "@/utils/cookieUtils";
import { STORAGE_KEYS } from "@/enums/app.enum";
import { toast } from "@/hooks/useToast";

/**
 * Reusable Base Axios Instance
 * Configured for secure cookie handling, CORS with credentials, and unified base URL.
 */
export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * In-flight GET request deduplication cache.
 * Automatically eliminates duplicate simultaneous GET requests across the entire app in production.
 */
const inFlightGetRequests = new Map<string, Promise<any>>();

const originalRequest = apiClient.request.bind(apiClient);

apiClient.request = function <T = any, R = AxiosResponse<T>, D = any>(
  config: AxiosRequestConfig<D>,
): Promise<R> {
  const method = (config.method || "get").toLowerCase();

  // Only deduplicate in-flight GET requests
  if (method === "get" && config.url) {
    const serializedParams = config.params ? JSON.stringify(config.params) : "";
    const dedupeKey = `GET:${config.url}:${serializedParams}`;

    if (inFlightGetRequests.has(dedupeKey)) {
      return inFlightGetRequests.get(dedupeKey) as Promise<R>;
    }

    const requestPromise = (originalRequest as any)(config).finally(() => {
      inFlightGetRequests.delete(dedupeKey);
    });

    inFlightGetRequests.set(dedupeKey, requestPromise);
    return requestPromise as Promise<R>;
  }

  return (originalRequest as any)(config);
} as any;

let inMemoryToken: string | null = null;

/**
 * Sets access token in secure cookies, memory, and localStorage
 */
export function setAccessToken(token: string | null) {
  inMemoryToken = token;
  if (token) {
    authCookies.setToken(token);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    }
  } else {
    authCookies.clearToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }
}

/**
 * Gets access token preferentially from secure cookies, falling back to storage/memory
 */
export function getAccessToken(): string | null {
  if (inMemoryToken) return inMemoryToken;

  const cookieToken = authCookies.getToken();
  if (cookieToken) {
    inMemoryToken = cookieToken;
    return cookieToken;
  }

  if (typeof window !== "undefined") {
    const localToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (localToken) {
      inMemoryToken = localToken;
      return localToken;
    }
  }

  return null;
}

// Interceptor Request: Automatically attach Bearer token from cookies
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor Response: Handle 401 Silent Token Refresh Queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Global API Success Toast: If showSuccessToast is enabled in config, show message automatically
    const config = response.config as any;
    if (config?.showSuccessToast && typeof window !== 'undefined') {
      const msg = response.data?.message || 'Operation completed successfully';
      toast.success(msg, 'Success');
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Don't retry auth endpoints themselves
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(ACTION_CONFIG.AUTH.LOGIN) &&
      !originalRequest.url?.includes(ACTION_CONFIG.AUTH.REGISTER) &&
      !originalRequest.url?.includes(ACTION_CONFIG.AUTH.REFRESH)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${env.apiUrl}${ACTION_CONFIG.AUTH.REFRESH}`,
          {},
          { withCredentials: true },
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error("Refresh token exchange failed");
        }
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        setAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Global API Error Toast: Shows error toast automatically for all APIs across the app
    const isSilentRefresh =
      error.response?.status === 401 &&
      !originalRequest?.url?.includes(ACTION_CONFIG.AUTH.LOGIN);

    if (!isSilentRefresh && typeof window !== "undefined") {
      const resData = error.response?.data as any;
      let errorMsg = "An unexpected error occurred during API request";

      if (resData?.message) {
        errorMsg = resData.message;
      } else if (Array.isArray(resData?.errors) && resData.errors.length > 0) {
        errorMsg = resData.errors
          .map((e: any) => (typeof e === 'object' && e.message ? e.message : String(e)))
          .join(", ");
      } else if (typeof resData?.error === "string") {
        errorMsg = resData.error;
      } else if (error.message) {
        errorMsg = error.message;
      }

      toast.error(errorMsg, "API Error");
    }

    return Promise.reject(error);
  },
);
