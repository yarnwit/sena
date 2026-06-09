import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ResidentRouteProp, ResidentNavigationProp } from '../../types/navigation';
import { Complaint, Comment } from '../../types/complaint';
import { getComplaintById } from '../../api/complaints';
import { getComments, addComment } from '../../api/comments';
import { StatusTimeline, CommentSection } from '../../components/complaints';
import { Card, Button } from '../../components/ui';
import theme from '../../utils/theme';
import { formatDate } from '../../utils/helpers';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';

const ComplaintDetailScreen: React.FC = () => {
  const route = useRoute<ResidentRouteProp<'ComplaintDetail'>>();
  const navigation = useNavigation<ResidentNavigationProp>();
  const { user } = useAuth();
  
  const complaintId = route.params.id;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);

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

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!complaint) return null;

  return (
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

        {complaint.attachment_url && (
          <View style={styles.attachmentContainer}>
            <Text style={styles.sectionTitle}>รูปภาพแนบ</Text>
            <Image source={{ uri: complaint.attachment_url }} style={styles.image} />
          </View>
        )}

        {complaint.status === 'pending' && (
          <Button
            title="แก้ไขร้องเรียน"
            variant="outline"
            onPress={() => navigation.navigate('EditComplaint', { id: complaint.complaint_id })}
            style={styles.editButton}
          />
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  editButton: {
    marginTop: theme.spacing.lg,
  },
});

export default ComplaintDetailScreen;
