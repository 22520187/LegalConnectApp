import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import COLORS from '../../constant/colors';

const LawyerRequestModal = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    specialization: '',
    education: '',
    additionalInfo: '',
  });

  const [documents, setDocuments] = useState({
    lawyerCertificate: null,
    idCard: null,
    cv: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickDocument = async (documentType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setDocuments(prev => ({
          ...prev,
          [documentType]: file,
        }));
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn tệp tin. Vui lòng thử lại.');
    }
  };

  const removeDocument = (documentType) => {
    setDocuments(prev => ({
      ...prev,
      [documentType]: null,
    }));
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'experience', 'specialization', 'education'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());

    if (missingFields.length > 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return false;
    }

    if (!documents.lawyerCertificate) {
      Alert.alert('Thiếu tài liệu', 'Vui lòng tải lên giấy phép hành nghề luật sư.');
      return false;
    }

    if (!documents.idCard) {
      Alert.alert('Thiếu tài liệu', 'Vui lòng tải lên ảnh CCCD/CMND.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Email không hợp lệ', 'Vui lòng nhập email đúng định dạng.');
      return false;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại 10-11 chữ số.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onSubmit({
        ...formData,
        documents,
      });
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        experience: '',
        specialization: '',
        education: '',
        additionalInfo: '',
      });
      setDocuments({
        lawyerCertificate: null,
        idCard: null,
        cv: null,
      });
      
      onClose();
      Alert.alert('Thành công', 'Yêu cầu của bạn đã được gửi và đang chờ xét duyệt.');
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocumentUpload = (documentType, title, isRequired = true) => (
    <View style={styles.documentSection}>
      <Text style={styles.documentTitle}>
        {title} {isRequired && <Text style={styles.required}>*</Text>}
      </Text>
      
      {documents[documentType] ? (
        <View style={styles.uploadedDocument}>
          <View style={styles.documentInfo}>
            <Ionicons name="document-outline" size={24} color={COLORS.BLUE} />
            <Text style={styles.documentName} numberOfLines={1}>
              {documents[documentType].name}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => removeDocument(documentType)}
            style={styles.removeButton}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.RED} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickDocument(documentType)}
        >
          <Ionicons name="cloud-upload-outline" size={24} color={COLORS.BLUE} />
          <Text style={styles.uploadText}>Chọn tệp tin</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yêu cầu trở thành luật sư</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Họ và tên <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                placeholder="Nhập họ và tên đầy đủ"
                placeholderTextColor={COLORS.GRAY}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Nhập địa chỉ email"
                placeholderTextColor={COLORS.GRAY}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Số điện thoại <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Nhập số điện thoại"
                placeholderTextColor={COLORS.GRAY}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Địa chỉ <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Nhập địa chỉ đầy đủ"
                placeholderTextColor={COLORS.GRAY}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* Professional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin nghề nghiệp</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Số năm kinh nghiệm <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.experience}
                onChangeText={(value) => handleInputChange('experience', value)}
                placeholder="Ví dụ: 5 năm"
                placeholderTextColor={COLORS.GRAY}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Chuyên môn <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.specialization}
                onChangeText={(value) => handleInputChange('specialization', value)}
                placeholder="Ví dụ: Luật Dân sự, Luật Hình sự"
                placeholderTextColor={COLORS.GRAY}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Trình độ học vấn <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.education}
                onChangeText={(value) => handleInputChange('education', value)}
                placeholder="Ví dụ: Thạc sĩ Luật, Đại học Luật Hà Nội"
                placeholderTextColor={COLORS.GRAY}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Thông tin bổ sung</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.additionalInfo}
                onChangeText={(value) => handleInputChange('additionalInfo', value)}
                placeholder="Thêm thông tin khác (nếu có)"
                placeholderTextColor={COLORS.GRAY}
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Document Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>
            
            {renderDocumentUpload('lawyerCertificate', 'Giấy phép hành nghề luật sư')}
            {renderDocumentUpload('idCard', 'Ảnh CCCD/CMND (mặt trước và sau)')}
            {renderDocumentUpload('cv', 'CV/Hồ sơ cá nhân', false)}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  required: {
    color: COLORS.RED,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
  },
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  documentSection: {
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: COLORS.BLUE,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  uploadText: {
    color: COLORS.BLUE,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  uploadedDocument: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentName: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.BLACK,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 24,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.GRAY,
  },
  submitButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LawyerRequestModal;
