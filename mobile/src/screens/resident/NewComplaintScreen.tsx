import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ResidentNavigationProp } from '../../types/navigation';
import { ComplaintForm } from '../../components/complaints';
import { useComplaints } from '../../hooks/useComplaints';
import { ComplaintCreatePayload } from '../../types/complaint';
import theme from '../../utils/theme';

const NewComplaintScreen: React.FC = () => {
  const navigation = useNavigation<ResidentNavigationProp>();
  const { createComplaint } = useComplaints();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: ComplaintCreatePayload) => {
    setIsSubmitting(true);
    try {
      await createComplaint(data);
      Alert.alert(
        'สำเร็จ', 
        'แจ้งเรื่องร้องเรียนเรียบร้อยแล้ว',
        [{ text: 'ตกลง', onPress: () => navigation.navigate('ResidentTabs') }]
      );
    } catch (error) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้างเรื่องร้องเรียนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ComplaintForm 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default NewComplaintScreen;
