import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useSlowNote, { WAKING_NOTE } from '../../hooks/useSlowNote';
import { StateMark } from '../ui/Marks';

const CheckingSession = () => {
  const slow = useSlowNote(true);
  return (
    <div className="loading-screen" role="status">
      <p className="state-line"><StateMark kind="waking" /> Checking your session</p>
      {slow && <div className="notice is-wait"><StateMark kind="waking" /><p>{WAKING_NOTE}</p></div>}
    </div>
  );
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <CheckingSession />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
