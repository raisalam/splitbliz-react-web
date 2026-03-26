import { Navigate, Outlet } from 'react-router-dom';
import { tokenStore } from '../services/apiClient';

export function ProtectedRoute() {
  const token = tokenStore.get();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
