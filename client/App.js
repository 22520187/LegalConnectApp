import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStackNavigator, UserTabNavigator } from './src/navigation';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import COLORS from './src/constant/colors';

export default function App() {
  // Giả sử user đã đăng nhập để test bottom navigation
  // Trong thực tế, bạn sẽ quản lý state đăng nhập ở đây
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <NavigationContainer>
          {isAuthenticated ? <UserTabNavigator /> : <AuthStackNavigator />}
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
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
