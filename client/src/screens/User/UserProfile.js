import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../../constant/colors';
import ReportModal from '../../components/ReportModal/ReportModal';
import { useAuth } from '../../context/AuthContext';
import { getOrCreateConversation } from '../../services/MessageService';
import UserService from '../../services/UserService';
import Toast from 'react-native-toast-message';

const UserProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, userName, userAvatar } = route.params;
  const { user: currentUser } = useAuth();
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Kiểm tra xem đây có phải profile của chính mình không
  const isOwnProfile = currentUser && currentUser.id === userId;

  // User profile data from API
  const [userProfile, setUserProfile] = useState({
    id: userId,
    name: userName || '',
    avatar: userAvatar || null,
    bio: '',
    legalExpertise: [],
    joinDate: null,
    stats: {
      questionsAsked: 0,
      answersGiven: 0,
      bestAnswers: 0,
      reputation: 0,
    },
    role: '',
  });

  // Recent activities from user posts
  const [recentActivities, setRecentActivities] = useState([]);

  // Load user profile and posts
  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Load profile data
      const profileData = await UserService.getUserProfile(userId);
      
      if (profileData) {
        setUserProfile({
          id: profileData.id,
          name: profileData.fullName || userName || '',
          avatar: profileData.avatar || userAvatar || null,
          bio: profileData.bio || '',
          legalExpertise: profileData.legalExpertise || [],
          joinDate: profileData.joinedAt ? new Date(profileData.joinedAt) : null,
          stats: {
            questionsAsked: profileData.postCount || 0,
            answersGiven: profileData.replyCount || 0,
            bestAnswers: 0, // Backend chưa có field này
            reputation: 0, // Backend chưa có field này
          },
          role: profileData.role || '',
        });
      }

      // Load user posts for activities
      const postsData = await UserService.getUserPosts(userId, {
        page: 0,
        size: 10,
        sort: 'createdAt,desc'
      });

      if (postsData && postsData.content) {
        // Convert posts to activities format
        const activities = postsData.content.slice(0, 5).map(post => ({
          id: post.id,
          type: 'question',
          title: post.title,
          timestamp: post.createdAt ? new Date(post.createdAt) : new Date(),
          votes: 0, // Backend chưa có vote count trong UserPostDto
          isBestAnswer: post.solved || false,
        }));
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi tải thông tin',
        text2: 'Không thể tải thông tin người dùng. Vui lòng thử lại.'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserProfile();
  };

  const formatJoinDate = (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const formatLastActivity = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    }
  };

  const handleStartChat = async () => {
    try {
      setIsLoadingChat(true);
      
      // Gọi API để lấy hoặc tạo conversation
      const conversation = await getOrCreateConversation(userProfile.id);
      
      if (!conversation || !conversation.id) {
        Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện. Vui lòng thử lại.');
        setIsLoadingChat(false);
        return;
      }
      
      // Navigate với conversationId
      navigation.navigate('ChatScreen', {
        conversationId: conversation.id,
        userId: userProfile.id,
        userName: userProfile.name,
        userAvatar: userProfile.avatar,
        isOnline: false, // Backend chưa có field này
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert(
        'Lỗi',
        error.response?.data?.message || 'Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.'
      );
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleReportSubmit = (reportData) => {
    console.log('User report submitted:', reportData);
    // Here you would typically send the report to your backend
    setShowReportModal(false);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
  };

  const renderStatItem = (label, value, icon) => (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={20} color={COLORS.BLUE} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderActivityItem = (activity) => (
    <View key={activity.id} style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons 
          name={activity.type === 'answer' ? 'chatbubble' : 'help-circle'} 
          size={16} 
          color={COLORS.BLUE} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle} numberOfLines={2}>
          {activity.title}
        </Text>
        <View style={styles.activityMeta}>
          <Text style={styles.activityTime}>
            {formatLastActivity(activity.timestamp)}
          </Text>
          <View style={styles.activityVotes}>
            <Ionicons name="arrow-up" size={12} color={COLORS.GREEN} />
            <Text style={styles.voteCount}>{activity.votes}</Text>
          </View>
          {activity.isBestAnswer && (
            <View style={styles.bestAnswerBadge}>
              <Ionicons name="checkmark-circle" size={12} color={COLORS.GREEN} />
              <Text style={styles.bestAnswerText}>Tốt nhất</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Hồ sơ</Text>
        
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={handleReport}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.BLUE]}
            />
          }
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {userProfile.avatar ? (
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Text style={styles.avatarText}>
                    {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              )}
              {userProfile.role === 'LAWYER' && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.BLUE} />
                </View>
              )}
            </View>
            
            <Text style={styles.userName}>{userProfile.name || 'Người dùng'}</Text>
            
            {userProfile.joinDate && (
              <Text style={styles.joinDate}>
                Tham gia từ {formatJoinDate(userProfile.joinDate)}
              </Text>
            )}
            
            {userProfile.bio && (
              <Text style={styles.bio}>{userProfile.bio}</Text>
            )}
            
            {/* Expertise Tags */}
            {userProfile.legalExpertise && userProfile.legalExpertise.length > 0 && (
              <View style={styles.expertiseSection}>
                <Text style={styles.expertiseTitle}>Chuyên môn:</Text>
                <View style={styles.expertiseTags}>
                  {userProfile.legalExpertise.map((expertise, index) => (
                    <View key={`expertise-${expertise}-${index}`} style={styles.expertiseTag}>
                      <Text style={styles.expertiseText}>{expertise}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.primaryButton, isLoadingChat && styles.primaryButtonDisabled]}
              onPress={handleStartChat}
              disabled={isLoadingChat}
            >
              {isLoadingChat ? (
                <ActivityIndicator size="small" color={COLORS.WHITE} />
              ) : (
                <>
                  <Ionicons name="chatbubble-outline" size={20} color={COLORS.WHITE} />
                  <Text style={styles.primaryButtonText}>Nhắn tin</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Thống kê</Text>
          <View style={styles.statsGrid}>
            {renderStatItem('Câu hỏi', userProfile.stats.questionsAsked, 'help-circle-outline')}
            {renderStatItem('Câu trả lời', userProfile.stats.answersGiven, 'chatbubble-outline')}
            {renderStatItem('Câu trả lời hay nhất', userProfile.stats.bestAnswers, 'trophy-outline')}
            {renderStatItem('Uy tín', userProfile.stats.reputation, 'star-outline')}
          </View>
        </View>

          {/* Recent Activities */}
          <View style={styles.activitiesSection}>
            <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
            {recentActivities.length > 0 ? (
              recentActivities.map(renderActivityItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <ReportModal
        visible={showReportModal}
        onClose={handleCloseReportModal}
        reportType="user"
        targetId={userProfile.id}
        targetTitle={userProfile.name}
        onSubmit={handleReportSubmit}
      />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: 32,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.GREEN,
    borderWidth: 3,
    borderColor: COLORS.WHITE,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 8,
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginLeft: 4,
  },
  joinDate: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginBottom: 16,
  },
  bio: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  expertiseSection: {
    width: '100%',
    alignItems: 'center',
  },
  expertiseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  expertiseTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  expertiseTag: {
    backgroundColor: COLORS.BLUE_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  expertiseText: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.WHITE,
    marginBottom: 8,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BLUE,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  statsSection: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
  activitiesSection: {
    backgroundColor: COLORS.WHITE,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.BLUE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: COLORS.BLACK,
    lineHeight: 18,
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginRight: 12,
  },
  activityVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  voteCount: {
    fontSize: 12,
    color: COLORS.GREEN,
    marginLeft: 2,
    fontWeight: '500',
  },
  bestAnswerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.Light_Cyan,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bestAnswerText: {
    fontSize: 10,
    color: COLORS.GREEN,
    marginLeft: 2,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
});

export default UserProfile;
