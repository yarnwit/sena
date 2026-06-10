import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, Dimensions, ScrollView, TouchableOpacity, TextInput, Modal, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';

import { StaffNavigationProp } from '../../types/navigation';
import { useComplaints } from '../../hooks/useComplaints';
import { ComplaintCreateForStaffPayload } from '../../types/complaint';
import * as complaintsApi from '../../api/complaints';

const { width } = Dimensions.get('window');

const NewComplaintScreen: React.FC = () => {
  const navigation = useNavigation<StaffNavigationProp>();
  const { createComplaintForStaff } = useComplaints();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [complainantMode, setComplainantMode] = useState<'system' | 'manual'>('system');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState<any>(null);

  // Residents List state
  const [residents, setResidents] = useState<any[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null);
  const [searchResident, setSearchResident] = useState('');
  const [isResidentsLoading, setIsResidentsLoading] = useState(false);
  const [showResidentModal, setShowResidentModal] = useState(false);

  // Manual Mode state
  const [manualFirstName, setManualFirstName] = useState('');
  const [manualLastName, setManualLastName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualHouseNo, setManualHouseNo] = useState('');
  const [manualPhase, setManualPhase] = useState('');
  const [manualSoi, setManualSoi] = useState('');

  useEffect(() => {
    const fetchResidents = async () => {
      setIsResidentsLoading(true);
      try {
        const response = await complaintsApi.getResidentsList();
        if (response && response.data) {
          setResidents(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch residents:', err);
      } finally {
        setIsResidentsLoading(false);
      }
    };
    fetchResidents();
  }, []);

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

  const filteredResidents = residents.filter(r => {
    if (!searchResident) return true;
    const query = searchResident.toLowerCase();
    const houseMatch = r.house_no ? r.house_no.toLowerCase().includes(query) : false;
    const firstNameMatch = r.first_name ? r.first_name.toLowerCase().includes(query) : false;
    const lastNameMatch = r.last_name ? r.last_name.toLowerCase().includes(query) : false;
    return houseMatch || firstNameMatch || lastNameMatch;
  });

  const selectedResident = residents.find(r => r.resident_id === selectedResidentId) || null;

  const handleSubmit = async () => {
    if (complainantMode === 'system' && !selectedResidentId) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาเลือกลูกบ้านจากระบบ');
      return;
    }

    if (complainantMode === 'manual') {
      if (!manualFirstName.trim() || !manualLastName.trim() || !manualHouseNo.trim()) {
        Alert.alert('ข้อผิดพลาด', 'กรุณากรอกชื่อ นามสกุล และบ้านเลขที่');
        return;
      }
    }

    if (!subject.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณาระบุหัวข้อคำร้อง');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalDescription = description;
      if (complainantMode === 'manual') {
        if (manualPhase.trim() || manualSoi.trim()) {
          finalDescription = `[ข้อมูลเพิ่มเติม - เฟส: ${manualPhase.trim() || '-'} | ซอย: ${manualSoi.trim() || '-'}]\n\n${description}`;
        }
      }

      const payload: ComplaintCreateForStaffPayload = {
        subject,
        description: finalDescription,
        intake_channel: 'mobile', // default to mobile for staff
        attachment,
      };

      if (complainantMode === 'system') {
        payload.resident_id = selectedResidentId;
      } else {
        payload.manual_name = `${manualFirstName.trim()} ${manualLastName.trim()}`;
        payload.manual_house_no = manualHouseNo.trim();
        payload.manual_phone = manualPhone.trim() || undefined;
        payload.phase = manualPhase.trim() || undefined;
        payload.soi = manualSoi.trim() || undefined;
      }

      await createComplaintForStaff(payload);

      // Reset form states
      setSubject('');
      setDescription('');
      setAttachment(null);
      setSelectedResidentId(null);
      setManualFirstName('');
      setManualLastName('');
      setManualPhone('');
      setManualHouseNo('');
      setManualPhase('');
      setManualSoi('');

      Alert.alert(
        'สำเร็จ', 
        'สร้างเรื่องร้องเรียนเข้าระบบเรียบร้อยแล้ว',
        [{ text: 'ตกลง', onPress: () => navigation.navigate('StaffTabs', { screen: 'Dashboard' } as any) }]
      );
    } catch (error: any) {
      Alert.alert('ข้อผิดพลาด', error.message || 'ไม่สามารถสร้างเรื่องร้องเรียนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={['#1c2e42', '#0058b8']} style={styles.flex1}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.headerNav}>
          <TouchableOpacity 
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('StaffTabs' as any, { screen: 'Dashboard' });
              }
            }} 
            style={styles.backBtn}
          >
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>สร้างคำร้องนิติบุคคล</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
          {/* Info Banner */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerIconContainer}>
              <Icon name="briefcase" size={24} color="#F59E0B" />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>สร้างคำร้องในนามนิติบุคคล</Text>
              <Text style={styles.bannerSubtitle}>สามารถเลือกลูกบ้านที่มีในระบบ หรือกรอกข้อมูลผู้มาติดต่อเองได้</Text>
            </View>
          </View>

          {/* Section 1 */}
          <View style={styles.sectionHeader}>
            <Icon name="account-group" size={20} color="#fff" />
            <Text style={styles.sectionTitle}>1. ข้อมูลผู้ร้องเรียน</Text>
          </View>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabBtn, complainantMode === 'system' && styles.tabBtnActive]}
              onPress={() => setComplainantMode('system')}
            >
              <Text style={[styles.tabText, complainantMode === 'system' && styles.tabTextActive]}>เลือกจากระบบ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabBtn, complainantMode === 'manual' && styles.tabBtnActive]}
              onPress={() => setComplainantMode('manual')}
            >
              <Text style={[styles.tabText, complainantMode === 'manual' && styles.tabTextActive]}>กรอกข้อมูลเอง</Text>
            </TouchableOpacity>
          </View>

          {complainantMode === 'system' ? (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>เลือกลูกบ้าน</Text>
                <TouchableOpacity 
                  style={styles.dropdownInput}
                  onPress={() => setShowResidentModal(true)}
                >
                  <Text style={selectedResident ? styles.dropdownTextSelected : styles.dropdownText}>
                    {selectedResident 
                      ? `🏠 ${selectedResident.house_no} - ${selectedResident.first_name} ${selectedResident.last_name}`
                      : 'เลือกลูกบ้านจากระบบ...'}
                  </Text>
                  <Icon name="menu-down" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>

              {selectedResident && (
                <View style={styles.readOnlyContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ชื่อจริง</Text>
                    <View style={styles.readOnlyInput}>
                      <Text style={styles.readOnlyText}>{selectedResident.first_name || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>นามสกุล</Text>
                    <View style={styles.readOnlyInput}>
                      <Text style={styles.readOnlyText}>{selectedResident.last_name || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
                    <View style={styles.readOnlyInput}>
                      <Text style={styles.readOnlyText}>{selectedResident.phone_number || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>บ้านเลขที่</Text>
                    <View style={styles.readOnlyInput}>
                      <Text style={styles.readOnlyText}>{selectedResident.house_no || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>เฟส</Text>
                    <View style={styles.readOnlyInput}>
                      <Text style={styles.readOnlyText}>{selectedResident.phase || '-'}</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>ซอย</Text>
                    <View style={styles.readOnlyInput}>
                      <Text style={styles.readOnlyText}>{selectedResident.soi || '-'}</Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ชื่อจริง <Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ชื่อจริง"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={manualFirstName}
                  onChangeText={setManualFirstName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>นามสกุล <Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="นามสกุล"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={manualLastName}
                  onChangeText={setManualLastName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="08x-xxx-xxxx"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={manualPhone}
                  onChangeText={setManualPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>บ้านเลขที่ <Text style={styles.requiredStar}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="เช่น 88/20"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={manualHouseNo}
                  onChangeText={setManualHouseNo}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>เฟส</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="เฟส"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={manualPhase}
                  onChangeText={setManualPhase}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ซอย</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="ซอย"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={manualSoi}
                  onChangeText={setManualSoi}
                />
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Section 2 */}
          <View style={styles.sectionHeader}>
            <Icon name="file-document-outline" size={20} color="#fff" />
            <Text style={styles.sectionTitle}>2. ข้อมูลเรื่องร้องเรียน</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>หัวข้อคำร้อง</Text>
            <TextInput
              style={styles.textInput}
              placeholder="เช่น น้ำรั่ว, แอร์ไม่เย็น"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={subject}
              onChangeText={setSubject}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>รายละเอียดเพิ่มเติม (ถ้ามี)</Text>
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
            <Text style={styles.inputLabel}>สถานที่รับคำร้อง</Text>
            <View style={styles.dropdownInput}>
              <Text style={styles.dropdownText}>นิติบุคคล</Text>
              <Icon name="menu-down" size={24} color="rgba(255,255,255,0.5)" />
            </View>
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

        <Modal
          visible={showResidentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowResidentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>เลือกลูกบ้านจากระบบ</Text>
                <TouchableOpacity onPress={() => setShowResidentModal(false)} style={styles.modalCloseBtn}>
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.searchBarContainer}>
                <Icon name="magnify" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="ค้นหาบ้านเลขที่ หรือ ชื่อ-นามสกุล..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={searchResident}
                  onChangeText={setSearchResident}
                />
                {searchResident ? (
                  <TouchableOpacity onPress={() => setSearchResident('')}>
                    <Icon name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                ) : null}
              </View>

              {isResidentsLoading ? (
                <View style={styles.modalLoading}>
                  <Text style={styles.modalLoadingText}>กำลังโหลดรายชื่อลูกบ้าน...</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredResidents}
                  keyExtractor={(item) => item.resident_id.toString()}
                  renderItem={({ item }) => {
                    const isSelected = selectedResidentId === item.resident_id;
                    return (
                      <TouchableOpacity
                        style={[styles.residentItem, isSelected && styles.residentItemActive]}
                        onPress={() => {
                          setSelectedResidentId(item.resident_id);
                          setShowResidentModal(false);
                        }}
                      >
                        <View style={styles.residentItemLeft}>
                          <View style={styles.houseBadge}>
                            <Text style={styles.houseBadgeText}>🏠 {item.house_no || '-'}</Text>
                          </View>
                          <Text style={styles.residentNameText}>
                            {item.first_name} {item.last_name}
                          </Text>
                        </View>
                        <View style={styles.residentItemRight}>
                          <Text style={styles.residentPhoneText}>{item.phone_number || ''}</Text>
                          {isSelected && <Icon name="check" size={20} color="#007BFF" style={{ marginLeft: 8 }} />}
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>ไม่พบข้อมูลลูกบ้าน</Text>
                    </View>
                  }
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
  },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 179, 0, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.3)',
    marginBottom: 24,
    alignItems: 'center',
  },
  bannerIconContainer: {
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#007BFF', // Bright blue
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  tabTextActive: {
    color: '#fff',
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
  rowInputs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#007BFF', // Bright blue
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1c2e42',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalCloseBtn: {
    padding: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoadingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  residentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginVertical: 2,
  },
  residentItemActive: {
    backgroundColor: 'rgba(0,123,255,0.15)',
    borderBottomColor: 'transparent',
  },
  residentItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  houseBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
  },
  houseBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  residentNameText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  residentItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentPhoneText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
  },
  readOnlyContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  readOnlyInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
  },
  readOnlyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  requiredStar: {
    color: '#FF5252',
  },
  dropdownTextSelected: {
    color: '#fff',
    fontSize: 15,
  },
});

export default NewComplaintScreen;
