import axios from 'axios';
import { PYTHON_API_URL } from '@env';

// Clean và xử lý URL từ environment variable
const cleanPythonApiUrl = PYTHON_API_URL 
  ? PYTHON_API_URL.replace(/['"\s]+/g, '').trim().replace(/\/+$/, '') 
  : 'http://localhost:8000';

// Tạo axios instance riêng cho Python API
const pythonApiClient = axios.create({
  baseURL: cleanPythonApiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000, // 60 giây vì AI có thể xử lý lâu
});

// Debug logging
if (__DEV__) {
  console.log('🔧 Python ML Service Configuration:');
  console.log('  - PYTHON_API_URL from env:', PYTHON_API_URL);
  console.log('  - Clean Python API URL:', cleanPythonApiUrl);
}

/**
 * Gửi câu hỏi đến AI và nhận câu trả lời
 * @param {string} question - Câu hỏi của người dùng
 * @param {number} topK - Số lượng documents để retrieve (mặc định: 5)
 * @param {string} conversationId - ID của conversation (optional)
 * @param {Array} chatHistory - Lịch sử chat trước đó (optional)
 * @returns {Promise<Object>} Response từ AI
 */
export const askQuestion = async (question, topK = 5, conversationId = null, chatHistory = []) => {
  try {
    console.log('🤖 Sending question to AI:', question.substring(0, 50) + '...');
    
    const requestBody = {
      question: question,
      top_k: topK,
      conversation_id: conversationId ? String(conversationId) : undefined,
      chat_history: chatHistory.length > 0 ? chatHistory.map(msg => ({
        role: msg.role || (msg.isUser ? 'user' : 'assistant'),
        content: msg.content || msg.message
      })) : undefined,
    };

    const response = await pythonApiClient.post('/rag/ask', requestBody);

    if (response.status >= 200 && response.status < 300) {
      console.log('✅ AI response received');
      return {
        success: true,
        answer: response.data.answer,
        sources: response.data.sources || [],
        processingTime: response.data.processing_time,
        modelUsed: response.data.model_used,
      };
    } else {
      throw new Error(`API returned status ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error asking question to AI:', error);
    
    if (error.response) {
      // Server trả về lỗi
      const errorMessage = error.response.data?.detail || 
                          error.response.data?.error || 
                          'Lỗi khi xử lý câu hỏi';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Không nhận được response
      throw new Error('Không thể kết nối đến server AI. Vui lòng kiểm tra kết nối mạng và URL API.');
    } else {
      // Lỗi khác
      throw new Error(error.message || 'Đã có lỗi xảy ra');
    }
  }
};

/**
 * Kiểm tra trạng thái của RAG service
 */
export const checkRAGStatus = async () => {
  try {
    const response = await pythonApiClient.get('/rag/status');
    return response.data;
  } catch (error) {
    console.error('Error checking RAG status:', error);
    throw error;
  }
};

/**
 * Lấy danh sách documents mẫu để biết có thể hỏi về gì
 */
export const getSampleDocuments = async (limit = 20) => {
  try {
    const response = await pythonApiClient.get(`/rag/documents?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error getting sample documents:', error);
    throw error;
  }
};