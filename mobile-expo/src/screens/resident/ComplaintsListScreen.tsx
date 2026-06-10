import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useComplaints } from '../../hooks/useComplaints';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ResidentNavigationProp } from '../../types/navigation';
import { ComplaintStatus } from '../../types/complaint';
import { formatDate } from '../../utils/helpers';

const { width } = Dimensions.get('window');

const FILTERS: { label: string; value: ComplaintStatus | 'all' }[] = [
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'รอดำเนินการ', value: 'pending' },
  { label: 'กำลังแก้ไข', value: 'in_progress' },
  { label: 'เสร็จสิ้น', value: 'resolved' },
  { label: 'ปิดงาน', value: 'closed' },
  { label: 'ปฏิเสธ', value: 'rejected' },
];

const ComplaintsListScreen: React.FC = () => {
  const { 
    complaints, 
    isLoading, 
    fetchComplaints, 
    refresh, 
    loadMore, 
    filterByStatus,
    search
  } = useComplaints();
  const navigation = useNavigation<ResidentNavigationProp>();
  
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchComplaints();
    }, [fetchComplaints])
  );

  const handleStatusChange = (itemValue: ComplaintStatus | 'all') => {
    setStatusFilter(itemValue);
    filterByStatus(itemValue === 'all' ? undefined : itemValue);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    search(text);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return '#9BA5B1';
      case 'in_progress': return '#4B8BF5';
      case 'resolved': return '#26D68C';
      case 'closed': return '#38BC0B';
      case 'rejected': return '#FF5252';
      default: return '#fff';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'รอดำเนินการ';
      case 'in_progress': return 'กำลังดำเนินการ';
      case 'resolved': return 'แก้ไขแล้ว';
      case 'closed': return 'ปิดงาน';
      case 'rejected': return 'ปฏิเสธ';
      default: return status;
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ComplaintDetail', { id: item.complaint_id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.ticketBadge}>
          <Icon name="ticket-confirmation-outline" size={14} color="#38BC0B" />
          <Text style={styles.ticketNo}>{item.ticket_no}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.subject} numberOfLines={2}>{item.subject}</Text>
      
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Icon name="clock-outline" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.date}>{formatDate(item.reported_date)}</Text>
        </View>
        <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.3)" />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#161D19', '#38BC0B']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('ResidentTabs' as any, { screen: 'Dashboard' });
              }
            }} 
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>ประวัติคำร้อง</Text>
          <TouchableOpacity style={styles.searchBtn} onPress={() => setShowSearch(!showSearch)}>
            <Icon name={showSearch ? "close" : "magnify"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {showSearch && (
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="ค้นหา..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
          </View>
        )}

        <View style={styles.filterWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTERS}
            keyExtractor={(item) => item.value}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
              const isActive = statusFilter === item.value;
              return (
                <TouchableOpacity 
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => handleStatusChange(item.value)}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {item.label}
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
          contentContainerStyle={styles.listContent}
          refreshing={isLoading && complaints.length === 0}
          onRefresh={refresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isLoading ? <ActivityIndicator size="small" color="#fff" style={{ margin: 20 }} /> : null}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyContainer}>
                <Icon name="clipboard-text-off-outline" size={60} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>ไม่พบข้อมูลการร้องเรียน</Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  backBtn: {
    padding: 4,
    width: 44,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  searchBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  filterWrapper: {
    marginBottom: 10,
  },
  filterList: {
    paddingHorizontal: 15,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  filterPillActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#38BC0B',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 188, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  ticketNo: {
    color: '#38BC0B',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subject: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
    fontSize: 16,
  },
});

export default ComplaintsListScreen;
