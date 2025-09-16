import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const FloatingActionButton = ({ onPress, icon = 'add', size = 56 }) => {
  return (
    <TouchableOpacity style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]} onPress={onPress}>
      <Ionicons name={icon} size={24} color={COLORS.WHITE} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default FloatingActionButton;
