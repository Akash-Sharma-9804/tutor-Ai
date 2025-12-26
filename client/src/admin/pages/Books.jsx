import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";
import Table from "../components/Table";
import StatusBadge from "../components/StatusBadge";

const Books = () => {
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);

  const [schoolId, setSchoolId] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  /* Fetch schools */
  useEffect(() => {
    adminAxios.get("/schools").then(res => setSchools(res.data));
  }, []);

  /* Fetch classes when school changes */
  useEffect(() => {
    if (!schoolId) return;
    setClassId("");
    setSubjectId("");
    setBooks([]);

    adminAxios
      .get(`/classes?schoolId=${schoolId}`)
      .then(res => setClasses(res.data));
  }, [schoolId]);

  /* Fetch subjects when class changes */
  /* Fetch subjects when class changes */
useEffect(() => {
  if (!schoolId || !classId) return;

  setSubjectId("");
  setBooks([]);

  adminAxios
    .get(`/subjects?schoolId=${schoolId}&classId=${classId}`)
    .then(res => setSubjects(res.data));
}, [schoolId, classId]);


  /* Fetch books when subject changes */
  useEffect(() => {
    if (!subjectId) return;

    adminAxios
      .get(`/books?subjectId=${subjectId}`)
      .then(res => setBooks(res.data));
  }, [subjectId]);

  const tableData = books.map(b => ({
  Title: b.title,
  Class: b.class_name,
  Subject: b.subject,
  Status: <StatusBadge status="ready" />
}));

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Books</h2>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        {/* School */}
        <select
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select School</option>
          {schools.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Class */}
        <select
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="border p-2 rounded"
          disabled={!schoolId}
        >
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>
              {c.class_name}
            </option>
          ))}
        </select>

        {/* Subject */}
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="border p-2 rounded"
          disabled={!classId}
        >
          <option value="">Select Subject</option>
          {subjects.map(s => (
   <option key={s.id} value={s.id}>
     {s.subject_name}
   </option>
 ))}
        </select>
      </div>

      {/* Books Table */}
      <Table
        columns={["Title", "Class", "Subject", "Status"]}
        data={tableData}
      />
    </div>
  );
};

export default Books;
