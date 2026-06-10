import apiClient from './client';

export interface UserProfile {
  user_id: number;
  username: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  house_no?: string | null;
  phone_number?: string | null;
  resident_type?: string | null;
  phase?: string | null;
  soi?: string | null;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  house_no?: string;
  phone_number?: string;
  resident_type?: string;
  phase?: string;
  soi?: string;
}

export const getProfile = async (): Promise<{ success: boolean; data: UserProfile }> => {
  const response = await apiClient.get('/users/profile');
  return response.data;
};

export const updateProfile = async (data: UpdateProfilePayload): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.patch('/users/profile', data);
  return response.data;
};
