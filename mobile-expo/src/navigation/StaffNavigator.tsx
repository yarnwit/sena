/**
 * SENA Mobile App — Staff Navigator
 *
 * Bottom Tabs and Stack Navigator for Staff Role
 */

import React from 'react';
import { Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import theme from '../utils/theme';

import { StaffTabParamList, StaffStackParamList } from '../types/navigation';

const { width } = Dimensions.get('window');

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
        headerShown: false,
        tabBarActiveTintColor: '#5495ff', // Active blue
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)', // Inactive gray
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 24,
          right: 24,
          backgroundColor: '#1E2C3A', // Dark pill background
          borderRadius: 35,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10, // คืนขนาดตัวหนังสือ
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
          title: 'ภาพรวมงาน',
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-grid" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NewComplaint"
        component={NewComplaintScreen}
        options={{
          title: 'สร้างเรื่องร้องเรียน',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document-plus-outline" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Complaints"
        component={ComplaintsListScreen}
        options={{
          title: 'จัดการร้องเรียน',
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-text-outline" size={24} color={color} />
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
    </Stack.Navigator>
  );
};

export default StaffNavigator;
