import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Intelligent Production & Local API Base URL Resolver
 * 
 * Rules:
 * 1. When running on a remote/production hostname (e.g. *.vercel.app, *.onrender.com, custom domain):
 *    - Never allow localhost URLs.
 *    - Automatically use the live Render production API: https://studyos-5r51.onrender.com/api/v1
 * 2. When running locally (localhost / 127.0.0.1):
 *    - Use NEXT_PUBLIC_API_URL or fallback to http://localhost:5000/api/v1
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.');

    if (!isLocalhost) {
      const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
      if (configuredUrl && !configuredUrl.includes('localhost') && !configuredUrl.includes('127.0.0.1')) {
        return configuredUrl.replace(/\/+$/, '');
      }
      // Production fallback to live Render backend
      return 'https://studyos-5r51.onrender.com/api/v1';
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (process.env.NODE_ENV === 'production' && (!envUrl || envUrl.includes('localhost'))) {
    return 'https://studyos-5r51.onrender.com/api/v1';
  }

  return (envUrl || 'http://localhost:5000/api/v1').replace(/\/+$/, '');
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let inMemoryToken: string | null = null;

export function setAccessToken(token: string | null) {
  inMemoryToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('studyos_access_token', token);
    } else {
      localStorage.removeItem('studyos_access_token');
      localStorage.removeItem('studyos_user');
    }
  }
}

export function getAccessToken(): string | null {
  if (!inMemoryToken && typeof window !== 'undefined') {
    inMemoryToken = localStorage.getItem('studyos_access_token');
  }
  return inMemoryToken;
}

// Interceptor Request: Dynamically set Base URL and attach Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.baseURL = getApiBaseUrl();

    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response: Handle 401 Silent Token Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
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
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Don't retry auth endpoints themselves
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            originalRequest.baseURL = getApiBaseUrl();
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentBaseUrl = getApiBaseUrl();
        const refreshResponse = await axios.post(
          `${currentBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          originalRequest.baseURL = currentBaseUrl;
          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token exchange failed');
        }
      } catch (refreshErr) {
        processQueue(refreshErr as AxiosError, null);
        setAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
