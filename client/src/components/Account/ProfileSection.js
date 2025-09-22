import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import ProfileAvatar from './ProfileAvatar';
import EditableSection from './EditableSection';
import PasswordSection from './PasswordSection';
import BioSection from './BioSection';
import LegalExpertiseSection from './LegalExpertiseSection';
import COLORS from '../../constant/colors';

const ProfileSection = () => {
  const navigation = useNavigation();
  // Mock user data for frontend-only version
  const [profile, setProfile] = useState({
    name: 'Nguyễn Văn An',
    bio: 'Luật sư có 5 năm kinh nghiệm trong lĩnh vực tư vấn pháp luật dân sự và hình sự. Tốt nghiệp Đại học Luật Hà Nội, từng làm việc tại nhiều văn phòng luật uy tín.',
    legalExpertise: ['Luật Dân sự', 'Luật Hình sự', 'Luật Gia đình'],
    id: 1,
    first_name: 'Nguyễn Văn',
    last_name: 'An',
    followers: 100,
    reputation: 100,
  });

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
      } else if (field === 'bio') {
        // Update local state only (frontend-only)
        setProfile(prev => ({
          ...prev,
          bio: value
        }));

        Toast.show({
          type: 'success',
          text1: 'Cập nhật tiểu sử thành công'
        });
      } else if (field === 'legalExpertise') {
        // Update local state only (frontend-only)
        setProfile(prev => ({
          ...prev,
          legalExpertise: value
        }));

        Toast.show({
          type: 'success',
          text1: 'Cập nhật chuyên môn pháp luật thành công'
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
              // Frontend-only logout - just show success message
              Toast.show({
                type: 'success',
                text1: 'Đăng xuất thành công',
                text2: 'Hẹn gặp lại bạn!'
              });

              // In a real app, you would navigate to login screen
              // navigation.reset({
              //   index: 0,
              //   routes: [{ name: 'Login' }],
              // });
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
            <ProfileAvatar name={profile.name} size="lg" />
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>{profile.name}</Text>
              <Text style={styles.infoText} numberOfLines={2}>
                {profile.bio || 'Chưa có tiểu sử'}
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.labelText}>Chuyên môn: </Text>
                <Text style={styles.valueText}>
                  {profile.legalExpertise && profile.legalExpertise.length > 0 
                    ? profile.legalExpertise.join(', ') 
                    : 'Chưa chọn chuyên môn'}
                </Text>
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.labelText}>Lượt theo dõi: </Text>
                <Text style={styles.valueText}>{profile.followers}</Text>
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.labelText}>Uy tín: </Text>
                <Text style={styles.valueText}>{profile.reputation} </Text>
                <Ionicons name="star-outline" size={16} color={COLORS.GREEN} />
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

        <BioSection
          title="Tiểu sử"
          value={profile.bio}
          onSave={(value) => updateProfile('bio', value)}
          icon={<Feather name="file-text" size={16} color="#666" />}
        />

        <LegalExpertiseSection
          title="Chuyên môn"
          value={profile.legalExpertise}
          onSave={(value) => updateProfile('legalExpertise', value)}
          icon={<Feather name="briefcase" size={16} color="#666" />}
        />

        <PasswordSection
          title="Mật khẩu"
          onSave={handleChangePassword}
          icon={<Feather name="lock" size={16} color="#666" />}
        />
      </View>




      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
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
      marginBottom: 4,
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
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      padding: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#e5e5e5',
    },
    editButtonText: {
      color: '#007AFF',
      fontSize: 14,
    },
    gradeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 16,
      paddingHorizontal: 16,
    },
    addSubjectButton: {
      margin: 16,
      padding: 8,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#e5e5e5',
      alignItems: 'center',
    },
    addSubjectText: {
      color: '#007AFF',
      fontSize: 16,
    },
    studentModeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e5e5',
    },
    studentModeText: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    sections: {
      marginTop: 24,
    },
    viewOnlySection: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e5e5',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '500',
    },
    sectionValue: {
      fontSize: 14,
      color: '#666',
      marginLeft: 24,
    },
    supportSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e5e5',
    },
    supportHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    supportText: {
      fontSize: 16,
      fontWeight: '500',
    },
    logoutButton: {
      backgroundColor: '#007AFF',
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 24,
    },
    logoutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
    },
    navbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: '#e5e5e5',
    },
    navItem: {
      alignItems: 'center',
      flex: 1,
    },
    navIcon: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: '#f1f1f1',
      marginBottom: 4,
    },
    activeNavIcon: {
      backgroundColor: '#007AFF',
    },
    navLabel: {
      fontSize: 12,
    },
    activeNavLabel: {
      fontWeight: '500',
    },
  });

export default ProfileSection;
