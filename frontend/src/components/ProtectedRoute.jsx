import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some((role) =>
      user.roles?.some((r) => r.toLowerCase().includes(role.toLowerCase()))
    );
    if (!hasAccess) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
}
