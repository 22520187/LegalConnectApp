import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import UserService from '../../services/UserService';

const AppHeader = ({ onSearch, onNotification, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleAvatarPress = async () => {
    setShowUserMenu(true);
    // Call API to get latest user info when menu opens
    await loadUserInfo();
  };

  const loadUserInfo = async () => {
    try {
      if (!user?.id && !user?.userId) {
        // Use current user data if no userId
        setUserInfo({
          name: user?.fullName || user?.name || 'User',
          avatar: user?.avatar || null,
        });
        return;
      }

      setLoadingUserInfo(true);
      setAvatarError(false); // Reset avatar error when loading new info
      const userId = user.id || user.userId;
      const profileData = await UserService.getUserProfile(userId);
      
      if (profileData) {
        // Validate avatar URL - must be a non-empty string
        const avatarUrl = profileData.avatar;
        const isValidAvatar = avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim().length > 0;
        
        console.log('Loaded user profile:', {
          name: profileData.fullName,
          avatar: avatarUrl,
          isValidAvatar: isValidAvatar
        });
        
        setUserInfo({
          name: profileData.fullName || user.fullName || user.name || 'User',
          avatar: isValidAvatar ? avatarUrl : (user?.avatar || null),
        });
      } else {
        // Fallback to current user data if API returns null
        setUserInfo({
          name: user?.fullName || user?.name || 'User',
          avatar: user?.avatar || null,
        });
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      // Fallback to current user data if API fails
      setUserInfo({
        name: user?.fullName || user?.name || 'User',
        avatar: user?.avatar || null,
      });
    } finally {
      setLoadingUserInfo(false);
    }
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo and App Name */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} />
        </View>
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
        onRequestClose={() => {
          setShowUserMenu(false);
          setUserInfo(null); // Reset user info when closing
          setAvatarError(false); // Reset avatar error when closing
        }}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => {
            setShowUserMenu(false);
            setUserInfo(null); // Reset user info when closing
            setAvatarError(false); // Reset avatar error when closing
          }}
        >
          <View style={styles.userMenu}>
            {/* User Info Section */}
            <View style={styles.userInfoSection}>
              {loadingUserInfo ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.BLUE} />
                </View>
              ) : (
                <>
                  {/* Avatar */}
                  {(() => {
                    // Try userInfo first, then fallback to user prop
                    const avatarUrl = userInfo?.avatar || user?.avatar;
                    const displayName = userInfo?.name || user?.fullName || user?.name || 'User';
                    const isValidAvatar = avatarUrl && 
                                         typeof avatarUrl === 'string' && 
                                         avatarUrl.trim().length > 0 && 
                                         !avatarError;
                    
                    if (isValidAvatar) {
                      return (
                        <Image 
                          source={{ uri: avatarUrl }} 
                          style={styles.menuAvatar}
                          onError={(error) => {
                            console.log('Avatar load error:', error.nativeEvent?.error || 'Unknown error');
                            console.log('Failed avatar URL:', avatarUrl);
                            setAvatarError(true);
                          }}
                          onLoad={() => {
                            console.log('Avatar loaded successfully:', avatarUrl);
                          }}
                        />
                      );
                    }
                    
                    return (
                      <View style={styles.menuDefaultAvatar}>
                        <Text style={styles.menuAvatarText}>
                          {displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    );
                  })()}
                  {/* User Name - below avatar */}
                  <Text style={styles.userNameText} numberOfLines={1}>
                    {userInfo?.name || user?.fullName || user?.name || 'User'}
                  </Text>
                </>
              )}
            </View>

            <View style={styles.menuDivider} />

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.RED} />
              <Text style={[styles.menuText, { color: COLORS.RED }]}>Đăng xuất</Text>
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
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginLeft: 18,
  },
  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
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
  userInfoSection: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    paddingVertical: 8,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    backgroundColor: COLORS.GRAY_BG,
  },
  menuDefaultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuAvatarText: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: 'bold',
  },
  userNameText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.BLACK,
    textAlign: 'center',
  },
});

export default AppHeader;
