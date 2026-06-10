import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';

import { ResidentRouteProp, ResidentNavigationProp } from '../../types/navigation';
import { Complaint, Comment } from '../../types/complaint';
import { getComplaintById } from '../../api/complaints';
import { getComments } from '../../api/comments';
import { StatusTimeline } from '../../components/complaints/StatusTimeline';
import { useAuth } from '../../hooks/useAuth';

const parseComplaintComplainant = (complaint: Complaint) => {
  let first_name = complaint.first_name || '';
  let last_name = complaint.last_name || '';
  let phone_number = complaint.phone_number || '';
  let house_no = complaint.house_no || '';
  let phase = complaint.phase || '';
  let soi = complaint.soi || '';
  let cleanDescription = complaint.description || '';

  // 1. Parse backend's manual contact info: [ผู้ร้อง: Name | บ้านเลขที่: HouseNo | โทร: Phone]
  if (cleanDescription.startsWith('[ผู้ร้อง:')) {
    const headerMatch = cleanDescription.match(/^\[ผู้ร้อง:\s*(.*?)\s*\|\s*บ้านเลขที่:\s*([^\]|]+)(?:\s*\|\s*โทร:\s*([^\]]+))?\]/);
    if (headerMatch) {
      const fullName = headerMatch[1].trim();
      const parts = fullName.split(/\s+/);
      first_name = parts[0] || '';
      last_name = parts.slice(1).join(' ') || '';
      house_no = headerMatch[2].trim();
      if (headerMatch[3]) {
        phone_number = headerMatch[3].trim();
      }
      // Strip the header line
      cleanDescription = cleanDescription.replace(/^\[ผู้ร้อง:.*?\]\s*/, '');
    }
  }

  // 2. Parse frontend's custom phase/soi info: [ข้อมูลเพิ่มเติม - เฟส: Phase | ซอย: Soi]
  if (cleanDescription.startsWith('[ข้อมูลเพิ่มเติม')) {
    const extraMatch = cleanDescription.match(/^\[ข้อมูลเพิ่มเติม\s*-\s*เฟส:\s*(.*?)\s*\|\s*ซอย:\s*([^\]]+)\]/);
    if (extraMatch) {
      phase = extraMatch[1].trim();
      soi = extraMatch[2].trim();
      // Strip the extra line
      cleanDescription = cleanDescription.replace(/^\[ข้อมูลเพิ่มเติม.*?\]\s*/, '');
    }
  }

  return {
    first_name,
    last_name,
    phone_number,
    house_no,
    phase,
    soi,
    description: cleanDescription.trim()
  };
};

const getChannelLabel = (channel?: string | null) => {
  if (!channel) return 'โมบายล์';
  switch (channel) {
    case 'Mobile App':
    case 'mobile':
      return 'โมบายล์';
    case 'walk_in':
      return 'เดินเข้ามาแจ้ง';
    case 'phone':
      return 'โทรศัพท์';
    case 'line':
      return 'LINE';
    case 'email':
      return 'อีเมล';
    case 'group_village':
      return 'กลุ่มไลน์หมู่บ้าน';
    case 'website':
      return 'เว็บไซต์';
    default:
      return channel;
  }
};

