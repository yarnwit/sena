import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../ui';
import { StatusBadge } from './StatusBadge';
import { Complaint } from '../../types/complaint';
import { formatDate } from '../../utils/helpers';
import theme from '../../utils/theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface ComplaintCardProps {
  complaint: Complaint;
  onPress: () => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onPress }) => {
  return (
    <Card onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.ticketNo}>{complaint.ticket_no}</Text>
        <StatusBadge status={complaint.status} />
      </View>
      <Text style={styles.subject} numberOfLines={1}>
        {complaint.subject}
      </Text>
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Icon name="clock-outline" size={14} color={theme.colors.text.tertiary} />
          <Text style={styles.date}>{formatDate(complaint.reported_date)}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  ticketNo: {
    ...theme.typography.subtitle,
    color: theme.colors.primary,
  },
  subject: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    paddingTop: theme.spacing.sm,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  date: {
    ...theme.typography.caption,
    color: theme.colors.text.tertiary,
  },
});
