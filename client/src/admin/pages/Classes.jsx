import { useEffect, useState } from "react";
import adminAxios from "../api/adminAxios";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [name, setName] = useState("");

  const fetchClasses = () => {
    adminAxios.get("/classes").then(res => setClasses(res.data));
  };

  useEffect(fetchClasses, []);

  const addClass = async () => {
    await adminAxios.post("/classes", { class_name: name });
    setName("");
    fetchClasses();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Classes</h2>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Class name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addClass} className="bg-blue-600 text-white px-4 rounded">
          Add
        </button>
      </div>

      <ul className="bg-white shadow rounded">
        {classes.map(c => (
          <li key={c.id} className="p-2 border-b">
            {c.class_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Classes;
