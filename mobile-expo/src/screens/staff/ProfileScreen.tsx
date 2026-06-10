import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import { useFocusEffect } from '@react-navigation/native';
import { getProfile, updateProfile } from '../../api/users';
import { changePassword } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();

  const [username, setUsername] = useState(user?.username || '');
  const [role, setRole] = useState(user?.role || '');
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadProfile = async () => {
        try {
          const res = await getProfile();
          if (res.success && res.data) {
            setUsername(res.data.username || '');
            setRole(res.data.role || '');
            setFirstName(res.data.first_name || '');
            setLastName(res.data.last_name || '');
          }
        } catch (error) {
          console.error('Failed to load profile', error);
        } finally {
          setIsLoading(false);
        }
      };
      loadProfile();
    }, [])
  );

  // Password Reset States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อจริงและนามสกุล');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ first_name: firstName, last_name: lastName });
      Alert.alert('สำเร็จ', 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
    } catch (error: any) {
      Alert.alert('ข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถอัปเดตข้อมูลได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกรหัสผ่านใหม่และยืนยันรหัสผ่าน');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({ newPassword });
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
    } catch (error: any) {
      Alert.alert('ข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'ยืนยันการออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ออกจากระบบ', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <LinearGradient colors={['#1c2e42', '#0058b8']} style={styles.flex1}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>โปรไฟล์</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Card 1: ข้อมูลส่วนตัว */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Icon name="account-outline" size={22} color="#fff" />
              <Text style={styles.cardTitle}>ข้อมูลส่วนตัว</Text>
            </View>
            <View style={styles.cardDivider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อผู้ใช้งาน (Username)</Text>
              <View style={styles.inputWrapperDisabled}>
                <Text style={styles.inputTextDisabled}>{isLoading ? 'กำลังโหลด...' : username || '-'}</Text>
              </View>
              <Text style={styles.inputHelperText}>ไม่สามารถเปลี่ยนชื่อผู้ใช้งานได้</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อจริง</Text>
              <TextInput
                style={styles.textInput}
                placeholder="ชื่อจริง"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>นามสกุล</Text>
              <TextInput
                style={styles.textInput}
                placeholder="นามสกุล"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ระดับสิทธิ์</Text>
              <View style={styles.inputWrapperDisabled}>
                <Text style={styles.inputTextDisabled}>
                  {isLoading ? 'กำลังโหลด...' : role === 'staff' ? 'เจ้าหน้าที่นิติบุคคล (Staff)' : role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ไม่ทราบสิทธิ์'}
                </Text>
              </View>
              <Text style={styles.inputHelperText}>สิทธิ์นี้กำหนดโดยผู้ดูแลระบบ ไม่สามารถเปลี่ยนได้</Text>
            </View>

            <View style={styles.buttonRightAlign}>
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Icon name="content-save-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card 2: เปลี่ยนรหัสผ่าน */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Icon name="lock-outline" size={22} color="#fff" />
              <Text style={styles.cardTitle}>เปลี่ยนรหัสผ่าน</Text>
            </View>
            <View style={styles.cardDivider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>รหัสผ่านใหม่</Text>
              <TextInput
                style={styles.textInput}
                placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ยืนยันรหัสผ่านใหม่</Text>
              <TextInput
                style={styles.textInput}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.buttonRightAlign}>
              <TouchableOpacity 
                style={styles.changePasswordBtn} 
                onPress={handleChangePassword}
                disabled={isChangingPassword}
              >
                <Text style={styles.saveBtnText}>
                  {isChangingPassword ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={handleLogout}
          >
            <Icon name="logout" size={20} color="#fff" />
            <Text style={styles.logoutBtnText}>ออกจากระบบ</Text>
          </TouchableOpacity>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
    width: 40,
    alignItems: 'flex-start',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  inputWrapperDisabled: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
  },
  inputTextDisabled: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
  inputHelperText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 15,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  buttonRightAlign: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  changePasswordBtn: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5252',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5252',
    gap: 8,
  },
  logoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
