import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../../hooks/useAuth';
import { useComplaints } from '../../hooks/useComplaints';
import { StaffNavigationProp } from '../../types/navigation';
import theme from '../../utils/theme';

const { width } = Dimensions.get('window');

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
  const navigation = useNavigation<StaffNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      fetchComplaints({ limit: 10 });
    }, [fetchComplaints])
  );

  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length;
  const rejectedCount = complaints.filter(c => c.status === 'rejected').length;

  const recentComplaints = complaints.slice(0, 3);

  // Use the full_name provided by the backend auth response
  const fullName = user?.full_name 
    ? `${user.full_name}ครับ` 
    : 'เจ้าหน้าที่';

  return (
    <LinearGradient colors={['#1c2e42', '#0058b8']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor="#fff" />
          }
        >
          {/* Top Bar */}
          <View style={styles.headerNav}>
            <Text style={styles.headerTitle}>หน้าหลัก</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                <Icon name="bell-outline" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Profile */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Icon name="briefcase" size={30} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName}</Text>
              <Text style={styles.profileRole}>เจ้าหน้าที่นิติบุคคล</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.gridContainer}>
            <StatCard 
              icon="view-dashboard-outline" 
              color="#7BA4FF" 
              number={totalCount} 
              label="เรื่องร้องเรียนทั้งหมด" 
              isFullWidth={true} 
            />
            
            <View style={styles.row}>
              <StatCard icon="clock-time-four-outline" color="#9BA5B1" number={pendingCount} label="รอดำเนินการ" />
              <StatCard icon="text-box-check-outline" color="#26D68C" number={0} label="อนุมัติรับเรื่อง" />
            </View>
            
            <View style={styles.row}>
              <StatCard icon="account-group" color="#B859D3" number={0} label="เข้าที่ประชุม" />
              <StatCard icon="trending-up" color="#4B8BF5" number={inProgressCount} label="กำลังดำเนินการ" />
            </View>
            
            <View style={styles.row}>
              <StatCard icon="check-circle-outline" color="#38BC0B" number={resolvedCount} label="แก้ไขแล้ว / ปิด" />
              <StatCard icon="close-circle-outline" color="#FF5252" number={rejectedCount} label="ปฏิเสธ" />
            </View>
          </View>

          {/* Recent Complaints Section */}
          <View style={styles.recentSection}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[styles.recentTitle, { marginBottom: 0 }]}>เรื่องร้องเรียนล่าสุด</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Complaints')}>
                <Text style={{ color: '#7BA4FF', fontSize: 13, fontWeight: '500' }}>ดูทั้งหมด</Text>
              </TouchableOpacity>
            </View>
            {recentComplaints.length > 0 ? (
              recentComplaints.map(complaint => (
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
                    <Text style={styles.recentItemStatus}>{
                      complaint.status === 'pending' ? 'รอดำเนินการ' :
                      complaint.status === 'in_progress' ? 'กำลังดำเนินการ' :
                      complaint.status === 'resolved' ? 'แก้ไขแล้ว' :
                      complaint.status === 'closed' ? 'ปิดงาน' : 'ปฏิเสธ'
                    }</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.emptyText}>ไม่มีรายการร้องเรียน</Text>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 100 
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
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
  actionBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.12)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  profileSection: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 32, 
    marginBottom: 32 
  },
  avatarContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(255,255,255,0.18)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  profileInfo: { 
    flex: 1 
  },
  profileName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 4 
  },
  profileRole: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.6)' 
  },
  gridContainer: { 
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
    fontWeight: '500' 
  },
  recentSection: { 
    marginTop: 36 
  },
  recentTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 16 
  },
  recentItem: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: 'bold', 
    marginBottom: 6 
  },
  recentItemTicket: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.5)' 
  },
  recentItemAction: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recentItemStatus: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  emptyText: { 
    color: 'rgba(255,255,255,0.5)', 
    textAlign: 'center', 
    marginTop: 20 
  },
});

export default DashboardScreen;
