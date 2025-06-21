import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user?.role?.name !== requiredRole) {
    // Redirect based on user role
    switch (user?.role?.name) {
      case 'Admin':
        return <Navigate to="/dashboard/admin" replace />;
      case 'Warehouse Manager':
        return <Navigate to="/dashboard/warehouse" replace />;
      case 'Staff':
        return <Navigate to="/dashboard/staff" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect authenticated users to appropriate dashboard
  if (isAuthenticated && user) {
    switch (user.role?.name) {
      case 'Admin':
        return <Navigate to="/dashboard/admin" replace />;
      case 'Warehouse Manager':
        return <Navigate to="/dashboard/warehouse" replace />;
      case 'Staff':
        return <Navigate to="/dashboard/staff" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

