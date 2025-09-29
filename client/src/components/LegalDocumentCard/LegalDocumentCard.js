import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constant/colors';

const LegalDocumentCard = ({ document, onViewDetail, onDownload, onViewSource }) => {
  const navigation = useNavigation();
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  const getDocumentTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'nghị quyết':
        return 'document-text';
      case 'quyết định':
        return 'checkmark-circle';
      case 'thông tư':
        return 'information-circle';
      case 'chỉ thị':
        return 'arrow-forward-circle';
      default:
        return 'document';
    }
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
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const handleViewDetail = () => {
    if (onViewDetail) {
      onViewDetail(document);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document);
    }
  };

  const handleViewSource = () => {
    if (onViewSource) {
      onViewSource(document);
    }
  };

  return (
    <View style={styles.container}>
      {/* Document Type Badge */}
      <View style={[styles.typeBadge, { backgroundColor: getDocumentTypeColor(document.type) }]}>
        <Ionicons 
          name={getDocumentTypeIcon(document.type)} 
          size={14} 
          color={COLORS.WHITE} 
        />
        <Text style={styles.typeText}>{document.type}</Text>
      </View>

      <View style={styles.content}>
        {/* Status Badge */}
        <View style={styles.header}>
          <View style={[styles.statusBadge, document.status === 'Đã biết' ? styles.activeStatus : styles.expiredStatus]}>
            <Text style={styles.statusText}>{document.status}</Text>
          </View>
          <Text style={styles.documentCode}>{document.code}</Text>
        </View>

        {/* Document Title */}
        <Text style={styles.title} numberOfLines={3}>
          {document.title}
        </Text>

        {/* Document Summary */}
        <Text style={styles.summary} numberOfLines={2}>
          {document.summary}
        </Text>

        {/* Tags */}
        {renderTags(document.tags)}

        {/* Document Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.GRAY} />
            <Text style={styles.infoText}>{document.province}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={14} color={COLORS.GRAY} />
            <Text style={styles.infoText}>{document.issuer}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.GRAY} />
            <Text style={styles.infoText}>{formatDate(document.date)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryAction]} 
            onPress={handleViewDetail}
          >
            <Ionicons name="eye-outline" size={16} color={COLORS.WHITE} />
            <Text style={styles.actionButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryAction]} 
            onPress={handleDownload}
          >
            <Ionicons name="download-outline" size={16} color={COLORS.BLUE} />
            <Text style={styles.secondaryActionText}>Tải về</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryAction]} 
            onPress={handleViewSource}
          >
            <Ionicons name="link-outline" size={16} color={COLORS.BLUE} />
            <Text style={styles.secondaryActionText}>Nguồn gốc</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  typeBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    zIndex: 1,
  },
  typeText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    padding: 16,
    paddingTop: 40, // Space for type badge
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredStatus: {
    backgroundColor: COLORS.RED_LIGHT,
  },
  activeStatus: {
    backgroundColor: COLORS.GREEN_LIGHT,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
  },
  documentCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 8,
    lineHeight: 20,
  },
  summary: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    marginBottom: 12,
    lineHeight: 18,
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tag: {
    backgroundColor: COLORS.BLUE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  infoContainer: {
    marginBottom: 16,
    backgroundColor: COLORS.GRAY_BG,
    padding: 12,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginLeft: 6,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 40,
  },
  primaryAction: {
    backgroundColor: COLORS.BLUE,
    flex: 1.2, // Slightly bigger for primary action
  },
  secondaryAction: {
    backgroundColor: COLORS.BLUE_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  secondaryActionText: {
    color: COLORS.BLUE,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default LegalDocumentCard;

