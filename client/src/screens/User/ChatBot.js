import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import { ChatMessage, ChatInput, PDFPicker } from '../../components';

const ChatBot = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('normal'); // 'normal' hoặc 'pdf'
  const [messages, setMessages] = useState([]);
  const [pdfMessages, setPdfMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // Khởi tạo tin nhắn chào mừng
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      message: "Xin chào! Tôi là chatbot hỗ trợ pháp lý. Tôi có thể giúp bạn giải đáp các thắc mắc về luật pháp. Hãy đặt câu hỏi của bạn!",
      isUser: false,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    const pdfWelcomeMessage = {
      id: 1,
      message: "Chào bạn! Ở đây bạn có thể tải lên file PDF và tôi sẽ giúp bạn giải đáp các câu hỏi dựa trên nội dung file đó. Hãy chọn file PDF trước nhé!",
      isUser: false,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([welcomeMessage]);
    setPdfMessages([pdfWelcomeMessage]);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async (message) => {
    const currentMessages = activeTab === 'normal' ? messages : pdfMessages;
    const setCurrentMessages = activeTab === 'normal' ? setMessages : setPdfMessages;

    // Thêm tin nhắn của user
    const userMessage = {
      id: Date.now(),
      message: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setCurrentMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    scrollToBottom();

    // Giả lập phản hồi từ bot (trong thực tế sẽ gọi API)
    setTimeout(() => {
      let botResponse = "";
      
      if (activeTab === 'normal') {
        // Logic cho tab hỏi đáp bình thường
        botResponse = generateNormalResponse(message);
      } else {
        // Logic cho tab hỏi đáp dựa trên PDF
        if (!selectedFile) {
          botResponse = "Bạn cần chọn file PDF trước khi đặt câu hỏi. Vui lòng tải lên file PDF để tôi có thể hỗ trợ bạn tốt hơn.";
        } else {
          botResponse = generatePDFResponse(message, selectedFile.name);
        }
      }

      const botMessage = {
        id: Date.now() + 1,
        message: botResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
      scrollToBottom();
    }, 1500);
  };

  const generateNormalResponse = (question) => {
    // Giả lập phản hồi dựa trên từ khóa
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('hợp đồng')) {
      return "Về hợp đồng: Hợp đồng là thỏa thuận giữa các bên về việc xác lập, thay đổi hoặc chấm dứt quyền và nghĩa vụ dân sự. Để hợp đồng có hiệu lực, cần đảm bảo các điều kiện: các bên có năng lực hành vi dân sự, nội dung không vi phạm pháp luật, mục đích không trái đạo đức xã hội.";
    } else if (lowerQuestion.includes('thuê nhà') || lowerQuestion.includes('cho thuê')) {
      return "Về thuê nhà: Hợp đồng thuê nhà cần có các nội dung chính như địa chỉ nhà, thời hạn thuê, giá thuê, quyền và nghĩa vụ của các bên. Bên cho thuê có nghĩa vụ giao nhà đúng thỏa thuận, bảo đảm sử dụng ổn định. Bên thuê có nghĩa vụ trả tiền đúng hạn, sử dụng đúng mục đích.";
    } else if (lowerQuestion.includes('lao động') || lowerQuestion.includes('việc làm')) {
      return "Về lao động: Hợp đồng lao động là thỏa thuận giữa người lao động và người sử dụng lao động về công việc có trả lương. Các quyền cơ bản của người lao động bao gồm: được trả lương đầy đủ, được nghỉ phép, được bảo hiểm xã hội, được bảo hộ lao động.";
    } else if (lowerQuestion.includes('ly hôn') || lowerQuestion.includes('hôn nhân')) {
      return "Về ly hôn: Ly hôn là việc chấm dứt hôn nhân theo quyết định của Tòa án. Có thể ly hôn theo thỏa thuận hoặc đơn phương. Cần chuẩn bị đơn khởi kiện, giấy tờ liên quan đến tài sản, con cái. Tòa án sẽ tiến hành hòa giải trước khi ra quyết định.";
    } else {
      return "Cảm ơn bạn đã đặt câu hỏi. Đây là một vấn đề pháp lý phức tạp cần được xem xét cụ thể. Tôi khuyên bạn nên tham khảo thêm ý kiến của luật sư chuyên nghiệp để có lời khuyên chính xác nhất. Bạn có thể chia sẻ thêm chi tiết để tôi hỗ trợ tốt hơn không?";
    }
  };

  const generatePDFResponse = (question, fileName) => {
    return `Dựa trên nội dung file "${fileName}" mà bạn đã tải lên, tôi hiểu câu hỏi của bạn về: "${question}". Đây là phân tích dựa trên tài liệu:\n\n[Trong thực tế, đây sẽ là phản hồi được xử lý từ nội dung PDF thực tế thông qua AI]\n\nNếu bạn cần làm rõ thêm điều gì trong tài liệu, hãy hỏi tôi nhé!`;
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    if (file) {
      const fileMessage = {
        id: Date.now(),
        message: `✅ Đã tải lên file: ${file.name}\nBây giờ bạn có thể đặt câu hỏi dựa trên nội dung file này.`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setPdfMessages(prev => [...prev, fileMessage]);
      scrollToBottom();
    }
  };

  const getCurrentMessages = () => {
    return activeTab === 'normal' ? messages : pdfMessages;
  };

  const renderTabButton = (tabKey, title, icon) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tabKey && styles.activeTab]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tabKey ? COLORS.WHITE : COLORS.GRAY_DARK}
      />
      <Text style={[styles.tabText, activeTab === tabKey && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>ChatBot Pháp lý</Text>
          <Text style={styles.subtitle}>Hỗ trợ tư vấn 24/7</Text>
        </View>
        <View style={styles.headerRight}>
          <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.BLUE} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('normal', 'Hỏi đáp thường', 'chatbubbles-outline')}
        {renderTabButton('pdf', 'Hỏi đáp PDF', 'document-text-outline')}
      </View>

      {/* Chat Content */}
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* PDF Picker (chỉ hiện ở tab PDF) */}
        {activeTab === 'pdf' && !selectedFile && (
          <PDFPicker
            onFileSelected={handleFileSelected}
            selectedFile={selectedFile}
          />
        )}

        {/* PDF File Info (hiện khi đã chọn file ở tab PDF) */}
        {activeTab === 'pdf' && selectedFile && (
          <PDFPicker
            onFileSelected={handleFileSelected}
            selectedFile={selectedFile}
          />
        )}

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {getCurrentMessages().map((msg) => (
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
          placeholder={
            activeTab === 'pdf' && !selectedFile
              ? "Hãy chọn file PDF trước..."
              : "Nhập câu hỏi của bạn..."
          }
          disabled={activeTab === 'pdf' && !selectedFile}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  headerRight: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.GRAY_BG,
  },
  activeTab: {
    backgroundColor: COLORS.BLUE,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.GRAY_DARK,
    marginLeft: 8,
  },
  activeTabText: {
    color: COLORS.WHITE,
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

export default ChatBot;