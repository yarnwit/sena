import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useComplaints } from '../../hooks/useComplaints';
import { ComplaintCard } from '../../components/complaints';
import { Card, Button } from '../../components/ui';
import theme from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { StaffNavigationProp } from '../../types/navigation';

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { complaints, isLoading, fetchComplaints, refresh } = useComplaints();
  const navigation = useNavigation<StaffNavigationProp>();

  useEffect(() => {
    fetchComplaints({ limit: 10 }); // fetch more for staff
  }, [fetchComplaints]);

  // For staff, highlight what they need to act on
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const totalCount = complaints.length;

  const recentPending = complaints.filter(c => c.status === 'pending').slice(0, 3);
  
  // If no pending, just show recent ones
  const displayComplaints = recentPending.length > 0 ? recentPending : complaints.slice(0, 3);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>สวัสดี, {user?.first_name || user?.username}</Text>
        <Text style={styles.subtitle}>ระบบรับร้องเรียนนิติบุคคล SENA - ส่วนเจ้าหน้าที่</Text>
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
        <Card style={[styles.statCard, { borderTopColor: theme.colors.primary, borderTopWidth: 4 }]}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>ทั้งหมด</Text>
        </Card>
      </View>

      <View style={styles.actionContainer}>
        <Button 
          title="ดูรายการทั้งหมด" 
          icon="clipboard-list" 
          onPress={() => navigation.navigate('StaffTabs')} 
          style={{ marginBottom: theme.spacing.md }}
        />
        <Button 
          title="สร้างเรื่องร้องเรียนแทนลูกบ้าน" 
          icon="plus" 
          variant="outline"
          onPress={() => navigation.navigate('NewComplaint')} 
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {recentPending.length > 0 ? 'รายการรอรับเรื่องด่วน' : 'รายการล่าสุด'}
        </Text>
      </View>

      {displayComplaints.length > 0 ? (
        displayComplaints.map(complaint => (
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
