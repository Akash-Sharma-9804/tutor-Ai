import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";
import SubjectsHeader from "../components/Subject/SubjectsHeader";
import SubjectsStats from "../components/Subject/SubjectsStats";
import SubjectsFilters from "../components/Subject/SubjectsFilters";
import SubjectsGrid from "../components/Subject/SubjectsGrid";
import SubjectsTable from "../components/Subject/SubjectsTable";
import AddSubjectModal from "../components/Subject/AddSubjectModal";
import EditSubjectModal from "../components/Subject/EditSubjectModal";
import DeleteSubjectModal from "../components/Subject/DeleteSubjectModal";
import ViewSubjectModal from "../components/Subject/ViewSubjectModal";
import EmptyState from "../components/Subject/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import AdminFooter from "../layout/AdminFooter";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    class_id: "",
  });

  // Fetch schools
  const fetchSchools = async () => {
    try {
      const res = await adminAxios.get("/schools");
      setSchools(res.data.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  // Fetch classes based on school
  const fetchClasses = async (schoolId) => {
    if (!schoolId) {
      setClasses([]);
      setSelectedClass("");
      return;
    }

    try {
      const res = await adminAxios.get(`/classes?school_id=${schoolId}`);
      setClasses(res.data.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    }
  };

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const params = {};
      if (selectedSchool) params.school_id = selectedSchool;
      if (selectedClass) params.class_id = selectedClass;
      if (searchTerm) params.search = searchTerm;

      const res = await adminAxios.get("/subjects", { params });
      setSubjects(res.data.data);
      setFilteredSubjects(res.data.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
      setFilteredSubjects([]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await fetchSchools();
      setLoading(false);
    };
    initData();
  }, []);

  // Fetch classes when school changes
  useEffect(() => {
    if (selectedSchool) {
      fetchClasses(selectedSchool);
      setSelectedClass("");
    } else {
      setClasses([]);
      setSelectedClass("");
    }
  }, [selectedSchool]);

  // Fetch subjects when filters change
  useEffect(() => {
    if (selectedSchool) {
      fetchSubjects();
    } else {
      setSubjects([]);
      setFilteredSubjects([]);
    }
  }, [selectedSchool, selectedClass, searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      class_id: selectedClass,
    };

    try {
      console.log("payload:", payload);

      await adminAxios.post("/subjects", payload);

      setShowAddModal(false);
      setFormData({ name: "", code: "", description: "", class_id: "" });
      fetchSubjects();
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  const handleEditSubject = async (e) => {
    e.preventDefault();
    if (!selectedSubject) return;

    try {
      await adminAxios.put(`/subjects/${selectedSubject.id}`, formData);
      setShowEditModal(false);
      setSelectedSubject(null);
      setFormData({ name: "", code: "", description: "", class_id: "" });
      fetchSubjects();
    } catch (error) {
      console.error("Error updating subject:", error);
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    try {
      await adminAxios.delete(`/subjects/${selectedSubject.id}`);
      setShowDeleteModal(false);
      setSelectedSubject(null);
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const handleViewSubject = async (subject) => {
    try {
      const res = await adminAxios.get(`/subjects/${subject.id}`);
      setSelectedSubject(res.data.data);
      setShowViewModal(true);
    } catch (error) {
      console.error("Error fetching subject details:", error);
    }
  };

  const handleEditClick = (subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || "",
      description: subject.description || "",
      class_id: subject.class_id,
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (subject) => {
    setSelectedSubject(subject);
    setShowDeleteModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSchool("");
    setSelectedClass("");
  };

  if (loading) {
    return <LoadingSpinner message="Loading subjects..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 md:px-6 lg:px-8 pt-8 pb-0 transition-colors duration-200">
      {/* Header */}
      <SubjectsHeader
        onAddSubject={() => setShowAddModal(true)}
        disabled={!selectedSchool || !selectedClass}
      />

      {/* Statistics */}
      <SubjectsStats subjects={subjects} filteredSubjects={filteredSubjects} />

      {/* Filters */}
      <SubjectsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedSchool={selectedSchool}
        setSelectedSchool={setSelectedSchool}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        schools={schools}
        classes={classes}
        filteredSubjects={filteredSubjects}
        totalSubjects={subjects.length}
        clearFilters={clearFilters}
      />

      {/* Subjects Content */}
      {filteredSubjects.length === 0 ? (
        <EmptyState
          totalSubjects={subjects.length}
          hasSchoolSelected={!!selectedSchool}
          hasClassSelected={!!selectedClass}
          onAddSubject={() => setShowAddModal(true)}
          onSelectSchool={() => {
            const schoolSelect = document.querySelector(
              'select[name="school"]'
            );
            schoolSelect?.focus();
          }}
        />
      ) : (
        <>
          <SubjectsGrid
            subjects={filteredSubjects}
            onView={handleViewSubject}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />

          <div className="mt-8">
            <SubjectsTable
              subjects={filteredSubjects}
              onView={handleViewSubject}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          </div>
        </>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddSubjectModal
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleAddSubject}
          onClose={() => {
            setShowAddModal(false);
            setFormData({ name: "", code: "", description: "", class_id: "" });
          }}
          classes={classes}
          selectedSchool={selectedSchool}
          selectedClass={selectedClass}
        />
      )}

      {showViewModal && selectedSubject && (
        <ViewSubjectModal
          subject={selectedSubject}
          onEdit={() => {
            setShowViewModal(false);
            handleEditClick(selectedSubject);
          }}
          onClose={() => {
            setShowViewModal(false);
            setSelectedSubject(null);
          }}
        />
      )}

      {showEditModal && selectedSubject && (
        <EditSubjectModal
          subject={selectedSubject}
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleEditSubject}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSubject(null);
            setFormData({ name: "", code: "", description: "", class_id: "" });
          }}
          classes={classes}
        />
      )}

      {showDeleteModal && selectedSubject && (
        <DeleteSubjectModal
          subject={selectedSubject}
          onDelete={handleDeleteSubject}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSubject(null);
          }}
        />
      )}
      <div className=" md:-mx-8 -mx-4">
        <AdminFooter />
      </div>
    </div>
  );
};

export default Subjects;
