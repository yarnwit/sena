import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StaffRouteProp, StaffNavigationProp } from '../../types/navigation';
import { Complaint, Comment, ComplaintStatus } from '../../types/complaint';
import { getComplaintById, updateComplaintStatus } from '../../api/complaints';
import { getComments, addComment } from '../../api/comments';
import { StatusTimeline, CommentSection } from '../../components/complaints';
import { Card, Button, Input } from '../../components/ui';
import theme from '../../utils/theme';
import { formatDate } from '../../utils/helpers';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';

const ComplaintDetailScreen: React.FC = () => {
  const route = useRoute<StaffRouteProp<'ComplaintDetail'>>();
  const navigation = useNavigation<StaffNavigationProp>();
  const { user } = useAuth();
  
  const complaintId = route.params.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchDetail = useCallback(async () => {
    try {
      const response = await getComplaintById(complaintId);
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
    } finally {
      setIsCommentsLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchDetail();
    fetchComments();
  }, [fetchDetail, fetchComments]);

  const handleAddComment = async (content: string) => {
    try {
      const response = await addComment(complaintId, { content });
      setComments(prev => [...prev, response.data]);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถเพิ่มความคิดเห็นได้');
    }
  };

  const handleUpdateStatus = async (newStatus: ComplaintStatus, remark?: string) => {
    try {
      setIsUpdatingStatus(true);
      const response = await updateComplaintStatus(complaintId, { status: newStatus });
      
      // If there is a remark, add it as a comment automatically
      if (remark) {
        await addComment(complaintId, { content: `[หมายเหตุการเปลี่ยนสถานะเป็น ${newStatus}]: ${remark}` });
        fetchComments();
      }
      
      setComplaint(response.data);
      Alert.alert('สำเร็จ', 'อัปเดตสถานะเรียบร้อยแล้ว');
      if (rejectModalVisible) setRejectModalVisible(false);
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถอัปเดตสถานะได้');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุเหตุผลการปฏิเสธ');
      return;
    }
    handleUpdateStatus('rejected', rejectReason);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!complaint) return null;

  return (
    <View style={styles.flex1}>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.ticketNo}>{complaint.ticket_no}</Text>
            <Text style={styles.date}>{formatDate(complaint.reported_date)}</Text>
          </View>

          <Text style={styles.subject}>{complaint.subject}</Text>

          <StatusTimeline currentStatus={complaint.status} />

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>รายละเอียด</Text>
          <Text style={styles.description}>{complaint.description}</Text>

          {complaint.location_written && (
            <View style={styles.infoRow}>
              <Icon name="map-marker-outline" size={20} color={theme.colors.text.tertiary} />
              <Text style={styles.infoText}>{complaint.location_written}</Text>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <Icon name="account-outline" size={20} color={theme.colors.text.tertiary} />
            <Text style={styles.infoText}>แจ้งโดย: ลูกบ้าน (ID: {complaint.resident_id})</Text>
          </View>

          {complaint.attachment_url && (
            <View style={styles.attachmentContainer}>
              <Text style={styles.sectionTitle}>รูปภาพแนบ</Text>
              <Image source={{ uri: complaint.attachment_url }} style={styles.image} />
            </View>
          )}
        </Card>

        <Card style={styles.card}>
          <CommentSection
            comments={comments}
            isLoading={isCommentsLoading}
            onAddComment={handleAddComment}
            currentUserId={user?.user_id}
          />
        </Card>
        
        {/* Padding for bottom action bar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Staff Action Bar at Bottom */}
      {(complaint.status === 'pending' || complaint.status === 'in_progress') && (
        <View style={styles.actionBar}>
          {complaint.status === 'pending' && (
            <>
              <Button
                title="ปฏิเสธ"
                variant="danger"
                style={styles.actionButton}
                onPress={() => setRejectModalVisible(true)}
                loading={isUpdatingStatus}
              />
              <Button
                title="รับเรื่อง (กำลังดำเนินการ)"
                variant="primary"
                style={styles.actionButton}
                onPress={() => handleUpdateStatus('in_progress')}
                loading={isUpdatingStatus}
              />
            </>
          )}

          {complaint.status === 'in_progress' && (
            <>
              <Button
                title="ส่งกลับ (รอข้อมูล)"
                variant="outline"
                style={styles.actionButton}
                onPress={() => handleUpdateStatus('pending')}
                loading={isUpdatingStatus}
              />
              <Button
                title="แก้ไขเสร็จสิ้น"
                variant="primary"
                style={styles.actionButtonResolved}
                onPress={() => handleUpdateStatus('resolved')}
                loading={isUpdatingStatus}
              />
            </>
          )}
        </View>
      )}

      {/* Reject Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>ปฏิเสธเรื่องร้องเรียน</Text>
            <Text style={styles.modalSubtitle}>กรุณาระบุเหตุผลการปฏิเสธเรื่องร้องเรียนนี้</Text>
            
            <Input
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="เช่น ไม่เกี่ยวข้องกับส่วนกลาง, ข้อมูลไม่ครบถ้วน..."
              multiline
              numberOfLines={4}
              containerStyle={{ marginBottom: theme.spacing.lg }}
            />
            
            <View style={styles.modalActions}>
              <Button
                title="ยกเลิก"
                variant="ghost"
                onPress={() => setRejectModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="ยืนยันปฏิเสธ"
                variant="danger"
                onPress={handleReject}
                loading={isUpdatingStatus}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  ticketNo: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  subject: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  attachmentContainer: {
    marginTop: theme.spacing.sm,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    resizeMode: 'cover',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    gap: theme.spacing.md,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonResolved: {
    flex: 1,
    backgroundColor: theme.colors.status.resolved,
    borderColor: theme.colors.status.resolved,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.md,
  },
  modalTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  modalSubtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
});

export default ComplaintDetailScreen;
