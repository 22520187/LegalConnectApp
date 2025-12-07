import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import ProfileAvatar from './ProfileAvatar';
import EditableSection from './EditableSection';
import PasswordSection from './PasswordSection';
import COLORS from '../../constant/colors';
import { useAuth } from '../../context/AuthContext';

const AdminProfileSection = ({ profileData, onRefresh }) => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  
  // Initialize profile from API data or use default values
  const initializeProfile = (data) => {
    if (!data) {
      return {
        name: 'Admin System',
        email: '',
        phone: '',
        id: null,
        first_name: '',
        last_name: '',
        role: 'Administrator',
        joinDate: new Date().toISOString(),
        avatar: null,
      };
    }

    const nameParts = (data.fullName || '').trim().split(' ');
    const lastName = nameParts.length > 0 ? nameParts.pop() : '';
    const firstName = nameParts.join(' ');

    return {
      name: data.fullName || '',
      email: data.email || '',
      phone: data.phoneNumber || '',
      id: data.id || null,
      first_name: firstName,
      last_name: lastName,
      role: data.role || 'Administrator',
      joinDate: data.joinedAt || new Date().toISOString(),
      avatar: data.avatar || null,
      postCount: data.postCount || 0,
      replyCount: data.replyCount || 0,
      bio: data.bio || '',
      legalExpertise: data.legalExpertise || [],
    };
  };

  const [profile, setProfile] = useState(initializeProfile(profileData));

  // Update profile when profileData changes
  useEffect(() => {
    if (profileData) {
      setProfile(initializeProfile(profileData));
    }
  }, [profileData]);

  const updateProfile = (field, value) => {
    try {
      if (field === 'name') {
        // Split the name into first name and last name
        const nameParts = value.trim().split(' ');
        const lastName = nameParts.pop(); // Last word is the last name
        const firstName = nameParts.join(' '); // Rest is the first name

        if (!firstName || !lastName) {
          Toast.show({
            type: 'error',
            text1: 'Tên không hợp lệ',
            text2: 'Vui lòng nhập cả họ và tên'
          });
          return;
        }

        // Update local state only (frontend-only)
        setProfile(prev => ({
          ...prev,
          name: value,
          first_name: firstName,
          last_name: lastName
        }));

        Toast.show({
          type: 'success',
          text1: 'Cập nhật tên thành công'
        });
      } else if (field === 'email') {
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          Toast.show({
            type: 'error',
            text1: 'Email không hợp lệ',
            text2: 'Vui lòng nhập email đúng định dạng'
          });
          return;
        }

        setProfile(prev => ({
          ...prev,
          email: value
        }));

        Toast.show({
          type: 'success',
          text1: 'Cập nhật email thành công'
        });
      } else if (field === 'phone') {
        // Basic phone validation
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          Toast.show({
            type: 'error',
            text1: 'Số điện thoại không hợp lệ',
            text2: 'Vui lòng nhập số điện thoại 10-11 chữ số'
          });
          return;
        }

        setProfile(prev => ({
          ...prev,
          phone: value
        }));

        Toast.show({
          type: 'success',
          text1: 'Cập nhật số điện thoại thành công'
        });
      } else {
        // For other fields, just update the state
        setProfile(prev => ({ ...prev, [field]: value }));

        Toast.show({
          type: 'success',
          text1: `Cập nhật ${field} thành công`
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Không thể cập nhật thông tin',
        text2: 'Vui lòng thử lại'
      });
    }
  };

  const handleChangePassword = ({ currentPassword, newPassword }) => {
    try {
      // Frontend-only password change simulation
      if (!currentPassword || !newPassword) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi đổi mật khẩu',
          text2: 'Vui lòng nhập đầy đủ thông tin'
        });
        return;
      }

      if (newPassword.length < 6) {
        Toast.show({
          type: 'error',
          text1: 'Mật khẩu không hợp lệ',
          text2: 'Mật khẩu phải có ít nhất 6 ký tự'
        });
        return;
      }

      // Simulate successful password change
      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi đổi mật khẩu',
        text2: 'Có lỗi xảy ra khi đổi mật khẩu'
      });
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          onPress: () => {
            try {
              logout();
              Toast.show({
                type: 'success',
                text1: 'Đăng xuất thành công',
                text2: 'Hẹn gặp lại bạn!'
              });
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.profileInfo}>
            <ProfileAvatar name={profile.name} image={profile.avatar} size="lg" />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>{profile.name}</Text>
              <View style={styles.roleContainer}>
                <Ionicons name="shield-checkmark" size={16} color={COLORS.BLUE} />
                <Text style={styles.roleText}>{profile.role}</Text>
              </View>
              <Text style={styles.infoText}>
                <Text style={styles.labelText}>Email: </Text>
                <Text style={styles.valueText}>{profile.email}</Text>
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.labelText}>Số điện thoại: </Text>
                <Text style={styles.valueText}>{profile.phone}</Text>
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.labelText}>Ngày tham gia: </Text>
                <Text style={styles.valueText}>
                  {new Date(profile.joinDate).toLocaleDateString('vi-VN')}
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Editable Sections */}
      <View style={styles.sections}>
        <EditableSection
          title="Tên tài khoản"
          value={profile.name}
          onSave={(value) => updateProfile('name', value)}
          icon={<Feather name="user" size={16} color="#666" />}
        />

        <EditableSection
          title="Email"
          value={profile.email}
          onSave={(value) => updateProfile('email', value)}
          icon={<Feather name="mail" size={16} color="#666" />}
          keyboardType="email-address"
        />

        <EditableSection
          title="Số điện thoại"
          value={profile.phone}
          onSave={(value) => updateProfile('phone', value)}
          icon={<Feather name="phone" size={16} color="#666" />}
          keyboardType="phone-pad"
        />

        <PasswordSection
          title="Mật khẩu"
          onSave={handleChangePassword}
          icon={<Feather name="lock" size={16} color="#666" />}
        />
      </View>

      {/* Admin Info Section */}
      <View style={styles.adminInfoSection}>
        <View style={styles.adminInfoHeader}>
          <Ionicons name="information-circle" size={20} color={COLORS.BLUE} />
          <Text style={styles.adminInfoTitle}>Thông tin quản trị viên</Text>
        </View>
        <Text style={styles.adminInfoText}>
          Bạn đang đăng nhập với quyền quản trị viên. Có thể quản lý người dùng, bài viết và các chức năng hệ thống.
        </Text>
      </View>

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.WHITE} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: COLORS.BLUE,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  profileInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  textContainer: {
    flex: 1,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.BLACK,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLUE,
    marginLeft: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  labelText: {
    fontWeight: 'bold',
  },
  valueText: {
    fontWeight: 'normal',
  },
  sections: {
    marginTop: 24,
  },
  adminInfoSection: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    marginHorizontal: 0,
    marginTop: 24,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.BLUE,
  },
  adminInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adminInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: COLORS.BLACK,
  },
  adminInfoText: {
    fontSize: 14,
    color: COLORS.GRAY,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.RED || '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginVertical: 24,
  },
  logoutText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default AdminProfileSection;
