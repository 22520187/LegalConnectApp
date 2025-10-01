import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import COLORS from '../../constant/colors';
import ReportModal from '../../components/ReportModal/ReportModal';

const UserProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, userName, userAvatar } = route.params;
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Mock user profile data
  const [userProfile] = useState({
    id: userId,
    name: userName,
    avatar: userAvatar,
    bio: 'Luật sư có 8 năm kinh nghiệm trong lĩnh vực tư vấn pháp luật dân sự, hình sự và lao động. Tốt nghiệp xuất sắc Đại học Luật Hà Nội, từng công tác tại nhiều văn phòng luật uy tín.',
    legalExpertise: ['Luật Dân sự', 'Luật Hình sự', 'Luật Lao động', 'Luật Gia đình'],
    location: 'Hà Nội, Việt Nam',
    joinDate: new Date(2020, 5, 15),
    stats: {
      questionsAsked: 23,
      answersGiven: 156,
      bestAnswers: 89,
      helpfulVotes: 1247,
      reputation: 2580,
    },
    isOnline: true,
    lastSeen: new Date(),
    verified: true,
  });

  // Mock recent activities
  const [recentActivities] = useState([
    {
      id: 1,
      type: 'answer',
      title: 'Trả lời: "Quy định về hợp đồng thuê nhà"',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      votes: 15,
    },
    {
      id: 2,
      type: 'question',
      title: 'Đặt câu hỏi: "Luật bảo vệ quyền lợi người tiêu dùng mới nhất"',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      votes: 8,
    },
    {
      id: 3,
      type: 'answer',
      title: 'Trả lời: "Thủ tục ly hôn đơn phương"',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      votes: 24,
      isBestAnswer: true,
    },
  ]);

  const formatJoinDate = (date) => {
    return date.toLocaleDateString('vi-VN', { 
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

  const handleStartChat = () => {
    navigation.navigate('ChatScreen', {
      userId: userProfile.id,
      userName: userProfile.name,
      userAvatar: userProfile.avatar,
      isOnline: userProfile.isOnline,
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    Alert.alert(
      isFollowing ? 'Bỏ theo dõi' : 'Theo dõi',
      isFollowing 
        ? `Đã bỏ theo dõi ${userProfile.name}` 
        : `Đã theo dõi ${userProfile.name}`
    );
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userProfile.avatar ? (
              <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Text style={styles.avatarText}>
                  {userProfile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {userProfile.isOnline && <View style={styles.onlineIndicator} />}
            {userProfile.verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.BLUE} />
              </View>
            )}
          </View>
          
          <Text style={styles.userName}>{userProfile.name}</Text>
          
          {userProfile.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={16} color={COLORS.GRAY} />
              <Text style={styles.location}>{userProfile.location}</Text>
            </View>
          )}
          
          <Text style={styles.joinDate}>
            Tham gia từ {formatJoinDate(userProfile.joinDate)}
          </Text>
          
          {userProfile.bio && (
            <Text style={styles.bio}>{userProfile.bio}</Text>
          )}
          
          {/* Expertise Tags */}
          {userProfile.legalExpertise && userProfile.legalExpertise.length > 0 && (
            <View style={styles.expertiseSection}>
              <Text style={styles.expertiseTitle}>Chuyên môn:</Text>
              <View style={styles.expertiseTags}>
                {userProfile.legalExpertise.map((expertise, index) => (
                  <View key={index} style={styles.expertiseTag}>
                    <Text style={styles.expertiseText}>{expertise}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleStartChat}
          >
            <Ionicons name="chatbubble-outline" size={20} color={COLORS.WHITE} />
            <Text style={styles.primaryButtonText}>Nhắn tin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, isFollowing && styles.followingButton]}
            onPress={handleFollow}
          >
            <Ionicons 
              name={isFollowing ? "person-remove-outline" : "person-add-outline"} 
              size={20} 
              color={isFollowing ? COLORS.WHITE : COLORS.BLUE} 
            />
            <Text style={[
              styles.secondaryButtonText,
              isFollowing && styles.followingButtonText
            ]}>
              {isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
            </Text>
          </TouchableOpacity>
        </View>

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
          {recentActivities.map(renderActivityItem)}
        </View>
      </ScrollView>

      <ReportModal
        visible={showReportModal}
        onClose={handleCloseReportModal}
        reportType="user"
        targetId={userProfile.id}
        targetTitle={userProfile.name}
        onSubmit={handleReportSubmit}
      />
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
    marginRight: 8,
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.WHITE,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
    marginLeft: 8,
  },
  followingButton: {
    backgroundColor: COLORS.GRAY,
    borderColor: COLORS.GRAY,
  },
  secondaryButtonText: {
    color: COLORS.BLUE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  followingButtonText: {
    color: COLORS.WHITE,
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
});

export default UserProfile;
