import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import ProfileSection from '../../components/Account/ProfileSection';
import Toast from 'react-native-toast-message';
import COLORS from '../../constant/colors';

const Profile = () => {
  return (
    <SafeAreaView style={styles.container}>
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
