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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChatMessage, ChatInput } from '../../components';
import COLORS from '../../constant/colors';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, userName, userAvatar, isOnline } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // Mock messages data
  useEffect(() => {
    const mockMessages = [
      {
        id: 1,
        message: "Xin chào! Tôi cần tư vấn về vấn đề hợp đồng lao động.",
        isUser: false,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        senderId: userId,
      },
      {
        id: 2,
        message: "Chào bạn! Tôi có thể giúp bạn tư vấn về vấn đề này. Bạn có thể mô tả chi tiết tình huống của mình không?",
        isUser: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        senderId: 'me',
      },
      {
        id: 3,
        message: "Công ty tôi muốn chấm dứt hợp đồng lao động với tôi mà không có lý do chính đáng. Họ nói là do cắt giảm nhân sự nhưng tôi thấy họ vẫn tuyển người mới cho vị trí tương tự.",
        isUser: false,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        senderId: userId,
      },
      {
        id: 4,
        message: "Theo Bộ luật Lao động 2019, công ty không được chấm dứt hợp đồng lao động tùy tiện. Nếu họ nói do cắt giảm nhân sự nhưng vẫn tuyển người mới cho cùng vị trí, đây có thể là vi phạm pháp luật.\n\nBạn đã làm việc ở công ty bao lâu rồi? Và hợp đồng của bạn thuộc loại nào?",
        isUser: true,
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        senderId: 'me',
      },
    ];
    
    setMessages(mockMessages);
  }, [userId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async (message) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      message: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      senderId: 'me',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    scrollToBottom();

    // Simulate response (in real app, this would be WebSocket or API call)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        message: generateResponse(message),
        isUser: false,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        senderId: userId,
      };

      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
      scrollToBottom();
    }, 1000);
  };

  const generateResponse = (message) => {
    const responses = [
      "Cảm ơn bạn đã chia sẻ thông tin. Tôi sẽ xem xét và tư vấn cho bạn.",
      "Đây là một vấn đề khá phức tạp. Bạn có thể cung cấp thêm chi tiết không?",
      "Theo hiểu biết của tôi, trong trường hợp này bạn có thể làm như sau...",
      "Tôi khuyên bạn nên lưu giữ tất cả bằng chứng liên quan đến vấn đề này.",
      "Bạn có thể liên hệ với Sở Lao động địa phương để được hỗ trợ thêm.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleProfilePress = () => {
    navigation.navigate('UserProfile', {
      userId: userId,
      userName: userName,
      userAvatar: userAvatar,
    });
  };

  const handleMoreOptions = () => {
    // Handle more options like block, report, etc.
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg.message}
              isUser={msg.isUser}
              timestamp={msg.timestamp}
            />
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <Text style={styles.loadingText}>Đang nhập...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Chat Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          placeholder="Nhập tin nhắn..."
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
    paddingVertical: 16,
  },
  loadingContainer: {
    paddingHorizontal: 16,
    marginVertical: 4,
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
    fontSize: 15,
    color: COLORS.GRAY,
    fontStyle: 'italic',
  },
});

export default ChatScreen;
