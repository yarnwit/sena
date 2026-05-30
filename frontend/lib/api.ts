import axios from 'axios';

/**
 * Axios instance with interceptors
 * ตาม AGENTS.md — ทุกฟังก์ชันที่ต้องดึงข้อมูลให้เรียกใช้ผ่าน Axios instance นี้
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor — auto refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (data.success) {
          // Token is now set securely via HttpOnly cookie by backend
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed — clear local state and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
