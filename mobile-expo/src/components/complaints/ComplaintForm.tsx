import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Text } from 'react-native';
import { Input, Button } from '../ui';
import { ComplaintCreatePayload } from '../../types/complaint';
import theme from '../../utils/theme';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';

interface ComplaintFormProps {
  initialValues?: Partial<ComplaintCreatePayload>;
  onSubmit: (data: ComplaintCreatePayload) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
  isEdit?: boolean;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  initialValues = {},
  onSubmit,
  isSubmitting,
  submitLabel = 'บันทึก',
  isEdit = false,
}) => {
  const [subject, setSubject] = useState(initialValues.subject || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [location, setLocation] = useState(initialValues.location_written || '');
  const [attachment, setAttachment] = useState<ComplaintCreatePayload['attachment']>(
    initialValues.attachment
  );
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!subject.trim()) newErrors.subject = 'กรุณาระบุหัวข้อร้องเรียน';
    if (!description.trim()) newErrors.description = 'กรุณาระบุรายละเอียด';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        subject,
        description,
        location_written: location,
        attachment,
        // Default intake_channel if creating new
        intake_channel: isEdit ? initialValues.intake_channel : 'Mobile App',
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="หัวข้อร้องเรียน *"
        placeholder="เช่น น้ำรั่ว, ไฟดับ"
        value={subject}
        onChangeText={setSubject}
        error={errors.subject}
      />
      
      <Input
        label="รายละเอียด *"
        placeholder="ระบุรายละเอียดปัญหาที่พบ"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        error={errors.description}
      />

      <Input
        label="สถานที่เกิดเหตุ (ถ้ามี)"
        placeholder="เช่น ชั้น 2, หน้าโครงการ"
        value={location}
        onChangeText={setLocation}
      />

      <View style={styles.attachmentContainer}>
        <Text style={styles.label}>แนบรูปภาพ (ถ้ามี)</Text>
        {attachment ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: attachment.uri }} style={styles.image} />
            <TouchableOpacity 
              style={styles.removeImageBtn} 
              onPress={() => setAttachment(undefined)}
            >
              <Icon name="close" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadBtn} onPress={handleImagePick}>
            <Icon name="camera-plus" size={32} color={theme.colors.primary} />
            <Text style={styles.uploadText}>แตะเพื่อเลือกรูปภาพ</Text>
          </TouchableOpacity>
        )}
      </View>

      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={isSubmitting}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.lg,
  },
  attachmentContainer: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    ...theme.typography.subtitle,
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  uploadBtn: {
    height: 120,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  uploadText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  imageContainer: {
    height: 200,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});
