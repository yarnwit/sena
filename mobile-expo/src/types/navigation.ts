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
  Notifications: undefined;
};

/** Staff Stack */
export type StaffStackParamList = {
  StaffTabs: undefined;
  ComplaintDetail: { id: number };
  NewComplaint: undefined;
  ComplaintSubList: { category: 'all' | 'pending' | 'in_progress' | 'resolved' };
  EditComplaint: { id: number };
  Notifications: undefined;
};

/** Admin Stack */
export type AdminStackParamList = {
  AdminTabs: undefined;
  UserDetail: { id: number };
  ComplaintDetail: { id: number };
};

export type ResidentTabParamList = {
  Dashboard: undefined;
  NewComplaint: undefined;
  ComplaintsList: undefined;
  Profile: undefined;
};

/** Staff Bottom Tab */
export type StaffTabParamList = {
  Dashboard: undefined;
  NewComplaint: undefined;
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
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type AuthNavigationProp = StackNavigationProp<AuthStackParamList>;
export type RootNavigationProp = StackNavigationProp<RootStackParamList>;
export type ResidentNavigationProp = CompositeNavigationProp<
  StackNavigationProp<ResidentStackParamList>,
  BottomTabNavigationProp<ResidentTabParamList>
>;
export type StaffNavigationProp = CompositeNavigationProp<
  StackNavigationProp<StaffStackParamList>,
  BottomTabNavigationProp<StaffTabParamList>
>;
export type AdminNavigationProp = CompositeNavigationProp<
  StackNavigationProp<AdminStackParamList>,
  BottomTabNavigationProp<AdminTabParamList>
>;

/** Route prop helpers */
export type AuthRouteProp<T extends keyof AuthStackParamList> = RouteProp<AuthStackParamList, T>;
export type ResidentRouteProp<T extends keyof ResidentStackParamList> = RouteProp<ResidentStackParamList, T>;
export type StaffRouteProp<T extends keyof StaffStackParamList> = RouteProp<StaffStackParamList, T>;
export type AdminRouteProp<T extends keyof AdminStackParamList> = RouteProp<AdminStackParamList, T>;
