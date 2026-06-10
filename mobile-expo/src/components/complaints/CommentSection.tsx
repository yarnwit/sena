import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Comment } from '../../types/complaint';
import { Input, Button, Avatar } from '../ui';
import theme from '../../utils/theme';
import { formatDate } from '../../utils/helpers';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface CommentSectionProps {
  comments: Comment[];
  isLoading: boolean;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment?: (commentId: number) => Promise<void>;
  currentUserId?: string | number;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  isLoading,
  onAddComment,
  onDeleteComment,
  currentUserId,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => {
    const isOwner = currentUserId && String(item.user_id) === String(currentUserId);
    const fullName = [item.first_name, item.last_name].filter(Boolean).join(' ') || item.username || 'User';

    return (
      <View style={styles.commentContainer}>
        <Avatar name={fullName} size={32} />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthor}>{fullName}</Text>
            <Text style={styles.commentDate}>{formatDate(item.created_at)}</Text>
          </View>
          <Text style={styles.commentText}>{item.content}</Text>
        </View>
        {isOwner && onDeleteComment && (
          <Icon
            name="delete-outline"
            size={20}
            color={theme.colors.text.tertiary}
            onPress={() => onDeleteComment(item.comment_id)}
            style={styles.deleteIcon}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ความคิดเห็น ({comments.length})</Text>
      
      <View style={styles.inputContainer}>
        <Input
          placeholder="เพิ่มความคิดเห็น..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          numberOfLines={2}
          containerStyle={styles.inputBox}
        />
        <Button
          title="ส่ง"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!newComment.trim() || isSubmitting}
          style={styles.sendButton}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
      ) : comments.length > 0 ? (
        <FlatList
          data={comments}
          keyExtractor={(item) => item.comment_id.toString()}
          renderItem={renderComment}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <Text style={styles.emptyText}>ยังไม่มีความคิดเห็น</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  inputBox: {
    flex: 1,
    marginBottom: 0,
  },
  sendButton: {
    marginTop: theme.spacing.md,
  },
  loader: {
    marginVertical: theme.spacing.lg,
  },
  commentContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  commentContent: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  commentAuthor: {
    ...theme.typography.subtitle,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  commentDate: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
  commentText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  deleteIcon: {
    padding: theme.spacing.xs,
  },
  separator: {
    height: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: theme.spacing.lg,
  },
});
