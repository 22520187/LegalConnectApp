import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../constant/colors';

const LegalDocumentDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { document } = route.params;
  
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDocumentTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'nghị quyết':
        return COLORS.BLUE;
      case 'quyết định':
        return COLORS.GREEN;
      case 'thông tư':
        return COLORS.ORANGE;
      case 'chỉ thị':
        return COLORS.PURPLE;
      default:
        return COLORS.GRAY;
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Tải về văn bản',
      'Bạn có muốn tải về văn bản này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Tải về', onPress: () => {
          // Implement download functionality
          Alert.alert('Thông báo', 'Tính năng tải về đang được phát triển');
        }}
      ]
    );
  };

  const handleViewSource = () => {
    Alert.alert(
      'Nguồn gốc văn bản',
      `Văn bản được ban hành bởi: ${document.issuer}\nCơ quan: ${document.province}\nNgày ban hành: ${formatDate(document.date)}`,
      [{ text: 'Đóng' }]
    );
  };

  const handleShare = () => {
    Alert.alert(
      'Chia sẻ văn bản',
      'Bạn có muốn chia sẻ văn bản này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Chia sẻ', onPress: () => {
          // Implement share functionality
          Alert.alert('Thông báo', 'Tính năng chia sẻ đang được phát triển');
        }}
      ]
    );
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      'Thông báo',
      isBookmarked ? 'Đã bỏ lưu văn bản' : 'Đã lưu văn bản vào danh sách yêu thích'
    );
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
      >
        {tags.map((tag, index) => (
          <View key={`doc-detail-tag-${tag}-${index}`} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Chi tiết văn bản</Text>
        
        {/* <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={toggleBookmark}
          >
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isBookmarked ? COLORS.BLUE : COLORS.GRAY} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color={COLORS.GRAY} />
          </TouchableOpacity>
        </View> */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Document Type Banner */}
        <View style={[styles.typeBanner, { backgroundColor: getDocumentTypeColor(document.type) }]}>
          <Text style={styles.typeText}>{document.type}</Text>
          <Text style={styles.codeText}>{document.code}</Text>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, document.status === 'Đã biệt' ? styles.expiredStatus : styles.activeStatus]}>
            <Ionicons 
              name={document.status === 'Đã biệt' ? "close-circle" : "checkmark-circle"} 
              size={16} 
              color={document.status === 'Đã biệt' ? COLORS.RED : COLORS.GREEN} 
            />
            <Text style={[styles.statusText, { color: document.status === 'Đã biệt' ? COLORS.RED : COLORS.GREEN }]}>
              {document.status}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{document.title}</Text>

        {/* Document Info */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Thông tin văn bản</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cơ quan ban hành:</Text>
              <Text style={styles.infoValue}>{document.province}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Người ký:</Text>
              <Text style={styles.infoValue}>{document.issuer}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày ban hành:</Text>
              <Text style={styles.infoValue}>{formatDate(document.date)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số hiệu:</Text>
              <Text style={styles.infoValue}>{document.code}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lĩnh vực:</Text>
              <Text style={styles.infoValue}>{document.field}</Text>
            </View>
          </View>
        </View>

        {/* Tags */}
        {document.tags && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Từ khóa</Text>
            {renderTags(document.tags)}
          </View>
        )}

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung tóm tắt</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{document.summary}</Text>
          </View>
        </View>

        {/* Full Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung đầy đủ</Text>
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>
              {/* Mock full content */}
              {document.title}
              {'\n\n'}
              {document.summary}
              {'\n\n'}
              Điều 1. Phạm vi điều chỉnh
              {'\n'}
              Văn bản này quy định về...
              {'\n\n'}
              Điều 2. Đối tượng áp dụng
              {'\n'}
              Văn bản này áp dụng đối với...
              {'\n\n'}
              Điều 3. Hiệu lực thi hành
              {'\n'}
              Văn bản này có hiệu lực từ ngày ký.
              {'\n\n'}
              [Nội dung đầy đủ sẽ được tải từ server...]
            </Text>
          </View>
        </View>

        {/* Related Documents */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Văn bản liên quan</Text>
          <View style={styles.relatedCard}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.BLUE} />
            <Text style={styles.relatedText}>Chưa có văn bản liên quan</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.downloadButton]}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={20} color={COLORS.WHITE} />
          <Text style={styles.actionButtonText}>Tải về</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.sourceButton]}
          onPress={handleViewSource}
        >
          <Ionicons name="link-outline" size={20} color={COLORS.BLUE} />
          <Text style={styles.sourceButtonText}>Nguồn gốc</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    backgroundColor: COLORS.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerAction: {
    padding: 4,
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  typeBanner: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  typeText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  codeText: {
    color: COLORS.WHITE,
    fontSize: 14,
    opacity: 0.9,
  },
  statusContainer: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  expiredStatus: {
    backgroundColor: COLORS.RED_LIGHT,
  },
  activeStatus: {
    backgroundColor: COLORS.GREEN_LIGHT,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    lineHeight: 26,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  section: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  infoSection: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    width: 120,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.BLACK,
    flex: 1,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
  },
  tag: {
    backgroundColor: COLORS.BLUE_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  contentCard: {
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    padding: 16,
  },
  contentText: {
    fontSize: 14,
    color: COLORS.BLACK,
    lineHeight: 22,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    padding: 16,
  },
  relatedText: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginLeft: 12,
  },
  actionBar: {
    backgroundColor: COLORS.WHITE,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_BG,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  downloadButton: {
    backgroundColor: COLORS.BLUE,
  },
  sourceButton: {
    backgroundColor: COLORS.BLUE_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sourceButtonText: {
    color: COLORS.BLUE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default LegalDocumentDetail;

