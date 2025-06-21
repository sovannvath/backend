import axios from "axios";
import {
  User,
  UpdateProfileData,
  UpdatePreferencesData,
  DashboardStats,
  IncomeAnalytics,
  CategoryAnalytics,
  Category,
  Brand,
  Product,
  ApiResponse,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://laravel-wtc.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token"); // Changed from "access_token" to "auth_token"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      localStorage.removeItem("auth_token"); // Changed from "access_token" to "auth_token"
      localStorage.removeItem("user");
      // Optionally redirect to login page
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Define types for login and register data
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UpdatePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const authAPI = {
  // Authentication - Updated to match AuthContext expectations
  login: async (data: LoginData): Promise<{ user: User; token: string; message?: string }> => {
    try {
      const response = await api.post("/login", {
        email: data.email,
        password: data.password,
      });
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token); // Changed from "access_token" to "auth_token"
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (data: RegisterData): Promise<{ user: User; token: string; message?: string }> => {
    try {
      const response = await api.post("/register", data);
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem("auth_token", response.data.token); // Changed from "access_token" to "auth_token"
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("auth_token"); // Changed from "access_token" to "auth_token"
      localStorage.removeItem("user");
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("auth_token"); // Changed from "access_token" to "auth_token"
    return !!token;
  },

  // Get stored user data
  getStoredUser: (): User | null => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  },

  // User related
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await api.get("/user");
    
    // Update stored user data
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    }
    
    return { user: response.data };
  },

  updateProfile: async (
    data: UpdateProfileData,
  ): Promise<{ user: User; message?: string }> => {
    const response = await api.put("/user/profile", data);
    
    // Update stored user data
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    }
    
    return { user: response.data };
  },

  updatePassword: async (
    data: UpdatePasswordData,
  ): Promise<{ message?: string }> => {
    const response = await api.put("/user/password", data);
    return response.data;
  },

  updatePreferences: async (
    data: UpdatePreferencesData,
  ): Promise<User> => {
    const response = await api.put("/user/preferences", data);
    return response.data;
  },

  // Products
  getProducts: async (): Promise<Product[]> => {
    const response = await api.get("/products");
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data;
  },

  // Brands
  getBrands: async (): Promise<Brand[]> => {
    const response = await api.get("/brands");
    return response.data;
  },

  // Orders
  getOrders: async (): Promise<any[]> => {
    const response = await api.get("/orders");
    return response.data;
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  getIncomeAnalytics: async (
    period: string,
  ): Promise<IncomeAnalytics> => {
    const response = await api.get(
      `/dashboard/analytics/income?period=${period}`,
    );
    return response.data;
  },

  getCategoryAnalytics: async (): Promise<CategoryAnalytics> => {
    const response = await api.get("/dashboard/analytics/categories");
    return response.data;
  },
};

export default api;

