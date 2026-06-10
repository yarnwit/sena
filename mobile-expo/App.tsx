/**
 * SENA Mobile App — Entry Point
 *
 * Root component wrapped with:
 * - SafeAreaProvider (safe area management)
 * - AuthProvider (authentication state)
 * - RootNavigator (role-based navigation with route protection)
 */

import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
