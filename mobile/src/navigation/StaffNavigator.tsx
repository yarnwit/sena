/**
 * SENA Mobile App — Staff Navigator
 *
 * Bottom Tabs and Stack Navigator for Staff Role
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import theme from '../utils/theme';

import { StaffTabParamList, StaffStackParamList } from '../types/navigation';

// Import Screens
import DashboardScreen from '../screens/staff/DashboardScreen';
import ComplaintsListScreen from '../screens/staff/ComplaintsListScreen';
import ProfileScreen from '../screens/staff/ProfileScreen';
import ComplaintDetailScreen from '../screens/staff/ComplaintDetailScreen';
import NewComplaintScreen from '../screens/staff/NewComplaintScreen';

const Tab = createBottomTabNavigator<StaffTabParamList>();
const Stack = createStackNavigator<StaffStackParamList>();

const StaffTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.status.in_progress, // Use a different color for staff to distinguish
        },
        headerTintColor: theme.colors.white,
        tabBarActiveTintColor: theme.colors.status.in_progress,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'ภาพรวมงาน',
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Complaints"
        component={ComplaintsListScreen}
        options={{
          title: 'จัดการเรื่องร้องเรียน',
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-text-multiple" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-badge" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const StaffNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.status.in_progress,
        },
        headerTintColor: theme.colors.white,
      }}
    >
      <Stack.Screen
        name="StaffTabs"
        component={StaffTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ComplaintDetail"
        component={ComplaintDetailScreen}
        options={{ title: 'รายละเอียดและจัดการ' }}
      />
      <Stack.Screen
        name="NewComplaint"
        component={NewComplaintScreen}
        options={{ title: 'สร้างเรื่องร้องเรียนใหม่' }}
      />
    </Stack.Navigator>
  );
};

export default StaffNavigator;
