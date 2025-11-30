import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import PostReportService from '../../services/PostReportService';

const { width } = Dimensions.get('window');

const ReportModal = ({ 
  visible, 
  onClose, 
  reportType, // 'post' hoặc 'user'
  targetId, 
  targetTitle = '',
  onSubmit 
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postReportReasons = [
    'Nội dung không phù hợp',
    'Spam hoặc quảng cáo',
    'Thông tin sai lệch',
    'Vi phạm bản quyền',
    'Ngôn từ độc hại',
    'Nội dung khiêu dâm',
    'Bạo lực hoặc đe dọa',
    'Lý do khác'
  ];

  const userReportReasons = [
    'Hành vi quấy rối',
    'Ngôn từ độc hại',
    'Spam liên tục',
    'Mạo danh',
    'Chia sẻ thông tin sai lệch',
    'Vi phạm quy tắc cộng đồng',
    'Hành vi đáng ngờ',
    'Lý do khác'
  ];

  const reasons = reportType === 'post' ? postReportReasons : userReportReasons;
  
  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    if (reason !== 'Lý do khác') {
      setOtherReason('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Lỗi', 'Vui lòng chọn lý do báo cáo');
      return;
    }

    if (selectedReason === 'Lý do khác' && !otherReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng mô tả lý do báo cáo');
      return;
    }

    setIsSubmitting(true);

    try {
      const reasonText = selectedReason === 'Lý do khác' ? otherReason : selectedReason;
      
      // Chỉ gọi API nếu là báo cáo bài viết (post)
      if (reportType === 'post' && targetId) {
        const reportData = {
          reason: reasonText,
          description: selectedReason === 'Lý do khác' ? otherReason : null,
        };

        await PostReportService.reportPost(targetId, reportData);

        Alert.alert(
          'Báo cáo đã gửi',
          'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        // Nếu là báo cáo user hoặc không có targetId, vẫn gọi callback nếu có
        const reportData = {
          targetId,
          targetTitle,
          reportType,
          reason: reasonText,
          timestamp: new Date().toISOString(),
        };

        if (onSubmit) {
          onSubmit(reportData);
        }

        Alert.alert(
          'Báo cáo đã gửi',
          'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.',
          [{ text: 'OK', onPress: onClose }]
        );
      }

      // Reset form
      setSelectedReason('');
      setOtherReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
      const errorMessage = error.message || 'Không thể gửi báo cáo. Vui lòng thử lại sau.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setOtherReason('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Báo cáo {reportType === 'post' ? 'bài viết' : 'người dùng'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.GRAY} />
            </TouchableOpacity>
          </View>

          {targetTitle ? (
            <View style={styles.targetInfo}>
              <Text style={styles.targetTitle} numberOfLines={2}>
                {reportType === 'post' ? 'Bài viết: ' : 'Người dùng: '}{targetTitle}
              </Text>
            </View>
          ) : null}

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Chọn lý do báo cáo:</Text>
            
            {reasons.map((reason, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.reasonItem,
                  selectedReason === reason && styles.selectedReasonItem
                ]}
                onPress={() => handleReasonSelect(reason)}
              >
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radioButton,
                    selectedReason === reason && styles.selectedRadioButton
                  ]}>
                    {selectedReason === reason && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason && styles.selectedReasonText
                  ]}>
                    {reason}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {selectedReason === 'Lý do khác' && (
              <View style={styles.otherReasonContainer}>
                <Text style={styles.otherReasonLabel}>Mô tả chi tiết:</Text>
                <TextInput
                  style={styles.otherReasonInput}
                  value={otherReason}
                  onChangeText={setOtherReason}
                  placeholder="Vui lòng mô tả lý do báo cáo..."
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            )}

            <View style={styles.warningContainer}>
              <Ionicons name="warning-outline" size={20} color={COLORS.ORANGE} />
              <Text style={styles.warningText}>
                Báo cáo sai sự thật có thể dẫn đến việc tài khoản của bạn bị hạn chế.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selectedReason || isSubmitting) && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={!selectedReason || isSubmitting}
            >
              {isSubmitting ? (
                <Text style={styles.submitButtonText}>Đang gửi...</Text>
              ) : (
                <>
                  <Ionicons name="send" size={16} color={COLORS.WHITE} />
                  <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  targetInfo: {
    padding: 16,
    backgroundColor: COLORS.GRAY_BG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  targetTitle: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    fontStyle: 'italic',
  },
  content: {
    maxHeight: '60%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    margin: 16,
    marginBottom: 12,
  },
  reasonItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  selectedReasonItem: {
    backgroundColor: COLORS.BLUE_LIGHT,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedRadioButton: {
    borderColor: COLORS.BLUE,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.BLUE,
  },
  reasonText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    flex: 1,
  },
  selectedReasonText: {
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  otherReasonContainer: {
    padding: 16,
  },
  otherReasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  otherReasonInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.BLACK,
    backgroundColor: COLORS.WHITE,
    minHeight: 80,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: COLORS.ORANGE_LIGHT,
    margin: 16,
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    color: COLORS.ORANGE_DARK,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.RED,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.GRAY,
  },
  submitButtonText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default ReportModal;
