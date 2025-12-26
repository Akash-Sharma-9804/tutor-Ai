import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminProtectedRoute = () => {
  const isAdminAuthenticated = useSelector(
    (state) => state.adminAuth?.isAuthenticated
  );

  return isAdminAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace />
  );
};

export default AdminProtectedRoute;

