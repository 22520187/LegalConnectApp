import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import AdminService from '../../services/AdminService';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [pendingViolations, setPendingViolations] = useState([]);
  const [processedViolations, setProcessedViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadPendingViolations();
    loadProcessedViolations();
  }, []);

  const loadUsers = async (pageNum = 0, append = false) => {
    try {
      if (pageNum === 0) {
        setLoading(true);
      }

      const response = await AdminService.getAllUsers({
        page: pageNum,
        size: 20,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });

      if (response && response.content) {
        // Map API response to UI format
        const mappedUsers = response.content.map(user => ({
          id: user.id,
          name: user.fullName || 'Không có tên',
          email: user.email || '',
          role: user.role?.toLowerCase() || 'user',
          avatar: user.avatar || 'https://via.placeholder.com/50',
          joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
          status: user.isEnabled ? 'active' : 'banned',
          postsCount: user.postsCount || 0,
          reputation: user.messagesCount || 0, // Using messagesCount as reputation for now
        }));

        if (append) {
          setUsers(prev => [...prev, ...mappedUsers]);
        } else {
          setUsers(mappedUsers);
        }

        setPage(response.number || 0);
        setTotalPages(response.totalPages || 0);
        setHasMore((response.number || 0) < (response.totalPages || 0) - 1);
      } else {
        if (!append) {
          setUsers([]);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng. Vui lòng thử lại.');
      if (!append) {
        setUsers([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    loadUsers(0, false);
  };

  const loadMore = () => {
    if (!loading && hasMore && activeTab === 'users') {
      const nextPage = page + 1;
      if (nextPage < totalPages) {
        loadUsers(nextPage, true);
      }
    }
  };

  const loadPendingViolations = () => {
    // Mock API call - Vi phạm chưa xử lý
    const mockPendingViolations = [
      {
        id: 5,
        name: 'Hoàng Văn Em',
        email: 'hoang.van.em@example.com',
        role: 'user',
        avatar: 'https://via.placeholder.com/50',
        violationType: 'spam',
        violationDate: '2024-09-25',
        violationCount: 3,
        status: 'pending',
        description: 'Đăng nội dung spam nhiều lần',
        reportedBy: 'Người dùng khác',
        reportDate: '2024-09-25',
      },
      {
        id: 6,
        name: 'Vũ Thị Phương',
        email: 'vu.thi.phuong@example.com',
        role: 'user',
        avatar: 'https://via.placeholder.com/50',
        violationType: 'inappropriate',
        violationDate: '2024-09-28',
        violationCount: 1,
        status: 'pending',
        description: 'Sử dụng ngôn từ không phù hợp trong bình luận',
        reportedBy: 'Hệ thống tự động',
        reportDate: '2024-09-28',
      },
      {
        id: 8,
        name: 'Lý Văn Hùng',
        email: 'ly.van.hung@example.com',
        role: 'user',
        avatar: 'https://via.placeholder.com/50',
        violationType: 'fake_info',
        violationDate: '2024-09-29',
        violationCount: 1,
        status: 'pending',
        description: 'Chia sẻ thông tin pháp luật không chính xác',
        reportedBy: 'Luật sư Nguyễn Văn A',
        reportDate: '2024-09-29',
      },
    ];
    setPendingViolations(mockPendingViolations);
  };

  const loadProcessedViolations = () => {
    // Mock API call - Vi phạm đã xử lý
    const mockProcessedViolations = [
      {
        id: 7,
        name: 'Đỗ Văn Giang',
        email: 'do.van.giang@example.com',
        role: 'user',
        avatar: 'https://via.placeholder.com/50',
        violationType: 'fake_info',
        violationDate: '2024-09-20',
        violationCount: 2,
        status: 'suspended',
        description: 'Cung cấp thông tin pháp luật sai lệch',
        reportedBy: 'Luật sư Trần Thị B',
        reportDate: '2024-09-20',
        processedBy: 'Admin',
        processedDate: '2024-09-21',
        processedAction: 'suspend',
        processedReason: 'Vi phạm nghiêm trọng về thông tin pháp luật',
      },
      {
        id: 9,
        name: 'Phạm Thị Mai',
        email: 'pham.thi.mai@example.com',
        role: 'user',
        avatar: 'https://via.placeholder.com/50',
        violationType: 'spam',
        violationDate: '2024-09-15',
        violationCount: 5,
        status: 'blocked',
        description: 'Đăng spam liên tục trong nhiều bài viết',
        reportedBy: 'Nhiều người dùng',
        reportDate: '2024-09-15',
        processedBy: 'Admin',
        processedDate: '2024-09-16',
        processedAction: 'block',
        processedReason: 'Spam nghiêm trọng, ảnh hưởng đến trải nghiệm người dùng',
      },
    ];
    setProcessedViolations(mockProcessedViolations);
  };

  const handleUserAction = (user, action) => {
    setSelectedUser(user);
    setSelectedAction(action);
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedUser || !selectedAction) return;

    setActionLoading(true);

    try {
      if ((selectedAction === 'ban' || selectedAction === 'unban') && activeTab === 'users') {
        const isEnabled = selectedAction === 'unban';
        
        await AdminService.updateUserStatus(selectedUser.id, isEnabled);
        
        setPage(0);
        await loadUsers(0, false);
        
        const message = isEnabled 
          ? `Đã bỏ chặn người dùng ${selectedUser.name}`
          : `Đã chặn người dùng ${selectedUser.name}`;
        
        Alert.alert('Thành công', message);
      } else {
        let message = '';
        let newStatus = '';
        
        switch (selectedAction) {
          case 'block':
            message = `Đã chặn người dùng ${selectedUser.name}`;
            newStatus = 'blocked';
            break;
          case 'suspend':
            message = `Đã khóa tài khoản ${selectedUser.name}`;
            newStatus = 'suspended';
            break;
          case 'delete':
            message = `Đã xóa tài khoản ${selectedUser.name}`;
            newStatus = 'deleted';
            break;
          case 'warn':
            message = `Đã cảnh báo người dùng ${selectedUser.name}`;
            newStatus = 'warned';
            break;
        }

        // Chuyển từ pending violations sang processed violations
        const processedViolation = {
          ...selectedUser,
          status: newStatus,
          processedBy: 'Admin',
          processedDate: new Date().toISOString().split('T')[0],
          processedAction: selectedAction,
          processedReason: actionReason || `Thực hiện hành động: ${selectedAction}`,
        };

        // Cập nhật state
        setPendingViolations(prev => prev.filter(item => item.id !== selectedUser.id));
        setProcessedViolations(prev => [processedViolation, ...prev]);

        Alert.alert('Thành công', message);
      }
    } catch (error) {
      console.error('Error performing action:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể thực hiện hành động. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setActionLoading(false);
      setShowActionModal(false);
      setSelectedUser(null);
      setSelectedAction(null);
      setActionReason('');
    }
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userTopRow}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.status !== 'banned' ? (
          <TouchableOpacity
            style={styles.banBtn}
            onPress={() => handleUserAction(item, 'ban')}
          >
            <Ionicons name="ban" size={16} color={COLORS.WHITE} />
            <Text style={styles.banBtnText}>Chặn</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.unbanBtn}
            onPress={() => handleUserAction(item, 'unban')}
          >
            <Ionicons name="checkmark-circle" size={16} color={COLORS.WHITE} />
            <Text style={styles.unbanBtnText}>Bỏ chặn</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.userDetails}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <View style={styles.userMeta}>
          <View style={[styles.roleTag, item.role === 'lawyer' && styles.lawyerTag]}>
            <Text style={[styles.roleText, item.role === 'lawyer' && styles.lawyerText]}>
              {item.role === 'lawyer' ? 'Luật sư' : 'Người dùng'}
            </Text>
          </View>
          <Text style={styles.joinDate}>Tham gia: {item.joinDate}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>Bài viết: {item.postsCount}</Text>
          <Text style={styles.statText}>Uy tín: {item.reputation}</Text>
        </View>
        {item.status === 'banned' && (
          <View style={styles.bannedIndicator}>
            <Ionicons name="ban" size={16} color={COLORS.RED} />
            <Text style={styles.bannedText}>Đã chặn</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderPendingViolationItem = ({ item }) => (
    <View style={styles.violatedUserCard}>
      <View style={styles.userInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.violationInfo}>
            <View style={[styles.violationTag, getViolationTagStyle(item.violationType)]}>
              <Text style={styles.violationText}>{getViolationTypeText(item.violationType)}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: COLORS.ORANGE_LIGHT }]}>
              <Text style={styles.statusText}>Chưa xử lý</Text>
            </View>
          </View>
          <Text style={styles.violationDesc}>{item.description}</Text>
          <Text style={styles.violationDate}>
            Vi phạm: {item.violationDate} • Số lần: {item.violationCount}
          </Text>
          <Text style={styles.reportInfo}>
            Báo cáo bởi: {item.reportedBy} • {item.reportDate}
          </Text>
        </View>
      </View>
      <View style={styles.violationActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.warnBtn]}
          onPress={() => handleUserAction(item, 'warn')}
        >
          <Ionicons name="warning" size={16} color={COLORS.ORANGE} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.blockBtn]}
          onPress={() => handleUserAction(item, 'block')}
        >
          <Ionicons name="ban" size={16} color={COLORS.RED} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.suspendBtn]}
          onPress={() => handleUserAction(item, 'suspend')}
        >
          <Ionicons name="lock-closed" size={16} color={COLORS.PURPLE} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleUserAction(item, 'delete')}
        >
          <Ionicons name="trash" size={16} color={COLORS.RED} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProcessedViolationItem = ({ item }) => (
    <View style={[styles.violatedUserCard, styles.processedCard]}>
      <View style={styles.userInfo}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.violationInfo}>
            <View style={[styles.violationTag, getViolationTagStyle(item.violationType)]}>
              <Text style={styles.violationText}>{getViolationTypeText(item.violationType)}</Text>
            </View>
            <View style={[styles.statusTag, getStatusTagStyle(item.status)]}>
              <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
            </View>
          </View>
          <Text style={styles.violationDesc}>{item.description}</Text>
          <Text style={styles.violationDate}>
            Vi phạm: {item.violationDate} • Số lần: {item.violationCount}
          </Text>
          <Text style={styles.reportInfo}>
            Báo cáo bởi: {item.reportedBy} • {item.reportDate}
          </Text>
          <View style={styles.processedInfo}>
            <Text style={styles.processedText}>
              Xử lý bởi: {item.processedBy} • {item.processedDate}
            </Text>
            <Text style={styles.processedReason}>
              Lý do: {item.processedReason}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.processedBadge}>
        <Ionicons name="checkmark-circle" size={24} color={COLORS.GREEN} />
      </View>
    </View>
  );

  const getViolationTypeText = (type) => {
    switch (type) {
      case 'spam': return 'Spam';
      case 'inappropriate': return 'Không phù hợp';
      case 'fake_info': return 'Thông tin sai';
      default: return 'Khác';
    }
  };

  const getViolationTagStyle = (type) => {
    switch (type) {
      case 'spam': return { backgroundColor: COLORS.RED_LIGHT };
      case 'inappropriate': return { backgroundColor: COLORS.ORANGE_LIGHT };
      case 'fake_info': return { backgroundColor: COLORS.YELLOW };
      default: return { backgroundColor: COLORS.GRAY_BG };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'warned': return 'Đã cảnh báo';
      case 'suspended': return 'Đã khóa';
      case 'blocked': return 'Đã chặn';
      default: return 'Không xác định';
    }
  };

  const getStatusTagStyle = (status) => {
    switch (status) {
      case 'active': return { backgroundColor: COLORS.GREEN_LIGHT };
      case 'warned': return { backgroundColor: COLORS.ORANGE_LIGHT };
      case 'suspended': return { backgroundColor: COLORS.RED_LIGHT };
      case 'blocked': return { backgroundColor: COLORS.RED_LIGHT };
      default: return { backgroundColor: COLORS.GRAY_BG };
    }
  };

  const renderTabButton = (tabKey, title, icon, count) => (
    <TouchableOpacity
      style={[styles.tab, activeTab === tabKey && styles.activeTab]}
      onPress={() => setActiveTab(tabKey)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tabKey ? COLORS.WHITE : COLORS.GRAY_DARK}
      />
      <Text style={[styles.tabText, activeTab === tabKey && styles.activeTabText]}>
        {title}
      </Text>
      {count > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý người dùng</Text>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('users', 'Danh sách người dùng', 'people', users.length)}
          {renderTabButton('pending', 'Vi phạm chưa xử lý', 'warning', pendingViolations.length)}
          {renderTabButton('processed', 'Vi phạm đã xử lý', 'checkmark-circle', processedViolations.length)}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {activeTab === 'users' ? (
          loading && page === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.BLUE} />
              <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUserItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="people" size={64} color={COLORS.GRAY} />
                  <Text style={styles.emptyText}>Không có người dùng nào</Text>
                </View>
              }
              ListFooterComponent={
                loading && page > 0 ? (
                  <View style={styles.loadMoreContainer}>
                    <ActivityIndicator size="small" color={COLORS.BLUE} />
                    <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
                  </View>
                ) : null
              }
            />
          )
        ) : activeTab === 'pending' ? (
          <FlatList
            data={pendingViolations}
            renderItem={renderPendingViolationItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle" size={64} color={COLORS.GREEN} />
                <Text style={styles.emptyText}>Không có vi phạm nào cần xử lý</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={processedViolations}
            renderItem={renderProcessedViolationItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text" size={64} color={COLORS.GRAY} />
                <Text style={styles.emptyText}>Chưa có vi phạm nào được xử lý</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác nhận hành động</Text>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn thực hiện hành động này với người dùng {selectedUser?.name}?
            </Text>
            
            <TextInput
              style={styles.reasonInput}
              placeholder="Nhập lý do (tùy chọn)"
              value={actionReason}
              onChangeText={setActionReason}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn, actionLoading && styles.disabledBtn]}
                onPress={() => !actionLoading && setShowActionModal(false)}
                disabled={actionLoading}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn, actionLoading && styles.disabledBtn]}
                onPress={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <View style={styles.loadingButtonContent}>
                    <ActivityIndicator size="small" color={COLORS.WHITE} />
                    <Text style={[styles.confirmBtnText, { marginLeft: 8 }]}>Đang xử lý...</Text>
                  </View>
                ) : (
                  <Text style={styles.confirmBtnText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    borderBottomColor: COLORS.GRAY_BG,
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY_BG,
  },
  activeTab: {
    backgroundColor: COLORS.BLUE,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.GRAY_DARK,
    marginLeft: 6,
  },
  activeTabText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: COLORS.RED,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  countText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  violatedUserCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.RED,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: COLORS.BLUE,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleTag: {
    backgroundColor: COLORS.BLUE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  lawyerTag: {
    backgroundColor: COLORS.GREEN_LIGHT,
  },
  roleText: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  lawyerText: {
    color: COLORS.GREEN,
  },
  joinDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statText: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginRight: 16,
  },
  violationInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  violationTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  violationText: {
    fontSize: 12,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.BLACK,
    fontWeight: '500',
  },
  violationDesc: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 4,
  },
  violationDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  banBtn: {
    backgroundColor: COLORS.RED,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  banBtnText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  unbanBtn: {
    backgroundColor: COLORS.GREEN,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  unbanBtnText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  bannedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.RED_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  bannedText: {
    color: COLORS.RED,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  bannedBadge: {
    backgroundColor: COLORS.RED_LIGHT,
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  violationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  viewBtn: {
    backgroundColor: COLORS.BLUE_LIGHT,
  },
  editBtn: {
    backgroundColor: COLORS.ORANGE_LIGHT,
  },
  warnBtn: {
    backgroundColor: COLORS.ORANGE_LIGHT,
  },
  blockBtn: {
    backgroundColor: COLORS.RED_LIGHT,
  },
  suspendBtn: {
    backgroundColor: COLORS.PURPLE + '20',
  },
  deleteBtn: {
    backgroundColor: COLORS.RED_LIGHT,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 16,
    textAlign: 'center',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.GRAY_BG,
    marginRight: 8,
  },
  confirmBtn: {
    backgroundColor: COLORS.RED,
    marginLeft: 8,
  },
  cancelBtnText: {
    color: COLORS.GRAY_DARK,
    fontWeight: '500',
  },
  confirmBtnText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processedCard: {
    borderLeftColor: COLORS.GREEN,
    opacity: 0.8,
  },
  reportInfo: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginBottom: 8,
  },
  processedInfo: {
    backgroundColor: COLORS.GREEN_LIGHT,
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  processedText: {
    fontSize: 12,
    color: COLORS.GREEN,
    fontWeight: '500',
    marginBottom: 4,
  },
  processedReason: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    fontStyle: 'italic',
  },
  processedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.GRAY,
    marginTop: 16,
    textAlign: 'center',
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
});

export default UserManagement;