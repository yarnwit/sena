import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
  TouchableOpacity, TextInput, Image, Modal, FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import dayjs from 'dayjs';

import { getComplaintById, updateComplaint } from '../../api/complaints';
import { Complaint } from '../../types/complaint';
import { useAuth } from '../../hooks/useAuth';

// ── helpers ───────────────────────────────────────────────────────────────────

// No more parseComplaintComplainant hack

const CHANNEL_OPTIONS = [
  { value: 'mobile',        label: 'โมบายล์' },
  { value: 'walk_in',       label: 'เดินเข้ามาแจ้ง' },
  { value: 'phone',         label: 'โทรศัพท์' },
  { value: 'line',          label: 'LINE' },
  { value: 'email',         label: 'อีเมล' },
  { value: 'group_village', label: 'กลุ่มไลน์หมู่บ้าน' },
  { value: 'website',       label: 'เว็บไซต์' },
];

const getChannelLabel = (channel?: string | null) => {
  if (!channel) return 'โมบายล์';
  return CHANNEL_OPTIONS.find(o => o.value === channel)?.label ?? channel;
};

// ── theme tokens ──────────────────────────────────────────────────────────────

const THEME = {
  resident: {
    bg:         '#161D19' as const,
    gradientColors: ['#161D19', '#38BC0B'] as [string, string],
    card:        'rgba(255,255,255,0.12)',
    inputBox:    'rgba(255,255,255,0.08)',
    inputBoxRO:  'rgba(255,255,255,0.04)',
    editBtnBorder: '#38BC0B',
    editBtnText:   '#fff',
    modalBg:     '#1D2B22',
  },
  staff: {
    bg:         '#161D19' as const,
    gradientColors: ['#161D19', '#007AFF'] as [string, string],
    card:        'rgba(255,255,255,0.12)',
    inputBox:    'rgba(255,255,255,0.08)',
    inputBoxRO:  'rgba(255,255,255,0.04)',
    editBtnBorder: '#007BFF',
    editBtnText:   '#fff',
    modalBg:     '#1D2B22',
  },
};

// ── component ─────────────────────────────────────────────────────────────────

