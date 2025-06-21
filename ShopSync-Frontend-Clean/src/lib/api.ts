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
} from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Uses the .env variable
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // For sessions/cookies if using Laravel Sanctum
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// User API
export const fetchUser = async (): Promise<User> => {
  const response = await api.get("/user");
  return response.data;
};

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await api.put("/profile", data);
  return response.data;
};

export const updatePreferences = async (
  data: UpdatePreferencesData,
): Promise<User> => {
  const response = await api.put("/preferences", data);
  return response.data;
};

// Dashboard API
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const fetchIncomeAnalytics = async (): Promise<IncomeAnalytics> => {
  const response = await api.get("/analytics/income");
  return response.data;
};

export const fetchCategoryAnalytics = async (): Promise<CategoryAnalytics> => {
  const response = await api.get("/analytics/categories");
  return response.data;
};

// Catalog API
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await api.get("/categories");
  return response.data.data || response.data.categories;
};

export const fetchBrands = async (): Promise<Brand[]> => {
  const response = await api.get("/brands");
  return response.data.data || response.data.brands;
};

export const fetchProducts = async (params = {}): Promise<Product[]> => {
  const response = await api.get("/products", { params });
  return response.data.data || response.data.products;
};

export const createProduct = async (
  productData: FormData,
): Promise<Product> => {
  const response = await api.post("/products", productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateProduct = async (
  id: number,
  productData: FormData,
): Promise<Product> => {
  const response = await api.post(`/products/${id}`, productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export default api;
