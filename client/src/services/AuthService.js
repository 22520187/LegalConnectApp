import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './ApiClient';

class AuthService {
  // Helper method để handle response từ apiClient
  handleResponse(response) {
    // apiClient đã handle validation status và parse JSON
    // Chỉ cần format lại response cho AuthContext
    const data = response.data;
    
    // Kiểm tra nếu response có status 2xx
    if (response.status >= 200 && response.status < 300) {
      // Backend trả về format: { success, data, message }
      return data;
    } else {
      // Error case (shouldn't happen vì apiClient.interceptor đã reject)
      const errorMessage = data?.message || data?.error || 'Something went wrong';
      throw new Error(errorMessage);
    }
  }

  // Đăng ký người dùng mới
  async signup(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phoneNumber: userData.phoneNumber || null,
      });

      const result = this.handleResponse(response);
      
      // Lưu token nếu có
      if (result.success && result.data?.token) {
        await AsyncStorage.setItem('userToken', result.data.token);
      }
      
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
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const result = this.handleResponse(response);
      
      // Lưu token nếu có
      if (result.success && result.data?.token) {
        await AsyncStorage.setItem('userToken', result.data.token);
      }
      
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
    // Luôn xóa local storage trước, sau đó mới gọi API
    // Điều này đảm bảo logout luôn thành công ngay cả khi API fail
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('isAuthenticated');
    
    try {
      // Thử gọi API logout (có thể fail nếu session đã hết hạn, nhưng không sao)
      const response = await apiClient.post('/auth/logout');
      return this.handleResponse(response);
    } catch (error) {
      // Log error nhưng không throw - logout local đã thành công
      // API có thể fail nếu session đã hết hạn, nhưng điều đó không quan trọng
      console.log('Logout API call failed (session may have expired):', error.message);
      // Trả về success vì logout local đã thành công
      return {
        success: true,
        message: 'Logout successful'
      };
    }
  }

  // Lấy thông tin user hiện tại
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');

      const result = this.handleResponse(response);
      
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
      const response = await apiClient.get('/auth/status');
      return this.handleResponse(response);
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
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('isAuthenticated');
    } catch (error) {
      console.error('Clear stored auth error:', error);
    }
  }

  // Lấy Google OAuth URL từ backend
  async getGoogleOAuthUrl() {
    try {
      const response = await apiClient.get('/auth/oauth/mobile/google');
      const result = this.handleResponse(response);
      
      if (result.success && result.data) {
        // Backend trả về URL trong data field
        return result.data;
      }
      throw new Error('Failed to get OAuth URL');
    } catch (error) {
      console.error('Get Google OAuth URL error:', error);
      throw error;
    }
  }

  // Xử lý OAuth callback với code từ Google
  async handleGoogleOAuthCallback(code, provider = 'google') {
    try {
      // Backend nhận @RequestParam, nên gửi params trong query string
      const response = await apiClient.post(
        `/auth/oauth/mobile/callback?code=${encodeURIComponent(code)}&provider=${encodeURIComponent(provider)}`,
        null
      );

      const result = this.handleResponse(response);
      
      // Lưu token nếu có
      if (result.success && result.data?.token) {
        await AsyncStorage.setItem('userToken', result.data.token);
      }
      
      // Lưu thông tin user vào AsyncStorage
      if (result.success && result.data) {
        await AsyncStorage.setItem('user', JSON.stringify(result.data));
        await AsyncStorage.setItem('isAuthenticated', 'true');
      }
      
      return result;
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      throw error;
    }
  }
}

export default new AuthService();