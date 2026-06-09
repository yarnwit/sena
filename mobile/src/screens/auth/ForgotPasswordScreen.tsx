/**
 * SENA Mobile App — Forgot Password Screen
 *
 * Two-phase password recovery:
 * Phase 1: Verify identity (username, first_name, last_name) → get resetToken
 * Phase 2: Set new password using resetToken
 *
 * Matches backend: POST /api/auth/forgot-password → POST /api/auth/reset-password
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
import { authApi } from '@api/index';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from '@validators/auth.validator';
import { colors, spacing, borderRadius, typography, shadows } from '@utils/theme';
import type { AuthNavigationProp } from '../../types/navigation';

type Phase = 'verify' | 'reset' | 'success';

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();

  const [phase, setPhase] = useState<Phase>('verify');
  const [resetToken, setResetToken] = useState('');

  // Verify identity form
  const [verifyForm, setVerifyForm] = useState<ForgotPasswordFormData>({
    username: '',
    first_name: '',
    last_name: '',
  });
  const [verifyErrors, setVerifyErrors] = useState<
    Partial<Record<keyof ForgotPasswordFormData, string>>
  >({});

  // Reset password form
  const [resetForm, setResetForm] = useState<ResetPasswordFormData>({
    newPassword: '',
    confirmPassword: '',
  });
  const [resetErrors, setResetErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({});

  const [isLoading, setIsLoading] = useState(false);

  const updateVerifyField = (field: keyof ForgotPasswordFormData, value: string) => {
    setVerifyForm(prev => ({ ...prev, [field]: value }));
    if (verifyErrors[field]) {
      setVerifyErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateResetField = (field: keyof ResetPasswordFormData, value: string) => {
    setResetForm(prev => ({ ...prev, [field]: value }));
    if (resetErrors[field]) {
      setResetErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Phase 1: Verify identity to get reset token
   */
  const handleVerifyIdentity = async () => {
    const result = forgotPasswordSchema.safeParse(verifyForm);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ForgotPasswordFormData, string>> = {};
      result.error.issues.forEach((err: any) => {
        const field = err.path[0] as keyof ForgotPasswordFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setVerifyErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    setVerifyErrors({});

    try {
      const response = await authApi.forgotPassword(verifyForm);
      setResetToken(response.data.resetToken);
      setPhase('reset');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'ไม่สามารถยืนยันตัวตนได้ กรุณาตรวจสอบข้อมูลอีกครั้ง';
      Alert.alert('ยืนยันตัวตนไม่สำเร็จ', message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Phase 2: Set new password
   */
  const handleResetPassword = async () => {
    const result = resetPasswordSchema.safeParse(resetForm);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
      result.error.issues.forEach((err: any) => {
        const field = err.path[0] as keyof ResetPasswordFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setResetErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    setResetErrors({});

    try {
      await authApi.resetPassword({
        resetToken,
        newPassword: resetForm.newPassword,
      });
      setPhase('success');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      Alert.alert('เปลี่ยนรหัสผ่านไม่สำเร็จ', message);
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
        {/* Header */}
        <View style={styles.headerSection}>
          <Pressable
            onPress={() => {
              if (phase === 'reset') {
                setPhase('verify');
              } else {
                navigation.goBack();
              }
            }}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {phase === 'success' ? 'สำเร็จ!' : 'ลืมรหัสผ่าน'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {phase === 'verify' && 'กรอกข้อมูลเพื่อยืนยันตัวตน'}
            {phase === 'reset' && 'ตั้งรหัสผ่านใหม่'}
            {phase === 'success' && 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว'}
          </Text>
        </View>

        {/* Phase: Verify Identity */}
        {phase === 'verify' && (
          <View style={[styles.card, shadows.lg]}>
            <View style={styles.iconCircle}>
              <Icon name="account-search-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.cardDescription}>
              กรุณากรอกข้อมูลให้ตรงกับที่ลงทะเบียนไว้ เพื่อยืนยันตัวตนของท่าน
            </Text>

            <Input
              label="ชื่อผู้ใช้"
              placeholder="กรอกชื่อผู้ใช้"
              leftIcon="account-outline"
              value={verifyForm.username}
              onChangeText={(text) => updateVerifyField('username', text)}
              error={verifyErrors.username}
              autoCapitalize="none"
            />

            <Input
              label="ชื่อจริง"
              placeholder="กรอกชื่อจริง"
              leftIcon="account-edit-outline"
              value={verifyForm.first_name}
              onChangeText={(text) => updateVerifyField('first_name', text)}
              error={verifyErrors.first_name}
            />

            <Input
              label="นามสกุล"
              placeholder="กรอกนามสกุล"
              leftIcon="account-edit-outline"
              value={verifyForm.last_name}
              onChangeText={(text) => updateVerifyField('last_name', text)}
              error={verifyErrors.last_name}
            />

            <Button
              title="ยืนยันตัวตน"
              onPress={handleVerifyIdentity}
              loading={isLoading}
              icon="shield-check-outline"
              size="lg"
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Phase: Reset Password */}
        {phase === 'reset' && (
          <View style={[styles.card, shadows.lg]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.successBg }]}>
              <Icon name="lock-reset" size={32} color={colors.success} />
            </View>
            <Text style={styles.cardDescription}>
              ยืนยันตัวตนสำเร็จ! กรุณาตั้งรหัสผ่านใหม่
            </Text>

            <Input
              label="รหัสผ่านใหม่"
              placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
              leftIcon="lock-outline"
              value={resetForm.newPassword}
              onChangeText={(text) => updateResetField('newPassword', text)}
              error={resetErrors.newPassword}
              isPassword
            />

            <Input
              label="ยืนยันรหัสผ่าน"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              leftIcon="lock-check-outline"
              value={resetForm.confirmPassword}
              onChangeText={(text) => updateResetField('confirmPassword', text)}
              error={resetErrors.confirmPassword}
              isPassword
            />

            <Button
              title="เปลี่ยนรหัสผ่าน"
              onPress={handleResetPassword}
              loading={isLoading}
              icon="content-save-check-outline"
              size="lg"
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Phase: Success */}
        {phase === 'success' && (
          <View style={[styles.card, shadows.lg]}>
            <View style={[styles.iconCircle, styles.successCircle]}>
              <Icon name="check-circle" size={48} color={colors.success} />
            </View>
            <Text style={styles.successTitle}>เปลี่ยนรหัสผ่านสำเร็จ!</Text>
            <Text style={styles.cardDescription}>
              กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ของท่าน
            </Text>

            <Button
              title="กลับไปเข้าสู่ระบบ"
              onPress={() => navigation.navigate('Login')}
              icon="login"
              size="lg"
              style={styles.actionButton}
            />
          </View>
        )}
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
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['3xl'],
  },
  headerSection: {
    marginBottom: spacing['2xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  successCircle: {
    width: 80,
    height: 80,
    backgroundColor: colors.successBg,
  },
  cardDescription: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: 22,
  },
  successTitle: {
    ...typography.h2,
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
});

export default ForgotPasswordScreen;
