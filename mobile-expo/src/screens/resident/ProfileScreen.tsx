import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input, Button, Avatar, Card } from '../../components/ui';
import theme from '../../utils/theme';
import { ResidentUser } from '../../types/auth';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const residentUser = user as ResidentUser | null;

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(residentUser?.phone_number || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call for now since there's no specific endpoint listed in mobli.md
      // await updateProfile({ first_name: firstName, last_name: lastName, phone_number: phone });
      
      setTimeout(() => {
        setIsSubmitting(false);
        setIsEditing(false);
        Alert.alert('สำเร็จ', 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลได้');
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar name={`${user?.first_name} ${user?.last_name}`} size={80} />
        <Button 
          title={isEditing ? "ยกเลิก" : "แก้ไขโปรไฟล์"} 
          variant="outline" 
          size="sm" 
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editBtn}
        />
      </View>

      <Card style={styles.card}>
        <Input
          label="ชื่อ"
          value={firstName}
          onChangeText={setFirstName}
          editable={isEditing}
        />
        <Input
          label="นามสกุล"
          value={lastName}
          onChangeText={setLastName}
          editable={isEditing}
        />
        {residentUser && (
          <>
            <Input
              label="เบอร์โทรศัพท์"
              value={phone}
              onChangeText={setPhone}
              editable={isEditing}
              keyboardType="phone-pad"
            />
            <Input
              label="บ้านเลขที่"
              value={residentUser.house_no}
              editable={false}
            />
            <View style={styles.row}>
              <Input
                label="เฟส"
                value={residentUser.phase}
                editable={false}
                containerStyle={styles.flex1}
              />
              <Input
                label="ซอย"
                value={residentUser.soi}
                editable={false}
                containerStyle={styles.flex1}
              />
            </View>
          </>
        )}

        {isEditing && (
          <Button 
            title="บันทึกข้อมูล" 
            onPress={handleSave} 
            loading={isSubmitting} 
            style={styles.saveBtn}
          />
        )}
      </Card>

      <Button 
        title="ออกจากระบบ" 
        variant="danger" 
        onPress={handleLogout} 
        style={styles.logoutBtn}
        icon="logout"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  editBtn: {
    marginTop: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex1: {
    flex: 1,
  },
  saveBtn: {
    marginTop: theme.spacing.md,
  },
  logoutBtn: {
    marginBottom: theme.spacing.xl * 2,
  },
});

export default ProfileScreen;
