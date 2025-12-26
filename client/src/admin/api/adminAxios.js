import axios from "axios";

const adminAxios = axios.create({
  baseURL: "http://localhost:4000/api/admin",
});

// Attach token automatically
adminAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default adminAxios;
