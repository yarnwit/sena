/**
 * SENA Mobile App — Navigation Types
 *
 * Type definitions for React Navigation routes and params
 */

import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

/** Auth Stack (Login, Register, ForgotPassword) */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { resetToken: string };
};

/** Resident Stack (For nested screens like Complaint Detail) */
export type ResidentStackParamList = {
  ResidentTabs: undefined;
  ComplaintDetail: { id: number };
  NewComplaint: undefined;
  EditComplaint: { id: number };
};

/** Staff Stack */
export type StaffStackParamList = {
  StaffTabs: undefined;
  ComplaintDetail: { id: number };
  NewComplaint: undefined;
};

/** Admin Stack */
export type AdminStackParamList = {
  AdminTabs: undefined;
  UserDetail: { id: number };
  ComplaintDetail: { id: number };
};

/** Resident Bottom Tab */
export type ResidentTabParamList = {
  Dashboard: undefined;
  ComplaintsList: undefined;
  Profile: undefined;
};

/** Staff Bottom Tab */
export type StaffTabParamList = {
  Dashboard: undefined;
  Complaints: undefined;
  Profile: undefined;
};

/** Admin Bottom Tab */
export type AdminTabParamList = {
  Dashboard: undefined;
  Users: undefined;
  Complaints: undefined;
  Reports: undefined;
  Logs: undefined;
};

/** Root Navigator — switches between Auth and Role-based navigators */
export type RootStackParamList = {
  Auth: undefined;
  ResidentMain: undefined;
  StaffMain: undefined;
  AdminMain: undefined;
};

/** Navigation prop helpers */
export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>;
export type RootNavigationProp = StackNavigationProp<RootStackParamList>;
export type ResidentNavigationProp = StackNavigationProp<ResidentStackParamList>;
export type StaffNavigationProp = StackNavigationProp<StaffStackParamList>;
export type AdminNavigationProp = StackNavigationProp<AdminStackParamList>;

/** Route prop helpers */
export type AuthRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>;
export type ResidentRouteProp<T extends keyof ResidentStackParamList> = RouteProp<ResidentStackParamList, T>;
export type StaffRouteProp<T extends keyof StaffStackParamList> = RouteProp<StaffStackParamList, T>;
export type AdminRouteProp<T extends keyof AdminStackParamList> = RouteProp<AdminStackParamList, T>;
