import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { ResidentUser } from '../../types/auth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getProfile, updateProfile } from '../../api/users';
import { changePassword } from '../../api/auth';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const residentUser = user as ResidentUser | null;
  const navigation = useNavigation<any>();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(residentUser?.phone_number || '');
  const [houseNo, setHouseNo] = useState(residentUser?.house_no || '');
  const [phase, setPhase] = useState(residentUser?.phase || '');
  const [soi, setSoi] = useState(residentUser?.soi || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchProfile = async () => {
        try {
          const res = await getProfile();
          if (res.success && isActive) {
            setFirstName(res.data.first_name || '');
            setLastName(res.data.last_name || '');
            setPhone(res.data.phone_number || '');
            setHouseNo(res.data.house_no || '');
            setPhase(res.data.phase || '');
            setSoi(res.data.soi || '');
          }
        } catch (error) {
          console.error('Failed to fetch profile', error);
        }
      };
      fetchProfile();
      return () => { isActive = false; };
    }, [])
  );

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('ResidentTabs' as any, { screen: 'Dashboard' });
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        house_no: houseNo,
        phase: phase,
        soi: soi,
      };
      const res = await updateProfile(payload);
      setIsSubmitting(false);
      if (res.success) {
        Alert.alert('สำเร็จ', 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
      } else {
        Alert.alert('ข้อผิดพลาด', res.message || 'ไม่สามารถอัปเดตข้อมูลได้');
      }
    } catch (error: any) {
      setIsSubmitting(false);
      Alert.alert('ข้อผิดพลาด', error.response?.data?.error || 'ไม่สามารถอัปเดตข้อมูลได้');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await changePassword({ newPassword });
      setIsChangingPassword(false);
      if (res.success) {
        Alert.alert('สำเร็จ', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('ข้อผิดพลาด', res.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
      }
    } catch (error: any) {
      setIsChangingPassword(false);
      Alert.alert('ข้อผิดพลาด', error.response?.data?.error || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
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
    <LinearGradient colors={['#161D19', '#38BC0B']} style={styles.flex1}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>โปรไฟล์</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Icon name="account" size={40} color="#fff" />
            </View>
            <Text style={styles.avatarName}>{user?.full_name || user?.username}</Text>
          </View>

          {/* Card: ข้อมูลส่วนตัว */}
          <View style={styles.glassCard}>
            <View style={styles.cardHeader}>
              <Icon name="card-account-details-outline" size={22} color="#fff" />
              <Text style={styles.cardTitle}>ข้อมูลลูกบ้าน</Text>
            </View>
            <View style={styles.cardDivider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ชื่อ</Text>
              <TextInput
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="ชื่อ"
                placeholderTextColor="rgba(255,255,255,0.4)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>นามสกุล</Text>
              <TextInput
                style={styles.textInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="นามสกุล"
                placeholderTextColor="rgba(255,255,255,0.4)"
              />
            </View>

            {residentUser && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
                  <TextInput
                    style={styles.textInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="เบอร์โทรศัพท์"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>บ้านเลขที่</Text>
                  <TextInput
                    style={styles.textInput}
                    value={houseNo}
                    onChangeText={setHouseNo}
                    placeholder="บ้านเลขที่"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>เฟส</Text>
                  <TextInput
                    style={styles.textInput}
                    value={phase}
                    onChangeText={setPhase}
                    placeholder="เฟส"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ซอย</Text>
                  <TextInput
                    style={styles.textInput}
                    value={soi}
                    onChangeText={setSoi}
                    placeholder="ซอย"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                  />
                </View>
              </>
            )}

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

          {/* Card: เปลี่ยนรหัสผ่าน */}
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
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="รหัสผ่านใหม่อย่างน้อย 6 ตัวอักษร"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ยืนยันรหัสผ่านใหม่</Text>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry
              />
            </View>

            <View style={styles.buttonRightAlign}>
              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: '#FF9800' }]} 
                onPress={handleChangePassword}
                disabled={isChangingPassword}
              >
                <Icon name="key-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
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
  safeArea: {
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
  buttonRightAlign: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BC0B',
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
