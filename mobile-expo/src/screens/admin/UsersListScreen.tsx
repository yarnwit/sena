import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../utils/theme';

const UsersListScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>การจัดการผู้ใช้งาน (Phase 4)</Text>
      <Text style={styles.subtitle}>แสดงรายชื่อผู้ใช้ทั้งหมด, ค้นหา, กรองตาม role</Text>
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

export default UsersListScreen;
