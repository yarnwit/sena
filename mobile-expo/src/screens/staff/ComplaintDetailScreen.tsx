import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity, TextInput } from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';

import { StaffRouteProp, StaffNavigationProp } from '../../types/navigation';
import { Complaint, Comment, ComplaintStatus } from '../../types/complaint';
import { getComplaintById, updateComplaintStatus } from '../../api/complaints';
import { getComments, addComment } from '../../api/comments';
import { StatusTimeline } from '../../components/complaints/StatusTimeline';
import { useAuth } from '../../hooks/useAuth';

const getChannelLabel = (channel?: string | null) => {
  if (!channel) return 'แอปพลิเคชัน';
  switch (channel) {
    case 'Mobile App':
    case 'mobile':
      return 'แอปพลิเคชัน';
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
  const route = useRoute<StaffRouteProp<'ComplaintDetail'>>();
  const navigation = useNavigation<StaffNavigationProp>();
  const { user } = useAuth();
  
  const complaintId = route.params.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);

  // Decision & Progress State
  const [selectedDecision, setSelectedDecision] = useState<'approved' | 'rejected'>('approved');
  const [decisionRemark, setDecisionRemark] = useState('');
  
  const [selectedProgress, setSelectedProgress] = useState<ComplaintStatus>('pending');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const response = await getComplaintById(complaintId, user?.role);
      setComplaint(response.data);
      setSelectedProgress(response.data.status);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [complaintId, navigation, user?.role]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await getComments(complaintId);
      setComments(response.data);
    } catch (error) {
      // Failed to load comments
    } finally {
      setIsCommentsLoading(false);
    }
  }, [complaintId]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
      fetchComments();
    }, [fetchDetail, fetchComments])
  );

  const handleUpdateStatus = async (targetStatus: ComplaintStatus, remark?: string) => {
    if (!complaint) return;

    if (targetStatus === 'rejected' && !remark?.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกความเห็น/เหตุผลการปฏิเสธ');
      return;
    }

    setIsSubmittingDecision(true);
    try {
      const response = await updateComplaintStatus(complaintId, {
        status: targetStatus,
        petition: remark?.trim() || undefined,
      });

      let logMsg = `[เปลี่ยนสถานะเป็น: ${getStatusLabel(targetStatus)}]`;
      if (remark?.trim()) {
        logMsg += `\nหมายเหตุ: ${remark.trim()}`;
      }
      try {
        await addComment(complaintId, { content: logMsg });
      } catch (err) {
        // Silently ignore because status is already updated in backend via audit logs
        console.log('Failed to add comment, but status was updated');
      }
      
      setComplaint(response.data);
      setDecisionRemark('');
      fetchComments();
      Alert.alert('สำเร็จ', 'อัปเดตสถานะเรียบร้อยแล้ว');
    } catch (error: any) {
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

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
      <View style={[styles.flex1, { backgroundColor: '#161D19', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  return (
    <LinearGradient colors={['#161D19', '#007AFF']} style={styles.flex1}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerNav}>
          <TouchableOpacity 
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('StaffTabs');
              }
            }} 
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>รายละเอียดคำร้อง</Text>
          {complaint.status !== 'closed' ? (
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
            <View style={{ backgroundColor: '#007AFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
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
            <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.first_name || complaint.resident_name?.split(' ')[0] || '-'}</Text></View>
            
            <Text style={styles.inputLabel}>นามสกุล</Text>
            <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.last_name || complaint.resident_name?.split(' ').slice(1).join(' ') || '-'}</Text></View>
            
            <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
            <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.phone_number || '-'}</Text></View>
            
            <Text style={styles.inputLabel}>บ้านเลขที่</Text>
            <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.house_no || '-'}</Text></View>
            
            <Text style={styles.inputLabel}>เฟส</Text>
            <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.phase || '-'}</Text></View>
            
            <Text style={styles.inputLabel}>ซอย</Text>
            <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.soi || '-'}</Text></View>
          </View>

          <View style={styles.divider} />

          {/* 2. ข้อมูลเรื่องร้องเรียน */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="file-document-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>2. ข้อมูลเรื่องร้องเรียน</Text>
            </View>
            
            <Text style={styles.inputLabel}>หัวข้อคำร้อง</Text>
            <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.subject}</Text></View>
            
            <Text style={styles.inputLabel}>รายละเอียดเพิ่มเติม</Text>
            <View style={[styles.inputBox, { minHeight: 80 }]}><Text style={styles.inputText}>{complaint.description || '-'}</Text></View>
            
            <Text style={styles.inputLabel}>สถานที่รับคำร้อง</Text>
            <View style={styles.inputBox}><Text style={styles.inputText}>{complaint.location_written || 'สำนักงาน'}</Text></View>
          </View>

          <View style={styles.divider} />

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

          <View style={styles.divider} />

          {/* 4. ส่วนพิจารณาคำร้อง */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="gavel" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>4. ส่วนพิจารณาคำร้อง</Text>
            </View>

            <View>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 16 }}>
                การพิจารณาอนุมัติหรือไม่อนุมัติตามระเบียบนิติบุคคล
              </Text>

              <Text style={styles.inputLabel}>ผลการพิจารณา</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[styles.radioButton, selectedDecision === 'approved' && styles.radioButtonActive]}
                  onPress={() => {
                    setSelectedDecision('approved');
                    setSelectedProgress('approved');
                  }}
                  disabled={complaint.status === 'closed'}
                >
                  <Icon
                    name={selectedDecision === 'approved' ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={selectedDecision === 'approved' ? '#4CAF50' : 'rgba(255,255,255,0.6)'}
                  />
                  <Text style={[styles.radioText, selectedDecision === 'approved' && { color: '#4CAF50' }]}>
                    อนุมัติรับเรื่อง
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.radioButton, selectedDecision === 'rejected' && styles.radioButtonActive]}
                  onPress={() => {
                    setSelectedDecision('rejected');
                    setSelectedProgress('rejected');
                  }}
                  disabled={complaint.status === 'closed'}
                >
                  <Icon
                    name={selectedDecision === 'rejected' ? 'radiobox-marked' : 'radiobox-blank'}
                    size={20}
                    color={selectedDecision === 'rejected' ? '#FF5252' : 'rgba(255,255,255,0.6)'}
                  />
                  <Text style={[styles.radioText, selectedDecision === 'rejected' && { color: '#FF5252' }]}>
                    ไม่อนุมัติ/ปฏิเสธ
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>ผู้รับคำร้อง (เจ้าหน้าที่นิติบุคคล)</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputText}>
                  {complaint.reviewer_name || user?.full_name || user?.username || 'เจ้าหน้าที่นิติบุคคล'}
                </Text>
              </View>

              <Text style={styles.inputLabel}>ความเห็นคณะกรรมการ (เหตุผลประกอบการพิจารณา)</Text>
              <TextInput
                style={styles.textInputArea}
                placeholder="กรอกความเห็นหรือเหตุผลการพิจารณา..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                numberOfLines={4}
                value={decisionRemark}
                onChangeText={setDecisionRemark}
                editable={complaint.status !== 'closed'}
              />

              <TouchableOpacity
                style={[styles.submitBtn, complaint.status === 'closed' && { backgroundColor: 'gray' }]}
                onPress={() => handleUpdateStatus(selectedDecision, decisionRemark)}
                disabled={isSubmittingDecision || complaint.status === 'closed'}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmittingDecision ? 'กำลังบันทึก...' : 'บันทึกผลการพิจารณา'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* 5. ความคืบหน้า */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="chart-line-variant" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>5. ความคืบหน้า</Text>
            </View>
            <StatusTimeline 
              currentStatus={selectedProgress} 
              isInteractive={complaint.status !== 'closed'}
              onStatusChange={(status) => setSelectedProgress(status)}
            />

            <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 12 }}>
                คลิกที่จุดสถานะด้านบนเพื่อเลือกความคืบหน้า จากนั้นกดปุ่มด้านล่างเพื่อบันทึก
              </Text>
              
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: '#4CAF50', marginTop: 12 }, complaint.status === 'closed' && { backgroundColor: 'gray' }]}
                onPress={() => handleUpdateStatus(selectedProgress)}
                disabled={isSubmittingDecision || complaint.status === 'closed'}
              >
                <Text style={styles.submitBtnText}>
                  {isSubmittingDecision ? 'กำลังบันทึก...' : 'อัปเดตความคืบหน้า'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 6. ประวัติการดำเนินการ */}
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Icon name="message-text-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>6. ประวัติการดำเนินการ</Text>
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
    backgroundColor: 'rgba(255,255,255,0.12)', // Staff card background
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    marginTop: 8,
  },
  inputBox: {
    backgroundColor: 'rgba(255,255,255,0.08)', // Darker inner box
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  inputText: {
    color: '#fff',
    fontSize: 15,
  },
  textInputArea: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  radioButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  radioButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  radioText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyItem: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    marginBottom: 8,
  },
  editBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007BFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  editBtnText: {
    color: '#007BFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editHeaderBtn: {
    padding: 4,
    width: 40,
    alignItems: 'flex-end',
  },
});

export default ComplaintDetailScreen;