const EditComplaintScreen: React.FC = () => {
  const route      = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user }   = useAuth();

  const isStaff     = user?.role === 'staff' || user?.role === 'admin';
  const theme       = isStaff ? THEME.staff : THEME.resident;
  const complaintId = route.params.id as number;

  const [complaint,    setComplaint]    = useState<Complaint | null>(null);
  const [isLoading,    setIsLoading]    = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Section 1
  const [firstName,   setFirstName]   = useState('');
  const [lastName,    setLastName]    = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [houseNo,     setHouseNo]     = useState('');
  const [phase,       setPhase]       = useState('');
  const [soi,         setSoi]         = useState('');
  const [hasManualPrefix, setHasManualPrefix] = useState(false);

  // Section 2
  const [subject,     setSubject]     = useState('');
  const [description, setDescription] = useState('');

  // Section 3
  const [locationWritten,    setLocationWritten]    = useState('');
  const [intakeChannel,      setIntakeChannel]      = useState('mobile');
  const [attachment,         setAttachment]         = useState<any>(null);
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null);
  const [showChannelModal,   setShowChannelModal]   = useState(false);

  // ── fetch ────────────────────────────────────────────────────────────────

  const fetchDetail = useCallback(async () => {
    try {
      const res  = await getComplaintById(complaintId, user?.role);
      const data = res.data;

      if (data.status !== 'pending') {
        Alert.alert(
          'ไม่สามารถแก้ไขได้',
          'เรื่องร้องเรียนนี้ถูกรับเรื่องหรือดำเนินการแล้ว',
          [{ text: 'กลับ', onPress: () => navigation.goBack() }],
        );
        return;
      }

      setComplaint(data);
      setHasManualPrefix((data.description || '').startsWith('[ผู้ร้อง:'));

      setFirstName(data.first_name || data.resident_name?.split(' ')[0] || '');
      setLastName(data.last_name || data.resident_name?.split(' ').slice(1).join(' ') || '');
      setPhoneNumber(data.phone_number || '');
      setHouseNo(data.house_no || '');
      setPhase(data.phase || '');
      setSoi(data.soi || '');
      setSubject(data.subject || '');
      setDescription(data.description || '');
      setLocationWritten(data.location_written || '');
      setIntakeChannel(data.intake_channel || 'mobile');
      setExistingAttachment(data.attachment_url);
    } catch {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [complaintId, navigation, user?.role]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  // ── handlers ────────────────────────────────────────────────────────────

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setAttachment({ uri: asset.uri, type: asset.mimeType || 'image/jpeg', name: asset.fileName || 'attachment.jpg' });
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('ข้อผิดพลาด', 'กรุณากรอกหัวข้อคำร้อง');
      return;
    }

    let finalDescription = description;

    setIsSubmitting(true);
    try {
      await updateComplaint(complaintId, {
        subject:          subject.trim(),
        description:      finalDescription,
        location_written: locationWritten.trim() || undefined,
        intake_channel:   intakeChannel,
      }, user?.role);
      Alert.alert('สำเร็จ', 'แก้ไขเรื่องร้องเรียนเรียบร้อยแล้ว', [
        { text: 'ตกลง', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถแก้ไขเรื่องร้องเรียนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── loading ───────────────────────────────────────────────────────────────

  if (isLoading || !complaint) {
    return (
      <View style={[styles.flex1, { backgroundColor: '#141A16', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={isStaff ? '#007AFF' : '#2E7D32'} />
      </View>
    );
  }

  const previewUri = attachment?.uri ?? existingAttachment;

  // ── dynamic styles (เปลี่ยนตาม role) ─────────────────────────────────────

  const cardStyle   = [styles.card,     { backgroundColor: theme.card,     ...(isStaff && { borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }) }];
  const inputStyle  = [styles.inputBox, { backgroundColor: theme.inputBox  }];
  const roStyle     = [styles.inputBox, { backgroundColor: theme.inputBoxRO, opacity: 0.75 }];

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <LinearGradient colors={theme.gradientColors} style={styles.flex1}>
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>แก้ไขคำร้อง</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

          {/* Ticket chip */}
          <View style={[cardStyle, { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 4 }}>สถานะปัจจุบัน</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{complaint.ticket_no}</Text>
            </View>
            <View style={{ backgroundColor: '#F5A623', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold' }}>รอดำเนินการ</Text>
            </View>
          </View>

          {/* ─── 1. ข้อมูลผู้ร้องเรียน ─── */}
          <View>
            <View style={styles.sectionHeader}>
              <Icon name="account-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>1. ข้อมูลผู้ร้องเรียน</Text>
            </View>

            <Text style={styles.inputLabel}>ชื่อจริง</Text>
            <View style={roStyle}><Text style={{ color: 'rgba(255,255,255,0.7)' }}>{firstName || '-'}</Text></View>

            <Text style={styles.inputLabel}>นามสกุล</Text>
            <View style={roStyle}><Text style={{ color: 'rgba(255,255,255,0.7)' }}>{lastName || '-'}</Text></View>

            <Text style={styles.inputLabel}>เบอร์โทรศัพท์</Text>
            <View style={roStyle}><Text style={{ color: 'rgba(255,255,255,0.7)' }}>{phoneNumber || '-'}</Text></View>

            <Text style={styles.inputLabel}>บ้านเลขที่</Text>
            <View style={roStyle}><Text style={{ color: 'rgba(255,255,255,0.7)' }}>{houseNo || '-'}</Text></View>

            <Text style={styles.inputLabel}>เฟส</Text>
            <View style={roStyle}><Text style={{ color: 'rgba(255,255,255,0.7)' }}>{phase || '-'}</Text></View>

            <Text style={styles.inputLabel}>ซอย</Text>
            <View style={roStyle}><Text style={{ color: 'rgba(255,255,255,0.7)' }}>{soi || '-'}</Text></View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 5 }}>
              <Icon name="information-outline" size={13} color="rgba(255,255,255,0.4)" />
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontStyle: 'italic', flex: 1 }}>
                ข้อมูลผู้ร้องเรียนดึงจากระบบอัตโนมัติ (แก้ไขไม่ได้)
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ─── 2. ข้อมูลเรื่องร้องเรียน ─── */}
          <View>
            <View style={styles.sectionHeader}>
              <Icon name="file-document-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>2. ข้อมูลเรื่องร้องเรียน</Text>
            </View>

            <Text style={styles.inputLabel}>หัวข้อคำร้อง</Text>
            <TextInput style={inputStyle} value={subject} onChangeText={setSubject}
              placeholder="กรอกหัวข้อคำร้อง" placeholderTextColor="rgba(255,255,255,0.3)" />

            <Text style={styles.inputLabel}>รายละเอียดเพิ่มเติม</Text>
            <TextInput style={[inputStyle, { minHeight: 80 }]} value={description} onChangeText={setDescription}
              placeholder="กรอกรายละเอียด" placeholderTextColor="rgba(255,255,255,0.3)"
              multiline textAlignVertical="top" />
          </View>

          <View style={styles.divider} />

          {/* ─── 3. ข้อมูลเอกสารและการรับเรื่อง ─── */}
          <View>
            <View style={styles.sectionHeader}>
              <Icon name="file-multiple-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>3. ข้อมูลเอกสารและการรับเรื่อง</Text>
            </View>

            {/* วันที่แจ้ง — read-only */}
            <Text style={styles.inputLabel}>วันที่แจ้ง</Text>
            <View style={roStyle}>
              <Text style={styles.inputText}>{dayjs(complaint.reported_date).format('YYYY-MM-DD HH:mm:ss')}</Text>
            </View>

            <Text style={styles.inputLabel}>สถานที่รับคำร้อง</Text>
            <TextInput style={inputStyle} value={locationWritten} onChangeText={setLocationWritten}
              placeholder="เช่น สำนักงาน" placeholderTextColor="rgba(255,255,255,0.3)" />

            <Text style={styles.inputLabel}>ช่องทาง</Text>
            <TouchableOpacity
              style={[inputStyle, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
              onPress={() => setShowChannelModal(true)}
            >
              <Text style={styles.inputText}>{getChannelLabel(intakeChannel)}</Text>
              <Icon name="chevron-down" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>

            <Text style={styles.inputLabel}>ไฟล์แนบ/รูปภาพประกอบคำร้อง</Text>
            {previewUri ? (
              <View>
                <Image source={{ uri: previewUri }} style={{ width: '100%', height: 150, borderRadius: 8, marginTop: 4 }} />
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 }} onPress={handleImagePick}>
                  <Icon name="image-edit-outline" size={15} color="#4CAF50" />
                  <Text style={{ color: '#4CAF50', fontSize: 13 }}>เปลี่ยนรูปภาพ</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[inputStyle, { height: 100, justifyContent: 'center', alignItems: 'center' }]} onPress={handleImagePick}>
                <Icon name="image-plus" size={32} color="rgba(255,255,255,0.3)" />
                <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>แตะเพื่อเลือกรูปภาพ</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: theme.editBtnBorder, backgroundColor: isStaff ? '#007BFF' : 'transparent' }, isSubmitting && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={isStaff ? '#fff' : '#4CAF50'} />
            ) : (
              <Text style={[styles.editBtnText, { color: theme.editBtnText }]}>บันทึกการแก้ไข</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Channel Picker Modal */}
        <Modal visible={showChannelModal} transparent animationType="slide" onRequestClose={() => setShowChannelModal(false)}>
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
            activeOpacity={1}
            onPress={() => setShowChannelModal(false)}
          >
            <View style={[styles.modalSheet, { backgroundColor: theme.modalBg }]}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>เลือกช่องทางรับเรื่อง</Text>
              <FlatList
                data={CHANNEL_OPTIONS}
                keyExtractor={item => item.value}
                renderItem={({ item }) => {
                  const active = intakeChannel === item.value;
                  return (
                    <TouchableOpacity
                      style={[styles.modalItem, active && styles.modalItemActive]}
                      onPress={() => { setIntakeChannel(item.value); setShowChannelModal(false); }}
                    >
                      <Text style={[styles.modalItemText, active && { color: '#4CAF50', fontWeight: 'bold' }]}>{item.label}</Text>
                      {active && <Icon name="check-circle" size={18} color="#4CAF50" />}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>

      </SafeAreaView>
    </LinearGradient>
  );
};

// ── styles (base tokens — สีเปลี่ยนใน dynamic styles ด้านบน) ─────────────────

const styles = StyleSheet.create({
  flex1:     { flex: 1 },
  safeArea:  { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1 },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn:     { padding: 4, width: 40, alignItems: 'flex-start' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  scrollContent: { padding: 16, gap: 16 },
  card: { borderRadius: 16, padding: 20 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle:  { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  inputLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6, marginTop: 8 },
  inputBox:   { borderRadius: 8, padding: 12, color: '#fff', fontSize: 15 },
  inputText:  { color: '#fff', fontSize: 15 },
  editBtn: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  editBtnText: { fontWeight: 'bold', fontSize: 16 },
  // Modal
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingTop: 12, maxHeight: '65%',
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle:      { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalItem:       { padding: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalItemActive: { backgroundColor: 'rgba(76, 175, 80, 0.15)' },
  modalItemText:   { color: '#fff', fontSize: 15 },
});

export default EditComplaintScreen;
