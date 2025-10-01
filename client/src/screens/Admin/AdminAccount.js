import React from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AdminProfileSection from '../../components/Account/AdminProfileSection';
import Toast from 'react-native-toast-message';
import COLORS from '../../constant/colors';

const AdminAccount = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar backgroundColor={COLORS.BLUE} barStyle="light-content" />
      <AdminProfileSection />
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

export default AdminAccount;