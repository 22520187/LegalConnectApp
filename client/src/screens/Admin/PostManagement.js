import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const { width } = Dimensions.get('window');

const PostManagement = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('reports');
  const [reportedPosts, setReportedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);

  // Mock data - trong thực tế sẽ fetch từ API

  const mockReportedPosts = [
    {
      id: 1,
      title: "Hợp đồng thuê nhà có hiệu lực bao lâu?",
      author: "Nguyễn Văn A",
      reportCount: 3,
      reports: [
        { reason: "Nội dung không phù hợp", reportedBy: "User123", timestamp: "2024-01-15T10:30:00Z" },
        { reason: "Thông tin sai lệch", reportedBy: "User456", timestamp: "2024-01-15T11:45:00Z" },
        { reason: "Spam hoặc quảng cáo", reportedBy: "User789", timestamp: "2024-01-15T14:20:00Z" }
      ],
      content: "Tôi vừa ký hợp đồng thuê nhà với chủ nhà, nhưng không rõ thời hạn hiệu lực. Xin hỏi hợp đồng thuê nhà thường có hiệu lực trong bao lâu?",
      createdAt: "2024-01-14T08:00:00Z",
      status: "pending", // pending, reviewed, banned, dismissed
    },
    {
      id: 2,
      title: "Cách xử lý tranh chấp lao động",
      author: "Trần Thị B",
      reportCount: 2,
      reports: [
        { reason: "Ngôn từ độc hại", reportedBy: "User321", timestamp: "2024-01-15T09:15:00Z" },
        { reason: "Vi phạm quy tắc cộng đồng", reportedBy: "User654", timestamp: "2024-01-15T13:30:00Z" }
      ],
      content: "Công ty tôi đang có tranh chấp về việc chấm dứt hợp đồng lao động. Tôi cần tư vấn về quy trình xử lý.",
      createdAt: "2024-01-13T14:30:00Z",
      status: "pending",
    },
    {
      id: 3,
      title: "Quyền lợi của người tiêu dùng khi mua hàng online",
      author: "Lê Văn C",
      reportCount: 1,
      reports: [
        { reason: "Thông tin sai lệch", reportedBy: "User987", timestamp: "2024-01-15T16:45:00Z" }
      ],
      content: "Tôi mua hàng online nhưng nhận được sản phẩm không đúng mô tả. Xin hỏi tôi có quyền lợi gì?",
      createdAt: "2024-01-12T11:20:00Z",
      status: "pending",
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Simulate API calls
      setReportedPosts(mockReportedPosts);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} giờ trước`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} ngày trước`;
    }
  };

  const handlePostAction = (post, action) => {
    Alert.alert(
      'Xác nhận',
      action === 'ban' 
        ? `Bạn có chắc muốn cấm bài viết "${post.title}"?`
        : `Bạn có chắc muốn bỏ qua các báo cáo cho bài viết "${post.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: action === 'ban' ? 'Cấm' : 'Bỏ qua',
          style: action === 'ban' ? 'destructive' : 'default',
          onPress: () => {
            // Update post status
            const updatedPosts = reportedPosts.map(p => 
              p.id === post.id 
                ? { ...p, status: action === 'ban' ? 'banned' : 'dismissed' }
                : p
            );
            setReportedPosts(updatedPosts);
            
            Alert.alert(
              'Thành công',
              action === 'ban' 
                ? 'Bài viết đã được cấm'
                : 'Đã bỏ qua các báo cáo'
            );
          }
        }
      ]
    );
  };


  const renderReportedPost = (post) => (
    <View key={post.id} style={styles.reportedPostCard}>
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <Text style={styles.postTitle} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={styles.postAuthor}>Tác giả: {post.author}</Text>
          <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
        </View>
        
        <View style={styles.reportBadge}>
          <Ionicons name="warning" size={16} color={COLORS.WHITE} />
          <Text style={styles.reportCount}>{post.reportCount}</Text>
        </View>
      </View>

      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>

      <View style={styles.reportsSection}>
        <Text style={styles.reportsTitle}>Lý do báo cáo:</Text>
        {post.reports.slice(0, 2).map((report, index) => (
          <Text key={index} style={styles.reportReason}>
            • {report.reason} (bởi {report.reportedBy})
          </Text>
        ))}
        {post.reportCount > 2 && (
          <Text style={styles.moreReports}>
            +{post.reportCount - 2} báo cáo khác
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            setSelectedPost(post);
            setShowPostDetail(true);
          }}
        >
          <Ionicons name="eye" size={16} color={COLORS.BLUE} />
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={() => handlePostAction(post, 'dismiss')}
        >
          <Ionicons name="checkmark" size={16} color={COLORS.GREEN} />
          <Text style={styles.dismissButtonText}>Bỏ qua</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.banButton}
          onPress={() => handlePostAction(post, 'ban')}
        >
          <Ionicons name="ban" size={16} color={COLORS.WHITE} />
          <Text style={styles.banButtonText}>Cấm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReportedPosts = () => {
    const pendingPosts = reportedPosts.filter(post => post.status === 'pending');
    
    return (
      <View style={styles.reportedPostsContainer}>
        <Text style={styles.sectionTitle}>
          Bài viết bị báo cáo ({pendingPosts.length})
        </Text>
        
        {pendingPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.GREEN} />
            <Text style={styles.emptyStateText}>
              Không có bài viết nào bị báo cáo
            </Text>
          </View>
        ) : (
          pendingPosts.map(renderReportedPost)
        )}
      </View>
    );
  };

  const renderProcessedPost = (post) => (
    <View key={post.id} style={styles.processedPostCard}>
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <Text style={styles.postTitle} numberOfLines={2}>
            {post.title}
          </Text>
          <Text style={styles.postAuthor}>Tác giả: {post.author}</Text>
          <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
        </View>
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: post.status === 'banned' ? COLORS.RED : COLORS.GREEN }
        ]}>
          <Ionicons 
            name={post.status === 'banned' ? 'ban' : 'checkmark'} 
            size={16} 
            color={COLORS.WHITE} 
          />
          <Text style={styles.statusText}>
            {post.status === 'banned' ? 'Đã cấm' : 'Đã bỏ qua'}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent} numberOfLines={3}>
        {post.content}
      </Text>

      <View style={styles.reportsSection}>
        <Text style={styles.reportsTitle}>
          Đã xử lý {post.reportCount} báo cáo:
        </Text>
        {post.reports.slice(0, 2).map((report, index) => (
          <Text key={index} style={styles.reportReason}>
            • {report.reason} (bởi {report.reportedBy})
          </Text>
        ))}
        {post.reportCount > 2 && (
          <Text style={styles.moreReports}>
            +{post.reportCount - 2} báo cáo khác
          </Text>
        )}
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => {
            setSelectedPost(post);
            setShowPostDetail(true);
          }}
        >
          <Ionicons name="eye" size={16} color={COLORS.BLUE} />
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProcessedPosts = () => {
    const processedPosts = reportedPosts.filter(post => 
      post.status === 'banned' || post.status === 'dismissed'
    );
    
    return (
      <View style={styles.reportedPostsContainer}>
        <Text style={styles.sectionTitle}>
          Bài viết đã xử lý ({processedPosts.length})
        </Text>
        
        {processedPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={48} color={COLORS.GRAY} />
            <Text style={styles.emptyStateText}>
              Chưa có bài viết nào được xử lý
            </Text>
          </View>
        ) : (
          processedPosts.map(renderProcessedPost)
        )}
      </View>
    );
  };

  const renderPostDetailModal = () => (
    <Modal
      visible={showPostDetail}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPostDetail(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết bài viết</Text>
            <TouchableOpacity
              onPress={() => setShowPostDetail(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.GRAY} />
            </TouchableOpacity>
          </View>
          
          {selectedPost && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalPostTitle}>{selectedPost.title}</Text>
              <Text style={styles.modalPostAuthor}>
                Tác giả: {selectedPost.author}
              </Text>
              <Text style={styles.modalPostTime}>
                Đăng lúc: {formatTimeAgo(selectedPost.createdAt)}
              </Text>
              
              <Text style={styles.modalPostContent}>{selectedPost.content}</Text>
              
              <Text style={styles.modalReportsTitle}>
                Tất cả báo cáo ({selectedPost.reportCount}):
              </Text>
              
              {selectedPost.reports.map((report, index) => (
                <View key={index} style={styles.modalReportItem}>
                  <Text style={styles.modalReportReason}>{report.reason}</Text>
                  <Text style={styles.modalReportBy}>
                    Báo cáo bởi: {report.reportedBy}
                  </Text>
                  <Text style={styles.modalReportTime}>
                    {formatTimeAgo(report.timestamp)}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalDismissButton}
              onPress={() => {
                handlePostAction(selectedPost, 'dismiss');
                setShowPostDetail(false);
              }}
            >
              <Text style={styles.modalDismissButtonText}>Bỏ qua</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalBanButton}
              onPress={() => {
                handlePostAction(selectedPost, 'ban');
                setShowPostDetail(false);
              }}
            >
              <Text style={styles.modalBanButtonText}>Cấm bài viết</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý bài viết</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'reports' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('reports')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'reports' && styles.activeTabText
          ]}>
            Báo cáo ({reportedPosts.filter(p => p.status === 'pending').length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'processed' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('processed')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'processed' && styles.activeTabText
          ]}>
            Đã xử lý ({reportedPosts.filter(p => p.status === 'banned' || p.status === 'dismissed').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'reports' ? renderReportedPosts() : renderProcessedPosts()}
      </ScrollView>

      {renderPostDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.BLUE,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.BLUE,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  
  // Processed posts styles
  processedPostCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    opacity: 0.8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  
  // Reported posts styles
  reportedPostsContainer: {
    padding: 16,
  },
  reportedPostCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postInfo: {
    flex: 1,
    marginRight: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginBottom: 2,
  },
  postTime: {
    fontSize: 11,
    color: COLORS.GRAY,
  },
  reportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.RED,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportCount: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    lineHeight: 20,
    marginBottom: 12,
  },
  reportsSection: {
    backgroundColor: COLORS.GRAY_BG,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reportsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  reportReason: {
    fontSize: 11,
    color: COLORS.GRAY_DARK,
    marginBottom: 2,
  },
  moreReports: {
    fontSize: 11,
    color: COLORS.BLUE,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.BLUE_LIGHT,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    justifyContent: 'center',
  },
  viewButtonText: {
    color: COLORS.BLUE,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.GREEN_LIGHT,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    justifyContent: 'center',
  },
  dismissButtonText: {
    color: COLORS.GREEN,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  banButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.RED,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  banButtonText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.GRAY,
    marginTop: 16,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    maxHeight: '70%',
  },
  modalPostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  modalPostAuthor: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 4,
  },
  modalPostTime: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginBottom: 16,
  },
  modalPostContent: {
    fontSize: 14,
    color: COLORS.BLACK,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalReportsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  modalReportItem: {
    backgroundColor: COLORS.GRAY_BG,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalReportReason: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  modalReportBy: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginBottom: 2,
  },
  modalReportTime: {
    fontSize: 11,
    color: COLORS.GRAY,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
  },
  modalDismissButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.GREEN_LIGHT,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  modalDismissButtonText: {
    color: COLORS.GREEN,
    fontSize: 14,
    fontWeight: '600',
  },
  modalBanButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.RED,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  modalBanButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PostManagement;