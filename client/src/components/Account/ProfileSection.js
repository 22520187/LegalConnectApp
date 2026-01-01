import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import ProfileAvatar from './ProfileAvatar';
import EditableSection from './EditableSection';
import PasswordSection from './PasswordSection';
import BioSection from './BioSection';
import LegalExpertiseSection from './LegalExpertiseSection';
import LawyerRequestModal from '../LawyerRequestModal/LawyerRequestModal';
import LawyerApplicationDetailModal from '../LawyerApplicationDetailModal/LawyerApplicationDetailModal';
import COLORS from '../../constant/colors';
import SCREENS from '../../screens';
import { useAuth } from '../../context/AuthContext';
import UserService from '../../services/UserService';
import LawyerService from '../../services/LawyerService';

const ProfileSection = () => {
  const navigation = useNavigation();
  const { logout, user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    legalExpertise: [],
    id: null,
    first_name: '',
    last_name: '',
    followers: 0,
    reputation: 0,
    lawyerRequestStatus: null,
    postCount: 0,
    replyCount: 0,
    avatar: null,
    email: '',
    phoneNumber: '',
    joinedAt: null,
  });

  const [showLawyerRequestModal, setShowLawyerRequestModal] = useState(false);
  const [showApplicationDetailModal, setShowApplicationDetailModal] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadUserProfile();
    checkLawyerApplicationStatus();
  }, [currentUser]);

  const loadUserProfile = async () => {
    try {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      // Lấy userId từ currentUser (có thể là user.id hoặc user.userId)
      const userId = currentUser.id || currentUser.userId;
      
      if (!userId) {
        console.error('User ID not found');
        setLoading(false);
        return;
      }

      const profileData = await UserService.getUserProfile(userId);
      
      if (profileData) {
        setProfile({
          name: profileData.fullName || currentUser.fullName || currentUser.name || '',
          bio: profileData.bio || '',
          legalExpertise: profileData.legalExpertise || [],
          id: profileData.id,
          first_name: profileData.fullName?.split(' ').slice(0, -1).join(' ') || '',
          last_name: profileData.fullName?.split(' ').slice(-1)[0] || '',
          followers: 0, // Backend không có field này
          reputation: 0, // Backend không có field này
          lawyerRequestStatus: null,
          postCount: profileData.postCount || 0,
          replyCount: profileData.replyCount || 0,
          avatar: profileData.avatar || currentUser.avatar || null,
          email: profileData.email || currentUser.email || '',
          phoneNumber: profileData.phoneNumber || '',
          joinedAt: profileData.joinedAt ? new Date(profileData.joinedAt) : null,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi tải thông tin',
        text2: 'Không thể tải thông tin người dùng. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (field, value) => {
    try {
      if (!currentUser) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Vui lòng đăng nhập lại'
        });
        return;
      }

      const userId = currentUser.id || currentUser.userId;
      if (!userId) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không tìm thấy thông tin người dùng'
        });
        return;
      }

      let updateData = {};

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

        updateData = { fullName: value };
      } else if (field === 'bio') {
        updateData = { bio: value };
      } else if (field === 'legalExpertise') {
        updateData = { legalExpertise: value };
      } else {
        updateData = { [field]: value };
      }

      // Call API to update profile
      const updatedProfile = await UserService.updateProfile(userId, updateData);

      if (updatedProfile) {
        // Update local state with response from API
        if (field === 'name') {
          const nameParts = value.trim().split(' ');
          const lastName = nameParts.pop();
          const firstName = nameParts.join(' ');
          setProfile(prev => ({
            ...prev,
            name: updatedProfile.fullName || value,
            first_name: firstName,
            last_name: lastName,
            bio: updatedProfile.bio || prev.bio,
            legalExpertise: updatedProfile.legalExpertise || prev.legalExpertise,
            phoneNumber: updatedProfile.phoneNumber || prev.phoneNumber,
            avatar: updatedProfile.avatar || prev.avatar,
          }));
        } else {
          setProfile(prev => ({
            ...prev,
            [field]: value,
            bio: updatedProfile.bio !== undefined ? updatedProfile.bio : prev.bio,
            legalExpertise: updatedProfile.legalExpertise !== undefined ? updatedProfile.legalExpertise : prev.legalExpertise,
            phoneNumber: updatedProfile.phoneNumber !== undefined ? updatedProfile.phoneNumber : prev.phoneNumber,
            avatar: updatedProfile.avatar !== undefined ? updatedProfile.avatar : prev.avatar,
          }));
        }

        Toast.show({
          type: 'success',
          text1: 'Cập nhật thành công',
          text2: `Đã cập nhật ${field === 'name' ? 'tên' : field === 'bio' ? 'tiểu sử' : field === 'legalExpertise' ? 'chuyên môn' : field}`
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Không thể cập nhật thông tin',
        text2: error.response?.data?.message || 'Vui lòng thử lại'
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
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const checkLawyerApplicationStatus = async () => {
    try {
      const hasApplied = await LawyerService.hasUserApplied();
      if (hasApplied) {
        const application = await LawyerService.getUserApplication();
        if (application && application.status) {
          // Map backend status to frontend status
          const statusMap = {
            'PENDING': 'pending',
            'APPROVED': 'approved',
            'REJECTED': 'rejected'
          };
          setProfile(prev => ({
            ...prev,
            lawyerRequestStatus: statusMap[application.status] || 'pending'
          }));
          // Store application ID for detail modal
          if (application.id) {
            setApplicationId(application.id);
          }
        }
      } else {
        setProfile(prev => ({
          ...prev,
          lawyerRequestStatus: null
        }));
        setApplicationId(null);
      }
    } catch (error) {
      console.error('Error checking lawyer application status:', error);
    }
  };

  const handleLawyerRequest = async (applicationData) => {
    // Reload application status after submission
    await checkLawyerApplicationStatus();
    
    Toast.show({
      type: 'success',
      text1: 'Gửi đơn thành công',
      text2: 'Đơn đăng ký của bạn đang được xét duyệt'
    });
  };

  const handleViewApplicationDetails = () => {
    if (applicationId) {
      setShowApplicationDetailModal(true);
    }
  };

  const handleApplicationDetailClose = () => {
    setShowApplicationDetailModal(false);
    // Reload application status after closing (in case documents were updated)
    checkLawyerApplicationStatus();
  };

  const handleAvatarPress = () => {
    Alert.alert(
      'Chọn ảnh đại diện',
      'Bạn muốn chọn ảnh từ đâu?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Thư viện',
          onPress: () => pickImage('library'),
        },
        {
          text: 'Máy ảnh',
          onPress: () => pickImage('camera'),
        },
      ],
      { cancelable: true }
    );
  };

  const pickImage = async (source) => {
    try {
      // Request permissions
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Quyền truy cập', 'Cần quyền truy cập máy ảnh để chụp ảnh.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn ảnh.');
          return;
        }
      }

      // Pick image
      const options = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadAvatarImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể chọn ảnh. Vui lòng thử lại.'
      });
    }
  };

  const uploadAvatarImage = async (imageUri) => {
    try {
      setUploadingAvatar(true);

      // Upload avatar
      const avatarUrl = await UserService.uploadAvatar(imageUri);

      if (!avatarUrl) {
        throw new Error('Upload failed');
      }

      // Only upload avatar (do not call updateProfile)
      setProfile(prev => ({
        ...prev,
        avatar: avatarUrl
      }));

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã tải ảnh đại diện lên'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.response?.data?.message || 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại.'
      });
    } finally {
      setUploadingAvatar(false);
    }
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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.BLUE} />
        <Text style={{ marginTop: 16, color: COLORS.GRAY }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.profileInfo}>
            {uploadingAvatar ? (
              <View style={styles.avatarLoadingContainer}>
                <ActivityIndicator size="small" color={COLORS.BLUE} />
              </View>
            ) : (
              <ProfileAvatar 
                name={profile.name} 
                image={profile.avatar}
                size="lg"
                onPress={handleAvatarPress}
              />
            )}
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
                <Text style={styles.labelText}>Bài viết: </Text>
                <Text style={styles.valueText}>{profile.postCount || 0}</Text>
              </Text>
              <Text style={styles.infoText}>
                <Text style={styles.labelText}>Câu trả lời: </Text>
                <Text style={styles.valueText}>{profile.replyCount || 0}</Text>
              </Text>
              {profile.joinedAt && (
                <Text style={styles.infoText}>
                  <Text style={styles.labelText}>Tham gia: </Text>
                  <Text style={styles.valueText}>
                    {new Date(profile.joinedAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </Text>
                </Text>
              )}
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

      {/* View Application Details Button */}
      {profile.lawyerRequestStatus && applicationId && (
        <Pressable 
          style={styles.viewApplicationButton} 
          onPress={handleViewApplicationDetails}
        >
          <Ionicons name="document-text-outline" size={20} color={COLORS.WHITE} />
          <Text style={styles.viewApplicationText}>Xem chi tiết đơn đăng ký</Text>
        </Pressable>
      )}

      {/* Lawyer Request Button */}
      {!profile.lawyerRequestStatus && currentUser?.role !== 'LAWYER' && (
        <Pressable 
          style={styles.lawyerRequestButton} 
          onPress={() => setShowLawyerRequestModal(true)}
        >
          <Ionicons name="briefcase-outline" size={20} color={COLORS.WHITE} />
          <Text style={styles.lawyerRequestText}>Đăng ký trở thành luật sư</Text>
        </Pressable>
      )}

      {/* Logout Button */}
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.WHITE} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>

      {/* Lawyer Request Modal */}
      <LawyerRequestModal
        visible={showLawyerRequestModal}
        onClose={() => setShowLawyerRequestModal(false)}
        onSubmit={handleLawyerRequest}
      />

      {/* Application Detail Modal */}
      <LawyerApplicationDetailModal
        visible={showApplicationDetailModal}
        onClose={handleApplicationDetailClose}
        applicationId={applicationId}
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
      backgroundColor: COLORS.RED || '#dc3545',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 8,
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
    viewApplicationButton: {
      backgroundColor: COLORS.BLUE,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 8,
      marginHorizontal: 16,
      marginTop: 16,
    },
    viewApplicationText: {
      color: COLORS.WHITE,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    avatarPressable: {
      position: 'relative',
    },
    avatarLoadingContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: COLORS.GRAY_BG,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default ProfileSection;
