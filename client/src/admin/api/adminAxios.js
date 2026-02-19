import axios from "axios";

const adminAxios = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/admin`,
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
