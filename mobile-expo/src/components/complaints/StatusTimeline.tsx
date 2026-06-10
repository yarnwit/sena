import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../utils/theme';
import { ComplaintStatus } from '../../types/complaint';
import { getStatusLabel } from '../../utils/helpers';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface StatusTimelineProps {
  currentStatus: ComplaintStatus;
}

const statusFlow: ComplaintStatus[] = ['pending', 'in_progress', 'resolved', 'closed'];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus }) => {
  // If rejected, we just show a single red status or a modified flow
  if (currentStatus === 'rejected') {
    return (
      <View style={styles.container}>
        <View style={styles.step}>
          <View style={[styles.dot, { backgroundColor: theme.colors.status.rejected }]} />
          <Text style={[styles.label, { color: theme.colors.status.rejected }]}>
            {getStatusLabel('rejected')}
          </Text>
        </View>
      </View>
    );
  }

  const currentIndex = statusFlow.indexOf(currentStatus);

  return (
    <View style={styles.container}>
      {statusFlow.map((status, index) => {
        const isPast = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isFuture = index > currentIndex;

        let dotColor: string = theme.colors.border;
        let labelColor: string = theme.colors.text.tertiary;

        if (isPast || isCurrent) {
          switch (status) {
            case 'pending':
              dotColor = theme.colors.status.pending;
              break;
            case 'in_progress':
              dotColor = theme.colors.status.in_progress;
              break;
            case 'resolved':
              dotColor = theme.colors.status.resolved;
              break;
            case 'closed':
              dotColor = theme.colors.status.closed;
              break;
          }
          labelColor = isCurrent ? dotColor : theme.colors.text.primary;
        }

        return (
          <React.Fragment key={status}>
            <View style={styles.step}>
              <View style={[styles.dot, { backgroundColor: dotColor }]}>
                {(isPast || isCurrent) && <Icon name="check" size={12} color={theme.colors.white} />}
              </View>
              <Text style={[styles.label, { color: labelColor, fontWeight: isCurrent ? 'bold' : 'normal' }]}>
                {getStatusLabel(status)}
              </Text>
            </View>
            {index < statusFlow.length - 1 && (
              <View style={[styles.line, { backgroundColor: isPast ? dotColor : theme.colors.border }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  step: {
    alignItems: 'center',
    width: 60,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: theme.spacing.xs,
    marginBottom: 20, // Align with dot center
  },
  label: {
    ...theme.typography.caption,
    textAlign: 'center',
  },
});
