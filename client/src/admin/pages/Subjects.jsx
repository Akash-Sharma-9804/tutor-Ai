import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";

const Subjects = () => {
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [schoolId, setSchoolId] = useState("");
  const [classId, setClassId] = useState("");
  const [name, setName] = useState("");

  /* Fetch schools */
  useEffect(() => {
    adminAxios.get("/schools").then(res => setSchools(res.data));
  }, []);

  /* Fetch classes when school changes */
  useEffect(() => {
    if (!schoolId) return;

    setClassId("");
    setSubjects([]);

    adminAxios
      .get(`/classes?schoolId=${schoolId}`)
      .then(res => setClasses(res.data));
  }, [schoolId]);

  /* Fetch subjects when class changes */
  useEffect(() => {
    if (!schoolId || !classId) return;

    adminAxios
      .get(`/subjects?schoolId=${schoolId}&classId=${classId}`)
      .then(res => setSubjects(res.data));
  }, [schoolId, classId]);

  const addSubject = async () => {
    if (!name.trim() || !classId) return;

    await adminAxios.post("/subjects", {
      class_id: classId,
      name
    });

    setName("");

    const res = await adminAxios.get(
      `/subjects?schoolId=${schoolId}&classId=${classId}`
    );
    setSubjects(res.data);
  };

  const deleteSubject = async (id) => {
    await adminAxios.delete(`/subjects/${id}`);

    const res = await adminAxios.get(
      `/subjects?schoolId=${schoolId}&classId=${classId}`
    );
    setSubjects(res.data);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Subjects</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {/* School */}
        <select
          className="border p-2 rounded"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Class */}
        <select
          className="border p-2 rounded"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          disabled={!schoolId}
        >
          <option value="">Select Class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.class_name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Subject */}
      {classId && (
        <div className="flex gap-2 mb-4">
          <input
            className="border p-2 rounded"
            placeholder="Subject name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={addSubject}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add
          </button>
        </div>
      )}

      {/* Subjects Table */}
      {subjects.length > 0 && (
        <table className="w-full bg-white shadow rounded">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Subject</th>
              <th className="p-2 text-left">Class</th>
              <th className="p-2 text-left">School</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.subject_name}</td>
                <td className="p-2">{s.class_name}</td>
                <td className="p-2">{s.school_name}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => deleteSubject(s.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Subjects;
