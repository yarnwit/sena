import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ComplaintStatus } from '../../types/complaint';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface StatusTimelineProps {
  currentStatus: ComplaintStatus;
  isInteractive?: boolean;
  onStatusChange?: (status: ComplaintStatus) => void;
}

const statusFlow: ComplaintStatus[] = ['pending', 'approved', 'in_meeting', 'in_progress', 'resolved'];

const getStatusLabel = (status: ComplaintStatus) => {
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
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus, isInteractive, onStatusChange }) => {
  if (currentStatus === 'rejected') {
    return (
      <View style={styles.container}>
        <View style={styles.stepContainer}>
          <View style={styles.timelineCol}>
            <View style={[styles.dot, { borderColor: '#FF5252', backgroundColor: '#FF5252' }]} />
          </View>
          <View style={styles.contentCol}>
            <Text style={[styles.label, { color: '#FF5252', fontWeight: 'bold' }]}>
              {getStatusLabel('rejected')}
            </Text>
          </View>
        </View>
      </View>
    );
  }
  
  if (currentStatus === 'closed') {
    return (
      <View style={styles.container}>
        <View style={styles.stepContainer}>
          <View style={styles.timelineCol}>
            <View style={[styles.dot, { borderColor: '#10B981', backgroundColor: '#10B981' }]} />
          </View>
          <View style={styles.contentCol}>
            <Text style={[styles.label, { color: '#10B981', fontWeight: 'bold' }]}>
              {getStatusLabel('closed')}
            </Text>
          </View>
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
        const isLast = index === statusFlow.length - 1;

        const color = (isPast || isCurrent) ? '#F5A623' : 'rgba(255,255,255,0.3)';

        return (
          <View key={status} style={styles.stepContainer}>
            <View style={styles.timelineCol}>
              <TouchableOpacity
                disabled={!isInteractive}
                onPress={() => isInteractive && onStatusChange && onStatusChange(status)}
              >
                <View style={[styles.dot, { borderColor: color, backgroundColor: isCurrent || isPast ? color : 'transparent' }]} />
              </TouchableOpacity>
              {!isLast && <View style={[styles.line, { backgroundColor: isPast ? '#F5A623' : 'rgba(255,255,255,0.2)' }]} />}
            </View>
            <View style={styles.contentCol}>
              <TouchableOpacity
                disabled={!isInteractive}
                onPress={() => isInteractive && onStatusChange && onStatusChange(status)}
              >
                <Text style={[styles.label, { color: (isPast || isCurrent) ? '#F5A623' : 'rgba(255,255,255,0.4)', fontWeight: isCurrent ? 'bold' : 'normal' }]}>
                  {getStatusLabel(status)}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingLeft: 10,
  },
  stepContainer: {
    flexDirection: 'row',
  },
  timelineCol: {
    alignItems: 'center',
    width: 30,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    zIndex: 1,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 30,
    marginVertical: -2,
  },
  contentCol: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 25,
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});
