import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adminLogout } from "../../store/adminAuthSlice";

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Clear admin auth state
    dispatch(adminLogout());

    // 2. Redirect to admin login
    navigate("/admin/login", { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Admin Dashboard</h1>

      <button
        onClick={handleLogout}
        className="text-sm text-red-600 hover:underline"
      >
        Logout
      </button>
    </header>
  );
};

export default AdminHeader;
