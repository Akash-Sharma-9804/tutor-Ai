import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";
import {
  FaSchool,
  FaTrash,
  FaEdit,
  FaPlus,
  FaSearch,
  FaGlobe,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaEye,
  FaFilter
} from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBoard, setFilterBoard] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    board: "",
    country: "",
    state: ""
  });

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await adminAxios.get("/schools");
      setSchools(res.data);
      setFilteredSchools(res.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    let results = schools;
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(school =>
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.board?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply board filter
    if (filterBoard) {
      results = results.filter(school => school.board === filterBoard);
    }
    
    // Apply country filter
    if (filterCountry) {
      results = results.filter(school => school.country === filterCountry);
    }
    
    setFilteredSchools(results);
  }, [searchTerm, filterBoard, filterCountry, schools]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSchool = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    try {
      await adminAxios.post("/schools", formData);
      setFormData({ name: "", board: "", country: "", state: "" });
      setShowAddForm(false);
      fetchSchools();
    } catch (error) {
      console.error("Error adding school:", error);
    }
  };

  const deleteSchool = async (id) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;
    
    try {
      await adminAxios.delete(`/schools/${id}`);
      fetchSchools();
    } catch (error) {
      console.error("Error deleting school:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Extract unique values for filters
  const uniqueBoards = [...new Set(schools.map(s => s.board).filter(Boolean))];
  const uniqueCountries = [...new Set(schools.map(s => s.country).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading schools...</p>
        </div>
      </div>
    );
  }

  const SchoolCard = ({ school }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow mr-4">
            <FaSchool className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-1">{school.name}</h3>
            <div className="flex flex-wrap gap-2">
              {school.board && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  <FaGraduationCap className="mr-1" />
                  {school.board}
                </span>
              )}
              {school.country && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <FaGlobe className="mr-1" />
                  {school.country}
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => deleteSchool(school.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete School"
        >
          <FaTrash />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Location</p>
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-gray-400 mr-2" />
            <span className="font-medium text-gray-800">
              {school.state || "N/A"}, {school.country || "N/A"}
            </span>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Registered On</p>
          <div className="flex items-center">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <span className="font-medium text-gray-800">{formatDate(school.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <button
          onClick={() => {/* Navigate to school details */}}
          className="flex items-center text-blue-600 font-medium hover:text-blue-700"
        >
          <FaEye className="mr-2" />
          View Details
        </button>
        <button
          onClick={() => {/* Edit school */}}
          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );

  const StatCard = ({ label, value, icon: Icon, color }) => {
    const colorClasses = {
      blue: "from-blue-500 to-cyan-500",
      green: "from-emerald-500 to-teal-500",
      purple: "from-purple-500 to-pink-500",
      orange: "from-orange-500 to-amber-500"
    };

    return (
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm mb-2">{label}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
          </div>
          <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl`}>
            <Icon className="text-white text-xl" />
          </div>
        </div>
        <div className="mt-3 flex items-center text-green-600 text-sm">
          <FiTrendingUp className="mr-1" />
          <span>+12% from last month</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">School Management</h1>
            <p className="text-gray-600">Manage and oversee all registered educational institutions</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center"
          >
            <FaPlus className="mr-2" />
            Add New School
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Schools"
            value={schools.length}
            icon={FaSchool}
            color="blue"
          />
          <StatCard
            label="Active Boards"
            value={uniqueBoards.length}
            icon={FaGraduationCap}
            color="green"
          />
          <StatCard
            label="Countries"
            value={uniqueCountries.length}
            icon={FaGlobe}
            color="purple"
          />
          <StatCard
            label="Total Students"
            value="1,234"
            icon={FaSchool}
            color="orange"
          />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search schools by name, board, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filterBoard}
                onChange={(e) => setFilterBoard(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Boards</option>
                {uniqueBoards.map(board => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-bold">{filteredSchools.length}</span> of <span className="font-bold">{schools.length}</span> schools
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterBoard("");
                setFilterCountry("");
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Add School Modal/Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add New School</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={addSchool}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter school name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education Board
                  </label>
                  <select
                    name="board"
                    value={formData.board}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Board</option>
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IB">IB</option>
                    <option value="Cambridge">Cambridge</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Country"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
                >
                  Add School
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schools Grid/Table */}
      {filteredSchools.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSchool className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Schools Found</h3>
          <p className="text-gray-600 mb-6">
            {schools.length === 0 
              ? "Get started by adding your first school" 
              : "No schools match your search criteria"}
          </p>
          <button
            onClick={() => {
              setShowAddForm(true);
              setSearchTerm("");
              setFilterBoard("");
              setFilterCountry("");
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
          >
            <FaPlus className="inline mr-2" />
            Add Your First School
          </button>
        </div>
      ) : (
        <>
          {/* Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredSchools.map(school => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>

          {/* Table View */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="p-4 text-left font-bold text-gray-700">School Name</th>
                    <th className="p-4 text-left font-bold text-gray-700">Board</th>
                    <th className="p-4 text-left font-bold text-gray-700">Location</th>
                    <th className="p-4 text-left font-bold text-gray-700">Registered</th>
                    <th className="p-4 text-left font-bold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.map(school => (
                    <tr key={school.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-50 rounded-lg mr-3">
                            <FaSchool className="text-blue-600" />
                          </div>
                          <span className="font-bold text-gray-800">{school.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {school.board || "Not specified"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="text-gray-400 mr-2" />
                          <span className="text-gray-700">
                            {school.state || "N/A"}, {school.country || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-gray-400 mr-2" />
                          <span className="text-gray-700">{formatDate(school.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {/* Edit functionality */}}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => deleteSchool(school.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                          <button
                            onClick={() => {/* View details */}}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Schools;