/**
 * SENA Mobile App — Login Screen
 *
 * Login form with username + password, validated with Zod
 * Navigates to Register or ForgotPassword screens
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button, Input } from '@components/ui';
import { useAuth } from '@hooks/useAuth';
import { loginSchema, type LoginFormData } from '@validators/auth.validator';
import { colors, spacing, borderRadius, typography, shadows } from '@utils/theme';
import type { AuthNavigationProp } from '../../types/navigation';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { login } = useAuth();

  const [form, setForm] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof LoginFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async () => {
    // Validate form
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((err: any) => {
        const field = err.path[0] as keyof LoginFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login(form);
      // Navigation will be handled by RootNavigator based on auth state
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Branding */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Icon name="shield-home" size={48} color={colors.primary} />
          </View>
          <Text style={styles.appName}>SENA</Text>
          <Text style={styles.appTagline}>ระบบรับร้องเรียนนิติบุคคล</Text>
        </View>

        {/* Login Card */}
        <View style={[styles.card, shadows.lg]}>
          <Text style={styles.cardTitle}>เข้าสู่ระบบ</Text>
          <Text style={styles.cardSubtitle}>
            กรอกข้อมูลเพื่อเข้าใช้งานระบบ
          </Text>

          <Input
            label="ชื่อผู้ใช้"
            placeholder="กรอกชื่อผู้ใช้"
            leftIcon="account-outline"
            value={form.username}
            onChangeText={(text) => updateField('username', text)}
            error={errors.username}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <Input
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
            leftIcon="lock-outline"
            value={form.password}
            onChangeText={(text) => updateField('password', text)}
            error={errors.password}
            isPassword
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordBtn}
          >
            <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
          </Pressable>

          <Button
            title="เข้าสู่ระบบ"
            onPress={handleLogin}
            loading={isLoading}
            icon="login"
            size="lg"
            style={styles.loginButton}
          />
        </View>

        {/* Register Link */}
        <View style={styles.registerSection}>
          <Text style={styles.registerText}>ยังไม่มีบัญชี? </Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>สมัครสมาชิก</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['5xl'],
    paddingBottom: spacing['3xl'],
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  appName: {
    ...typography.h1,
    color: colors.primary,
    letterSpacing: 2,
  },
  appTagline: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  cardTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing['2xl'],
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  registerLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
