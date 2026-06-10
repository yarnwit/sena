import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';

import { StaffNavigationProp, StaffRouteProp } from '../../types/navigation';
import { useComplaints } from '../../hooks/useComplaints';
import { Complaint, ComplaintStatus } from '../../types/complaint';

const ComplaintSubListScreen: React.FC = () => {
  const navigation = useNavigation<StaffNavigationProp>();
  const route = useRoute<StaffRouteProp<'ComplaintSubList'>>();
  const initialCategory = route.params?.category || 'all';

  const { complaints, isLoading, error, fetchComplaints } = useComplaints();
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

  const categories = [
    { id: 'all', title: 'ทั้งหมด', icon: 'check', status: undefined },
    { id: 'pending', title: 'รอตรวจสอบ', icon: undefined, status: 'pending' as ComplaintStatus },
    { id: 'approved', title: 'รอเข้าที่ประชุม', icon: undefined, status: 'approved' as ComplaintStatus },
    { id: 'in_meeting', title: 'นำเรื่องเข้าที่ประชุม', icon: undefined, status: 'in_meeting' as ComplaintStatus },
    { id: 'in_progress', title: 'ติดตามการแก้ไขปัญหา', icon: undefined, status: 'in_progress' as ComplaintStatus },
  ];

  const loadData = useCallback(async () => {
    const activeStatus = categories.find(c => c.id === activeCategory)?.status;
    await fetchComplaints({ status: activeStatus });
  }, [activeCategory, fetchComplaints]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderStatusBadge = (status: ComplaintStatus) => {
    let label = '';
    let color = '';
    let bgColor = '';
    let borderColor = '';

    switch (status) {
      case 'pending':
        label = 'รอดำเนินการ';
        color = '#F59E0B';
        bgColor = 'transparent';
        borderColor = '#F59E0B';
        break;
      case 'approved':
        label = 'อนุมัติรับเรื่อง';
        color = '#8B5CF6';
        bgColor = 'transparent';
        borderColor = '#8B5CF6';
        break;
      case 'in_meeting':
        label = 'เข้าที่ประชุม';
        color = '#EC4899';
        bgColor = 'transparent';
        borderColor = '#EC4899';
        break;
      case 'in_progress':
        label = 'กำลังดำเนินการ';
        color = '#3B82F6';
        bgColor = 'transparent';
        borderColor = '#3B82F6';
        break;
      case 'resolved':
        label = 'แก้ไขแล้ว';
        color = '#10B981';
        bgColor = 'transparent';
        borderColor = '#10B981';
        break;
      case 'rejected':
      case 'closed':
        label = 'ปิดงาน';
        color = '#EF4444';
        bgColor = 'transparent';
        borderColor = '#EF4444';
        break;
      default:
        label = status;
        color = '#9CA3AF';
        bgColor = 'transparent';
        borderColor = '#9CA3AF';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor, borderColor }]}>
        <Text style={[styles.statusText, { color }]}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ComplaintDetail', { id: item.complaint_id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.ticketNo}>{item.ticket_no}</Text>
        {renderStatusBadge(item.status)}
      </View>

      <Text style={styles.subjectText} numberOfLines={1}>
        {item.subject}
      </Text>

      <View style={styles.cardFooter}>
        <View style={styles.locationContainer}>
          <Icon name="home" size={14} color="#F59E0B" />
          <Text style={styles.houseNoText}>{item.house_no || 'ไม่ระบุ'}</Text>
          {item.resident_name && (
            <Text style={styles.residentNameText} numberOfLines={1}>
              {item.resident_name}
            </Text>
          )}
        </View>
        <Text style={styles.dateText}>
          {dayjs(item.reported_date).format('DD MMM YYYY, HH:mm')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#1c2e42', '#0058b8']} style={styles.flex1}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>รายการคำร้องทั้งหมด</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
              const isActive = activeCategory === item.id;
              return (
                <TouchableOpacity
                  style={[styles.filterPill, isActive ? styles.filterPillActive : styles.filterPillInactive]}
                  onPress={() => setActiveCategory(item.id)}
                >
                  {isActive && item.icon && <Icon name={item.icon as any} size={16} color="#0058b8" style={styles.filterIcon} />}
                  <Text style={[styles.filterText, isActive ? styles.filterTextActive : styles.filterTextInactive]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        <FlatList
          data={complaints}
          keyExtractor={(item) => item.complaint_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Icon name="clipboard-text-off-outline" size={64} color="rgba(255,255,255,0.5)" />
                <Text style={styles.emptyText}>ไม่มีรายการคำร้อง</Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex1: { flex: 1 },
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
  filterContainer: {
    marginBottom: 16,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterPillActive: {
    backgroundColor: '#fff',
  },
  filterPillInactive: {
    backgroundColor: '#fff',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0058b8',
  },
  filterTextInactive: {
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketNo: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#60A5FA',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  subjectText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  cardFooter: {
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  houseNoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginLeft: 4,
    marginRight: 8,
  },
  residentNameText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
  },
});

export default ComplaintSubListScreen;
