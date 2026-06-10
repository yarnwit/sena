/**
 * SENA Mobile App — Loading Spinner Component
 *
 * Full-screen or inline loading indicator
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@utils/theme';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message,
  size = 'large',
  color = colors.primary,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <View style={styles.spinnerCard}>
          <ActivityIndicator size={size} color={color} />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inline}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  spinnerCard: {
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.lg,
  },
});

export default LoadingSpinner;
