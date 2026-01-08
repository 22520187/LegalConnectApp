import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const ConversationList = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onEditConversation,
  isLoading,
  onRefresh,
  refreshing,
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  const renderConversationItem = ({ item }) => {
    const isSelected = item.id === currentConversationId;
    
    return (
      <TouchableOpacity
        style={[styles.conversationItem, isSelected && styles.selectedItem]}
        onPress={() => onSelectConversation(item)}
        activeOpacity={0.7}
      >
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Ionicons
              name="chatbubbles"
              size={20}
              color={isSelected ? COLORS.BLUE : COLORS.GRAY_DARK}
              style={styles.icon}
            />
            <View style={styles.conversationInfo}>
              <Text
                style={[styles.conversationTitle, isSelected && styles.selectedTitle]}
                numberOfLines={1}
              >
                {item.title || 'Cuộc trò chuyện mới'}
              </Text>
              {item.summary && (
                <Text style={styles.conversationSummary} numberOfLines={1}>
                  {item.summary}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.conversationFooter}>
            <Text style={styles.conversationDate}>
              {formatDate(item.updatedAt || item.createdAt)}
            </Text>
            <View style={styles.footerActions}>
              {onEditConversation && (
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onEditConversation(item);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="create-outline" size={18} color={COLORS.GRAY_DARK} />
                </TouchableOpacity>
              )}
              {onDeleteConversation && (
                <TouchableOpacity
                  style={[styles.iconButton, styles.deleteButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(item.id);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.RED} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && conversations.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color={COLORS.GRAY} />
        <Text style={styles.emptyText}>Chưa có cuộc trò chuyện nào</Text>
        <Text style={styles.emptySubtext}>
          Tạo cuộc trò chuyện mới để bắt đầu
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      renderItem={renderConversationItem}
      keyExtractor={(item) => String(item.id)}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  conversationItem: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  selectedItem: {
    backgroundColor: COLORS.BLUE_LIGHT,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.BLUE,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 12,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  selectedTitle: {
    color: COLORS.BLUE,
  },
  conversationSummary: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationDate: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
  },
  iconButton: {
    padding: 4,
  },
  deleteButton: {
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
});

export default ConversationList;

