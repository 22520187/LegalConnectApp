import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import COLORS from '../../constant/colors';

const PDFPicker = ({ onFileSelected, selectedFile }) => {
  const [isLoading, setIsLoading] = useState(false);

  const pickDocument = async () => {
    try {
      setIsLoading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          Alert.alert(
            'File quá lớn',
            'Vui lòng chọn file PDF có kích thước nhỏ hơn 10MB'
          );
          return;
        }

        onFileSelected(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert(
        'Lỗi',
        'Không thể chọn file. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeFile = () => {
    Alert.alert(
      'Xóa file',
      'Bạn có chắc chắn muốn xóa file đã chọn?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => onFileSelected(null) }
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <View style={styles.selectedFileContainer}>
        <View style={styles.fileInfo}>
          <View style={styles.fileIconContainer}>
            <Ionicons name="document-text" size={24} color={COLORS.RED} />
          </View>
          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Text style={styles.fileSize}>
              {formatFileSize(selectedFile.size)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={removeFile}
        >
          <Ionicons name="close-circle" size={24} color={COLORS.RED} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.pickButton, isLoading && styles.pickButtonDisabled]}
        onPress={pickDocument}
        disabled={isLoading}
      >
        <Ionicons 
          name={isLoading ? "hourglass" : "cloud-upload-outline"} 
          size={32} 
          color={COLORS.BLUE} 
        />
        <Text style={styles.pickButtonText}>
          {isLoading ? 'Đang tải...' : 'Chọn file PDF'}
        </Text>
        <Text style={styles.pickButtonSubtext}>
          Nhấn để chọn file PDF (tối đa 10MB)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  pickButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 2,
    borderColor: COLORS.BLUE,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickButtonDisabled: {
    opacity: 0.6,
  },
  pickButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLUE,
    marginTop: 12,
    marginBottom: 4,
  },
  pickButtonSubtext: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  selectedFileContainer: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BLUE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  removeButton: {
    padding: 8,
  },
});

export default PDFPicker;











