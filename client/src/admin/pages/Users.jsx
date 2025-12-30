import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaSortAmountDown,
  FaSortAmountUp,
  FaDownload,
  FaSync,
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaSchool,
  FaIdCard,
} from "react-icons/fa";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import LoadingState from "../components/Dashboard/LoadingState";
import ErrorState from "../components/Dashboard/ErrorState";
import AdminFooter from "../layout/AdminFooter";
import adminAxios from "../api/adminAxios";

// Mock data for development
const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    role: "admin",
    status: "active",
    school_name: "Delhi Public School",
    created_at: "2024-01-15T10:30:00Z",
    avatar: null,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567891",
    role: "teacher",
    status: "active",
    school_name: "St. Mary's Convent",
    created_at: "2024-01-14T15:45:00Z",
    avatar: null,
  },
  {
    id: 3,
    name: "Robert Johnson",
    email: "robert@example.com",
    phone: "+1234567892",
    role: "student",
    status: "active",
    school_name: "Greenwood High",
    created_at: "2024-01-13T09:20:00Z",
    avatar: null,
  },
  {
    id: 4,
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+1234567893",
    role: "teacher",
    status: "inactive",
    school_name: "Delhi Public School",
    created_at: "2024-01-12T14:15:00Z",
    avatar: null,
  },
  {
    id: 5,
    name: "Michael Brown",
    email: "michael@example.com",
    phone: "+1234567894",
    role: "student",
    status: "active",
    school_name: "St. Mary's Convent",
    created_at: "2024-01-11T11:30:00Z",
    avatar: null,
  },
  {
    id: 6,
    name: "Emily Davis",
    email: "emily@example.com",
    phone: "+1234567895",
    role: "admin",
    status: "active",
    school_name: "Greenwood High",
    created_at: "2024-01-10T16:45:00Z",
    avatar: null,
  },
  {
    id: 7,
    name: "David Wilson",
    email: "david@example.com",
    phone: "+1234567896",
    role: "teacher",
    status: "pending",
    school_name: "Delhi Public School",
    created_at: "2024-01-09T13:20:00Z",
    avatar: null,
  },
  {
    id: 8,
    name: "Lisa Taylor",
    email: "lisa@example.com",
    phone: "+1234567897",
    role: "student",
    status: "suspended",
    school_name: "St. Mary's Convent",
    created_at: "2024-01-08T10:15:00Z",
    avatar: null,
  },
  {
    id: 9,
    name: "Thomas Anderson",
    email: "thomas@example.com",
    phone: "+1234567898",
    role: "teacher",
    status: "active",
    school_name: "Greenwood High",
    created_at: "2024-01-07T15:30:00Z",
    avatar: null,
  },
  {
    id: 10,
    name: "Maria Garcia",
    email: "maria@example.com",
    phone: "+1234567899",
    role: "student",
    status: "active",
    school_name: "Delhi Public School",
    created_at: "2024-01-06T12:45:00Z",
    avatar: null,
  },
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "created_at",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [userToAction, setUserToAction] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    teachers: 0,
    students: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, statusFilter, roleFilter, sortConfig]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAxios.get("/students");
      if (response.data.success) {
        setUsers(response.data.data.users);
        setFilteredUsers(response.data.data.users);
        setStats(response.data.data.stats);
        setError(null);
      } else {
        setError(response.data.message || "Failed to load users");
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(
        err.response?.data?.message || "Network error. Please try again."
      );
      // Use mock data for demo
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
      setStats({
        total: 150,
        active: 120,
        inactive: 30,
        admins: 5,
        teachers: 25,
        students: 120,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.includes(searchTerm) ||
          user.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map((user) => user.id));
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await adminAxios.delete(`/students/${userId}`);
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
      setShowDeleteModal(false);
      setUserToAction(null);
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user. Please try again.");
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminAxios.put(`/students/${userId}/status`, { status: newStatus });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      setShowStatusModal(false);
      setUserToAction(null);
    } catch (err) {
      console.error("Failed to update user status:", err);
      alert("Failed to update user status. Please try again.");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      alert("Please select users to perform bulk action");
      return;
    }

    try {
      if (action === "delete") {
        if (
          window.confirm(
            `Are you sure you want to delete ${selectedUsers.length} user(s)?`
          )
        ) {
          await Promise.all(
            selectedUsers.map((userId) =>
              adminAxios.delete(`/students/${userId}`)
            )
          );
          setUsers((prev) =>
            prev.filter((user) => !selectedUsers.includes(user.id))
          );
          setSelectedUsers([]);
        }
      } else if (action === "activate" || action === "deactivate") {
        const newStatus = action === "activate" ? "active" : "inactive";
        await Promise.all(
          selectedUsers.map((userId) =>
            adminAxios.put(`/students/${userId}/status`, { status: newStatus })
          )
        );
        setUsers((prev) =>
          prev.map((user) =>
            selectedUsers.includes(user.id)
              ? { ...user, status: newStatus }
              : user
          )
        );
        setSelectedUsers([]);
      }
    } catch (err) {
      console.error("Failed to perform bulk action:", err);
      alert("Failed to perform bulk action. Please try again.");
    }
  };

  const handleExport = () => {
    const data = filteredUsers.map((user) => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone || "N/A",
      Role: user.role,
      Status: user.status,
      School: user.school_name || "N/A",
      "Joined Date": new Date(user.created_at).toLocaleDateString(),
    }));

    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Pagination
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <LoadingState />;
  if (error && users.length === 0) return <ErrorState error={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center mb-2">
                <div className="p-3 rounded-xl mr-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
                  <FaUsers className="text-white text-xl" />
                </div>
                <span className="text-gray-800 dark:text-white">
                  Student Management
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all students across the platform
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                onClick={() => navigate("/admin/users/add")}
                className="px-6 py-3 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <FaUserPlus className="mr-2" />
                Add New Students
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Students"
              value={stats.total}
              icon={FaUsers}
              color="blue"
            />
            <StatCard
              title="Active Students"
              value={stats.active}
              icon={FaUserCheck}
              color="green"
            />
            <StatCard
              title="Inactive Students"
              value={stats.inactive}
              icon={FaUserTimes}
              color="red"
            />
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="rounded-2xl p-4 mb-6 shadow-lg bg-white/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name, email, phone, or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <FaSearch className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 rounded-xl border flex items-center transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <FaFilter className="mr-2" />
                Filters
                {showFilters && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>

              <button
                onClick={fetchUsers}
                className="p-3 rounded-xl border transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="Refresh"
              >
                <FaSync />
              </button>

              <button
                onClick={handleExport}
                className="p-3 rounded-xl border transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                title="Export to CSV"
              >
                <FaDownload />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Role
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Items Per Page
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="25">25 per page</option>
                    <option value="50">50 per page</option>
                    <option value="100">100 per page</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <div className="rounded-xl p-4 mb-6 shadow-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-3 md:mb-0">
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {selectedUsers.length} user(s) selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center transition-colors"
                >
                  <FaUserCheck className="mr-2" />
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center transition-colors"
                >
                  <FaUserTimes className="mr-2" />
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center transition-colors"
                >
                  <FaTrash className="mr-2" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="rounded-2xl shadow-xl overflow-hidden border bg-white/80 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                  <th className="p-4 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === currentUsers.length &&
                          currentUsers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                      />
                    </div>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      User
                      {sortConfig.key === "name" &&
                        (sortConfig.direction === "asc" ? (
                          <FaSortAmountUp className="ml-2" />
                        ) : (
                          <FaSortAmountDown className="ml-2" />
                        ))}
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("email")}
                      className="flex items-center font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Contact
                      {sortConfig.key === "email" &&
                        (sortConfig.direction === "asc" ? (
                          <FaSortAmountUp className="ml-2" />
                        ) : (
                          <FaSortAmountDown className="ml-2" />
                        ))}
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("role")}
                      className="flex items-center font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Role
                      {sortConfig.key === "role" &&
                        (sortConfig.direction === "asc" ? (
                          <FaSortAmountUp className="ml-2" />
                        ) : (
                          <FaSortAmountDown className="ml-2" />
                        ))}
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("school_name")}
                      className="flex items-center font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      School
                      {sortConfig.key === "school_name" &&
                        (sortConfig.direction === "asc" ? (
                          <FaSortAmountUp className="ml-2" />
                        ) : (
                          <FaSortAmountDown className="ml-2" />
                        ))}
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Status
                      {sortConfig.key === "status" &&
                        (sortConfig.direction === "asc" ? (
                          <FaSortAmountUp className="ml-2" />
                        ) : (
                          <FaSortAmountDown className="ml-2" />
                        ))}
                    </button>
                  </th>
                  <th className="p-4 text-left">
                    <button
                      onClick={() => handleSort("created_at")}
                      className="flex items-center font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      Joined
                      {sortConfig.key === "created_at" &&
                        (sortConfig.direction === "asc" ? (
                          <FaSortAmountUp className="ml-2" />
                        ) : (
                          <FaSortAmountDown className="ml-2" />
                        ))}
                    </button>
                  </th>
                  <th className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FaUsers className="text-4xl mb-4 text-gray-400 dark:text-gray-600" />
                        <p className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">
                          No users found
                        </p>
                        <p className="text-gray-500 dark:text-gray-500">
                          {searchTerm ||
                          statusFilter !== "all" ||
                          roleFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "No users available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`border-t transition-colors border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                        selectedUsers.includes(user.id)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              className="h-12 w-12 rounded-full object-cover"
                              src={
                                user.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                  user.name
                                )}&background=random`
                              }
                              alt={user.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <FaEnvelope className="mr-2 text-gray-400 dark:text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {user.email}
                            </span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center">
                              <FaPhone className="mr-2 text-gray-400 dark:text-gray-400" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {user.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                              : user.role === "teacher"
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {user.role === "admin" && (
                            <FaUserCircle className="mr-1" />
                          )}
                          {user.role === "teacher" && (
                            <FaUserCircle className="mr-1" />
                          )}
                          {user.role === "student" && (
                            <FaIdCard className="mr-1" />
                          )}
                          Student
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaSchool className="mr-2 text-gray-400 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {user.school_name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.status === "active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : user.status === "inactive"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                              : user.status === "pending"
                              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                              : "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {user.status === "active" && (
                            <FaUserCheck className="mr-1" />
                          )}
                          {user.status === "inactive" && (
                            <FaUserTimes className="mr-1" />
                          )}
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-gray-400 dark:text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="p-2 rounded-lg transition-colors text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/users/${user.id}/edit`)
                            }
                            className="p-2 rounded-lg transition-colors text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              setUserToAction(user);
                              setShowStatusModal(true);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              user.status === "active"
                                ? "text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30"
                                : "text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30"
                            }`}
                            title={
                              user.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            {user.status === "active" ? (
                              <FaUserTimes />
                            ) : (
                              <FaUserCheck />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setUserToAction(user);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-4 md:mb-0 text-gray-600 dark:text-gray-400">
                  Showing {indexOfFirstUser + 1} to{" "}
                  {Math.min(indexOfLastUser, filteredUsers.length)} of{" "}
                  {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${
                      currentPage === 1
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FiChevronsLeft />
                  </button>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${
                      currentPage === 1
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FiChevronLeft />
                  </button>

                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }

                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`px-4 py-2 rounded-lg border ${
                          currentPage === pageNumber
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FiChevronRight />
                  </button>
                  <button
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages
                        ? "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <FiChevronsRight />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full bg-white dark:bg-gray-800">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Delete User
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-bold text-red-500">
                {userToAction.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToAction(null);
                }}
                className="px-4 py-2 rounded-lg border transition-colors border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(userToAction.id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && userToAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-md w-full bg-white dark:bg-gray-800">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {userToAction.status === "active" ? "Deactivate" : "Activate"}{" "}
              User
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to{" "}
              {userToAction.status === "active" ? "deactivate" : "activate"}{" "}
              <span className="font-bold">{userToAction.name}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setUserToAction(null);
                }}
                className="px-4 py-2 rounded-lg border transition-colors border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleStatusChange(
                    userToAction.id,
                    userToAction.status === "active" ? "inactive" : "active"
                  )
                }
                className={`px-4 py-2 rounded-lg text-white transition-colors ${
                  userToAction.status === "active"
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {userToAction.status === "active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminFooter />
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800",
    green:
      "from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 border-green-200 dark:border-green-800",
    red: "from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/20 border-red-200 dark:border-red-800",
    purple:
      "from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/20 border-purple-200 dark:border-purple-800",
    orange:
      "from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20 border-orange-200 dark:border-orange-800",
    indigo:
      "from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800",
  };

  const iconColors = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`p-3 rounded-lg ${
            color === "blue"
              ? "bg-blue-100 dark:bg-blue-900/30"
              : color === "green"
              ? "bg-green-100 dark:bg-green-900/30"
              : color === "red"
              ? "bg-red-100 dark:bg-red-900/30"
              : color === "purple"
              ? "bg-purple-100 dark:bg-purple-900/30"
              : color === "orange"
              ? "bg-orange-100 dark:bg-orange-900/30"
              : "bg-indigo-100 dark:bg-indigo-900/30"
          }`}
        >
          <Icon className={`text-xl ${iconColors[color]}`} />
        </div>
      </div>
    </div>
  );
};

export default Users;
