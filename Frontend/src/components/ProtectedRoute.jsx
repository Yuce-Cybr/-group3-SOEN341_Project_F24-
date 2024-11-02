import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <div>Unauthorized Access</div>;  // You can also redirect to a 403 page
  }

  return children;
};

export default ProtectedRoute;
