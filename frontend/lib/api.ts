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
});

// Request interceptor — แนบ accessToken จาก sessionStorage เป็น Authorization header
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('accessToken');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — auto refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ดักจับระบบปิดปรับปรุง (Maintenance Mode)
    if (error.response?.status === 503 && error.response?.data?.code === 'MAINTENANCE_MODE') {
      if (typeof window !== 'undefined') {
        window.location.href = '/maintenance';
      }
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // ถ้าไม่ใช่ 401 หรือ retry แล้ว ให้ reject ทันที
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // ถ้ากำลัง refresh อยู่ ให้รอ queue
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = sessionStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (data.success && data.data?.accessToken) {
        const newAccessToken = data.data.accessToken;
        sessionStorage.setItem('accessToken', newAccessToken);
        if (data.data?.refreshToken) {
          sessionStorage.setItem('refreshToken', data.data.refreshToken);
        }

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } else {
        throw new Error('Refresh response invalid');
      }
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Refresh ล้มเหลว — ล้าง session แล้ว redirect ไป login
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        
        // ล้าง Cookies เก่าที่อาจทำให้ proxy.ts เกิด Infinite Loop
        document.cookie = 'user=; path=/; max-age=0';
        document.cookie = 'accessToken=; path=/; max-age=0';
        document.cookie = 'refreshToken=; path=/; max-age=0';
        
        window.location.href = '/login';
      }
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
