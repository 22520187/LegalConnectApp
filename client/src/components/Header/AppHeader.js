import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const AppHeader = ({ onSearch, onNotification, user }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAvatarPress = () => {
    setShowUserMenu(true);
  };

  const handleMenuAction = (action) => {
    setShowUserMenu(false);
    // Handle menu actions here
    console.log(`${action} clicked`);
  };

  return (
    <View style={styles.container}>
      {/* Logo and App Name */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>LC</Text>
        </View>
        <Text style={styles.appName}>Legal Connect</Text>
      </View>

      {/* Action Icons */}
      <View style={styles.actionsSection}>
        {/* Search Icon */}
        <TouchableOpacity style={styles.actionButton} onPress={onSearch}>
          <Ionicons name="search" size={24} color={COLORS.GRAY_DARK} />
        </TouchableOpacity>

        {/* Notification Icon */}
        <TouchableOpacity style={styles.actionButton} onPress={onNotification}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.GRAY_DARK} />
          {/* Notification Badge */}
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>

        {/* User Avatar */}
        <TouchableOpacity style={styles.avatarButton} onPress={handleAvatarPress}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* User Menu Modal */}
      <Modal
        visible={showUserMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowUserMenu(false)}
        >
          <View style={styles.userMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuAction('Profile')}
            >
              <Ionicons name="person-outline" size={20} color={COLORS.GRAY_DARK} />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuAction('Settings')}
            >
              <Ionicons name="settings-outline" size={20} color={COLORS.GRAY_DARK} />
              <Text style={styles.menuText}>Settings</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuAction('Logout')}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.RED} />
              <Text style={[styles.menuText, { color: COLORS.RED }]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  actionsSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  avatarButton: {
    marginLeft: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.RED,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  userMenu: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 150,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.GRAY_DARK,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.GRAY_BG,
    marginVertical: 4,
  },
});

export default AppHeader;
