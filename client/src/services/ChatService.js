import apiClient from "./ApiClient";

/**
 * Tạo conversation mới cho AI chat
 * @param {string} title - Tiêu đề conversation (optional)
 * @returns {Promise<Object>} Conversation đã tạo
 */
export const createConversation = async (title = null) => {
  try {
    const response = await apiClient.post('/conversations', {
      type: 'QA',
      title: title || 'Cuộc trò chuyện mới'
    });
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error('Failed to create conversation');
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Lấy tất cả conversations của user (AI chat)
 * @returns {Promise<Array>} Danh sách conversations
 */
export const getUserConversations = async () => {
  try {
    const response = await apiClient.get('/conversations?type=QA');
    if (response.status >= 200 && response.status < 300) {
      return response.data || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

/**
 * Lấy conversation theo ID
 * @param {number} conversationId - ID của conversation
 * @returns {Promise<Object>} Chi tiết conversation
 */
export const getConversationById = async (conversationId) => {
  try {
    const response = await apiClient.get(`/conversations/${conversationId}`);
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

/**
 * Lấy tất cả tin nhắn trong conversation
 * @param {number} conversationId - ID của conversation
 * @returns {Promise<Array>} Danh sách tin nhắn
 */
export const getConversationMessages = async (conversationId) => {
  try {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`);
    if (response.status >= 200 && response.status < 300) {
      return response.data || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return [];
  }
};

/**
 * Gửi tin nhắn trong conversation
 * @param {number} conversationId - ID của conversation
 * @param {string} content - Nội dung tin nhắn
 * @param {string} role - Role của message: 'USER' hoặc 'ASSISTANT'
 * @returns {Promise<Object>} Tin nhắn đã gửi
 */
export const sendMessage = async (conversationId, content, role = 'USER') => {
  try {
    console.log('📤 Sending message:', {
      conversationId,
      conversationIdType: typeof conversationId,
      contentLength: content.length,
      role
    });

    const response = await apiClient.post('/conversations/messages', {
      conversationId: Number(conversationId),
      content,
      role
    });
    
    if (response.status >= 200 && response.status < 300) {
      console.log('✅ Message sent successfully');
      return response.data;
    } else {
      const errorMsg = response.data?.message || response.data?.error || `HTTP ${response.status}`;
      console.error('❌ API returned non-success status:', response.status, response.data);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
    
    // Log chi tiết error response
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      
      // Trích xuất message từ error response
      const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          error.response.data?.detail ||
                          `HTTP ${error.response.status}: ${error.response.statusText}`;
      
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    } else {
      throw error;
    }
  }
};

/**
 * Xóa conversation
 * @param {number} conversationId - ID của conversation
 * @returns {Promise<boolean>} True nếu thành công
 */
export const deleteConversation = async (conversationId) => {
  try {
    const response = await apiClient.delete(`/conversations/${conversationId}`);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};

/**
 * Cập nhật tiêu đề conversation
 * @param {number} conversationId - ID của conversation
 * @param {string} title - Tiêu đề mới
 * @returns {Promise<Object>} Conversation đã cập nhật
 */
export const updateConversationTitle = async (conversationId, title) => {
  try {
    const response = await apiClient.put(`/conversations/${conversationId}/title`, {
      title
    });
    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      throw new Error('Failed to update title');
    }
  } catch (error) {
    console.error('Error updating conversation title:', error);
    throw error;
  }
};


