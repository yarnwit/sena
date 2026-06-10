/**
 * SENA Mobile App — Admin Dashboard Screen (Placeholder)
 *
 * Placeholder dashboard for Phase 4 implementation
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '@hooks/useAuth';
import { colors, spacing, borderRadius, typography, shadows } from '@utils/theme';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>สวัสดี 👋</Text>
        <Text style={styles.name}>
          {user?.first_name} {user?.last_name}
        </Text>
        <View style={styles.roleBadge}>
          <Icon name="shield-crown" size={14} color="#7C3AED" />
          <Text style={styles.roleText}>ผู้ดูแลระบบ (Admin)</Text>
        </View>
      </View>

      <View style={[styles.card, shadows.md]}>
        <Icon name="information-outline" size={24} color={colors.info} />
        <Text style={styles.cardText}>
          หน้า Dashboard, User Management, Reports, และ Audit Logs สำหรับ Admin จะถูกพัฒนาใน Phase 4
        </Text>
      </View>

      <View style={[styles.card, shadows.md]}>
        <Icon name="check-circle-outline" size={24} color={colors.success} />
        <Text style={styles.cardText}>
          ✅ Authentication & Route Protection ทำงานสำเร็จ!{'\n'}
          คุณเข้าสู่ระบบในฐานะ: {user?.role}
        </Text>
      </View>

      <Pressable
        onPress={logout}
        style={[styles.logoutButton, shadows.sm]}
      >
        <Icon name="logout" size={20} color={colors.error} />
        <Text style={styles.logoutText}>ออกจากระบบ</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['4xl'],
  },
  header: {
    marginBottom: spacing['3xl'],
  },
  greeting: {
    ...typography.h3,
    color: colors.text.secondary,
  },
  name: {
    ...typography.h1,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  roleText: {
    ...typography.caption,
    color: '#7C3AED',
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  cardText: {
    ...typography.body,
    color: colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorBg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  logoutText: {
    ...typography.button,
    color: colors.error,
  },
});

export default AdminDashboard;
