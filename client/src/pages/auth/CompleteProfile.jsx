import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { GraduationCap, School, Users, Calendar, Phone, ChevronRight, Sparkles, BookOpen, CheckCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get studentId from state (login) or query param (signup)
  const studentId = location.state?.studentId || new URLSearchParams(location.search).get("studentId");
  const token = location.state?.token || new URLSearchParams(location.search).get("token") || localStorage.getItem("token");

  const [form, setForm] = useState({ schoolName: "", className: "", gender: "", dob: "", phone: "" });
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  // Subject selection for class 11 & 12
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const UPPER_SECONDARY_CLASSES = /^(11|12)(\s*[\(\s]*(Science|Arts|Commerce)[\)]*)?$/i;
  const isUpperSecondary = UPPER_SECONDARY_CLASSES.test(form.className?.trim());

  const toggleSubject = (id) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!studentId) navigate("/login");
    axios.get(`${API_BASE_URL}/api/data/schools`).then((res) => setSchools(res.data)).catch(console.error);
  }, []);

  // Auto-fetch subjects when class 11/12 is selected
  useEffect(() => {
    if (selectedClassId && isUpperSecondary) {
      setSelectedSubjectIds([]);
      axios
        .get(`${API_BASE_URL}/api/subjects/class/${selectedClassId}`)
        .then((res) => setAvailableSubjects(res.data))
        .catch(() => setAvailableSubjects([]));
    } else {
      setAvailableSubjects([]);
      setSelectedSubjectIds([]);
    }
  }, [selectedClassId, form.className]);

  const handleSubmit = async () => {
    if (!form.schoolName || !form.className || !form.gender || !form.dob || !form.phone) {
      alert("Please fill in all fields.");
      return;
    }
    if (isUpperSecondary && selectedSubjectIds.length === 0) {
      alert("Please select at least one subject before continuing.");
      return;
    }
    setIsLoading(true);
    try {
      // 1. Save school/class/gender/dob/phone
      const res = await axios.post(`${API_BASE_URL}/api/auth/complete-profile`, {
        studentId,
        ...form,
      }, { headers: { Authorization: `Bearer ${token}` } });

      // 2. If class 11/12, save selected subjects
      if (isUpperSecondary && selectedSubjectIds.length > 0) {
        await axios.post(
          `${API_BASE_URL}/api/subjects/student/select`,
          { subjectIds: selectedSubjectIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 3. Update Redux store so ProtectedRoute sees profile_complete = true
      dispatch(loginSuccess({
        token,
        student: res.data.student,
      }));

      setFormSubmitted(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      navigate("/", { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">

      {/* Success Overlay */}
      {formSubmitted && (
        <div className="fixed inset-0 bg-green-500/90 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="text-center p-8 bg-white rounded-3xl shadow-2xl max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6 animate-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome Aboard! 🎉</h3>
            <p className="text-gray-600 mb-6">Your profile is complete! Taking you to your dashboard...</p>
            <div className="w-12 h-12 border-4 border-white border-t-green-500 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Complete Your Profile</h2>
          <p className="text-gray-500 text-sm">Just a few more details to get you started!</p>
        </div>

        <div className="space-y-4">
          {/* School */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <School className="w-4 h-4" /> School *
            </label>
            <select
              value={form.schoolName}
              onChange={(e) => {
                const selectedSchool = schools.find(s => s.name === e.target.value);
                setForm({ ...form, schoolName: e.target.value, className: "" });
                setClasses([]);
                setSelectedClassId(null);
                if (selectedSchool) {
                  axios.get(`${API_BASE_URL}/api/school/${selectedSchool.id}`)
                    .then((res) => setClasses(Array.isArray(res.data) ? res.data : res.data.data || []))
                    .catch(console.error);
                }
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
              required
            >
              <option value="">Select your school</option>
              {schools.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Class *
            </label>
            <select
              value={selectedClassId || ""}
              onChange={(e) => {
                const cls = classes.find(c => String(c.id) === e.target.value);
                setSelectedClassId(e.target.value);
                setForm({ ...form, className: cls ? cls.class_name : "" });
              }}
              disabled={!form.schoolName}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-500 focus:outline-none text-sm ${!form.schoolName ? "bg-gray-100 border-gray-200 text-gray-400" : "border-gray-200"}`}
              required
            >
              <option value="">{form.schoolName ? "Select class" : "Select school first"}</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.class_name}</option>)}
            </select>
          </div>

          {/* Subject Selection — shown only for class 11/12 */}
          {isUpperSecondary && availableSubjects.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Select Your Subjects *
                <span className="text-xs text-red-500 font-normal">(required)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableSubjects.map((subject) => {
                  const isSelected = selectedSubjectIds.includes(subject.id);
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => toggleSubject(subject.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        isSelected ? "border-indigo-500 bg-indigo-500" : "border-gray-300"
                      }`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-xs font-medium">{subject.name}</span>
                    </button>
                  );
                })}
              </div>
              {selectedSubjectIds.length === 0 && (
                <p className="text-xs text-red-400 mt-1">Please select at least one subject to continue.</p>
              )}
            </div>
          )}

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Users className="w-4 h-4" /> Gender *
            </label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Date of Birth *
            </label>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number *
            </label>
            <input
              type="tel"
              placeholder="Your mobile number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-sm"
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white py-3.5 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Complete Profile <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}