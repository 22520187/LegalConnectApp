import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';

const API_BASE_URL = (API_URL ? API_URL.replace(/['"\s]+/g, '') : 'http://localhost:8080') + '/api';

class AuthService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Helper method để tạo request headers
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      // Có thể thêm authorization header nếu cần
    }

    return headers;
  }

  // Helper method để handle response
  async handleResponse(response) {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  }

  // Đăng ký người dùng mới
  async signup(userData) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber || null,
        }),
        credentials: 'include', // Để nhận cookies từ server
      });

      const result = await this.handleResponse(response);
      
      // Lưu thông tin user vào AsyncStorage
      if (result.success && result.data) {
        await AsyncStorage.setItem('user', JSON.stringify(result.data));
        await AsyncStorage.setItem('isAuthenticated', 'true');
      }
      
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Đăng nhập
  async signin(credentials) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        credentials: 'include', // Để nhận cookies từ server
      });

      const result = await this.handleResponse(response);
      
      // Lưu thông tin user vào AsyncStorage
      if (result.success && result.data) {
        await AsyncStorage.setItem('user', JSON.stringify(result.data));
        await AsyncStorage.setItem('isAuthenticated', 'true');
      }
      
      return result;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  // Đăng xuất
  async logout() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      // Xóa thông tin local storage
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn xóa local storage ngay cả khi API call thất bại
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
      throw error;
    }
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      const result = await this.handleResponse(response);
      
      // Cập nhật thông tin user trong AsyncStorage
      if (result.success && result.data) {
        await AsyncStorage.setItem('user', JSON.stringify(result.data));
      }
      
      return result;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Kiểm tra trạng thái authentication
  async checkAuthStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/status`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error('Check auth status error:', error);
      throw error;
    }
  }

  // Lấy thông tin user từ AsyncStorage
  async getStoredUser() {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      
      return {
        user: userStr ? JSON.parse(userStr) : null,
        isAuthenticated: isAuthenticated === 'true',
      };
    } catch (error) {
      console.error('Get stored user error:', error);
      return { user: null, isAuthenticated: false };
    }
  }

  // Xóa thông tin stored
  async clearStoredAuth() {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('isAuthenticated');
    } catch (error) {
      console.error('Clear stored auth error:', error);
    }
  }
}

export default new AuthService();