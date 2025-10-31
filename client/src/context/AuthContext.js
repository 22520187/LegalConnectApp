import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';
import Toast from 'react-native-toast-message';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo auth state từ AsyncStorage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      const storedAuth = await AuthService.getStoredUser();
      
      if (storedAuth.isAuthenticated && storedAuth.user) {
        // Verify với server
        try {
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser.success) {
            setUser(currentUser.data);
            setIsAuthenticated(true);
          } else {
            await AuthService.clearStoredAuth();
          }
        } catch (error) {
          // Nếu không thể verify với server, vẫn sử dụng stored data
          setUser(storedAuth.user);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Initialize auth error:', error);
      await AuthService.clearStoredAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await AuthService.signin(credentials);
      
      if (result.success) {
        setUser(result.data);
        setIsAuthenticated(true);
        Toast.show({
          type: 'success',
          text1: 'Đăng nhập thành công',
          text2: result.message || 'Chào mừng bạn quay trở lại!',
        });
        return { success: true };
      } else {
        Toast.show({
          type: 'error',
          text1: 'Đăng nhập thất bại',
          text2: result.message || 'Vui lòng kiểm tra lại thông tin',
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Đăng nhập thất bại',
        text2: error.message || 'Có lỗi xảy ra, vui lòng thử lại',
      });
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await AuthService.signup(userData);
      
      if (result.success) {
        setUser(result.data);
        setIsAuthenticated(true);
        Toast.show({
          type: 'success',
          text1: 'Đăng ký thành công',
          text2: result.message || 'Tài khoản đã được tạo thành công!',
        });
        return { success: true };
      } else {
        Toast.show({
          type: 'error',
          text1: 'Đăng ký thất bại',
          text2: result.message || 'Vui lòng kiểm tra lại thông tin',
        });
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      Toast.show({
        type: 'error',
        text1: 'Đăng ký thất bại',
        text2: error.message || 'Có lỗi xảy ra, vui lòng thử lại',
      });
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      Toast.show({
        type: 'success',
        text1: 'Đăng xuất thành công',
        text2: 'Hẹn gặp lại bạn!',
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn logout local ngay cả khi API thất bại
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const result = await AuthService.getCurrentUser();
      if (result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
