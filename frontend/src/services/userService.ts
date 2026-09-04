import { apiClient } from '../lib/api/axios';
import { ACTION_CONFIG } from '../config/action.config';
import { ApiResponse, PaginationMeta } from '../types/api.types';
import {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UserListParams,
  UserListResponse,
} from '../types/user.types';

export const userService = {
  /**
   * Fetch paginated users with optional search, sorting, and filtering
   */
  async getUsers(params: UserListParams = {}): Promise<UserListResponse> {
    const res = await apiClient.get<ApiResponse<User[]>>(ACTION_CONFIG.USERS.BASE, {
      params,
    });

    const defaultMeta: PaginationMeta = {
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 10,
      total: 0,
      totalPages: 1,
    };

    const meta = res.data.meta || res.data.pagination || defaultMeta;

    return {
      users: res.data.data || [],
      meta,
      pagination: meta,
    };
  },

  /**
   * Fetch single user details by ID
   */
  async getUserById(id: string): Promise<User> {
    const res = await apiClient.get<ApiResponse<{ user: User }>>(
      ACTION_CONFIG.USERS.BY_ID(id)
    );
    return res.data.data!.user;
  },

  /**
   * Create a new user
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const res = await apiClient.post<ApiResponse<{ user: User }>>(
      ACTION_CONFIG.USERS.BASE,
      payload
    );
    return res.data.data!.user;
  },

  /**
   * Update an existing user
   */
  async updateUser(id: string, payload: UpdateUserPayload): Promise<User> {
    const res = await apiClient.put<ApiResponse<{ user: User }>>(
      ACTION_CONFIG.USERS.BY_ID(id),
      payload
    );
    return res.data.data!.user;
  },

  /**
   * Delete a user by ID
   */
  async deleteUser(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(ACTION_CONFIG.USERS.BY_ID(id));
  },

  /**
   * Update a user's active/inactive status
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<User> {
    const res = await apiClient.patch<ApiResponse<{ user: User }>>(
      ACTION_CONFIG.USERS.STATUS(id),
      { isActive }
    );
    return res.data.data!.user;
  },
};

export default userService;
