import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';
import COLORS from '../../constant/colors';
import LawyerService from '../../services/LawyerService';

const LawyerApplicationDetailModal = ({ visible, onClose, applicationId }) => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newDocuments, setNewDocuments] = useState([]);
  const [isEditingDocuments, setIsEditingDocuments] = useState(false);

  useEffect(() => {
    if (visible && applicationId) {
      loadApplicationDetails();
    } else {
      // Reset state when modal closes
      setApplication(null);
      setNewDocuments([]);
      setIsEditingDocuments(false);
    }
  }, [visible, applicationId]);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      const details = await LawyerService.getApplicationDetails();
      if (details) {
        setApplication(details);
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin đơn đăng ký');
        onClose();
      }
    } catch (error) {
      console.error('Error loading application details:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải thông tin đơn đăng ký');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const pickNewDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewDocuments(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn tệp tin. Vui lòng thử lại.');
    }
  };

  const removeNewDocument = (index) => {
    setNewDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDocuments = async () => {
    if (newDocuments.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một tài liệu mới');
      return;
    }

    try {
      setUpdating(true);
      
      // Upload new documents
      Toast.show({
        type: 'info',
        text1: 'Đang tải tài liệu...',
        text2: 'Vui lòng đợi trong giây lát'
      });

      const documentUrls = await LawyerService.uploadDocuments(newDocuments);
      
      if (!documentUrls || documentUrls.length === 0) {
        throw new Error('Không thể tải lên tài liệu');
      }

      // Update application documents
      Toast.show({
        type: 'info',
        text1: 'Đang cập nhật...',
        text2: 'Vui lòng đợi trong giây lát'
      });

      const updated = await LawyerService.updateApplicationDocuments(application.id, documentUrls);
      
      if (updated) {
        setApplication(prev => ({
          ...prev,
          documentUrls: documentUrls
        }));
        setNewDocuments([]);
        setIsEditingDocuments(false);
        
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: 'Đã cập nhật tài liệu thành công'
        });
      }
    } catch (error) {
      console.error('Error updating documents:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật tài liệu. Vui lòng thử lại.');
    } finally {
      setUpdating(false);
    }
  };

  const openDocument = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => {
        Alert.alert('Lỗi', 'Không thể mở tài liệu');
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return COLORS.ORANGE;
      case 'APPROVED':
        return COLORS.GREEN;
      case 'REJECTED':
        return COLORS.RED;
      default:
        return COLORS.GRAY;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'Đang chờ xét duyệt';
      case 'APPROVED':
        return 'Đã được phê duyệt';
      case 'REJECTED':
        return 'Bị từ chối';
      default:
        return status || 'Không xác định';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.BLACK} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Chi tiết đơn đăng ký</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.BLUE} />
            <Text style={styles.loadingText}>Đang tải thông tin...</Text>
          </View>
        </View>
      </Modal>
    );
  }

  if (!application) {
    return null;
  }

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
          <TouchableOpacity onPress={onClose} disabled={updating}>
            <Ionicons name="close" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn đăng ký</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Section */}
          <View style={styles.section}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(application.status) + '20' }]}>
              <Ionicons 
                name={
                  application.status?.toUpperCase() === 'APPROVED' ? 'checkmark-circle' :
                  application.status?.toUpperCase() === 'REJECTED' ? 'close-circle' :
                  'time-outline'
                } 
                size={20} 
                color={getStatusColor(application.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
                {getStatusText(application.status)}
              </Text>
            </View>
            {application.adminNotes && (
              <View style={styles.adminNotesContainer}>
                <Text style={styles.adminNotesLabel}>Ghi chú từ admin:</Text>
                <Text style={styles.adminNotesText}>{application.adminNotes}</Text>
              </View>
            )}
          </View>

          {/* License Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin giấy phép</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số giấy phép hành nghề:</Text>
              <Text style={styles.infoValue}>{application.licenseNumber}</Text>
            </View>
          </View>

          {/* Education Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin học vấn</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trường luật:</Text>
              <Text style={styles.infoValue}>{application.lawSchool}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Năm tốt nghiệp:</Text>
              <Text style={styles.infoValue}>{application.graduationYear}</Text>
            </View>
          </View>

          {/* Professional Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin nghề nghiệp</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số năm kinh nghiệm:</Text>
              <Text style={styles.infoValue}>{application.yearsOfExperience} năm</Text>
            </View>
            {application.currentFirm && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Công ty/Văn phòng hiện tại:</Text>
                <Text style={styles.infoValue}>{application.currentFirm}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Chuyên môn:</Text>
              <View style={styles.specializationsContainer}>
                {application.specializations && application.specializations.map((spec, index) => (
                  <View key={index} style={styles.specializationChip}>
                    <Text style={styles.specializationText}>{spec}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            {application.phoneNumber && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                <Text style={styles.infoValue}>{application.phoneNumber}</Text>
              </View>
            )}
            {application.officeAddress && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Địa chỉ văn phòng:</Text>
                <Text style={styles.infoValue}>{application.officeAddress}</Text>
              </View>
            )}
          </View>

          {/* Bio */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiểu sử</Text>
            <Text style={styles.bioText}>{application.bio}</Text>
          </View>

          {/* Documents Section */}
          <View style={styles.section}>
            <View style={styles.documentsHeader}>
              <Text style={styles.sectionTitle}>Tài liệu đính kèm</Text>
              {application.status?.toUpperCase() === 'PENDING' && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditingDocuments(!isEditingDocuments)}
                  disabled={updating}
                >
                  <Ionicons 
                    name={isEditingDocuments ? "close" : "create-outline"} 
                    size={18} 
                    color={COLORS.BLUE} 
                  />
                  <Text style={styles.editButtonText}>
                    {isEditingDocuments ? 'Hủy' : 'Chỉnh sửa'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Current Documents */}
            {!isEditingDocuments && application.documentUrls && application.documentUrls.length > 0 && (
              <View style={styles.documentsList}>
                {application.documentUrls.map((url, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.documentItem}
                    onPress={() => openDocument(url)}
                  >
                    <Ionicons name="document-outline" size={20} color={COLORS.BLUE} />
                    <Text style={styles.documentName} numberOfLines={1}>
                      Tài liệu {index + 1}
                    </Text>
                    <Ionicons name="open-outline" size={18} color={COLORS.GRAY} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Edit Documents Mode */}
            {isEditingDocuments && (
              <View style={styles.editDocumentsContainer}>
                <Text style={styles.editDocumentsTitle}>Tài liệu mới:</Text>
                
                {/* New Documents List */}
                {newDocuments.length > 0 && (
                  <View style={styles.newDocumentsList}>
                    {newDocuments.map((doc, index) => (
                      <View key={index} style={styles.newDocumentItem}>
                        <View style={styles.newDocumentInfo}>
                          <Ionicons name="document-outline" size={20} color={COLORS.BLUE} />
                          <Text style={styles.newDocumentName} numberOfLines={1}>
                            {doc.name}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeNewDocument(index)}
                          style={styles.removeButton}
                        >
                          <Ionicons name="close-circle" size={20} color={COLORS.RED} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Upload Button */}
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={pickNewDocuments}
                  disabled={updating}
                >
                  <Ionicons name="cloud-upload-outline" size={24} color={COLORS.BLUE} />
                  <Text style={styles.uploadText}>
                    {newDocuments.length > 0 ? 'Thêm tài liệu' : 'Chọn tài liệu mới'}
                  </Text>
                </TouchableOpacity>

                {/* Update Button */}
                {newDocuments.length > 0 && (
                  <TouchableOpacity
                    style={[styles.updateButton, updating && styles.updateButtonDisabled]}
                    onPress={handleUpdateDocuments}
                    disabled={updating}
                  >
                    {updating ? (
                      <ActivityIndicator size="small" color={COLORS.WHITE} />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.WHITE} />
                        <Text style={styles.updateButtonText}>Cập nhật tài liệu</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* Application Metadata */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin đơn</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày nộp đơn:</Text>
              <Text style={styles.infoValue}>{formatDate(application.createdAt)}</Text>
            </View>
            {application.updatedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cập nhật lần cuối:</Text>
                <Text style={styles.infoValue}>{formatDate(application.updatedAt)}</Text>
              </View>
            )}
          </View>
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
    borderBottomColor: COLORS.GRAY_LIGHT,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  section: {
    marginTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  adminNotesContainer: {
    backgroundColor: COLORS.GRAY_BG,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    marginBottom: 4,
  },
  adminNotesText: {
    fontSize: 14,
    color: COLORS.BLACK,
    lineHeight: 20,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.GRAY_DARK,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.BLACK,
    lineHeight: 22,
  },
  specializationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  specializationChip: {
    backgroundColor: COLORS.BLUE_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specializationText: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  bioText: {
    fontSize: 15,
    color: COLORS.GRAY_DARK,
    lineHeight: 22,
  },
  documentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.BLUE_LIGHT,
  },
  editButtonText: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontWeight: '500',
    marginLeft: 4,
  },
  documentsList: {
    marginTop: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_BG,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.BLACK,
  },
  editDocumentsContainer: {
    marginTop: 12,
  },
  editDocumentsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  newDocumentsList: {
    marginBottom: 12,
  },
  newDocumentItem: {
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
  newDocumentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newDocumentName: {
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
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  uploadText: {
    color: COLORS.BLUE,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: COLORS.BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  updateButtonDisabled: {
    backgroundColor: COLORS.GRAY,
  },
  updateButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default LawyerApplicationDetailModal;

