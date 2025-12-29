import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";
import SchoolsStats from "../components/School/SchoolsStats";
import SchoolsFilters from "../components/School/SchoolsFilters";
import SchoolsGrid from "../components/School/SchoolsGrid";
import SchoolsTable from "../components/School/SchoolsTable";
import AddSchoolModal from "../components/School/AddSchoolModal";
import ViewSchoolModal from "../components/School/ViewSchoolModal";
import EditSchoolModal from "../components/School/EditSchoolModal";
import DeleteSchoolModal from "../components/School/DeleteSchoolModal";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import SchoolsHeader from "../components/School/SchoolsHeader";
import AdminFooter from "../layout/AdminFooter";

const Schools = () => {
  const [schools, setSchools] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBoard, setFilterBoard] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    board: "",
    country: "",
    state: "",
  });

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await adminAxios.get("/schools");
      setSchools(res.data.data);
      setFilteredSchools(res.data.data);
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

    if (searchTerm) {
      results = results.filter(
        (school) =>
          school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.board?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          school.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterBoard) {
      results = results.filter((school) => school.board === filterBoard);
    }

    if (filterCountry) {
      results = results.filter((school) => school.country === filterCountry);
    }

    setFilteredSchools(results);
  }, [searchTerm, filterBoard, filterCountry, schools]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const updateSchool = async (e) => {
    e.preventDefault();
    if (!selectedSchool) return;

    try {
      await adminAxios.put(`/schools/${selectedSchool.id}`, formData);
      setShowEditModal(false);
      fetchSchools();
      setFormData({ name: "", board: "", country: "", state: "" });
      setSelectedSchool(null);
    } catch (error) {
      console.error("Error updating school:", error);
    }
  };

  const deleteSchool = async () => {
    if (!selectedSchool) return;

    try {
      await adminAxios.delete(`/schools/${selectedSchool.id}`);
      setShowDeleteModal(false);
      fetchSchools();
      setSelectedSchool(null);
    } catch (error) {
      console.error("Error deleting school:", error);
    }
  };

  const handleViewSchool = async (id) => {
    try {
      const res = await adminAxios.get(`/schools/${id}`);
      setSelectedSchool(res.data.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching school details:", error);
    }
  };

  const handleEditSchool = (school) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      board: school.board || "",
      country: school.country || "",
      state: school.state || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteSchool = (school) => {
    setSelectedSchool(school);
    setShowDeleteModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterBoard("");
    setFilterCountry("");
  };

  if (loading) {
    return <LoadingSpinner message="Loading schools..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0 transition-colors duration-200">
      {/* Header */}
      <SchoolsHeader onAddSchool={() => setShowAddForm(true)} />

      {/* Stats Overview */}
      <SchoolsStats schools={schools} />

      {/* Search and Filters */}
      <SchoolsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterBoard={filterBoard}
        setFilterBoard={setFilterBoard}
        filterCountry={filterCountry}
        setFilterCountry={setFilterCountry}
        filteredSchools={filteredSchools}
        schools={schools}
        clearFilters={clearFilters}
      />

      {/* Schools Content */}
      {filteredSchools.length === 0 ? (
        <EmptyState
          schoolsCount={schools.length}
          onAddSchool={() => {
            setShowAddForm(true);
            clearFilters();
          }}
        />
      ) : (
        <>
          <SchoolsGrid
            schools={filteredSchools}
            onView={handleViewSchool}
            onEdit={handleEditSchool}
            onDelete={handleDeleteSchool}
          />

          <div className="mt-8">
            <SchoolsTable
              schools={filteredSchools}
              onView={handleViewSchool}
              onEdit={handleEditSchool}
              onDelete={handleDeleteSchool}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showAddForm && (
        <AddSchoolModal
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={addSchool}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showViewModal && selectedSchool && (
        <ViewSchoolModal
          school={selectedSchool}
          onEdit={() => {
            setShowViewModal(false);
            handleEditSchool(selectedSchool);
          }}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSchool(null);
          }}
        />
      )}

      {showEditModal && selectedSchool && (
        <EditSchoolModal
          school={selectedSchool}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={updateSchool}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSchool(null);
            setFormData({ name: "", board: "", country: "", state: "" });
          }}
        />
      )}

      {showDeleteModal && selectedSchool && (
        <DeleteSchoolModal
          school={selectedSchool}
          onDelete={deleteSchool}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSchool(null);
          }}
        />
      )}
      <div className=" md:-mx-8 -mx-4">
        <AdminFooter />
      </div>
    </div>
  );
};

export default Schools;
