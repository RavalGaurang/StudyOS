import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userService } from '@/services/userService';
import { getApiErrorMessage } from '@/lib/api/apiService';
import {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  UserListParams,
  UserListResponse,
} from '@/types/user.types';
import { PaginationMeta } from '@/types/api.types';
import { toast } from '@/hooks/useToast';

export interface UserState {
  users: User[];
  selectedUser: User | null;
  pagination: PaginationMeta;
  loading: boolean;
  actionLoading: boolean;
  statusLoading: Record<string, boolean>; // Tracks per-user status toggle loading: { [userId]: boolean }
  error: string | null;
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  actionLoading: false,
  statusLoading: {},
  error: null,
};

// Async Thunks
export const fetchUsers = createAsyncThunk<
  UserListResponse,
  UserListParams | undefined,
  { rejectValue: string }
>('users/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    return await userService.getUsers(params);
  } catch (error: any) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const fetchUserById = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>('users/fetchUserById', async (id, { rejectWithValue }) => {
  try {
    return await userService.getUserById(id);
  } catch (error: any) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const createUser = createAsyncThunk<
  User,
  CreateUserPayload,
  { rejectValue: string }
>('users/createUser', async (payload, { rejectWithValue }) => {
  try {
    return await userService.createUser(payload);
  } catch (error: any) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const updateUser = createAsyncThunk<
  User,
  { id: string; payload: UpdateUserPayload },
  { rejectValue: string }
>('users/updateUser', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await userService.updateUser(id, payload);
  } catch (error: any) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('users/deleteUser', async (id, { rejectWithValue }) => {
  try {
    await userService.deleteUser(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(getApiErrorMessage(error));
  }
});

export const updateUserStatus = createAsyncThunk<
  User,
  { id: string; isActive: boolean },
  { rejectValue: { id: string; error: string; previousStatus: boolean } }
>('users/updateUserStatus', async ({ id, isActive }, { rejectWithValue }) => {
  try {
    return await userService.updateUserStatus(id, isActive);
  } catch (error: any) {
    return rejectWithValue({
      id,
      error: getApiErrorMessage(error),
      previousStatus: !isActive,
    });
  }
});

export const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    // 1. fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.meta;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      });

    // 2. fetchUserById
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to fetch user';
      });

    // 3. createUser
    builder
      .addCase(createUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.users.unshift(action.payload);
        state.pagination.total += 1;
        toast.success(
          `User "${action.payload.firstName} ${action.payload.lastName}" created successfully!`,
          'User Created'
        );
      })
      .addCase(createUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to create user';
      });

    // 4. updateUser
    builder
      .addCase(updateUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.users.findIndex((u) => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
        toast.success(
          `User "${action.payload.firstName} ${action.payload.lastName}" updated successfully!`,
          'User Updated'
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to update user';
      });

    // 5. deleteUser
    builder
      .addCase(deleteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        const targetUser = state.users.find((u) => u.id === action.payload);
        const name = targetUser ? `"${targetUser.firstName} ${targetUser.lastName}"` : 'User';
        state.users = state.users.filter((u) => u.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
        toast.success(`User ${name} deleted successfully!`, 'User Deleted');
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload || 'Failed to delete user';
      });

    // 6. updateUserStatus
    builder
      .addCase(updateUserStatus.pending, (state, action) => {
        const userId = action.meta.arg.id;
        state.statusLoading[userId] = true;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const userId = action.payload.id;
        delete state.statusLoading[userId];
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          user.isActive = action.payload.isActive;
        }
        if (state.selectedUser?.id === userId) {
          state.selectedUser.isActive = action.payload.isActive;
        }
        toast.success(
          `User "${action.payload.firstName} ${action.payload.lastName}" is now ${
            action.payload.isActive ? 'Active' : 'Inactive'
          }`,
          'Status Updated'
        );
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        if (action.payload) {
          const { id, previousStatus } = action.payload;
          delete state.statusLoading[id];
          const user = state.users.find((u) => u.id === id);
          if (user) {
            user.isActive = previousStatus;
          }
        }
      });
  },
});

export const { setSelectedUser, clearUserError, setPage } = userSlice.actions;

export default userSlice.reducer;
