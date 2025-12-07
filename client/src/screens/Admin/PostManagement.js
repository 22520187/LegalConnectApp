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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import AdminService from '../../services/AdminService';

const { width } = Dimensions.get('window');

const PostManagement = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('reports');
  const [reportedPosts, setReportedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPostDetail, setShowPostDetail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  useEffect(() => {
    setPage(0);
    setReportedPosts([]);
    loadData(0, selectedTab === 'reports' ? true : false);
  }, [selectedTab]);

  // Load counts for both tabs on initial mount
  useEffect(() => {
    const loadInitialCounts = async () => {
      try {
        // Load pending count (isActive = true)
        const pendingResponse = await AdminService.getViolationPosts({
          page: 0,
          size: 1,
          isActive: true,
        });
        if (pendingResponse && pendingResponse.totalElements !== undefined) {
          setPendingCount(pendingResponse.totalElements);
        }

        // Load processed count (isActive = false)
        const processedResponse = await AdminService.getViolationPosts({
          page: 0,
          size: 1,
          isActive: false,
        });
        if (processedResponse && processedResponse.totalElements !== undefined) {
          setProcessedCount(processedResponse.totalElements);
        }
      } catch (error) {
        console.error('Error loading initial counts:', error);
      }
    };

    loadInitialCounts();
  }, []);

  const loadData = async (pageNum = 0, isActive = null) => {
    try {
      setLoading(true);

      const activeFilter = selectedTab === 'reports' ? true : false;
      
      const response = await AdminService.getViolationPosts({
        page: pageNum,
        size: 20,
        sortBy: 'createdAt',
        sortDir: 'desc',
        isActive: activeFilter,
      });

      if (response && response.content) {
        // Map API response to UI format
        const mappedPosts = response.content.map(post => ({
          id: post.id,
          title: post.title || 'Không có tiêu đề',
          author: post.author?.fullName || post.author?.email || 'Không xác định',
          reportCount: post.reportCount || 0,
          reports: (post.reportReasons || []).map((reason, index) => ({
            reason: reason || 'Không có lý do',
            reportedBy: `User${index + 1}`,
            timestamp: post.createdAt || new Date().toISOString(),
          })),
          content: post.content || '',
          createdAt: post.createdAt || new Date().toISOString(),
          status: post.isActive ? 'pending' : 'banned', // Map isActive to status
          categoryName: post.categoryName,
          views: post.views || 0,
          replyCount: post.replyCount || 0,
          violationReason: post.violationReason,
          isReported: post.isReported,
        }));

        if (pageNum === 0) {
          setReportedPosts(mappedPosts);
        } else {
          setReportedPosts(prev => [...prev, ...mappedPosts]);
        }
        
        setPage(response.number || 0);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        
        // Update counts based on active filter
        if (activeFilter) {
          setPendingCount(response.totalElements || 0);
        } else {
          setProcessedCount(response.totalElements || 0);
        }
      } else {
        setReportedPosts([]);
      }
    } catch (error) {
      console.error('Error loading violation posts:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
      setReportedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(0, selectedTab === 'reports' ? true : false);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loading && page < totalPages - 1) {
      loadData(page + 1, selectedTab === 'reports' ? true : false);
    }
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

  const handlePostAction = async (post, action) => {
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
          onPress: async () => {
            try {
              // Gọi API để cập nhật trạng thái bài viết
              // Ban = set isActive = false (bài viết bị vô hiệu hóa)
              // Dismiss = giữ nguyên isActive = true (bài viết vẫn hoạt động)
              const isActive = action === 'ban' ? false : true;
              
              await AdminService.updatePostStatus(post.id, isActive);
              
              Alert.alert(
                'Thành công',
                action === 'ban' 
                  ? 'Bài viết đã được cấm'
                  : 'Đã bỏ qua các báo cáo'
              );
              
              // Reload counts for both tabs
              const reloadCounts = async () => {
                try {
                  const pendingResponse = await AdminService.getViolationPosts({
                    page: 0,
                    size: 1,
                    isActive: true,
                  });
                  if (pendingResponse && pendingResponse.totalElements !== undefined) {
                    setPendingCount(pendingResponse.totalElements);
                  }

                  const processedResponse = await AdminService.getViolationPosts({
                    page: 0,
                    size: 1,
                    isActive: false,
                  });
                  if (processedResponse && processedResponse.totalElements !== undefined) {
                    setProcessedCount(processedResponse.totalElements);
                  }
                } catch (error) {
                  console.error('Error reloading counts:', error);
                }
              };

              // Reload data after action
              setTimeout(() => {
                loadData(0, selectedTab === 'reports' ? true : false);
                reloadCounts();
              }, 500);
            } catch (error) {
              console.error('Error handling post action:', error);
              const errorMessage = error.response?.data?.message || error.message || 'Không thể thực hiện thao tác';
              Alert.alert('Lỗi', errorMessage);
            }
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

      {post.reportCount > 0 && (
        <View style={styles.reportsSection}>
          <Text style={styles.reportsTitle}>Lý do báo cáo ({post.reportCount}):</Text>
          {post.reports && post.reports.length > 0 ? (
            <>
              {post.reports.slice(0, 2).map((report, index) => (
                <Text key={index} style={styles.reportReason}>
                  • {report.reason}
                </Text>
              ))}
              {post.reportCount > 2 && (
                <Text style={styles.moreReports}>
                  +{post.reportCount - 2} báo cáo khác
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.reportReason}>Không có thông tin chi tiết</Text>
          )}
        </View>
      )}

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
    return (
      <View style={styles.reportedPostsContainer}>
        <Text style={styles.sectionTitle}>
          Bài viết bị báo cáo ({reportedPosts.length})
        </Text>
        
        {reportedPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color={COLORS.GREEN} />
            <Text style={styles.emptyStateText}>
              Không có bài viết nào bị báo cáo
            </Text>
          </View>
        ) : (
          reportedPosts.map(renderReportedPost)
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

      {post.reportCount > 0 && (
        <View style={styles.reportsSection}>
          <Text style={styles.reportsTitle}>
            Đã xử lý {post.reportCount} báo cáo:
          </Text>
          {post.reports && post.reports.length > 0 ? (
            <>
              {post.reports.slice(0, 2).map((report, index) => (
                <Text key={index} style={styles.reportReason}>
                  • {report.reason}
                </Text>
              ))}
              {post.reportCount > 2 && (
                <Text style={styles.moreReports}>
                  +{post.reportCount - 2} báo cáo khác
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.reportReason}>Không có thông tin chi tiết</Text>
          )}
        </View>
      )}

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
    return (
      <View style={styles.reportedPostsContainer}>
        <Text style={styles.sectionTitle}>
          Bài viết đã xử lý ({reportedPosts.length})
        </Text>
        
        {reportedPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={48} color={COLORS.GRAY} />
            <Text style={styles.emptyStateText}>
              Chưa có bài viết nào được xử lý
            </Text>
          </View>
        ) : (
          reportedPosts.map(renderProcessedPost)
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
              
              {selectedPost.categoryName && (
                <View style={styles.modalCategory}>
                  <Text style={styles.modalCategoryText}>
                    Danh mục: {selectedPost.categoryName}
                  </Text>
                </View>
              )}
              
              <View style={styles.modalStats}>
                <Text style={styles.modalStatText}>
                  Lượt xem: {selectedPost.views || 0}
                </Text>
                <Text style={styles.modalStatText}>
                  Trả lời: {selectedPost.replyCount || 0}
                </Text>
              </View>
              
              {selectedPost.reportCount > 0 && (
                <>
                  <Text style={styles.modalReportsTitle}>
                    Tất cả báo cáo ({selectedPost.reportCount}):
                  </Text>
                  
                  {selectedPost.reports && selectedPost.reports.length > 0 ? (
                    selectedPost.reports.map((report, index) => (
                      <View key={index} style={styles.modalReportItem}>
                        <Text style={styles.modalReportReason}>{report.reason}</Text>
                        {report.reportedBy && (
                          <Text style={styles.modalReportBy}>
                            Báo cáo bởi: {report.reportedBy}
                          </Text>
                        )}
                        {report.timestamp && (
                          <Text style={styles.modalReportTime}>
                            {formatTimeAgo(report.timestamp)}
                          </Text>
                        )}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.modalReportReason}>
                      Không có thông tin chi tiết về báo cáo
                    </Text>
                  )}
                </>
              )}
              
              {selectedPost.violationReason && (
                <View style={styles.modalViolationReason}>
                  <Text style={styles.modalViolationReasonTitle}>
                    Lý do vi phạm (Admin):
                  </Text>
                  <Text style={styles.modalViolationReasonText}>
                    {selectedPost.violationReason}
                  </Text>
                </View>
              )}
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
            Báo cáo
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
            Đã xử lý
          </Text>
        </TouchableOpacity>
      </View>

      {loading && page === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.BLUE} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {selectedTab === 'reports' ? renderReportedPosts() : renderProcessedPosts()}
          {loading && page > 0 && (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={COLORS.BLUE} />
              <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
            </View>
          )}
        </ScrollView>
      )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  loadMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.GRAY,
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
  modalCategory: {
    backgroundColor: COLORS.GRAY_BG,
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  modalCategoryText: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    fontWeight: '500',
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginBottom: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  modalStatText: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
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
  modalViolationReason: {
    backgroundColor: COLORS.RED_LIGHT || '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  modalViolationReasonTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.RED,
    marginBottom: 4,
  },
  modalViolationReasonText: {
    fontSize: 12,
    color: COLORS.BLACK,
    lineHeight: 18,
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