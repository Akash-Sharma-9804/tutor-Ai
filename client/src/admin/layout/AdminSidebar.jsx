import { NavLink } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Schools", path: "/admin/schools" },
  { name: "Classes", path: "/admin/classes" },
  { name: "Subjects", path: "/admin/subjects" },
  { name: "Books", path: "/admin/books" },
  { name: "Processing", path: "/admin/processing" },
];

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4 font-bold text-lg border-b">
        Admin Panel
      </div>

      <nav className="p-4 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
