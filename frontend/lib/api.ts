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

/**
 * Helper: อ่าน cookie จาก document.cookie ตามชื่อ
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Request interceptor — แนบ accessToken จาก cookie เป็น Authorization header
// เพราะ httpOnly cookie ที่ backend ตั้งค่าอาจไม่ถูกส่งข้าม port (3000 → 5000)
api.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getCookie('refreshToken');
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        if (data.success) {
          // อัปเดต accessToken ใน cookie ของ frontend ด้วย
          if (data.data?.accessToken) {
            document.cookie = `accessToken=${data.data.accessToken}; path=/; max-age=${60 * 15}; SameSite=Strict`;
          }
          // Retry original request with new token
          const newToken = data.data?.accessToken || getCookie('accessToken');
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
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
