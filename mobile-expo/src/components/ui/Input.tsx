/**
 * SENA Mobile App — Input Component
 *
 * Reusable text input with label, error message, and icon support
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  type TextInputProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { colors, spacing, borderRadius, typography } from '@utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  wrapperStyle?: ViewStyle;
  labelStyle?: TextStyle;
  iconColor?: string;
  isPassword?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  wrapperStyle,
  labelStyle,
  iconColor,
  isPassword = false,
  style,
  placeholderTextColor,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(isPassword);

  const borderColor = error
    ? colors.error
    : isFocused
      ? colors.primary
      : colors.border;

  const defaultIconColor = iconColor || (error ? colors.error : isFocused ? colors.primary : colors.text.tertiary);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          { borderColor },
          isFocused && styles.inputWrapperFocused,
          error && styles.inputWrapperError,
          wrapperStyle,
        ]}
      >
        {leftIcon && (
          <Icon
            name={leftIcon as any}
            size={20}
            color={defaultIconColor}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, leftIcon && styles.inputWithLeftIcon, style]}
          placeholderTextColor={placeholderTextColor || colors.text.tertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          {...rest}
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            style={styles.rightIconBtn}
            hitSlop={8}
          >
            <Icon
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={defaultIconColor}
            />
          </Pressable>
        )}
        {rightIcon && !isPassword && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIconBtn}
            hitSlop={8}
          >
            <Icon name={rightIcon as any} size={20} color={defaultIconColor} />
          </Pressable>
        )}
      </View>
      {error && (
        <View style={styles.errorRow}>
          <Icon name="alert-circle-outline" size={14} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    minHeight: 50,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  inputWrapperError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  rightIconBtn: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginLeft: spacing.xs,
    flex: 1,
  },
});

export default Input;
