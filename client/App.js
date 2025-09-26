import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStackNavigator, UserTabNavigator, AdminTabNavigator } from './src/navigation';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import COLORS from './src/constant/colors';

// Component để render navigation dựa trên auth state và role
const AppNavigator = () => {
  const { isAuthenticated, user } = useAuth();

  const getNavigator = () => {
    if (!isAuthenticated) {
      return <AuthStackNavigator />;
    }
    
    // Kiểm tra role của user để điều hướng
    if (user?.role === 'admin') {
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
  // Giả sử user đã đăng nhập để test bottom navigation
  // Trong thực tế, bạn sẽ quản lý state đăng nhập ở đây
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="auto" />
          <AppNavigator />
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
