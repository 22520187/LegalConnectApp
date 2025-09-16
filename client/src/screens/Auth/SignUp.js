import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../../constant/colors';

const SignUp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up Screen</Text>
      <Text style={styles.subtitle}>Join Legal Connect today</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
});

export default SignUp;