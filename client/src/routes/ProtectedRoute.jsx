import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const { token, student } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/home" replace />;
  }

  if (student && student.profile_complete === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
}