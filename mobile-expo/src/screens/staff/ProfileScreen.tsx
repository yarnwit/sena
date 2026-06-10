import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Input, Button, Avatar, Card } from '../../components/ui';
import theme from '../../utils/theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call for now since there's no specific endpoint listed in mobli.md
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
        
        <View style={styles.roleBadge}>
          <Icon name="badge-account-horizontal" size={16} color="#0891B2" />
          <Text style={styles.roleText}>เจ้าหน้าที่นิติบุคคล</Text>
        </View>

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
          label="ชื่อผู้ใช้ (Username)"
          value={user?.username}
          editable={false}
        />
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
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.md,
  },
  roleText: {
    ...theme.typography.caption,
    color: '#0891B2',
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  editBtn: {
    marginTop: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.xl,
  },
  saveBtn: {
    marginTop: theme.spacing.md,
  },
  logoutBtn: {
    marginBottom: theme.spacing.xl * 2,
  },
});

export default ProfileScreen;
