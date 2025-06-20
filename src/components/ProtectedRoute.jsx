import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

export default function ProtectedRoute() {
  const { isLogin } = useAuth();
  return isLogin ? <Outlet /> : <Navigate to="/login" />;
}
