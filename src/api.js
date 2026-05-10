import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = "https://rehanverse.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
});

// ✅ Har request ke saath token auto attach hoga
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Agar token expired/invalid hua to user ko crash nahi dikhega
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      const currentPath = window.location.pathname;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();

      if (currentPath !== "/login" && currentPath !== "/signup") {
        toast.error("Session expired. Please login again.");

        setTimeout(() => {
          window.location.href = "/login";
        }, 800);
      }
    }

    return Promise.reject(error);
  }
);

export default api;