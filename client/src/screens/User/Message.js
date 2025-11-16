import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import COLORS from '../../constant/colors';
import { getUserConversations } from '../../services/MessageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Message = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load current user ID
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Error loading current user:', error);
      }
    };
    loadCurrentUser();
  }, []);

  // Load conversations when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getUserConversations();
      
      // Đảm bảo luôn có array để map
      const conversationsArray = Array.isArray(data) ? data : [];
      
      // Transform API data to match component format
      const transformedConversations = conversationsArray.map(conv => ({
        id: conv.id,
        user: {
          id: conv.participant?.id,
          name: conv.participant?.name || 'Người dùng',
          avatar: conv.participant?.avatar || null,
          isOnline: conv.participant?.online || false,
        },
        lastMessage: conv.lastMessage ? {
          text: conv.lastMessage.content || '',
          timestamp: new Date(conv.lastMessage.timestamp),
          isRead: false,
          senderId: conv.lastMessage.senderId,
        } : null,
        unreadCount: conv.unreadCount || 0,
      }));
      
      setConversations(transformedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
      console.error('Error details:', error.response?.data || error.message);
      // Set empty array khi có lỗi
      setConversations([]);
      Alert.alert('Lỗi', 'Không thể tải danh sách tin nhắn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else if (diffInMinutes < 10080) {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    } else {
      return messageTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    }
  };

  const handleConversationPress = (conversation) => {
    console.log('=== Conversation Pressed ===');
    console.log('Conversation object:', conversation);
    console.log('Conversation ID:', conversation.id);
    console.log('User ID:', conversation.user?.id);
    console.log('User Name:', conversation.user?.name);
    
    if (!conversation.id) {
      Alert.alert('Lỗi', 'Không tìm thấy conversation ID');
      return;
    }
    
    navigation.navigate('ChatScreen', { 
      conversationId: conversation.id,
      userId: conversation.user?.id,
      userName: conversation.user?.name || 'Người dùng',
      userAvatar: conversation.user?.avatar,
      isOnline: conversation.user?.isOnline || false,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => handleConversationPress(item)}
    >
      <View style={styles.avatarContainer}>
        {item.user.avatar ? (
          <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={styles.avatarText}>
              {item.user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {item.user.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.user.name}
          </Text>
          <View style={styles.timeAndBadge}>
            <Text style={styles.messageTime}>
              {formatMessageTime(item.lastMessage?.timestamp)}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <Text
          style={[
            styles.lastMessage,
            item.unreadCount > 0 && item.lastMessage?.senderId !== currentUserId && styles.unreadMessage
          ]}
          numberOfLines={2}
        >
          {item.lastMessage?.text || 'Bắt đầu trò chuyện...'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={COLORS.GRAY} />
      <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
      <Text style={styles.emptyText}>
        Bắt đầu cuộc trò chuyện bằng cách nhấn vào avatar của người dùng trong diễn đàn
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="create-outline" size={24} color={COLORS.BLUE} />
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.BLUE]}
            />
          }
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={conversations.length === 0 ? styles.emptyList : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  headerButton: {
    padding: 8,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.GREEN,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  timeAndBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: COLORS.BLUE,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
  },
  unreadMessage: {
    fontWeight: '500',
    color: COLORS.BLACK,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.GRAY,
  },
});

export default Message;