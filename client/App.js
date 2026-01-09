import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStackNavigator, UserTabNavigator, AdminTabNavigator } from './src/navigation';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import COLORS from './src/constant/colors';
import Toast from 'react-native-toast-message';
import * as Linking from 'expo-linking';

// Component để render navigation dựa trên auth state và role
const AppNavigator = () => {
  const { isAuthenticated, user, loginWithGoogle, loading } = useAuth();

  // Xử lý deep link cho OAuth callback
  useEffect(() => {
    // Xử lý khi app được mở từ deep link
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleOAuthCallback(initialUrl);
      }
    };

    // Xử lý khi app đang chạy và nhận được deep link
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleOAuthCallback(url);
    });

    handleInitialURL();

    return () => {
      subscription?.remove();
    };
  }, [loginWithGoogle]);

  const handleOAuthCallback = (url) => {
    try {
      // Parse URL để lấy code
      // URL format: com.legalconnect://oauth2/callback?code=...
      if (url && url.includes('oauth2/callback')) {
        const parsed = Linking.parse(url);
        const code = parsed.queryParams?.code;
        
        if (code) {
          // Gọi loginWithGoogle với code
          loginWithGoogle(code);
        } else {
          console.error('No code found in OAuth callback');
          Toast.show({
            type: 'error',
            text1: 'Đăng nhập thất bại',
            text2: 'Không tìm thấy mã xác thực',
          });
        }
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      Toast.show({
        type: 'error',
        text1: 'Đăng nhập thất bại',
        text2: error.message || 'Có lỗi xảy ra',
      });
    }
  };

  // Hiển thị loading screen trong khi kiểm tra authentication
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
      </View>
    );
  }

  const getNavigator = () => {
    if (!isAuthenticated) {
      // Khi chưa đăng nhập, hiển thị AuthStackNavigator (trang Login)
      return <AuthStackNavigator />;
    }
    
    // Kiểm tra role của user để điều hướng
    if (user?.role === 'ADMIN' || user?.role?.toUpperCase() === 'ADMIN') {
      return <AdminTabNavigator />;
    } else {
      return <UserTabNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {getNavigator()}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="auto" />
          <AppNavigator />
          <Toast />
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BG,
  },
});
