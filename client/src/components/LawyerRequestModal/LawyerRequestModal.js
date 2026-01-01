import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import COLORS from '../../constant/colors';
import LawyerService from '../../services/LawyerService';
import ForumService from '../../services/ForumService';

const LawyerRequestModal = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    licenseNumber: '',
    lawSchool: '',
    graduationYear: '',
    yearsOfExperience: '',
    currentFirm: '',
    bio: '',
    phoneNumber: '',
    officeAddress: '',
  });

  const [specializations, setSpecializations] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories when modal opens
  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await ForumService.getCategories();
      if (categoriesData && Array.isArray(categoriesData)) {
        const categoryNames = categoriesData
          .filter(cat => cat.isActive !== false)
          .map(cat => cat.name)
          .sort();
        setAvailableCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi tải danh mục',
        text2: 'Không thể tải danh sách chuyên môn. Vui lòng thử lại.'
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecializationToggle = (category) => {
    setSpecializations(prev => {
      if (prev.includes(category)) {
        return prev.filter(item => item !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setDocuments(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn tệp tin. Vui lòng thử lại.');
    }
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    // Required fields validation
    if (!formData.licenseNumber.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số giấy phép hành nghề.');
      return false;
    }

    if (!formData.lawSchool.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên trường luật.');
      return false;
    }

    if (!formData.graduationYear.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập năm tốt nghiệp.');
      return false;
    }

    const graduationYear = parseInt(formData.graduationYear);
    if (isNaN(graduationYear) || graduationYear < 1950 || graduationYear > 2025) {
      Alert.alert('Năm tốt nghiệp không hợp lệ', 'Năm tốt nghiệp phải từ 1950 đến 2025.');
      return false;
    }

    if (!formData.yearsOfExperience.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập số năm kinh nghiệm.');
      return false;
    }

    const yearsOfExp = parseInt(formData.yearsOfExperience);
    if (isNaN(yearsOfExp) || yearsOfExp < 0 || yearsOfExp > 50) {
      Alert.alert('Số năm kinh nghiệm không hợp lệ', 'Số năm kinh nghiệm phải từ 0 đến 50.');
      return false;
    }

    if (specializations.length === 0) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn ít nhất một chuyên môn.');
      return false;
    }

    if (!formData.bio.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiểu sử.');
      return false;
    }

    if (formData.bio.length > 2000) {
      Alert.alert('Tiểu sử quá dài', 'Tiểu sử không được vượt quá 2000 ký tự.');
      return false;
    }

    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
        Alert.alert('Số điện thoại không hợp lệ', 'Vui lòng nhập số điện thoại 10-11 chữ số.');
        return false;
      }
    }

    if (documents.length === 0) {
      Alert.alert('Thiếu tài liệu', 'Vui lòng tải lên ít nhất một tài liệu.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Step 1: Upload documents
      Toast.show({
        type: 'info',
        text1: 'Đang tải tài liệu...',
        text2: 'Vui lòng đợi trong giây lát'
      });

      const documentUrls = await LawyerService.uploadDocuments(documents);
      
      if (!documentUrls || documentUrls.length === 0) {
        throw new Error('Không thể tải lên tài liệu');
      }

      // Step 2: Submit application
      Toast.show({
        type: 'info',
        text1: 'Đang gửi đơn...',
        text2: 'Vui lòng đợi trong giây lát'
      });

      const applicationData = {
        licenseNumber: formData.licenseNumber.trim(),
        lawSchool: formData.lawSchool.trim(),
        graduationYear: parseInt(formData.graduationYear),
        specializations: specializations,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        currentFirm: formData.currentFirm.trim() || null,
        bio: formData.bio.trim(),
        phoneNumber: formData.phoneNumber.trim() || null,
        officeAddress: formData.officeAddress.trim() || null,
        documentUrls: documentUrls,
      };

      const result = await LawyerService.submitLawyerApplication(applicationData);
      
      // Reset form
      setFormData({
        licenseNumber: '',
        lawSchool: '',
        graduationYear: '',
        yearsOfExperience: '',
        currentFirm: '',
        bio: '',
        phoneNumber: '',
        officeAddress: '',
      });
      setSpecializations([]);
      setDocuments([]);
      
      onClose();
      
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đơn đăng ký của bạn đã được gửi và đang chờ xét duyệt.'
      });

      if (onSubmit) {
        onSubmit(result);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Có lỗi xảy ra khi gửi đơn đăng ký. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDocumentList = () => {
    if (documents.length === 0) {
      return null;
    }

    return (
      <View style={styles.documentList}>
        {documents.map((doc, index) => (
          <View key={`doc-${doc.name || doc.uri || index}-${index}`} style={styles.documentItem}>
            <View style={styles.documentInfo}>
              <Ionicons name="document-outline" size={20} color={COLORS.BLUE} />
              <Text style={styles.documentName} numberOfLines={1}>
                {doc.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeDocument(index)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.RED} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

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
          <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
            <Ionicons name="close" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đăng ký trở thành luật sư</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* License Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin giấy phép</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Số giấy phép hành nghề <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.licenseNumber}
                onChangeText={(value) => handleInputChange('licenseNumber', value)}
                placeholder="Nhập số giấy phép hành nghề"
                placeholderTextColor={COLORS.GRAY}
                maxLength={50}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Education Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin học vấn</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Trường luật <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.lawSchool}
                onChangeText={(value) => handleInputChange('lawSchool', value)}
                placeholder="Ví dụ: Đại học Luật Hà Nội"
                placeholderTextColor={COLORS.GRAY}
                maxLength={200}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Năm tốt nghiệp <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                value={formData.graduationYear}
                onChangeText={(value) => handleInputChange('graduationYear', value)}
                placeholder="Ví dụ: 2020"
                placeholderTextColor={COLORS.GRAY}
                keyboardType="numeric"
                maxLength={4}
                editable={!isSubmitting}
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
                value={formData.yearsOfExperience}
                onChangeText={(value) => handleInputChange('yearsOfExperience', value)}
                placeholder="Ví dụ: 5"
                placeholderTextColor={COLORS.GRAY}
                keyboardType="numeric"
                maxLength={2}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Công ty/Văn phòng hiện tại</Text>
              <TextInput
                style={styles.textInput}
                value={formData.currentFirm}
                onChangeText={(value) => handleInputChange('currentFirm', value)}
                placeholder="Nhập tên công ty/văn phòng (nếu có)"
                placeholderTextColor={COLORS.GRAY}
                maxLength={200}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Chuyên môn <Text style={styles.required}>*</Text>
              </Text>
              {loadingCategories ? (
                <ActivityIndicator size="small" color={COLORS.BLUE} />
              ) : (
                <View style={styles.categoryContainer}>
                  {availableCategories.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        specializations.includes(category) && styles.categoryChipSelected
                      ]}
                      onPress={() => handleSpecializationToggle(category)}
                      disabled={isSubmitting}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          specializations.includes(category) && styles.categoryChipTextSelected
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {specializations.length > 0 && (
                <Text style={styles.selectedCount}>
                  Đã chọn: {specializations.length} chuyên môn
                </Text>
              )}
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.textInput}
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                placeholder="Nhập số điện thoại (10-11 chữ số)"
                placeholderTextColor={COLORS.GRAY}
                keyboardType="phone-pad"
                maxLength={11}
                editable={!isSubmitting}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Địa chỉ văn phòng</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.officeAddress}
                onChangeText={(value) => handleInputChange('officeAddress', value)}
                placeholder="Nhập địa chỉ văn phòng (nếu có)"
                placeholderTextColor={COLORS.GRAY}
                multiline
                numberOfLines={3}
                maxLength={500}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiểu sử</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Giới thiệu về bản thân <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={formData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                placeholder="Nhập tiểu sử và kinh nghiệm của bạn..."
                placeholderTextColor={COLORS.GRAY}
                multiline
                numberOfLines={6}
                maxLength={2000}
                editable={!isSubmitting}
              />
              <Text style={styles.charCount}>
                {formData.bio.length}/2000 ký tự
              </Text>
            </View>
          </View>

          {/* Document Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>
            
            <View style={styles.documentSection}>
              <Text style={styles.documentTitle}>
                Tài liệu <Text style={styles.required}>*</Text>
              </Text>
              
              {renderDocumentList()}
              
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickDocument}
                disabled={isSubmitting}
              >
                <Ionicons name="cloud-upload-outline" size={24} color={COLORS.BLUE} />
                <Text style={styles.uploadText}>
                  {documents.length > 0 ? 'Thêm tài liệu' : 'Chọn tài liệu'}
                </Text>
                <Text style={styles.uploadSubtext}>
                  Có thể chọn nhiều tài liệu
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.WHITE} />
            ) : (
              <Text style={styles.submitButtonText}>Gửi đơn đăng ký</Text>
            )}
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
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 4,
    textAlign: 'right',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipSelected: {
    backgroundColor: COLORS.BLUE,
    borderColor: COLORS.BLUE,
  },
  categoryChipText: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  categoryChipTextSelected: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 8,
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
  documentList: {
    marginBottom: 12,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    marginBottom: 8,
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
  uploadSubtext: {
    color: COLORS.GRAY,
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: COLORS.BLUE,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 24,
    flexDirection: 'row',
    justifyContent: 'center',
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
