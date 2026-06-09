/**
 * SENA Mobile App — Button Component
 *
 * Reusable button with variants: primary, secondary, danger, outline, ghost
 * Supports loading state and icon
 */

import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, borderRadius, typography, shadows } from '@utils/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = true,
}) => {
  const isDisabled = disabled || loading;

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles.button,
        sizeStyles.button,
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        variant === 'primary' && !isDisabled && shadows.md,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.loaderColor}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={sizeStyles.iconSize}
              color={isDisabled ? colors.text.disabled : variantStyles.iconColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={sizeStyles.iconSize}
              color={isDisabled ? colors.text.disabled : variantStyles.iconColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </Pressable>
  );
};

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return {
        button: { backgroundColor: colors.primary } as ViewStyle,
        text: { color: colors.text.inverse } as TextStyle,
        iconColor: colors.text.inverse,
        loaderColor: colors.text.inverse,
      };
    case 'secondary':
      return {
        button: { backgroundColor: colors.primaryBg } as ViewStyle,
        text: { color: colors.primary } as TextStyle,
        iconColor: colors.primary,
        loaderColor: colors.primary,
      };
    case 'danger':
      return {
        button: { backgroundColor: colors.error } as ViewStyle,
        text: { color: colors.text.inverse } as TextStyle,
        iconColor: colors.text.inverse,
        loaderColor: colors.text.inverse,
      };
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.border,
        } as ViewStyle,
        text: { color: colors.text.primary } as TextStyle,
        iconColor: colors.text.primary,
        loaderColor: colors.primary,
      };
    case 'ghost':
      return {
        button: { backgroundColor: 'transparent' } as ViewStyle,
        text: { color: colors.primary } as TextStyle,
        iconColor: colors.primary,
        loaderColor: colors.primary,
      };
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return {
        button: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg } as ViewStyle,
        text: typography.buttonSmall as TextStyle,
        iconSize: 16,
      };
    case 'md':
      return {
        button: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl } as ViewStyle,
        text: typography.button as TextStyle,
        iconSize: 18,
      };
    case 'lg':
      return {
        button: { paddingVertical: spacing.lg, paddingHorizontal: spacing['2xl'] } as ViewStyle,
        text: { ...typography.button, fontSize: 16 } as TextStyle,
        iconSize: 20,
      };
  }
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.text.disabled,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default Button;
