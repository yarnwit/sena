import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StaffNavigationProp } from '../../types/navigation';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<StaffNavigationProp>();

  return (
    <LinearGradient colors={['#1c2e42', '#0058b8']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* App Bar / Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>การแจ้งเตือน</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Icon name="bell-off-outline" size={64} color="rgba(255,255,255,0.5)" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>ไม่มีการแจ้งเตือนใหม่</Text>
        </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
    marginLeft: -5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default NotificationsScreen;
