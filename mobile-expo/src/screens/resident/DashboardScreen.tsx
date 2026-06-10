import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { useComplaints } from '../../hooks/useComplaints';
import { StatusBadge } from '../../components/complaints';
import theme from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { ResidentNavigationProp } from '../../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

const StatCard = ({ icon, color, number, label, isFullWidth = false }: any) => (
  <View style={[styles.statCard, isFullWidth && styles.fullWidthCard]}>
    <View style={styles.statHeader}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}30` }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statNumber}>{number}</Text>
    </View>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const { complaints, isLoading, fetchComplaints, refresh } = useComplaints();
  const navigation = useNavigation<ResidentNavigationProp>();

  useEffect(() => {
    fetchComplaints({ limit: 50 });
  }, [fetchComplaints]);

  // Filter ONLY pending, resolved, approved, rejected for the logged-in resident
  const targetStatuses = ['pending', 'resolved', 'approved', 'rejected', 'in_progress'];
  const filteredComplaints = complaints.filter(c => targetStatuses.includes(c.status));
  const recentComplaints = filteredComplaints.slice(0, 5);
  
  // Calculate stats from loaded complaints
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const approvedCount = complaints.filter(c => c.status === 'approved' || c.status === 'resolved' || c.status === 'closed').length;
  const rejectedCount = complaints.filter(c => c.status === 'rejected').length;

  const fullName = user?.full_name 
    ? user.full_name 
    : user?.username || 'ลูกบ้าน';

  return (
    <LinearGradient colors={['#161D19', '#38BC0B']} style={styles.flex1}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.container}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#fff" />}
        >
          {/* Top Bar */}
          <View style={styles.headerNav}>
            <Text style={styles.headerTitle}>หน้าหลัก</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications' as any)}>
                <Icon name="bell-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Profile */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Icon name="home-account" size={30} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileRole}>ลูกบ้าน</Text>
            </View>
          </View>

          <View style={styles.gridContainer}>
            <View style={styles.row}>
              <StatCard icon="clock-time-four-outline" color="#9BA5B1" number={pendingCount} label="รอดำเนินการ" />
              <StatCard icon="wrench" color="#FFD54F" number={inProgressCount} label="กำลังดำเนินการ" />
            </View>
            <View style={styles.row}>
              <StatCard icon="check-circle-outline" color="#38BC0B" number={approvedCount} label="อนุมัติรับเรื่อง / แก้ไขแล้ว" />
              <StatCard icon="close-circle-outline" color="#FF5252" number={rejectedCount} label="ไม่ได้รับการอนุมัติ" />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ติดตามสถานะคำร้องล่าสุด</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ResidentTabs' as any, { screen: 'ComplaintsList' })}>
              <Text style={styles.seeAllText}>ดูทั้งหมด {'>'}</Text>
            </TouchableOpacity>
          </View>

          {recentComplaints.length > 0 ? (
            <View style={{ paddingHorizontal: 20 }}>
              {recentComplaints.map(complaint => (
                <TouchableOpacity 
                  key={complaint.complaint_id}
                  style={styles.recentItem}
                  onPress={() => navigation.navigate('ComplaintDetail', { id: complaint.complaint_id })}
                >
                  <View style={styles.recentItemContent}>
                    <Text style={styles.recentItemTitle} numberOfLines={1}>{complaint.subject}</Text>
                    <Text style={styles.recentItemTicket}>{complaint.ticket_no}</Text>
                  </View>
                  <View style={styles.recentItemAction}>
                    <StatusBadge status={complaint.status} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>ไม่มีรายการร้องเรียน</Text>
            </View>
          )}
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
  container: {
    flex: 1,
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'left',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  bellBtn: {
    padding: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  gridContainer: { 
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16 
  },
  row: { 
    flexDirection: 'row', 
    gap: 16 
  },
  statCard: { 
    flex: 1, 
    backgroundColor: 'rgba(255,255,255,0.12)', 
    borderRadius: 20, 
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  fullWidthCard: { 
    width: '100%' 
  },
  statHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  iconCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  statLabel: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.85)', 
    marginTop: 4 
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: '#fff',
    fontSize: 16,
  },
  seeAllText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  recentItemContent: {
    flex: 1,
    marginRight: 12,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  recentItemTicket: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  recentItemAction: {
    alignItems: 'flex-end',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: 'rgba(255,255,255,0.6)',
  },
});

export default DashboardScreen;
