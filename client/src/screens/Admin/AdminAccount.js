import React, { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminProfileSection from '../../components/Account/AdminProfileSection';
import Toast from 'react-native-toast-message';
import COLORS from '../../constant/colors';
import { useAuth } from '../../context/AuthContext';
import UserService from '../../services/UserService';

const AdminAccount = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.error('User not found in AuthContext');
        setLoading(false);
        return;
      }

      // Lấy userId từ user object
      const userId = user.id || user.userId;
      
      if (!userId) {
        console.error('User ID not found');
        setLoading(false);
        return;
      }

      // Gọi API /api/user/{userId}
      const data = await UserService.getUserProfileByUserId(userId);
      
      if (data) {
        setProfileData(data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Lỗi tải thông tin',
          text2: 'Không thể tải thông tin người dùng',
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi tải thông tin',
        text2: error.message || 'Có lỗi xảy ra khi tải thông tin',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar backgroundColor={COLORS.BLUE} barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
        </View>
        <Toast />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar backgroundColor={COLORS.BLUE} barStyle="light-content" />
      <AdminProfileSection profileData={profileData} onRefresh={loadUserProfile} />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminAccount;