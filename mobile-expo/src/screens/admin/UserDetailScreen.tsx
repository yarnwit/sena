import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../utils/theme';

const UserDetailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>รายละเอียดผู้ใช้งาน (Phase 4)</Text>
      <Text style={styles.subtitle}>แก้ไขสิทธิ์ผู้ใช้, ปิดการใช้งาน</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});

export default UserDetailScreen;