const ComplaintDetailScreen: React.FC = () => {
  const route = useRoute<ResidentRouteProp<'ComplaintDetail'>>();
  const navigation = useNavigation<ResidentNavigationProp>();
  const { user } = useAuth();
  
  const complaintId = route.params.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    try {
      const response = await getComplaintById(complaintId, 'resident');
      setComplaint(response.data);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [complaintId, navigation]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await getComments(complaintId);
      setComments(response.data);
    } catch (error) {
      // Failed to load comments
    }
  }, [complaintId]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
      fetchComments();
    }, [fetchDetail, fetchComments])
  );

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'รอดำเนินการ';
      case 'approved': return 'อนุมัติรับเรื่อง';
      case 'in_meeting': return 'เข้าที่ประชุม';
      case 'in_progress': return 'กำลังดำเนินการ';
      case 'resolved': return 'แก้ไขแล้ว';
      case 'closed': return 'ปิดงาน';
      case 'rejected': return 'ไม่อนุมัติ/ปฏิเสธ';
      default: return status;
    }
  };

  if (isLoading || !complaint) {
    return (
      <View style={[styles.flex1, { backgroundColor: '#141A16', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  const parsedComplainant = parseComplaintComplainant(complaint);

  return (
    <LinearGradient colors={['#161D19', '#38BC0B']} style={styles.flex1}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
      <View style={styles.headerNav}>
        <TouchableOpacity 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('ResidentTabs');
            }
          }} 
          style={styles.backBtn}
        >
          <Icon name="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>รายละเอียดคำร้อง</Text>
        {complaint.status === 'pending' ? (
          <TouchableOpacity 
            onPress={() => navigation.navigate('EditComplaint', { id: complaint.complaint_id })}
            style={styles.editHeaderBtn}
          >
            <Icon name="pencil" size={22} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* Ticket Header Card */}
        <View style={[styles.card, { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>สถานะปัจจุบัน</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{complaint.ticket_no}</Text>
          </View>
          <View style={{ backgroundColor: '#F5A623', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>{getStatusLabel(complaint.status)}</Text>
          </View>
        </View>

        {/* 1. ข้อมูลผู้ร้องเรียน */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="account-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>1. ข้อมูลผู้ร้องเรียน</Text>
          </View>
          
          <Text style={styles.inputLabel}>ชื่อจริง</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>{parsedComplainant.first_name || '-'}</Text></View>
          
          <Text style={styles.inputLabel}>นามสกุล</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>{parsedComplainant.last_name || '-'}</Text></View>
          
          <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>{parsedComplainant.phone_number || '-'}</Text></View>
          
          <Text style={styles.inputLabel}>บ้านเลขที่</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>{parsedComplainant.house_no || '-'}</Text></View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>เฟส</Text>
              <View style={styles.inputBox}><Text style={styles.inputText}>{parsedComplainant.phase || '-'}</Text></View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>ซอย</Text>
              <View style={styles.inputBox}><Text style={styles.inputText}>{parsedComplainant.soi || '-'}</Text></View>
            </View>
          </View>
        </View>

        {/* 2. ข้อมูลเรื่องร้องเรียน */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="file-document-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>2. ข้อมูลเรื่องร้องเรียน</Text>
          </View>
          
          <Text style={styles.inputLabel}>หัวข้อคำร้อง</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.subject}</Text></View>
          
          <Text style={styles.inputLabel}>รายละเอียดเพิ่มเติม</Text>
          <View style={[styles.inputBox, { minHeight: 80 }]}><Text style={styles.inputText}>{parsedComplainant.description || '-'}</Text></View>
          
          <Text style={styles.inputLabel}>สถานที่รับคำร้อง</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.location_written || 'สำนักงาน'}</Text></View>
        </View>

        {/* 3. ข้อมูลเอกสารและการรับเรื่อง */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="file-multiple-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>3. ข้อมูลเอกสารและการรับเรื่อง</Text>
          </View>
          
          <Text style={styles.inputLabel}>วันที่แจ้ง</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>{dayjs(complaint.reported_date).format('YYYY-MM-DD HH:mm:ss')}</Text></View>
          
          <Text style={styles.inputLabel}>ช่องทาง</Text>
          <View style={styles.inputBox}><Text style={styles.inputText}>{getChannelLabel(complaint.intake_channel)}</Text></View>
          
          <Text style={styles.inputLabel}>ไฟล์แนบ/รูปภาพประกอบคำร้อง</Text>
          {complaint.attachment_url ? (
            <Image source={{ uri: complaint.attachment_url }} style={{ width: '100%', height: 150, borderRadius: 8, marginTop: 4 }} />
          ) : (
            <View style={[styles.inputBox, { height: 100, justifyContent: 'center', alignItems: 'center' }]}>
              <Icon name="image-off-outline" size={32} color="rgba(255,255,255,0.3)" />
              <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>ไม่มีไฟล์แนบ</Text>
            </View>
          )}
        </View>

        {/* 5. ความคืบหน้า */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="chart-line-variant" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>ความคืบหน้า</Text>
          </View>
          <StatusTimeline currentStatus={complaint.status} />
        </View>

        {/* 6. ประวัติการดำเนินการ */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Icon name="message-text-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>ประวัติการดำเนินการ</Text>
          </View>
          
          {comments.length === 0 ? (
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', padding: 10 }}>ยังไม่มีประวัติการดำเนินการ</Text>
          ) : (
            comments.map((comment, idx) => (
              <View key={idx} style={styles.historyItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{comment.username || 'System'}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginLeft: 8 }}>
                    {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm:ss')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Icon name={comment.type === 'system_log' ? "information-outline" : "clock-outline"} size={14} color="rgba(255,255,255,0.5)" style={{ marginTop: 2, marginRight: 6 }} />
                  <Text style={{ color: 'rgba(255,255,255,0.8)', flex: 1 }}>
                    {comment.type === 'system_log' 
                      ? `[ระบบ] ${comment.action || 'อัปเดตระบบ'} ${comment.details?.to ? `เป็น ${comment.details.to}` : ''}`
                      : comment.content}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {complaint.status === 'pending' && (
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditComplaint', { id: complaint.complaint_id })}
          >
            <Text style={styles.editBtnText}>แก้ไขคำร้อง</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16, // spacing between cards
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  inputBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  inputText: {
    color: '#fff',
    fontSize: 15,
  },
  historyItem: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  editBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  editBtnText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editHeaderBtn: {
    padding: 4,
    width: 40,
    alignItems: 'flex-end',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },
});

export default ComplaintDetailScreen;
