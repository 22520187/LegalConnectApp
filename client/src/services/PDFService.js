import apiClient from './ApiClient';
import { PYTHON_API_URL } from '@env';

// Clean và xử lý URL từ environment variable
const cleanPythonApiUrl = PYTHON_API_URL 
  ? PYTHON_API_URL.replace(/['"\s]+/g, '').trim().replace(/\/+$/, '') 
  : 'http://localhost:8000';

/**
 * Upload PDF file lên Python API để xử lý
 * @param {File|Object} file - File PDF (từ expo-document-picker)
 * @returns {Promise<Object>} Response với file_id
 */
export const uploadPdfToPython = async (file) => {
  try {
    console.log('📤 Uploading PDF to Python API:', file.name);
    
    // Tạo FormData
    const formData = new FormData();
    
    // Expo DocumentPicker trả về file object với uri
    // Cần convert sang format mà fetch có thể xử lý
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'document.pdf',
      type: 'application/pdf',
    });

    const response = await fetch(`${cleanPythonApiUrl}/pdf/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ PDF uploaded to Python API:', result);
    return result.data;
  } catch (error) {
    console.error('❌ Error uploading PDF to Python API:', error);
    throw error;
  }
};

/**
 * Lấy summary của PDF từ Python API
 * @param {string} fileId - ID của file PDF
 * @param {number} maxLength - Độ dài tối đa của summary (mặc định: 200)
 * @returns {Promise<Object>} Summary của PDF
 */
export const getPdfSummary = async (fileId, maxLength = 200) => {
  try {
    const formData = new FormData();
    formData.append('file_id', fileId);
    formData.append('max_length', String(maxLength));

    const response = await fetch(`${cleanPythonApiUrl}/pdf/summarize-id`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Summary failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error getting PDF summary:', error);
    throw error;
  }
};

/**
 * Hỏi đáp dựa trên PDF
 * @param {string} pdfId - ID của PDF (file_id từ Python API)
 * @param {string} question - Câu hỏi
 * @returns {Promise<Object>} Câu trả lời từ AI
 */
export const askPdfQuestion = async (pdfId, question) => {
  try {
    console.log('🤖 Asking PDF question:', question.substring(0, 50) + '...');
    
    const response = await fetch(`${cleanPythonApiUrl}/pdf/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdf_id: pdfId,
        question: question,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDF Q&A failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ PDF Q&A response received');
    return {
      success: true,
      answer: result.data.answer,
      sources: result.data.sources || [],
    };
  } catch (error) {
    console.error('❌ Error asking PDF question:', error);
    throw error;
  }
};

/**
 * Upload PDF lên backend và tạo conversation
 * @param {File|Object} file - File PDF
 * @param {string} title - Tiêu đề conversation
 * @param {string} summary - Summary của PDF (optional)
 * @param {string} pythonFileId - File ID từ Python API (optional)
 * @returns {Promise<Object>} Response với conversation
 */
export const uploadPdfToBackend = async (file, title, summary = null, pythonFileId = null) => {
  try {
    console.log('📤 Uploading PDF to backend:', title);
    
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'document.pdf',
      type: 'application/pdf',
    });
    formData.append('title', title);
    if (summary) {
      formData.append('summary', summary);
    }
    if (pythonFileId) {
      formData.append('pythonFileId', pythonFileId);
    }

    const response = await apiClient.post('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.status >= 200 && response.status < 300) {
      console.log('✅ PDF uploaded to backend successfully:', response.data);
      return response.data;
    } else {
      const errorMsg = response.data?.message || response.data?.error || `HTTP ${response.status}`;
      console.error('❌ Backend returned non-success status:', response.status, response.data);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('❌ Error uploading PDF to backend:', error);
    
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

