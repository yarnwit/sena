import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ResidentRouteProp, ResidentNavigationProp } from '../../types/navigation';
import { ComplaintForm } from '../../components/complaints';
import { getComplaintById, updateComplaint } from '../../api/complaints';
import { ComplaintCreatePayload } from '../../types/complaint';
import theme from '../../utils/theme';

const EditComplaintScreen: React.FC = () => {
  const route = useRoute<ResidentRouteProp<'EditComplaint'>>();
  const navigation = useNavigation<ResidentNavigationProp>();
  
  const complaintId = route.params.id;
  const [initialData, setInitialData] = useState<Partial<ComplaintCreatePayload> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await getComplaintById(complaintId);
        const data = response.data;
        
        // Cannot edit if not pending
        if (data.status !== 'pending') {
          Alert.alert('ไม่สามารถแก้ไขได้', 'เรื่องร้องเรียนนี้ถูกรับเรื่องหรือดำเนินการแล้ว', [
            { text: 'กลับ', onPress: () => navigation.goBack() }
          ]);
          return;
        }

        setInitialData({
          subject: data.subject,
          description: data.description,
          location_written: data.location_written,
          intake_channel: data.intake_channel,
          // We can't easily handle existing image in this basic implementation 
          // without more advanced backend support, so we leave attachment undefined 
          // to let user upload a new one if they want to override.
        });
      } catch (error) {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetail();
  }, [complaintId, navigation]);

  const handleSubmit = async (data: ComplaintCreatePayload) => {
    setIsSubmitting(true);
    try {
      // NOTE: Our API requires ComplaintUpdatePayload which is similar
      await updateComplaint(complaintId, {
        subject: data.subject,
        description: data.description,
        location_written: data.location_written,
        intake_channel: data.intake_channel,
      });
      Alert.alert(
        'สำเร็จ', 
        'แก้ไขเรื่องร้องเรียนเรียบร้อยแล้ว',
        [{ text: 'ตกลง', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถแก้ไขเรื่องร้องเรียนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !initialData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ComplaintForm 
        initialValues={initialData}
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        submitLabel="บันทึกการแก้ไข"
        isEdit={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditComplaintScreen;
