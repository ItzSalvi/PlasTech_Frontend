import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  requireUserRole?: boolean;
}

export function ProtectedRoute({ adminOnly = false, requireUserRole = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireUserRole && user?.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
