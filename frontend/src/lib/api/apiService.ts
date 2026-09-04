/**
 * Reusable REST API Service
 * Clean and simple wrappers around Axios for GET, POST, PUT, PATCH, DELETE.
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { apiClient } from './axios';
import { ApiResponse } from '@/types/api.types';
import { HTTP_METHODS, HttpMethod } from '@/enums/app.enum';

export interface DynamicRequestParams<TData = any> {
  endpoint: string;
  method?: HttpMethod;
  data?: TData;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  config?: AxiosRequestConfig;
}

/**
 * Extracts a clean, human-readable error string from any API error response
 */
export function getApiErrorMessage(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map((e: any) => e.message).join(', ');
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

export const apiService = {
  /**
   * Generic GET request
   */
  async get<T = any>(
    endpoint: string,
    params?: Record<string, any>,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const res: AxiosResponse<ApiResponse<T>> = await apiClient.get(endpoint, {
      params,
      ...config,
    });
    return res.data;
  },

  /**
   * Generic POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const res: AxiosResponse<ApiResponse<T>> = await apiClient.post(endpoint, data, config);
    return res.data;
  },

  /**
   * Generic PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const res: AxiosResponse<ApiResponse<T>> = await apiClient.put(endpoint, data, config);
    return res.data;
  },

  /**
   * Generic PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const res: AxiosResponse<ApiResponse<T>> = await apiClient.patch(endpoint, data, config);
    return res.data;
  },

  /**
   * Generic DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const res: AxiosResponse<ApiResponse<T>> = await apiClient.delete(endpoint, config);
    return res.data;
  },

  /**
   * Dynamic request method for the common dynamic action
   */
  async request<T = any>({
    endpoint,
    method = HTTP_METHODS.GET,
    data,
    params,
    headers,
    config,
  }: DynamicRequestParams<T>): Promise<ApiResponse<T>> {
    const mergedConfig: AxiosRequestConfig = {
      method,
      url: endpoint,
      data,
      params,
      headers,
      ...config,
    };

    const res: AxiosResponse<ApiResponse<T>> = await apiClient.request(mergedConfig);
    return res.data;
  },
};

export default apiService;
