import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import NotificationService from '../../services/NotificationService';

// Map notification type từ API sang UI format
const mapNotificationType = (type) => {
  switch (type) {
    case 'MENTION':
      return {
        icon: 'chatbubble',
        iconColor: COLORS.BLUE,
        title: 'Bạn được nhắc đến',
      };
    case 'REPLY':
      return {
        icon: 'chatbubbles',
        iconColor: COLORS.BLUE,
        title: 'Có người trả lời',
      };
    case 'UPVOTE':
      return {
        icon: 'thumbs-up',
        iconColor: COLORS.ORANGE,
        title: 'Câu trả lời được vote up',
      };
    default:
      return {
        icon: 'notifications',
        iconColor: COLORS.GRAY,
        title: 'Thông báo',
      };
  }
};

// Map notification từ API format sang UI format
const mapNotification = (notification) => {
  const typeInfo = mapNotificationType(notification.type);
  return {
    id: notification.id,
    title: typeInfo.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: new Date(notification.createdAt),
    icon: typeInfo.icon,
    iconColor: typeInfo.iconColor,
    relatedEntityId: notification.relatedEntityId,
    relatedEntityType: notification.relatedEntityType,
  };
};

const Notification = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const loadingMoreRef = useRef(false);

  const loadNotifications = useCallback(async (pageNum = 0, append = false) => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      const unreadOnly = activeTab === 'unread' ? true : null;
      const response = await NotificationService.getNotifications(unreadOnly, pageNum, 20);
      
      if (!mountedRef.current) return;
      
      if (response && response.content) {
        const mappedNotifications = response.content.map(mapNotification);
        
        if (append) {
          setNotifications(prev => [...prev, ...mappedNotifications]);
        } else {
          setNotifications(mappedNotifications);
        }
        
        // Update totalElements - Spring Page returns totalElements
        const total = response.totalElements || 0;
        setTotalElements(total);
        
        // Check if there are more pages
        // Spring Page: number (0-based), totalPages
        const currentPage = response.number !== undefined ? response.number : pageNum;
        const totalPages = response.totalPages || 0;
        const hasMorePages = currentPage < totalPages - 1;
        setHasMore(hasMorePages);
        // Set next page number for pagination
        setPage(currentPage + 1);
      } else {
        if (!append) {
          setNotifications([]);
          setTotalElements(0);
          setHasMore(false);
        }
      }
    } catch (error) {
      if (!mountedRef.current) return;
      console.error('Error loading notifications:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo. Vui lòng thử lại.');
      if (!append) {
        setNotifications([]);
        setTotalElements(0);
        setHasMore(false);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
      loadingRef.current = false;
    }
  }, [activeTab]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      if (mountedRef.current) {
        setUnreadCount(count || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (mountedRef.current) {
      loadNotifications(0, false);
      loadUnreadCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleTabChange = useCallback((tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setPage(0);
      setHasMore(true);
      setNotifications([]); // Clear current notifications when switching tabs
      setTotalElements(0); // Reset total elements
    }
  }, [activeTab]);

  const handleRefresh = useCallback(() => {
    if (!loadingRef.current) {
      setRefreshing(true);
      loadNotifications(0, false);
      loadUnreadCount();
    }
  }, [loadNotifications, loadUnreadCount]);

  const handleLoadMore = useCallback(() => {
    if (!loadingRef.current && !loadingMoreRef.current && !loading && hasMore && notifications.length > 0) {
      loadingMoreRef.current = true;
      // Use current page number (which is already set to next page after previous load)
      loadNotifications(page, true).finally(() => {
        loadingMoreRef.current = false;
      });
    }
  }, [loading, hasMore, page, notifications.length, loadNotifications]);

  const handleNotificationPress = useCallback(async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        await NotificationService.markAsRead(notification.id);
        if (mountedRef.current) {
          // Update local state
          setNotifications(prev => {
            const updated = prev.map(n => 
              n.id === notification.id ? { ...n, isRead: true } : n
            );
            // If on unread tab, remove the notification from list
            if (activeTab === 'unread') {
              return updated.filter(n => !n.isRead);
            }
            return updated;
          });
          
          // Update unread count and reload if on unread tab to get correct totalElements
          await loadUnreadCount();
          if (activeTab === 'unread') {
            // Reload to get updated totalElements from server
            await loadNotifications(0, false);
          }
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type and related entity
    if (notification.relatedEntityId) {
      switch (notification.relatedEntityType) {
        case 'POST':
          // Navigate to question/post detail
          // navigation.navigate('QuestionDetail', { questionId: notification.relatedEntityId });
          break;
        case 'REPLY':
          // Navigate to question detail with reply focus
          // navigation.navigate('QuestionDetail', { 
          //   questionId: notification.relatedEntityId,
          //   replyId: notification.relatedEntityId 
          // });
          break;
        default:
          break;
      }
    }
  }, [loadUnreadCount, activeTab, loadNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const success = await NotificationService.markAllAsRead();
      if (success && mountedRef.current) {
        // Update unread count
        setUnreadCount(0);
        
        // Reload notifications to get fresh data
        await loadNotifications(0, false);
        await loadUnreadCount();
        
        Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả là đã đọc. Vui lòng thử lại.');
    }
  }, [loadNotifications, loadUnreadCount]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Vừa xong';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút trước`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày trước`;
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.iconColor}15` }]}>
          <Ionicons name={item.icon} size={20} color={item.iconColor} />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.time}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
        
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    </TouchableOpacity>
  );

  const renderTabButton = (key, label) => (
    <TouchableOpacity
      key={key}
      style={[styles.tab, activeTab === key && styles.activeTab]}
      onPress={() => handleTabChange(key)}
    >
      <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.WHITE} 
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Thông báo</Text>
          
          <TouchableOpacity 
            style={styles.markAllReadButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllReadText}>Đọc tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {renderTabButton('all', `Tất cả (${totalElements})`)}
          {renderTabButton('unread', `Chưa đọc (${unreadCount})`)}
        </View>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.BLUE} />
            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.BLUE]}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            removeClippedSubviews={false}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={400}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-outline" size={64} color={COLORS.GRAY} />
                <Text style={styles.emptyText}>
                  {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'}
                </Text>
              </View>
            }
            ListFooterComponent={
              loading && notifications.length > 0 ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator size="small" color={COLORS.BLUE} />
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  markAllReadButton: {
    padding: 4,
  },
  markAllReadText: {
    fontSize: 14,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.BLUE,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.GRAY,
  },
  activeTabText: {
    color: COLORS.BLUE,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  notificationItem: {
    backgroundColor: COLORS.WHITE,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadItem: {
    backgroundColor: `${COLORS.BLUE}05`,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.BLUE,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    lineHeight: 20,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.BLUE,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.GRAY,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.GRAY,
    marginTop: 16,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default Notification;