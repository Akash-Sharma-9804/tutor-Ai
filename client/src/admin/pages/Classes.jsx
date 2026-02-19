import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";
import ClassesHeader from "../components/Clases/ClassesHeader";
import ClassesFilters from "../components/Clases/ClassesFilters";
import ClassesStats from "../components/Clases/ClassesStats";
import ClassesGrid from "../components/Clases/ClassesGrid";
import ClassesTable from "../components/Clases/ClassesTable";
import AddClassModal from "../components/Clases/AddClassModal";
import EditClassModal from "../components/Clases/EditClassModal";
import DeleteClassModal from "../components/Clases/DeleteClassModal";
import ViewClassModal from "../components/Clases/ViewClassModal";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import AdminFooter from "../layout/AdminFooter";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    class_name: "",
    school_id: "",
  });

  // Fetch classes and schools
  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesRes, schoolsRes] = await Promise.all([
        adminAxios.get("/classes"),
        adminAxios.get("/schools")
      ]);
      
      setClasses(classesRes.data.data);
      setFilteredClasses(classesRes.data.data);
      setSchools(schoolsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter classes based on search and school filter
  useEffect(() => {
    let results = classes;

    if (searchTerm) {
      results = results.filter(cls =>
        cls.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSchool) {
      results = results.filter(cls => cls.school_id == selectedSchool);
    }

    setFilteredClasses(results);
  }, [searchTerm, selectedSchool, classes]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      await adminAxios.post("/classes", formData);
      setShowAddModal(false);
      setFormData({ class_name: "", school_id: "" });
      fetchData();
    } catch (error) {
      console.error("Error adding class:", error);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;

    try {
      await adminAxios.put(`/classes/${selectedClass.id}`, formData);
      setShowEditModal(false);
      setSelectedClass(null);
      setFormData({ class_name: "", school_id: "" });
      fetchData();
    } catch (error) {
      console.error("Error updating class:", error);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      await adminAxios.delete(`/classes/${selectedClass.id}`);
      setShowDeleteModal(false);
      setSelectedClass(null);
      fetchData();
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  const handleViewClass = (cls) => {
    setSelectedClass(cls);
    setShowViewModal(true);
  };

  const handleEditClick = (cls) => {
    setSelectedClass(cls);
    setFormData({
      class_name: cls.class_name,
      school_id: cls.school_id,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (cls) => {
    setSelectedClass(cls);
    setShowDeleteModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSchool("");
  };

  if (loading) {
    return <LoadingSpinner message="Loading classes..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0  transition-colors duration-200">
      {/* Header */}
      <ClassesHeader
        onAddClass={() => setShowAddModal(true)}
      />

      {/* Statistics */}
      <ClassesStats
        classes={classes}
        filteredClasses={filteredClasses}
      />

      {/* Filters */}
      <ClassesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
        schools={schools}
        filteredClasses={filteredClasses}
        totalClasses={classes.length}
        clearFilters={clearFilters}
      />

      {/* Classes Content */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          totalClasses={classes.length}
          onAddClass={() => {
            setShowAddModal(true);
            clearFilters();
          }}
        />
      ) : (
        <>
          <ClassesGrid
            classes={filteredClasses}
            onView={handleViewClass}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
          
          <div className="mt-8">
            <ClassesTable
              classes={filteredClasses}
              onView={handleViewClass}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddClassModal
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleAddClass}
          onClose={() => {
            setShowAddModal(false);
            setFormData({ class_name: "", school_id: "" });
          }}
          schools={schools}
        />
      )}

      {showViewModal && selectedClass && (
        <ViewClassModal
          classData={selectedClass}
          onEdit={() => {
            setShowViewModal(false);
            handleEditClick(selectedClass);
          }}
          onClose={() => {
            setShowViewModal(false);
            setSelectedClass(null);
          }}
        />
      )}

      {showEditModal && selectedClass && (
        <EditClassModal
          classData={selectedClass}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleEditClass}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClass(null);
            setFormData({ class_name: "", school_id: "" });
          }}
          schools={schools}
        />
      )}

      {showDeleteModal && selectedClass && (
        <DeleteClassModal
          classData={selectedClass}
          onDelete={handleDeleteClass}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedClass(null);
          }}
        />
      )}
      <div className=" md:-mx-8 -mx-4">
        <AdminFooter/>
      </div>
    </div>
  );
};

export default Classes;