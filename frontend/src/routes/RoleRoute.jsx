import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allowedRole, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    if (user.role === "CUSTOMER") {
      return <Navigate to="/customer/home" replace />;
    }
    if (user.role === "OWNER") {
      return <Navigate to="/owner/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
