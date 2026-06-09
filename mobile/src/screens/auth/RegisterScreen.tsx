/**
 * SENA Mobile App — Register Screen
 *
 * Registration form for residents only
 * Fields: username, password, first_name, last_name, house_no, phone_number, resident_type, phase, soi
 * Validated with Zod
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
  Alert,
  type TextInput as TextInputType,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Button, Input } from '@components/ui';
import { useAuth } from '@hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@validators/auth.validator';
import { colors, spacing, borderRadius, typography, shadows } from '@utils/theme';
import type { AuthNavigationProp } from '../../types/navigation';

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { register } = useAuth();

  const [form, setForm] = useState<RegisterFormData>({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    house_no: '',
    phone_number: '',
    resident_type: '',
    phase: '',
    soi: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // Multi-step form

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const step1Fields = ['username', 'password', 'first_name', 'last_name'] as const;
    const step1Data = {
      username: form.username,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name,
      // Provide defaults for step 2 fields to pass full schema
      house_no: 'temp',
      phone_number: '000000000',
      resident_type: 'temp',
      phase: 'temp',
      soi: 'temp',
    };
    const result = registerSchema.safeParse(step1Data);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((err: any) => {
        const field = err.path[0] as keyof RegisterFormData;
        if (step1Fields.includes(field as any) && !fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async () => {
    // Validate full form
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((err: any) => {
        const field = err.path[0] as keyof RegisterFormData;
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
      await register(form);
      // Navigation handled by RootNavigator
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
      Alert.alert('สมัครสมาชิกไม่สำเร็จ', message);
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
            onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>สมัครสมาชิก</Text>
          <Text style={styles.headerSubtitle}>สำหรับลูกบ้าน (Resident) เท่านั้น</Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
            <Text style={[styles.stepNumber, step >= 1 && styles.stepNumberActive]}>1</Text>
          </View>
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
            <Text style={[styles.stepNumber, step >= 2 && styles.stepNumberActive]}>2</Text>
          </View>
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, step === 1 && styles.stepLabelActive]}>
            ข้อมูลบัญชี
          </Text>
          <Text style={[styles.stepLabel, step === 2 && styles.stepLabelActive]}>
            ข้อมูลที่อยู่
          </Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, shadows.lg]}>
          {step === 1 ? (
            <>
              <Text style={styles.sectionTitle}>ข้อมูลบัญชี</Text>

              <Input
                label="ชื่อผู้ใช้"
                placeholder="กรอกชื่อผู้ใช้ (อย่างน้อย 3 ตัวอักษร)"
                leftIcon="account-outline"
                value={form.username}
                onChangeText={(text) => updateField('username', text)}
                error={errors.username}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Input
                label="รหัสผ่าน"
                placeholder="กรอกรหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                leftIcon="lock-outline"
                value={form.password}
                onChangeText={(text) => updateField('password', text)}
                error={errors.password}
                isPassword
              />

              <Input
                label="ชื่อ"
                placeholder="กรอกชื่อจริง"
                leftIcon="account-edit-outline"
                value={form.first_name}
                onChangeText={(text) => updateField('first_name', text)}
                error={errors.first_name}
              />

              <Input
                label="นามสกุล"
                placeholder="กรอกนามสกุล"
                leftIcon="account-edit-outline"
                value={form.last_name}
                onChangeText={(text) => updateField('last_name', text)}
                error={errors.last_name}
              />

              <Button
                title="ถัดไป"
                onPress={handleNext}
                icon="arrow-right"
                iconPosition="right"
                size="lg"
                style={styles.actionButton}
              />
            </>
          ) : (
            <>
              <Text style={styles.sectionTitle}>ข้อมูลที่อยู่</Text>

              <Input
                label="บ้านเลขที่"
                placeholder="กรอกบ้านเลขที่"
                leftIcon="home-outline"
                value={form.house_no}
                onChangeText={(text) => updateField('house_no', text)}
                error={errors.house_no}
              />

              <Input
                label="เบอร์โทรศัพท์"
                placeholder="กรอกเบอร์โทรศัพท์"
                leftIcon="phone-outline"
                value={form.phone_number}
                onChangeText={(text) => updateField('phone_number', text)}
                error={errors.phone_number}
                keyboardType="phone-pad"
              />

              <Input
                label="ประเภทผู้พักอาศัย"
                placeholder="เช่น เจ้าของ, ผู้เช่า"
                leftIcon="account-group-outline"
                value={form.resident_type}
                onChangeText={(text) => updateField('resident_type', text)}
                error={errors.resident_type}
              />

              <Input
                label="Phase"
                placeholder="กรอก Phase"
                leftIcon="map-marker-outline"
                value={form.phase}
                onChangeText={(text) => updateField('phase', text)}
                error={errors.phase}
              />

              <Input
                label="ซอย"
                placeholder="กรอกซอย"
                leftIcon="road-variant"
                value={form.soi}
                onChangeText={(text) => updateField('soi', text)}
                error={errors.soi}
              />

              <Button
                title="สมัครสมาชิก"
                onPress={handleRegister}
                loading={isLoading}
                icon="account-plus"
                size="lg"
                style={styles.actionButton}
              />
            </>
          )}
        </View>

        {/* Login Link */}
        <View style={styles.loginSection}>
          <Text style={styles.loginText}>มีบัญชีอยู่แล้ว? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>เข้าสู่ระบบ</Text>
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
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  stepNumberActive: {
    color: colors.text.inverse,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['4xl'],
    marginBottom: spacing.xl,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xl,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  loginLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});

export default RegisterScreen;
