/**
 * SENA Mobile App — Root Navigator (Navigation Guard)
 *
 * The main navigation controller that:
 * 1. Shows a loading spinner while checking auth state
 * 2. Redirects unauthenticated users to Auth Navigator
 * 3. Routes authenticated users to their role-based navigator:
 *    - resident → ResidentNavigator
 *    - staff → StaffNavigator
 *    - admin → AdminNavigator
 * 4. Prevents cross-role access (enforced structurally)
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoadingSpinner } from '@components/ui';
import { useAuth } from '@hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import ResidentNavigator from './ResidentNavigator';
import StaffNavigator from './StaffNavigator';
import AdminNavigator from './AdminNavigator';
import type { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading screen while restoring session
  if (isLoading) {
    return <LoadingSpinner fullScreen message="กำลังตรวจสอบสิทธิ์..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Not logged in → show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user?.role === 'resident' ? (
          <Stack.Screen name="ResidentMain" component={ResidentNavigator} />
        ) : user?.role === 'staff' ? (
          <Stack.Screen name="StaffMain" component={StaffNavigator} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="AdminMain" component={AdminNavigator} />
        ) : (
          // Fallback if role is invalid or missing
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
