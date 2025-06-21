import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderSuccess from "./pages/OrderSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManagement from "./pages/AdminManagement";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StaffManagement from "./pages/StaffManagement";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Placeholder components for routes to be implemented later
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-metallic-100 to-white dark:from-slate-900 dark:to-slate-800 transition-colors">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-metallic-900 dark:text-white mb-4 transition-colors">
        {title}
      </h1>
      <p className="text-metallic-600 dark:text-slate-400 transition-colors">
        This page is coming soon...
      </p>
    </div>
  </div>
);

const App = () => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Index />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route
              path="/categories"
              element={<PlaceholderPage title="Categories" />}
            />
            <Route
              path="/categories/:slug"
              element={<PlaceholderPage title="Category Products" />}
            />
            <Route path="/brands" element={<PlaceholderPage title="Brands" />} />

            {/* Auth routes - redirect if already logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected routes - require authentication */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/success"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Order Details" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Wishlist" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Role-based dashboard routes */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-management"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/warehouse"
              element={
                <ProtectedRoute requiredRole="Warehouse Manager">
                  <WarehouseDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-management"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/staff"
              element={
                <ProtectedRoute requiredRole="Staff">
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Generic dashboard route - redirects based on role */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PlaceholderPage title="Dashboard" />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

