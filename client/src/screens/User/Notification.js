import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const Notification = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      title: 'Câu hỏi của bạn đã được trả lời',
      message: 'John Doe đã trả lời câu hỏi "Làm thế nào để khởi kiện doanh nghiệp?"',
      type: 'answer',
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      icon: 'chatbubble',
      iconColor: COLORS.BLUE,
    },
    {
      id: 2,
      title: 'Bài viết mới từ chuyên gia',
      message: 'Luật sư Nguyễn Văn A đã đăng bài viết về "Quyền lợi người lao động"',
      type: 'post',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: 'document-text',
      iconColor: COLORS.GREEN,
    },
    {
      id: 3,
      title: 'Câu hỏi được vote up',
      message: 'Câu hỏi của bạn về "Hợp đồng lao động" đã nhận được 5 votes',
      type: 'vote',
      isRead: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      icon: 'thumbs-up',
      iconColor: COLORS.ORANGE,
    },
    {
      id: 4,
      title: 'Có người theo dõi bạn',
      message: 'Sarah Wilson đã bắt đầu theo dõi bạn',
      type: 'follow',
      isRead: true,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      icon: 'person-add',
      iconColor: COLORS.PURPLE,
    },
    {
      id: 5,
      title: 'Bình luận mới',
      message: 'Mike Chen đã bình luận về câu trả lời của bạn',
      type: 'comment',
      isRead: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      icon: 'chatbubbles',
      iconColor: COLORS.BLUE,
    },
    {
      id: 6,
      title: 'Lời nhắc đánh giá',
      message: 'Đừng quên đánh giá câu trả lời hữu ích nhất cho câu hỏi của bạn',
      type: 'reminder',
      isRead: true,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      icon: 'star',
      iconColor: COLORS.YELLOW,
    },
    {
      id: 7,
      title: 'Cập nhật hệ thống',
      message: 'Ứng dụng đã được cập nhật với nhiều tính năng mới',
      type: 'system',
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      icon: 'refresh',
      iconColor: COLORS.GRAY,
    },
  ];

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const loadNotifications = () => {
    let filteredNotifications = [...mockNotifications];
    
    if (activeTab === 'unread') {
      filteredNotifications = filteredNotifications.filter(n => !n.isRead);
    }
    
    setNotifications(filteredNotifications);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadNotifications();
      setRefreshing(false);
    }, 1000);
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'answer':
      case 'comment':
      case 'vote':
        // Navigate to question detail
        // navigation.navigate('QuestionDetail', { questionId: notification.relatedId });
        break;
      case 'follow':
        // Navigate to user profile
        // navigation.navigate('UserProfile', { userId: notification.relatedId });
        break;
      default:
        break;
    }
  };

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

  const unreadCount = mockNotifications.filter(n => !n.isRead).length;

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
          
          <TouchableOpacity style={styles.markAllReadButton}>
            <Text style={styles.markAllReadText}>Đọc tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {renderTabButton('all', `Tất cả (${mockNotifications.length})`)}
          {renderTabButton('unread', `Chưa đọc (${unreadCount})`)}
        </View>

        {/* Notifications List */}
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
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={64} color={COLORS.GRAY} />
              <Text style={styles.emptyText}>
                {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo'}
              </Text>
            </View>
          }
        />
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
});

export default Notification;