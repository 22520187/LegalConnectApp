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
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import { ChatMessage, ChatInput, PDFPicker, ConversationList } from '../../components';
import { askQuestion } from '../../services/AIQAService';
import {
  createConversation,
  getUserConversations,
  getConversationMessages,
  getConversationById,
  sendMessage as sendMessageToBackend,
  deleteConversation,
  updateConversationTitle,
} from '../../services/ChatService';
import {
  uploadPdfToPython,
  getPdfSummary,
  askPdfQuestion,
  uploadPdfToBackend,
} from '../../services/PDFService';
import { useAuth } from '../../context/AuthContext';

const ChatBot = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('normal');
  const [messages, setMessages] = useState([]);
  const [pdfMessages, setPdfMessages] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfFileId, setPdfFileId] = useState(null); // Python file_id
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showConversationsModal, setShowConversationsModal] = useState(false);
  const [refreshingConversations, setRefreshingConversations] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renamingConversationId, setRenamingConversationId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const scrollViewRef = useRef(null);

  // Load conversations khi component mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Refresh conversations khi mở modal
  useEffect(() => {
    if (showConversationsModal && user) {
      loadConversations(false);
    }
  }, [showConversationsModal]);

  // Load messages khi conversation thay đổi
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId);
    } else {
      // Nếu không có conversation, hiển thị welcome message
      const welcomeMessage = {
        id: 1,
        message: "Xin chào! Tôi là chatbot hỗ trợ pháp lý. Tôi có thể giúp bạn giải đáp các thắc mắc về luật pháp. Hãy đặt câu hỏi của bạn!",
        isUser: false,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([welcomeMessage]);
      // Reset PDF state khi không có conversation
      setSelectedFile(null);
      setPdfFileId(null);
    }
  }, [currentConversationId]);

  // Khởi tạo tin nhắn chào mừng cho PDF tab
  useEffect(() => {
    const pdfWelcomeMessage = {
      id: 1,
      message: "Chào bạn! Ở đây bạn có thể tải lên file PDF và tôi sẽ giúp bạn giải đáp các câu hỏi dựa trên nội dung file đó. Hãy chọn file PDF trước nhé!",
      isUser: false,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setPdfMessages([pdfWelcomeMessage]);
  }, []);

  const loadConversations = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoadingConversations(true);
      } else {
        setRefreshingConversations(true);
      }
      const convs = await getUserConversations();
      setConversations(convs);
      
      // Nếu có conversations và chưa có conversation được chọn, chọn conversation đầu tiên
      if (convs.length > 0 && !currentConversationId) {
        setCurrentConversationId(convs[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách cuộc trò chuyện. Vui lòng thử lại.');
    } finally {
      setIsLoadingConversations(false);
      setRefreshingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      setIsLoadingMessages(true);
      
      // Load conversation details để lấy thông tin PDF
      let conversation = null;
      try {
        conversation = await getConversationById(conversationId);
        if (conversation) {
          // Cập nhật conversation trong state nếu cần
          setConversations(prev => {
            const existing = prev.find(c => c.id === conversationId);
            if (!existing || !existing.pythonFileId) {
              return prev.map(c => c.id === conversationId ? conversation : c);
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Error loading conversation details:', error);
        // Fallback: tìm trong state
        conversation = conversations.find(c => c.id === conversationId);
      }
      
      // Load messages
      const msgs = await getConversationMessages(conversationId);
      
      // Nếu là PDF_QA conversation, setup PDF state
      if (conversation && conversation.type === 'PDF_QA') {
        if (conversation.pythonFileId) {
          setPdfFileId(conversation.pythonFileId);
        }
        if (conversation.pdfDocument) {
          setSelectedFile({
            name: conversation.pdfDocument.originalFileName || 'document.pdf',
            conversationId: conversationId,
          });
        }
      }
      
      // Convert messages từ backend format sang UI format
      const formattedMessages = msgs.map(msg => ({
        id: msg.id,
        message: msg.content,
        isUser: msg.role === 'USER',
        timestamp: new Date(msg.createdAt).toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
      }));
      
      // Nếu là PDF_QA, set vào pdfMessages, ngược lại set vào messages
      if (conversation && conversation.type === 'PDF_QA') {
        setPdfMessages(formattedMessages);
      } else {
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const createNewConversation = async () => {
    try {
      const newConv = await createConversation();
      setCurrentConversationId(newConv.id);
      setConversations(prev => [newConv, ...prev]);
      setMessages([]);
      setShowConversationsModal(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại.');
    }
  };

  const handleSelectConversation = (conversation) => {
    setCurrentConversationId(conversation.id);
    setShowConversationsModal(false);
    
    // Nếu là PDF_QA conversation, chuyển sang PDF tab
    if (conversation.type === 'PDF_QA') {
      setActiveTab('pdf');
    } else {
      setActiveTab('normal');
    }
  };

  const handleEditConversationTitle = (conversation) => {
    setRenamingConversationId(conversation.id);
    setEditingTitle(conversation.title || '');
    setShowRenameModal(true);
  };

  const handleDeleteConversation = async (conversationId) => {
    Alert.alert(
      'Xóa cuộc trò chuyện',
      'Bạn có chắc chắn muốn xóa cuộc trò chuyện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteConversation(conversationId);
              // Nếu đang xem conversation bị xóa, chuyển sang conversation khác hoặc tạo mới
              if (currentConversationId === conversationId) {
                const remaining = conversations.filter(c => c.id !== conversationId);
                if (remaining.length > 0) {
                  setCurrentConversationId(remaining[0].id);
                } else {
                  setCurrentConversationId(null);
                  setMessages([]);
                }
              }
              // Cập nhật danh sách conversations
              setConversations(prev => prev.filter(c => c.id !== conversationId));
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Alert.alert('Lỗi', 'Không thể xóa cuộc trò chuyện. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async (message) => {
    if (activeTab !== 'normal') {
      // Logic cho PDF Q&A
      if (!selectedFile || !pdfFileId) {
        const botMessage = {
          id: Date.now() + 1,
          message: "Bạn cần chọn file PDF trước khi đặt câu hỏi. Vui lòng tải lên file PDF để tôi có thể hỗ trợ bạn tốt hơn.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setPdfMessages(prev => [...prev, botMessage]);
        scrollToBottom();
        return;
      }

      // Đảm bảo có conversation
      let convId = currentConversationId;
      if (!convId && selectedFile.conversationId) {
        convId = selectedFile.conversationId;
        setCurrentConversationId(convId);
      }

      // Thêm tin nhắn của user vào UI ngay
      const userMessage = {
        id: Date.now(),
        message: message,
        isUser: true,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setPdfMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      scrollToBottom();

      try {
        // Lưu user message vào backend nếu có conversation
        if (convId) {
          await sendMessageToBackend(convId, message, 'USER');
        }

        // Gọi PDF Q&A API
        const response = await askPdfQuestion(pdfFileId, message);

        if (response.success) {
          // Lưu AI response vào backend nếu có conversation
          if (convId) {
            await sendMessageToBackend(convId, response.answer, 'ASSISTANT');
          }

          // Thêm AI message vào UI
          const botMessage = {
            id: Date.now() + 1,
            message: response.answer,
            isUser: false,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            sources: response.sources,
          };
          setPdfMessages(prev => [...prev, botMessage]);
        } else {
          throw new Error('Không nhận được phản hồi từ AI');
        }
      } catch (error) {
        console.error('Error asking PDF question:', error);
        
        // Kiểm tra nếu lỗi liên quan đến API key
        const errorMsg = error.message || '';
        const isApiKeyLimitError = errorMsg.includes('API key limit') || 
                                   errorMsg.includes('limit exceeded') ||
                                   errorMsg.includes('quota') ||
                                   errorMsg.includes('Unauthorized');
        
        if (isApiKeyLimitError) {
          Alert.alert(
            'Đã hết lượt sử dụng',
            'Bạn đã sử dụng hết số lượt API miễn phí.\n\nVui lòng:\n• Nâng cấp gói để có thêm lượt\n• Hoặc chờ reset lượt (thường là hàng tháng)\n\nLiên hệ admin để biết thêm chi tiết.',
            [{ text: 'Đóng', style: 'cancel' }]
          );
        }
        
        const errorMessage = {
          id: Date.now() + 1,
          message: isApiKeyLimitError
            ? '❌ Đã hết lượt sử dụng API. Vui lòng nâng cấp gói hoặc chờ reset lượt.'
            : errorMsg || 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setPdfMessages(prev => [...prev, errorMessage]);
        
        if (!isApiKeyLimitError && (errorMsg.includes('kết nối') || errorMsg.includes('failed') || errorMsg.includes('network'))) {
          Alert.alert(
            'Lỗi kết nối',
            'Không thể kết nối đến server AI. Vui lòng kiểm tra:\n- Kết nối mạng\n- Server AI đang chạy\n- URL API đúng'
          );
        }
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
      return;
    }

    // Đảm bảo có conversation
    let convId = currentConversationId;
    if (!convId) {
      try {
        const newConv = await createConversation();
        convId = newConv.id;
        setCurrentConversationId(convId);
        setConversations(prev => [newConv, ...prev]);
        // Xóa welcome message khi tạo conversation mới
        setMessages([]);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện mới. Vui lòng thử lại.');
        return;
      }
    }

    // Thêm tin nhắn của user vào UI ngay
    const userMessage = {
      id: Date.now(),
      message: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    scrollToBottom();

    try {
      // Lưu user message vào backend
      await sendMessageToBackend(convId, message, 'USER');

      // Lấy lịch sử chat (6 tin nhắn gần nhất, loại bỏ welcome message)
      const recentHistory = messages
        .filter(msg => msg.id !== 1) // Loại bỏ welcome message
        .slice(-6)
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.message
        }));

      // Gọi AI API
      const response = await askQuestion(message, 5, convId, recentHistory);

      if (response.success) {
        // Lưu AI response vào backend
        await sendMessageToBackend(convId, response.answer, 'ASSISTANT');

        // Thêm AI message vào UI
        const botMessage = {
          id: Date.now() + 1,
          message: response.answer,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          sources: response.sources,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Không nhận được phản hồi từ AI');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        message: error.message || 'Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
      
      if (error.message.includes('kết nối')) {
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến server AI. Vui lòng kiểm tra:\n- Kết nối mạng\n- Server AI đang chạy\n- URL API đúng'
        );
      }
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleFileSelected = async (file) => {
    if (!file) {
      setSelectedFile(null);
      setPdfFileId(null);
      return;
    }

    setIsUploadingPdf(true);
    // Thêm loading message (định nghĩa trước try để có thể dùng trong catch)
    const loadingMessageId = Date.now();
    const loadingMessage = {
      id: loadingMessageId,
      message: `📤 Đang tải lên file: ${file.name}...`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setPdfMessages(prev => [...prev, loadingMessage]);
    scrollToBottom();
    
    try {

      // Bước 1: Upload PDF lên Python API
      console.log('Step 1: Uploading to Python API...');
      const pythonResult = await uploadPdfToPython(file);
      const fileId = pythonResult.file_id;
      
      if (!fileId) {
        throw new Error('Không nhận được file_id từ Python API');
      }

      // Bước 2: Lấy summary của PDF
      console.log('Step 2: Getting PDF summary...');
      const summaryResult = await getPdfSummary(fileId, 200);
      const summary = summaryResult.summary || '';

      // Bước 3: Upload PDF lên backend và tạo conversation
      console.log('Step 3: Creating conversation in backend...');
      const title = file.name.replace('.pdf', '') || 'Cuộc trò chuyện PDF';
      const backendResult = await uploadPdfToBackend(file, title, summary, fileId);

      if (backendResult.success && backendResult.conversation) {
        const newConv = backendResult.conversation;
        setCurrentConversationId(newConv.id);
        setSelectedFile({ ...file, conversationId: newConv.id });
        setPdfFileId(fileId);
        setConversations(prev => [newConv, ...prev]);

        // Xóa loading message và thêm success message
        setPdfMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== loadingMessageId);
          return [...filtered, {
            id: Date.now() + 1,
            message: `✅ Đã tải lên file thành công: ${file.name}\n\n${summary ? `Tóm tắt: ${summary}\n\n` : ''}Bây giờ bạn có thể đặt câu hỏi dựa trên nội dung file này.`,
            isUser: false,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          }];
        });
      } else {
        throw new Error(backendResult.message || 'Không thể tạo conversation');
      }
    } catch (error) {
      console.error('Error uploading PDF:', error);
      
      // Kiểm tra nếu lỗi liên quan đến API key limit
      const errorMsg = error.message || 'Vui lòng thử lại sau.';
      const isApiKeyLimitError = errorMsg.includes('API key limit') || 
                                 errorMsg.includes('limit exceeded') ||
                                 errorMsg.includes('quota');
      
      // Xóa loading message và thêm error message
      setPdfMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== loadingMessageId);
        return [...filtered, {
          id: Date.now() + 1,
          message: isApiKeyLimitError 
            ? `❌ Đã hết lượt sử dụng API.\n\nBạn đã sử dụng hết số lượt miễn phí. Vui lòng:\n• Nâng cấp gói để có thêm lượt\n• Hoặc chờ reset lượt (thường là hàng tháng)\n\nLiên hệ admin để biết thêm chi tiết.`
            : `❌ Lỗi khi tải lên file: ${errorMsg}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }];
      });
      
      // Hiển thị Alert với thông tin chi tiết hơn
      if (isApiKeyLimitError) {
        Alert.alert(
          'Đã hết lượt sử dụng',
          'Bạn đã sử dụng hết số lượt API miễn phí.\n\nVui lòng:\n• Nâng cấp gói để có thêm lượt\n• Hoặc chờ reset lượt (thường là hàng tháng)\n\nLiên hệ admin để biết thêm chi tiết.',
          [{ text: 'Đóng', style: 'cancel' }]
        );
      } else {
        Alert.alert('Lỗi', `Không thể tải lên file PDF: ${errorMsg}`);
      }
      
      setSelectedFile(null);
      setPdfFileId(null);
    } finally {
      setIsUploadingPdf(false);
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
      {/* Header với nút tạo conversation mới */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerContent}
          onPress={() => setShowConversationsModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.title} numberOfLines={1}>
            {currentConversationId 
              ? conversations.find(c => c.id === currentConversationId)?.title || 'ChatBot Pháp lý'
              : 'ChatBot Pháp lý'}
          </Text>
          <Text style={styles.subtitle}>
            {conversations.length > 0 
              ? `${conversations.length} cuộc trò chuyện` 
              : 'Hỗ trợ tư vấn 24/7'}
          </Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowConversationsModal(true)}
          >
            <Ionicons name="list-outline" size={24} color={COLORS.BLUE} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={createNewConversation}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.BLUE} />
          </TouchableOpacity>
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
        {activeTab === 'pdf' && (
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
          {isLoadingMessages ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.BLUE} />
            </View>
          ) : (
            <>
              {getCurrentMessages().map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg.message}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                />
              ))}
              
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <View style={styles.loadingBubble}>
                    <Text style={styles.loadingText}>Đang nhập...</Text>
                  </View>
                </View>
              )}
            </>
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
          disabled={(activeTab === 'pdf' && (!selectedFile || isUploadingPdf)) || isLoading}
        />
      </KeyboardAvoidingView>

      {/* Conversations Modal */}
      <Modal
        visible={showConversationsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowConversationsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cuộc trò chuyện</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowConversationsModal(false)}
            >
              <Ionicons name="close" size={28} color={COLORS.BLACK} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <ConversationList
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteConversation}
                onEditConversation={handleEditConversationTitle}
              isLoading={isLoadingConversations}
              onRefresh={() => loadConversations(false)}
              refreshing={refreshingConversations}
            />
          </View>
          <TouchableOpacity
            style={styles.newConversationButton}
            onPress={createNewConversation}
          >
            <Ionicons name="add-circle" size={24} color={COLORS.WHITE} />
            <Text style={styles.newConversationButtonText}>Tạo cuộc trò chuyện mới</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Rename Conversation Modal */}
      <Modal
        visible={showRenameModal}
        animationType="fade"
        transparent
        onRequestClose={() => !isRenaming && setShowRenameModal(false)}
      >
        <View style={styles.renameOverlay}>
          <View style={styles.renameContainer}>
            <Text style={styles.renameTitle}>Đổi tên cuộc trò chuyện</Text>
            <Text style={styles.renameLabel}>Tiêu đề</Text>
            <View style={styles.renameInputWrapper}>
              <TextInput
                style={styles.renameInput}
                placeholder="Nhập tiêu đề mới"
                value={editingTitle}
                onChangeText={setEditingTitle}
                editable={!isRenaming}
              />
            </View>
            <View style={styles.renameActions}>
              <TouchableOpacity
                style={[styles.renameButton, styles.renameCancelButton]}
                onPress={() => !isRenaming && setShowRenameModal(false)}
                disabled={isRenaming}
              >
                <Text style={styles.renameCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.renameButton, styles.renameSaveButton]}
                onPress={async () => {
                  if (!editingTitle.trim()) {
                    Alert.alert('Lỗi', 'Tiêu đề không được để trống.');
                    return;
                  }
                  try {
                    setIsRenaming(true);
                    const updated = await updateConversationTitle(
                      renamingConversationId,
                      editingTitle.trim()
                    );
                    // Cập nhật danh sách conversations trong state
                    setConversations(prev =>
                      prev.map(c =>
                        c.id === renamingConversationId ? { ...c, title: updated.title } : c
                      )
                    );
                    setShowRenameModal(false);
                  } catch (error) {
                    console.error('Error updating title:', error);
                    Alert.alert('Lỗi', 'Không thể cập nhật tiêu đề. Vui lòng thử lại.');
                  } finally {
                    setIsRenaming(false);
                  }
                }}
                disabled={isRenaming}
              >
                <Text style={styles.renameSaveText}>
                  {isRenaming ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
    marginLeft: 8,
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
  newChatButton: {
    padding: 4,
    marginLeft: 8,
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
    fontSize: 15,
    color: COLORS.GRAY,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BLUE,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  newConversationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.WHITE,
    marginLeft: 8,
  },
  renameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  renameContainer: {
    width: '100%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  renameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.BLACK,
    marginBottom: 12,
    textAlign: 'center',
  },
  renameLabel: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 6,
  },
  renameInputWrapper: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.BG,
  },
  renameInput: {
    fontSize: 15,
    color: COLORS.BLACK,
    paddingVertical: 6,
  },
  renameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  renameButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginLeft: 8,
  },
  renameCancelButton: {
    backgroundColor: COLORS.GRAY_BG,
  },
  renameSaveButton: {
    backgroundColor: COLORS.BLUE,
  },
  renameCancelText: {
    fontSize: 14,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  renameSaveText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: '600',
  },
});

export default ChatBot;
