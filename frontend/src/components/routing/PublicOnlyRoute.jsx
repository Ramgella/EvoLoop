import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../ui/LoadingScreen';

/** Login/signup pages: signed-in users are sent on to the dashboard. */
export default function PublicOnlyRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (session) return <Navigate to={location.state?.from || '/dashboard'} replace />;
  return children;
}
