/**
 * SENA Mobile App — Admin Navigator
 *
 * Phase 4 Navigation
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import theme from '../utils/theme';
import { AdminStackParamList, AdminTabParamList } from '../types/navigation';

// Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import UsersListScreen from '../screens/admin/UsersListScreen';
import UserDetailScreen from '../screens/admin/UserDetailScreen';
import ComplaintsListScreen from '../screens/admin/ComplaintsListScreen';
import ComplaintDetailScreen from '../screens/admin/ComplaintDetailScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import LogsScreen from '../screens/admin/LogsScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();
const Stack = createStackNavigator<AdminStackParamList>();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleAlign: 'center',
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          title: 'ภาพรวม',
          tabBarIcon: ({ color, size }) => <Icon name="view-dashboard" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Users" 
        component={UsersListScreen} 
        options={{
          title: 'ผู้ใช้งาน',
          tabBarIcon: ({ color, size }) => <Icon name="account-group" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Complaints" 
        component={ComplaintsListScreen} 
        options={{
          title: 'ร้องเรียน',
          tabBarIcon: ({ color, size }) => <Icon name="alert-circle" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{
          title: 'รายงาน',
          tabBarIcon: ({ color, size }) => <Icon name="chart-bar" size={size} color={color} />,
        }}
      />
      <Tab.Screen 
        name="Logs" 
        component={LogsScreen} 
        options={{
          title: 'ประวัติ',
          tabBarIcon: ({ color, size }) => <Icon name="history" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const AdminNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.white,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen 
        name="AdminTabs" 
        component={AdminTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="UserDetail" 
        component={UserDetailScreen} 
        options={{ title: 'รายละเอียดผู้ใช้งาน' }}
      />
      <Stack.Screen 
        name="ComplaintDetail" 
        component={ComplaintDetailScreen} 
        options={{ title: 'รายละเอียดเรื่องร้องเรียน' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
