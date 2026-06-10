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
import NotificationsScreen from '../screens/resident/NotificationsScreen';

const Tab = createBottomTabNavigator<ResidentTabParamList>();
const Stack = createStackNavigator<ResidentStackParamList>();

const ResidentTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#38BC0B', // Active green
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)', // Inactive gray
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 0,
          right: 0,
          marginHorizontal: 20,
          backgroundColor: '#161D19',
          borderRadius: 35,
          height: 68,
          paddingHorizontal: 15,
          paddingBottom: 15,
          paddingTop: 8,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarItemStyle: {
          padding: 0,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'ภาพรวม',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NewComplaint"
        component={NewComplaintScreen}
        options={{
          title: 'สร้างคำร้อง',
          tabBarIcon: ({ color, size }) => (
            <Icon name="plus-circle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ComplaintsList"
        component={ComplaintsListScreen}
        options={{
          title: 'ประวัติ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="receipt" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-outline" size={24} color={color} />
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
        headerTitleAlign: 'center',
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
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EditComplaint"
        component={EditComplaintScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen as any}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default ResidentNavigator;
