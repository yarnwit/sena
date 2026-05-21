import { UserRole } from './auth';

export interface UserProfile {
  user_id: string;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  house_no?: string;
  phone_number?: string;
  resident_type?: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  house_no?: string;
}

export interface ResidentInfo {
  resident_id: number | null;
  first_name: string;
  last_name: string;
  house_no: string;
  phone_number: string;
  resident_type: string;
}
