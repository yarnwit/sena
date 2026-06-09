import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { useComplaints } from '../../hooks/useComplaints';
import { ComplaintCard } from '../../components/complaints';
import { Input } from '../../components/ui';
import theme from '../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { ResidentNavigationProp } from '../../types/navigation';
import { ComplaintStatus } from '../../types/complaint';
import { Picker } from '@react-native-picker/picker';

const ComplaintsListScreen: React.FC = () => {
  const { 
    complaints, 
    isLoading, 
    fetchComplaints, 
    refresh, 
    loadMore, 
    search, 
    filterByStatus 
  } = useComplaints();
  const navigation = useNavigation<ResidentNavigationProp>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Simple debounce could be added here
    search(text);
  };

  const handleStatusChange = (itemValue: ComplaintStatus | 'all') => {
    setStatusFilter(itemValue);
    filterByStatus(itemValue === 'all' ? undefined : itemValue);
  };

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>ไม่พบข้อมูลการร้องเรียน</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Input
          placeholder="ค้นหา..."
          value={searchQuery}
          onChangeText={handleSearch}
          containerStyle={styles.searchInput}
          leftIcon="magnify"
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={statusFilter}
            onValueChange={handleStatusChange}
            style={styles.picker}
          >
            <Picker.Item label="ทั้งหมด" value="all" />
            <Picker.Item label="รอดำเนินการ" value="pending" />
            <Picker.Item label="กำลังแก้ไข" value="in_progress" />
            <Picker.Item label="เสร็จสิ้น" value="resolved" />
            <Picker.Item label="ปิดงาน" value="closed" />
            <Picker.Item label="ถูกปฏิเสธ" value="rejected" />
          </Picker>
        </View>
      </View>

      <FlatList
        data={complaints}
        keyExtractor={(item) => item.complaint_id.toString()}
        renderItem={({ item }) => (
          <ComplaintCard 
            complaint={item} 
            onPress={() => navigation.navigate('ComplaintDetail', { id: item.complaint_id })} 
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading && complaints.length === 0}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filterContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  searchInput: {
    marginBottom: theme.spacing.sm,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  picker: {
    height: 40,
  },
  listContent: {
    padding: theme.spacing.md,
    flexGrow: 1,
  },
  footerLoader: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.tertiary,
  },
});

export default ComplaintsListScreen;
