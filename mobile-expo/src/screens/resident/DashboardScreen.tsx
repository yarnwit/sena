import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useComplaints } from '../../hooks/useComplaints';
import { ComplaintCard } from '../../components/complaints';
import { Card, Button } from '../../components/ui';
import theme from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { ResidentNavigationProp } from '../../types/navigation';

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { complaints, isLoading, fetchComplaints, refresh } = useComplaints();
  const navigation = useNavigation<ResidentNavigationProp>();

  useEffect(() => {
    fetchComplaints({ limit: 5 });
  }, [fetchComplaints]);

  const recentComplaints = complaints.slice(0, 3);
  
  // Calculate stats from loaded complaints (Note: in a real app, this should be an API endpoint)
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>สวัสดี, {user?.first_name || user?.username}</Text>
        <Text style={styles.subtitle}>ระบบรับร้องเรียนนิติบุคคล SENA</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={[styles.statCard, { borderTopColor: theme.colors.status.pending, borderTopWidth: 4 }]}>
          <Text style={styles.statNumber}>{pendingCount}</Text>
          <Text style={styles.statLabel}>รอดำเนินการ</Text>
        </Card>
        <Card style={[styles.statCard, { borderTopColor: theme.colors.status.in_progress, borderTopWidth: 4 }]}>
          <Text style={styles.statNumber}>{inProgressCount}</Text>
          <Text style={styles.statLabel}>กำลังแก้ไข</Text>
        </Card>
        <Card style={[styles.statCard, { borderTopColor: theme.colors.status.resolved, borderTopWidth: 4 }]}>
          <Text style={styles.statNumber}>{resolvedCount}</Text>
          <Text style={styles.statLabel}>เสร็จสิ้น</Text>
        </Card>
      </View>

      <View style={styles.actionContainer}>
        <Button 
          title="แจ้งเรื่องร้องเรียนใหม่" 
          icon="plus" 
          onPress={() => navigation.navigate('NewComplaint')} 
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>รายการล่าสุด</Text>
        <Button 
          title="ดูทั้งหมด" 
          variant="ghost" 
          size="sm" 
          onPress={() => navigation.navigate('ResidentTabs')} 
        />
      </View>

      {recentComplaints.length > 0 ? (
        recentComplaints.map(complaint => (
          <ComplaintCard 
            key={complaint.complaint_id} 
            complaint={complaint} 
            onPress={() => navigation.navigate('ComplaintDetail', { id: complaint.complaint_id })} 
          />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ไม่มีรายการร้องเรียน</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  statNumber: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  actionContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.tertiary,
  },
});

export default DashboardScreen;
