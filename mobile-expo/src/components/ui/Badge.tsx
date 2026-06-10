import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import theme from '../../utils/theme';

interface BadgeProps {
  label: string;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = theme.colors.primary,
  backgroundColor = theme.colors.primaryBg,
  style,
  textStyle,
  size = 'md',
}) => {
  return (
    <View style={[styles.container, styles[size], { backgroundColor }, style]}>
      <Text style={[styles.text, styles[`text_${size}`], { color }, textStyle]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  lg: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  text: {
    fontWeight: '600',
  },
  text_sm: {
    fontSize: 10,
  },
  text_md: {
    fontSize: 12,
  },
  text_lg: {
    fontSize: 14,
  },
});
