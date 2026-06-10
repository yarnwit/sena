import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { StaffNavigationProp } from '../../types/navigation';

const { width } = Dimensions.get('window');

const StaffComplaintsMenuScreen: React.FC = () => {
  const navigation = useNavigation<StaffNavigationProp>();

  const menuItems = [
    {
      id: 'all',
      title: 'เรื่องร้องเรียนทั้งหมด',
      icon: 'clipboard-list-outline',
      category: 'all',
    },
    {
      id: 'pending',
      title: 'รอตรวจสอบ',
      icon: 'file-find-outline',
      category: 'pending',
    },
    {
      id: 'approved',
      title: 'รอเข้าที่ประชุม',
      icon: 'account-group-outline',
      category: 'approved',
    },
    {
      id: 'in_meeting',
      title: 'นำเรื่องเข้าที่ประชุม',
      icon: 'account-voice',
      category: 'in_meeting',
    },
    {
      id: 'in_progress',
      title: 'ติดตามการแก้ไขปัญหา',
      icon: 'target',
      category: 'in_progress',
    },
  ];

  return (
    <LinearGradient colors={['#161D19', '#007AFF']} style={styles.flex1}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerNav}>
          <TouchableOpacity 
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('StaffTabs' as any, { screen: 'Dashboard' });
              }
            }} 
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>จัดการเรื่องร้องเรียน</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.gridContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => navigation.navigate('ComplaintSubList', { category: item.category as any })}
            >
              <View style={styles.iconContainer}>
                <Icon name={item.icon as any} size={40} color="#007AFF" />
              </View>
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
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
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 48) / 2, // 2 items per row with 16px padding on sides and 16px between
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StaffComplaintsMenuScreen;
