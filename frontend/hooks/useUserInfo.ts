import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface UserInfo {
  first_name: string;
  last_name: string;
  phone_number: string;
  house_no: string;
  phase: string;
  soi: string;
}

export function useUserInfo() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await api.get('/complaints/user-info');
        if (res.data?.success && res.data?.data) {
          setUserInfo(res.data.data);
        }
      } catch (err) {
        console.error("Fetch user info error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { userInfo, isLoading, houseNo: userInfo?.house_no || "" };
}
