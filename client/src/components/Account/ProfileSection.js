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
import LawyerRequestModal from '../LawyerRequestModal/LawyerRequestModal';
import COLORS from '../../constant/colors';
import SCREENS from '../../screens';
import { useAuth } from '../../context/AuthContext';

const ProfileSection = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
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
    lawyerRequestStatus: null, // null, 'pending', 'approved', 'rejected'
  });

  const [showLawyerRequestModal, setShowLawyerRequestModal] = useState(false);

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

  const handleLawyerRequest = (requestData) => {
    // Update profile with pending status
    setProfile(prev => ({
      ...prev,
      lawyerRequestStatus: 'pending'
    }));

    Toast.show({
      type: 'success',
      text1: 'Gửi yêu cầu thành công',
      text2: 'Yêu cầu của bạn đang được xét duyệt'
    });
  };

  const renderLawyerRequestStatus = () => {
    if (profile.lawyerRequestStatus === 'pending') {
      return (
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Ionicons name="time-outline" size={20} color={COLORS.ORANGE} />
            <Text style={styles.statusTitle}>Trạng thái yêu cầu luật sư</Text>
          </View>
          <Text style={[styles.statusText, { color: COLORS.ORANGE }]}>
            Đang chờ xử lý
          </Text>
          <Text style={styles.statusDescription}>
            Yêu cầu của bạn đang được admin xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.
          </Text>
        </View>
      );
    }
    
    if (profile.lawyerRequestStatus === 'approved') {
      return (
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.GREEN} />
            <Text style={styles.statusTitle}>Trạng thái yêu cầu luật sư</Text>
          </View>
          <Text style={[styles.statusText, { color: COLORS.GREEN }]}>
            Đã được phê duyệt
          </Text>
          <Text style={styles.statusDescription}>
            Chúc mừng! Bạn đã trở thành luật sư được xác nhận.
          </Text>
        </View>
      );
    }
    
    if (profile.lawyerRequestStatus === 'rejected') {
      return (
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Ionicons name="close-circle" size={20} color={COLORS.RED} />
            <Text style={styles.statusTitle}>Trạng thái yêu cầu luật sư</Text>
          </View>
          <Text style={[styles.statusText, { color: COLORS.RED }]}>
            Bị từ chối
          </Text>
          <Text style={styles.statusDescription}>
            Yêu cầu của bạn không được chấp nhận. Vui lòng kiểm tra lại thông tin và gửi lại.
          </Text>
        </View>
      );
    }
    
    return null;
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

      {/* Lawyer Request Status */}
      {renderLawyerRequestStatus()}

      {/* Lawyer Request Button */}
      {!profile.lawyerRequestStatus && (
        <Pressable 
          style={styles.lawyerRequestButton} 
          onPress={() => setShowLawyerRequestModal(true)}
        >
          <Ionicons name="briefcase-outline" size={20} color={COLORS.WHITE} />
          <Text style={styles.lawyerRequestText}>Yêu cầu trở thành luật sư</Text>
        </Pressable>
      )}

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>

      {/* Lawyer Request Modal */}
      <LawyerRequestModal
        visible={showLawyerRequestModal}
        onClose={() => setShowLawyerRequestModal(false)}
        onSubmit={handleLawyerRequest}
      />

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
    statusSection: {
      backgroundColor: '#f8f9fa',
      padding: 16,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: COLORS.ORANGE,
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    statusTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
      color: COLORS.BLACK,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    },
    statusDescription: {
      fontSize: 12,
      color: COLORS.GRAY,
      lineHeight: 16,
    },
    lawyerRequestButton: {
      backgroundColor: COLORS.GREEN,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 8,
      marginHorizontal: 16,
      marginTop: 16,
    },
    lawyerRequestText: {
      color: COLORS.WHITE,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

export default ProfileSection;
