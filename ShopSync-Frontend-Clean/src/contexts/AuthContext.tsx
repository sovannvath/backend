import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, User, LoginData, RegisterData, UpdateProfileData, UpdatePasswordData } from '@/services/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<boolean>;
  updatePassword: (data: UpdatePasswordData) => Promise<boolean>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check if user is authenticated on app load
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token'); // Consistent token key
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authAPI.getCurrentUser();
      setUser(response.user);
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (data: LoginData): Promise<boolean> => {
    try {
      const response = await authAPI.login(data); // Now passes the data object correctly
      
      // Store token and user data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      toast.success(response.message || 'Login successful!');
      return true;
    } catch (error: any) {
      console.error('Login error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      const errors = error.response?.data?.errors;
      
      if (errors) {
        // Display validation errors
        Object.values(errors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((err: string) => toast.error(err));
          }
        });
      } else {
        toast.error(errorMessage);
      }
      return false;
    }
  };

  // Register function
  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const response = await authAPI.register(data);
      
      // Store token and user data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      
      toast.success(response.message || 'Registration successful!');
      return true;
    } catch (error: any) {
      console.error('Registration error details:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      const errors = error.response?.data?.errors;
      
      if (errors) {
        // Display validation errors
        Object.values(errors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((err: string) => toast.error(err));
          }
        });
      } else {
        toast.error(errorMessage);
      }
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Even if API call fails, we should still clear local data
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
    }
  };

  // Update profile function
  const updateProfile = async (data: UpdateProfileData): Promise<boolean> => {
    try {
      const response = await authAPI.updateProfile(data);
      
      // Update user data
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast.success(response.message || 'Profile updated successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Profile update failed. Please try again.';
      const errors = error.response?.data?.errors;
      
      if (errors) {
        Object.values(errors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((err: string) => toast.error(err));
          }
        });
      } else {
        toast.error(errorMessage);
      }
      return false;
    }
  };

  // Update password function
  const updatePassword = async (data: UpdatePasswordData): Promise<boolean> => {
    try {
      const response = await authAPI.updatePassword(data);
      toast.success(response.message || 'Password updated successfully!');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Password update failed. Please try again.';
      const errors = error.response?.data?.errors;
      
      if (errors) {
        Object.values(errors).forEach((errorArray: any) => {
          if (Array.isArray(errorArray)) {
            errorArray.forEach((err: string) => toast.error(err));
          }
        });
      } else {
        toast.error(errorMessage);
      }
      return false;
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

