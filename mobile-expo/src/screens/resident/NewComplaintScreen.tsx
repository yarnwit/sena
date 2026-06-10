import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';

import { ResidentNavigationProp } from '../../types/navigation';
import { useComplaints } from '../../hooks/useComplaints';
import { ComplaintCreatePayload } from '../../types/complaint';
import { useAuth } from '../../hooks/useAuth';
import { getProfile } from '../../api/users';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const NewComplaintScreen: React.FC = () => {
  const navigation = useNavigation<ResidentNavigationProp>();
  const { createComplaint } = useComplaints();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<any>(null);

  // Profile Data
  const [profile, setProfile] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const fetchProfile = async () => {
        try {
          const res = await getProfile();
          if (res.success && isActive) {
            setProfile(res.data);
          }
        } catch (error) {
          console.error('Failed to fetch profile', error);
        }
      };
      fetchProfile();
      return () => { isActive = false; };
    }, [])
  );

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      setAttachment({
        uri: asset.uri || '',
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || 'attachment.jpg',
      });
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุหัวข้อคำร้อง');
      return;
    }

    if (!description.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุรายละเอียด');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ComplaintCreatePayload = {
        subject,
        description,
        intake_channel: 'mobile',
        attachment,
      };

      await createComplaint(payload);

      Alert.alert(
        'สำเร็จ',
        'แจ้งเรื่องร้องเรียนเรียบร้อยแล้ว',
        [{ text: 'ตกลง', onPress: () => navigation.navigate('ResidentTabs' as any, { screen: 'Dashboard' }) }]
      );
    } catch (error: any) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถสร้างเรื่องร้องเรียนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

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
                navigation.navigate('ResidentTabs' as any, { screen: 'Dashboard' });
              }
            }}
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>แจ้งเรื่องร้องเรียน</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Section 1 */}
          <View style={styles.sectionHeader}>
            <Icon name="account-group" size={20} color="#fff" />
            <Text style={styles.sectionTitle}>1. ข้อมูลผู้ร้องเรียน</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ชื่อจริง</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{profile?.first_name || (user?.full_name || user?.username || '').split(' ')[0] || '-'}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>นามสกุล</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{profile?.last_name || (user?.full_name || '').split(' ').slice(1).join(' ') || '-'}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{profile?.phone_number || (user as any)?.phone_number || '-'}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>บ้านเลขที่</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{profile?.house_no || (user as any)?.house_no || '-'}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>เฟส</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{profile?.phase || (user as any)?.phase || '-'}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ซอย</Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{profile?.soi || (user as any)?.soi || '-'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Section 2 */}
          <View style={styles.sectionHeader}>
            <Icon name="file-document-outline" size={20} color="#fff" />
            <Text style={styles.sectionTitle}>2. ข้อมูลเรื่องร้องเรียน</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>หัวข้อคำร้อง <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={styles.textInput}
              placeholder="เช่น น้ำรั่ว, แอร์ไม่เย็น"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>รายละเอียดเพิ่มเติม <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="อธิบายรายละเอียดเพิ่มเติม..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ไฟล์แนบ/รูปภาพประกอบคำร้อง</Text>
            <TouchableOpacity style={styles.attachmentBtn} onPress={handleImagePick}>
              <Icon name="paperclip" size={20} color="rgba(255,255,255,0.7)" />
              <Text style={styles.attachmentText}>
                {attachment ? attachment.name : 'แนบไฟล์เอกสาร/ รูปภาพ'}
              </Text>
              {attachment && (
                <TouchableOpacity onPress={() => setAttachment(null)} style={{ marginLeft: 'auto' }}>
                  <Icon name="close-circle" size={20} color="#FF5252" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Section 3 */}
          <View style={styles.sectionHeader}>
            <Icon name="clipboard-text-outline" size={20} color="#fff" />
            <Text style={styles.sectionTitle}>3. ข้อมูลเอกสารและการรับเรื่อง</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>วันที่</Text>
            <View style={styles.dateInput}>
              <Text style={styles.dropdownText}>{dayjs().format('DD/MM/YYYY')}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ช่องทาง</Text>
            <View style={styles.dateInput}>
              <Text style={styles.dropdownText}>โมบายล์</Text>
            </View>
          </View>

          {/* Disclaimer Banner */}
          <View style={styles.disclaimerCard}>
            <Icon name="alert" size={24} color="#F59E0B" />
            <Text style={styles.disclaimerTitle}>เงื่อนไขความรับผิดชอบ</Text>
            <Text style={styles.disclaimerText}>
              ข้าพเจ้าจะดำเนินการทุกอย่างตามระเบียบปฏิบัติของทาง{'\n'}
              นิติบุคคล{'\n'}
              หากเกิดปัญหาหรือมีข้อผิดพลาดเกิดขึ้น ข้าพเจ้ายินดีรับผิด{'\n'}
              ชอบแต่เพียงผู้เดียว
            </Text>
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกคำร้อง'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  safeArea: {
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
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  readOnlyContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#FF5252',
  },
  readOnlyInput: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  readOnlyText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 15,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dateInput: {
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dropdownText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 24,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: 15,
  },
  textArea: {
    height: 100,
    paddingTop: 16,
  },
  attachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
    gap: 8,
  },
  attachmentText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  submitBtn: {
    backgroundColor: '#38BC0B',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disclaimerCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5252',
    marginTop: 8,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#FF5252',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NewComplaintScreen;
