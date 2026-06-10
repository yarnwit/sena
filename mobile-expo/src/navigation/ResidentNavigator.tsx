/**
 * SENA Mobile App — Resident Navigator
 *
 * Bottom Tabs and Stack Navigator for Resident Role
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import theme from '../utils/theme';

import { ResidentTabParamList, ResidentStackParamList } from '../types/navigation';

// Import Screens
import DashboardScreen from '../screens/resident/DashboardScreen';
import ComplaintsListScreen from '../screens/resident/ComplaintsListScreen';
import ProfileScreen from '../screens/resident/ProfileScreen';
import ComplaintDetailScreen from '../screens/resident/ComplaintDetailScreen';
import NewComplaintScreen from '../screens/resident/NewComplaintScreen';
import EditComplaintScreen from '../screens/resident/EditComplaintScreen';

const Tab = createBottomTabNavigator<ResidentTabParamList>();
const Stack = createStackNavigator<ResidentStackParamList>();

const ResidentTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        tabBarActiveTintColor: theme.colors.primary,
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
          title: 'หน้าแรก',
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ComplaintsList"
        component={ComplaintsListScreen}
        options={{
          title: 'ร้องเรียน',
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const ResidentNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
      }}
    >
      <Stack.Screen
        name="ResidentTabs"
        component={ResidentTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ComplaintDetail"
        component={ComplaintDetailScreen}
        options={{ title: 'รายละเอียดการร้องเรียน' }}
      />
      <Stack.Screen
        name="NewComplaint"
        component={NewComplaintScreen}
        options={{ title: 'แจ้งเรื่องร้องเรียน' }}
      />
      <Stack.Screen
        name="EditComplaint"
        component={EditComplaintScreen}
        options={{ title: 'แก้ไขเรื่องร้องเรียน' }}
      />
    </Stack.Navigator>
  );
};

export default ResidentNavigator;
