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
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '@components/ui';
import { useAuth } from '@hooks/useAuth';
import { loginSchema, type LoginFormData } from '@validators/auth.validator';
import { colors, spacing, borderRadius, typography } from '@utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AuthNavigationProp } from '../../types/navigation';

type Role = 'resident' | 'staff';

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<Role>('resident');
  const [rememberMe, setRememberMe] = useState(false);

  const isResident = role === 'resident';

  // Dynamic Theme from Figma
  const gradientColors = isResident 
    ? ['#161D19', '#38BC0B'] // Resident: Dark green to bright green
    : ['#2A343D', '#0073FF']; // Staff: Dark slate to bright blue
    
  const isFormComplete = form.username.trim() !== '' && form.password.trim() !== '';
  const buttonColor = !isFormComplete ? '#BEAFAF' : (isResident ? '#38BC0B' : '#3A00FF');
  const radioActiveColor = '#38BC0B'; // Radio active is always green

  const updateField = (field: keyof LoginFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
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
      await login(form, role);
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
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 20, 60),
              paddingBottom: Math.max(insets.bottom + 20, 40),
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Kept the elegant text style */}
          <View style={styles.headerSection}>
            <Text style={styles.senaText}>SENA</Text>
            <View style={styles.dividerWrapper}>
              <View style={styles.divider} />
            </View>
            <Text style={styles.grandHomeText}>GRAND HOME</Text>
            <Text style={styles.locationText}>Rangsit - Tiwanon</Text>

            <Text style={styles.appTagline}>
              ระบบจัดการรับเรื่องร้องเรียนและติดตามปัญหานิติบุคคล
            </Text>
          </View>

          {/* Simple Role Toggle */}
          <View style={styles.roleToggleContainer}>
            <Pressable
              style={styles.roleOption}
              onPress={() => setRole('resident')}
            >
              <View style={[styles.radioCircle, isResident ? { backgroundColor: radioActiveColor } : { backgroundColor: '#FFFFFF' }]} />
              <Text style={styles.roleText}>ลูกบ้าน</Text>
            </Pressable>

            <Pressable
              style={styles.roleOption}
              onPress={() => setRole('staff')}
            >
              <View style={[styles.radioCircle, !isResident ? { backgroundColor: radioActiveColor } : { backgroundColor: '#FFFFFF' }]} />
              <Text style={styles.roleText}>นิติบุคคล</Text>
            </Pressable>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Input
              placeholder="ชื่อผู้ใช้"
              leftIcon="account"
              value={form.username}
              onChangeText={(text) => updateField('username', text)}
              error={errors.username}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              wrapperStyle={styles.whiteInput}
              style={styles.darkInputText}
              placeholderTextColor="#999999"
              iconColor="#777777"
            />

            <Input
              placeholder="รหัสผ่าน"
              leftIcon="lock"
              value={form.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              wrapperStyle={styles.whiteInput}
              style={styles.darkInputText}
              placeholderTextColor="#999999"
              iconColor="#777777"
            />

            {/* Options Row */}
            <View style={styles.optionsRow}>
              <Pressable
                style={styles.checkboxContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe ? (
                  <View style={styles.checkboxCircleFilled} />
                ) : (
                  <View style={styles.checkboxCircleEmpty} />
                )}
                <Text style={styles.rememberText}>จดจำไว้ในระบบ</Text>
              </Pressable>

              <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotPasswordText}>ลืมรหัสผ่าน?</Text>
              </Pressable>
            </View>

            {/* Submit Button */}
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: buttonColor },
                pressed && isFormComplete && styles.submitButtonPressed,
                (isLoading || !isFormComplete) && styles.submitButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={isLoading || !isFormComplete}
            >
              {isLoading ? (
                <Text style={styles.submitButtonText}>กำลังเข้าสู่ระบบ...</Text>
              ) : (
                <Text style={styles.submitButtonText}>เข้าสู่ระบบ</Text>
              )}
            </Pressable>
          </View>

          {/* Footer Register Link */}
          <View style={styles.footerSection}>
            <Pressable onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>ลงทะเบียน</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
    justifyContent: 'flex-start',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 65,
    marginTop: 75,
  },
  senaText: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontSize: 22,
    color: '#F4F4F4',
    letterSpacing: 1,
    marginBottom: 0,
  },
  dividerWrapper: {
    width: '75%', // Try to match the width of "GRAND HOME"
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    marginTop: 2,
    marginBottom: 2,
  },
  grandHomeText: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontSize: 42,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 2,
  },
  locationText: {
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
    fontSize: 16,
    color: '#DDDDDD',
    marginBottom: 24,
  },
  appTagline: {
    ...typography.bodySmall,
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  roleToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  roleText: {
    ...typography.subtitle,
    fontSize: 18,
    color: colors.white,
    fontWeight: 'bold',
  },
  formSection: {
    width: '100%',
  },
  whiteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0,
  },
  darkInputText: {
    color: '#333333',
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: -8, // compensate for Input margin bottom
    paddingHorizontal: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxCircleEmpty: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },
  checkboxCircleFilled: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF', // Checked state can just stay white or add an inner circle, image shows white circle
  },
  rememberText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  submitButton: {
    minHeight: 54,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonDisabled: {
    opacity: 1, // Keep full opacity so white text doesn't blend in
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 30, // Prevents Thai vowel clipping
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    ...typography.body,
    color: 'rgba(255,255,255,0.8)',
  },
  registerLink: {
    ...typography.body,
    color: colors.white,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
