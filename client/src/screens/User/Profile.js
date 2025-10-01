import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileSection from '../../components/Account/ProfileSection';
import Toast from 'react-native-toast-message';
import COLORS from '../../constant/colors';

const Profile = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar backgroundColor={COLORS.BLUE} barStyle="light-content" />
      <ProfileSection />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
});

export default Profile;
