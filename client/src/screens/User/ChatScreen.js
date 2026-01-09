import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, ChatInput } from '../../components';
import COLORS from '../../constant/colors';
import {
  getConversationMessages,
  sendMessage,
  markConversationAsRead,
} from '../../services/MessageService';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId, userId, userName, userAvatar, isOnline } = route.params || {};
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const scrollViewRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load messages function
  const loadMessages = async () => {
    if (!conversationId) {
      console.error('❌ No conversationId provided!');
      Alert.alert('Lỗi', 'Không tìm thấy conversation ID');
      setIsLoadingMessages(false);
      return;
    }

    try {
      setIsLoadingMessages(true);
      // Load current user ID - ensure it's loaded before processing messages
      let actualUserId = currentUserId;
      if (!actualUserId) {
        try {
          // Try 'user' key first (as used in AuthService)
          let userData = await AsyncStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            actualUserId = user.id || user.userId;
            setCurrentUserId(actualUserId);
          } else {
            // Try 'userData' key as fallback
            userData = await AsyncStorage.getItem('userData');
            if (userData) {
              const user = JSON.parse(userData);
              actualUserId = user.id || user.userId;
              setCurrentUserId(actualUserId);
              console.log('✅ Current user ID loaded from AsyncStorage (key: "userData"):', actualUserId);
            } else {
              console.error('❌ No user data found in AsyncStorage (tried "user" and "userData")');
            }
          }
        } catch (error) {
          console.error('Error loading current user:', error);
        }
      } else {
        console.log('✅ Current user ID from state:', actualUserId);
        console.log('✅ User ID type:', typeof actualUserId);
      }
      
      // Double check - if still no userId, try one more time with different keys
      if (!actualUserId) {
        console.warn('⚠️ actualUserId still not set, trying one more time...');
        try {
          const keys = ['user', 'userData', 'currentUser'];
          for (const key of keys) {
            const userData = await AsyncStorage.getItem(key);
            if (userData) {
              try {
                const user = JSON.parse(userData);
                actualUserId = user.id || user.userId || user.user?.id;
                if (actualUserId) {
                  setCurrentUserId(actualUserId);
                  console.log(`✅ Current user ID loaded from key "${key}":`, actualUserId);
                  break;
                }
              } catch (e) {
                console.warn(`Failed to parse data from key "${key}"`);
              }
            }
          }
        } catch (error) {
          console.error('Error loading current user (retry):', error);
        }
      }
  
      const data = await getConversationMessages(conversationId);
      
      if (!data) {
        console.warn('⚠️ No data received');
        setMessages([]);
        return;
      }
      
      if (!Array.isArray(data)) {
        console.warn('⚠️ Invalid data format, expected array:', data);
        setMessages([]);
        return;
      }
      
      // Ensure actualUserId is set
      if (!actualUserId) {
        console.error('❌ actualUserId is not set!');
        Alert.alert('Lỗi', 'Không thể xác định người dùng hiện tại');
        setIsLoadingMessages(false);
        return;
      }
      
      // Convert to numbers for comparison (in case they're strings)
      const currentUserIdNum = Number(actualUserId);
      
      // Transform API data to match component format
      const transformedMessages = data.map((msg, index) => {
        const senderIdNum = Number(msg.senderId);
        const isUserMessage = senderIdNum === currentUserIdNum;
        
        console.log(`Message ${index + 1}:`, {
          senderId: msg.senderId,
          senderIdNum: senderIdNum,
          currentUserId: actualUserId,
          currentUserIdNum: currentUserIdNum,
          isUser: isUserMessage,
          comparison: `${senderIdNum} === ${currentUserIdNum} = ${isUserMessage}`
        });
        
        return {
          id: msg.id,
          message: msg.content,
          isUser: isUserMessage, // Message is from current user
          timestamp: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          senderId: msg.senderId,
        };
      });
      
      setMessages(transformedMessages);
      
      // Mark conversation as read
      try {
        await markConversationAsRead(conversationId);
        console.log('✅ Conversation marked as read');
      } catch (error) {
        console.warn('⚠️ Failed to mark as read:', error);
      }
      
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải tin nhắn. Vui lòng thử lại.');
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
      scrollToBottom();
    }
  };

  // Load user and messages when component mounts or conversationId changes
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🔄 Initializing ChatScreen...');
        
        // Load user data - try 'user' key first (as used in AuthService)
        try {
          let userData = await AsyncStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            const userId = user.id || user.userId;
            if (userId) {
              setCurrentUserId(userId);
              console.log('✅ User ID set from "user" key:', userId);
            } else {
              console.warn('⚠️ User object found but no id field:', user);
            }
          } else {
            // Try 'userData' as fallback
            userData = await AsyncStorage.getItem('userData');
            if (userData) {
              const user = JSON.parse(userData);
              const userId = user.id || user.userId;
              if (userId) {
                setCurrentUserId(userId);
                console.log('✅ User ID set from "userData" key:', userId);
              }
            } else {
              console.warn('⚠️ No user data in AsyncStorage (tried "user" and "userData")');
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
        
        // Load messages
        if (conversationId) {
          console.log('✅ conversationId exists, loading messages...');
          await loadMessages();
        } else {
          console.error('❌ conversationId is missing!');
          Alert.alert('Lỗi', 'Không tìm thấy conversation ID');
          setIsLoadingMessages(false);
        }
      } catch (error) {
        console.error('Error initializing:', error);
        setIsLoadingMessages(false);
      }
    };
    
    initialize();
  }, [conversationId]); // Re-run if conversationId changes

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async (messageContent) => {
    if (!messageContent.trim() || !conversationId) {
      return;
    }

    try {
      setIsLoading(true);

      // Send message via API
      const sentMessage = await sendMessage(conversationId, messageContent.trim());
      
      // Add to local messages immediately
      const newMessage = {
        id: sentMessage.id,
        message: sentMessage.content,
        isUser: true,
        timestamp: new Date(sentMessage.createdAt).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        senderId: sentMessage.senderId,
      };

      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('UserProfile', {
      userId: userId,
      userName: userName,
      userAvatar: userAvatar,
    });
  };

  const handleMoreOptions = () => {
    Alert.alert(
      'Tùy chọn',
      'Chọn hành động',
      [
        { text: 'Xem hồ sơ', onPress: handleProfilePress },
        { text: 'Báo cáo', onPress: () => {/* Handle report */} },
        { text: 'Chặn người dùng', onPress: () => {/* Handle block */} },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  // Show loading indicator while loading messages
  if (isLoadingMessages) {
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
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
        
        <TouchableOpacity 
          style={styles.userInfo}
          onPress={handleProfilePress}
        >
          <View style={styles.avatarContainer}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isOnline && <View style={styles.onlineIndicator} />}
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userStatus}>
              {isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.moreButton}
          onPress={handleMoreOptions}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={COLORS.GRAY} />
              <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
              <Text style={styles.emptySubtext}>Gửi tin nhắn đầu tiên để bắt đầu trò chuyện</Text>
            </View>
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.message}
                isUser={msg.isUser}
                timestamp={msg.timestamp}
              />
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingMessageContainer}>
              <View style={styles.loadingBubble}>
                <Text style={styles.loadingMessageText}>Đang gửi...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
        />
      </KeyboardAvoidingView>
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
    marginRight: 8,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.GREEN,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  userStatus: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
    marginLeft: 8,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBubble: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.GRAY,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadingMessageContainer: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  loadingMessageText: {
    fontSize: 15,
    color: COLORS.GRAY,
    fontStyle: 'italic',
  },
});

export default ChatScreen;
