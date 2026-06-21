import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

export function PrivateRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}