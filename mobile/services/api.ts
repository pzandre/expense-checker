import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Use SecureStore on native, AsyncStorage on web
const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      throw error;
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      // Ignore storage errors
    }
  },
};

// Get API URL from environment or use default
const getApiBaseUrl = () => {
  // For Android emulator, use 10.0.2.2 instead of localhost
  // For physical device, use your computer's local IP
  // You can override this by setting EXPO_PUBLIC_API_URL environment variable
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // Default for development (works with web and iOS simulator)
  // For Android emulator, change to: http://10.0.2.2:8000/api
  return 'http://192.168.1.54:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

interface LoginCredentials {
  username: string;
  password: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

interface Expense {
  id: number;
  amount: string;
  description: string;
  category?: ExpenseCategory;
  category_name?: string; // For list view
  category_id: number;
  date: string;
  user?: string;
  created_at: string;
  updated_at?: string;
}

interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface ExpenseFilters {
  category?: number | string; // Can be single ID or comma-separated IDs
  date_from?: string;
  date_to?: string;
  search?: string;
}

interface ReportSummary {
  total_amount: number;
  total_count: number;
  category_totals: Array<{
    category__name: string;
    category__id: number;
    total: number;
    count: number;
  }>;
  average_daily: number | null;
  filters: {
    category: number | null;
    date_from: string | null;
    date_to: string | null;
    description: string | null;
  };
}

class ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await storage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await storage.getItem('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post<TokenResponse>(
              `${API_BASE_URL}/auth/refresh/`,
              { refresh: refreshToken }
            );

            const { access, refresh } = response.data;
            await storage.setItem('access_token', access);
            await storage.setItem('refresh_token', refresh);

            this.processQueue(null, access);

            originalRequest.headers.Authorization = `Bearer ${access}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    try {
      const response = await this.client.post<TokenResponse>(
        '/auth/login/',
        credentials
      );
      const { access, refresh } = response.data;
      await storage.setItem('access_token', access);
      await storage.setItem('refresh_token', refresh);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async logout(): Promise<void> {
    await storage.removeItem('access_token');
    await storage.removeItem('refresh_token');
  }

  async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    const response = await this.client.get<Expense[] | { results: Expense[] }>('/expenses/', {
      params: filters,
    });
    // Handle paginated response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If paginated, return results array
    return (response.data as any).results || [];
  }

  async getExpense(id: number): Promise<Expense> {
    const response = await this.client.get<Expense>(`/expenses/${id}/`);
    return response.data;
  }

  async createExpense(data: Partial<Expense>): Promise<Expense> {
    const response = await this.client.post<Expense>('/expenses/', data);
    return response.data;
  }

  async updateExpense(id: number, data: Partial<Expense>): Promise<Expense> {
    const response = await this.client.put<Expense>(`/expenses/${id}/`, data);
    return response.data;
  }

  async deleteExpense(id: number): Promise<void> {
    await this.client.delete(`/expenses/${id}/`);
  }

  async getCategories(): Promise<ExpenseCategory[]> {
    const response = await this.client.get<ExpenseCategory[] | { results: ExpenseCategory[] }>('/categories/');
    // Handle paginated response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    // If paginated, return results array
    return (response.data as any).results || [];
  }

  async getCategory(id: number): Promise<ExpenseCategory> {
    const response = await this.client.get<ExpenseCategory>(`/categories/${id}/`);
    return response.data;
  }

  async createCategory(data: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
    const response = await this.client.post<ExpenseCategory>('/categories/', data);
    return response.data;
  }

  async updateCategory(
    id: number,
    data: Partial<ExpenseCategory>
  ): Promise<ExpenseCategory> {
    const response = await this.client.put<ExpenseCategory>(
      `/categories/${id}/`,
      data
    );
    return response.data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.client.delete(`/categories/${id}/`);
  }

  async getReports(filters?: ExpenseFilters): Promise<ReportSummary> {
    const response = await this.client.get<ReportSummary>('/reports/summary/', {
      params: filters,
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export type { Expense, ExpenseCategory, ExpenseFilters, ReportSummary };
