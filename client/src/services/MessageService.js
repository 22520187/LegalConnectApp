import apiClient from "./ApiClient";

/**
 * Lấy tất cả conversations của user hiện tại
 * @returns {Promise<Array>} Danh sách conversations
 */
export const getUserConversations = async () => {
    try {
        const response = await apiClient.get('/user-conversations');
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user conversations:', error);
        throw error;
    }
}

/**
 * Lấy conversation theo ID
 * @param {number} conversationId - ID của conversation
 * @returns {Promise<Object>} Chi tiết conversation
 */
export const getConversationById = async (conversationId) => {
    try {
        const response = await apiClient.get(`/user-conversations/${conversationId}`);
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
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
        const response = await apiClient.get(`/user-conversations/${conversationId}/messages`);
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            return [];
        }
    } catch (error) {
        console.error('Error fetching conversation messages:', error);
        throw error;
    }
};

/**
 * Tạo conversation mới với user khác
 * @param {number} otherUserId - ID của user muốn chat
 * @param {string} initialMessage - Tin nhắn đầu tiên (optional)
 * @returns {Promise<Object>} Conversation đã tạo
 */
export const createConversation = async (otherUserId, initialMessage = null) => {
    try {
        const response = await apiClient.post('/user-conversations', {
            otherUserId,
            initialMessage
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            throw new Error('Failed to create conversation');
        }
    } catch (error) {
        console.error('Error creating conversation:', error);
        throw error;
    }
};

/**
* Lấy hoặc tạo conversation với user khác
* (Nếu đã có conversation thì trả về, chưa có thì tạo mới)
* @param {number} otherUserId - ID của user muốn chat
* @returns {Promise<Object>} Conversation
*/
export const getOrCreateConversation = async (otherUserId) => {
    try {
        const response = await apiClient.post('/user-conversations/get-or-create', null, {
            params: { otherUserId }
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            throw new Error('Failed to get or create conversation');
        }
    } catch (error) {
        console.error('Error getting or creating conversation:', error);
        throw error;
    }
};

/**
* Gửi tin nhắn trong conversation
* @param {number} conversationId - ID của conversation
* @param {string} content - Nội dung tin nhắn
* @returns {Promise<Object>} Tin nhắn đã gửi
*/
export const sendMessage = async (conversationId, content) => {
    try {
        const response = await apiClient.post('/user-conversations/messages', {
            conversationId,
            content
        });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            console.error('API returned non-success status:', response.status);
            throw new Error('Failed to send message');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

/**
* Đánh dấu conversation đã đọc
* @param {number} conversationId - ID của conversation
* @returns {Promise<boolean>} True nếu thành công
*/
export const markConversationAsRead = async (conversationId) => {
    try {
        const response = await apiClient.put(`/user-conversations/${conversationId}/read`);
        if (response.status >= 200 && response.status < 300) {
            return true;
        } else {
            console.error('API returned non-success status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error marking conversation as read:', error);
        throw error;
    }
};