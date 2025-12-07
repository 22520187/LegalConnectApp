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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import AdminService from '../../services/AdminService';

const LawyerManagement = () => {
  const [activeTab, setActiveTab] = useState('lawyers');
  const [lawyers, setLawyers] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [processedApplications, setProcessedApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLawyers(),
        loadPendingApplications(),
        loadProcessedApplications(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadLawyers = async () => {
    try {
      const [applicationsResponse, usersResponse] = await Promise.all([
        AdminService.getLawyerApplications({
          status: 'APPROVED',
          page: 0,
          size: 100,
          sortBy: 'reviewedAt',
          sortDir: 'desc',
        }),
        AdminService.getAllUsers({
          role: 'LAWYER',
          page: 0,
          size: 100,
          sortBy: 'createdAt',
          sortDir: 'desc',
        }),
      ]);

      const userStatusMap = new Map();
      usersResponse.content.forEach(user => {
        userStatusMap.set(user.id, user.isEnabled);
      });

      const lawyersData = applicationsResponse.content.map(app => ({
        id: app.user?.id,
        name: app.user?.fullName || 'Chưa có tên',
        email: app.user?.email || '',
        phone: app.phoneNumber || 'Chưa có số điện thoại',
        avatar: app.user?.avatar || 'https://via.placeholder.com/50',
        specialization: app.specializations?.join(', ') || 'Chưa có thông tin',
        experience: app.yearsOfExperience ? `${app.yearsOfExperience} năm kinh nghiệm` : 'Chưa có thông tin',
        education: app.lawSchool ? `${app.lawSchool}${app.graduationYear ? ` (${app.graduationYear})` : ''}` : 'Chưa có thông tin',
        joinDate: app.reviewedAt ? new Date(app.reviewedAt).toISOString().split('T')[0] : (app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : ''),
        status: userStatusMap.get(app.user?.id) !== undefined 
          ? (userStatusMap.get(app.user?.id) ? 'active' : 'suspended')
          : 'active',
        casesHandled: 0,
        rating: 0,
        verified: true,
      }));
      setLawyers(lawyersData);
    } catch (error) {
      console.error('Error loading lawyers:', error);
      setLawyers([]);
    }
  };

  const loadPendingApplications = async () => {
    try {
      const response = await AdminService.getLawyerApplications({
        status: 'PENDING',
        page: 0,
        size: 100,
        sortBy: 'createdAt',
        sortDir: 'desc',
      });
      const applications = response.content.map(app => ({
        id: app.id,
        name: app.user?.fullName || 'Chưa có tên',
        email: app.user?.email || '',
        phone: app.phoneNumber || 'Chưa có số điện thoại',
        avatar: app.user?.avatar || 'https://via.placeholder.com/50',
        specialization: app.specializations?.join(', ') || 'Chưa có thông tin',
        experience: app.yearsOfExperience ? `${app.yearsOfExperience} năm kinh nghiệm` : 'Chưa có thông tin',
        education: app.lawSchool ? `${app.lawSchool}${app.graduationYear ? ` (${app.graduationYear})` : ''}` : 'Chưa có thông tin',
        applicationDate: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : '',
        status: 'pending',
        documents: {
          documentUrls: app.documentUrls || [],
        },
        additionalInfo: app.bio || 'Không có thông tin bổ sung',
        licenseNumber: app.licenseNumber,
        currentFirm: app.currentFirm,
        officeAddress: app.officeAddress,
      }));
      setPendingApplications(applications);
    } catch (error) {
      console.error('Error loading pending applications:', error);
      setPendingApplications([]);
    }
  };

  const loadProcessedApplications = async () => {
    try {
      const [approvedResponse, rejectedResponse] = await Promise.all([
        AdminService.getLawyerApplications({
          status: 'APPROVED',
          page: 0,
          size: 100,
          sortBy: 'reviewedAt',
          sortDir: 'desc',
        }),
        AdminService.getLawyerApplications({
          status: 'REJECTED',
          page: 0,
          size: 100,
          sortBy: 'reviewedAt',
          sortDir: 'desc',
        }),
      ]);
      
      const approved = approvedResponse.content.map(app => ({
        id: app.id,
        name: app.user?.fullName || 'Chưa có tên',
        email: app.user?.email || '',
        phone: app.phoneNumber || 'Chưa có số điện thoại',
        avatar: app.user?.avatar || 'https://via.placeholder.com/50',
        specialization: app.specializations?.join(', ') || 'Chưa có thông tin',
        experience: app.yearsOfExperience ? `${app.yearsOfExperience} năm kinh nghiệm` : 'Chưa có thông tin',
        education: app.lawSchool ? `${app.lawSchool}${app.graduationYear ? ` (${app.graduationYear})` : ''}` : 'Chưa có thông tin',
        applicationDate: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : '',
        status: 'approved',
        processedBy: 'Admin',
        processedDate: app.reviewedAt ? new Date(app.reviewedAt).toISOString().split('T')[0] : '',
        processedReason: app.adminNotes || 'Đơn xin đã được phê duyệt',
        documents: {
          documentUrls: app.documentUrls || [],
        },
        additionalInfo: app.bio || 'Không có thông tin bổ sung',
      }));

      const rejected = rejectedResponse.content.map(app => ({
        id: app.id,
        name: app.user?.fullName || 'Chưa có tên',
        email: app.user?.email || '',
        phone: app.phoneNumber || 'Chưa có số điện thoại',
        avatar: app.user?.avatar || 'https://via.placeholder.com/50',
        specialization: app.specializations?.join(', ') || 'Chưa có thông tin',
        experience: app.yearsOfExperience ? `${app.yearsOfExperience} năm kinh nghiệm` : 'Chưa có thông tin',
        education: app.lawSchool ? `${app.lawSchool}${app.graduationYear ? ` (${app.graduationYear})` : ''}` : 'Chưa có thông tin',
        applicationDate: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : '',
        status: 'rejected',
        processedBy: 'Admin',
        processedDate: app.reviewedAt ? new Date(app.reviewedAt).toISOString().split('T')[0] : '',
        processedReason: app.adminNotes || 'Đơn xin đã bị từ chối',
        documents: {
          documentUrls: app.documentUrls || [],
        },
        additionalInfo: app.bio || 'Không có thông tin bổ sung',
      }));

      setProcessedApplications([...approved, ...rejected]);
    } catch (error) {
      console.error('Error loading processed applications:', error);
      setProcessedApplications([]);
    }
  };

  const handleLawyerAction = async (lawyer, action) => {
    Alert.alert(
      'Xác nhận',
      `Bạn có chắc chắn muốn ${action === 'suspend' ? 'tạm khóa' : 'kích hoạt'} luật sư ${lawyer.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            try {
              setLoading(true);
              const isEnabled = action === 'activate';
              await AdminService.updateUserStatus(lawyer.id, isEnabled);
              
              const newStatus = action === 'suspend' ? 'suspended' : 'active';
              setLawyers(prev => prev.map(l => 
                l.id === lawyer.id ? { ...l, status: newStatus } : l
              ));
              Alert.alert('Thành công', `Đã ${action === 'suspend' ? 'tạm khóa' : 'kích hoạt'} luật sư ${lawyer.name}`);
            } catch (error) {
              console.error('Error updating lawyer status:', error);
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái luật sư. Vui lòng thử lại.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleApplicationAction = (application, action) => {
    setSelectedApplication(application);
    setSelectedAction(action);
    setShowActionModal(true);
  };

  const confirmApplicationAction = async () => {
    if (!selectedApplication || !selectedAction) return;

    // Require reason for rejection
    if (selectedAction === 'rejected' && !actionReason.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setLoading(true);
      
      if (selectedAction === 'approved') {
        await AdminService.approveLawyerApplication(selectedApplication.id, actionReason || null);
      } else {
        await AdminService.rejectLawyerApplication(selectedApplication.id, actionReason || null);
      }

      // Reload data after action
      await Promise.all([
        loadLawyers(),
        loadPendingApplications(),
        loadProcessedApplications(),
      ]);

      Alert.alert('Thành công', `Đơn xin của ${selectedApplication.name} đã được ${selectedAction === 'approved' ? 'phê duyệt' : 'từ chối'}`);
      setShowActionModal(false);
      setSelectedApplication(null);
      setSelectedAction(null);
      setActionReason('');
    } catch (error) {
      console.error('Error processing application:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể xử lý đơn xin. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderLawyerItem = ({ item }) => (
    <View style={styles.lawyerCard}>
      <View style={styles.lawyerHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.lawyerInfo}>
          <Text style={styles.lawyerName}>{item.name}</Text>
          <Text style={styles.lawyerEmail}>{item.email}</Text>
          <Text style={styles.lawyerPhone}>{item.phone}</Text>
        </View>
        <View style={styles.lawyerActions}>
          {item.status === 'active' ? (
            <TouchableOpacity
              style={styles.suspendBtn}
              onPress={() => handleLawyerAction(item, 'suspend')}
            >
              <Ionicons name="pause-circle" size={16} color={COLORS.WHITE} />
              <Text style={styles.suspendBtnText}>Tạm khóa</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.activateBtn}
              onPress={() => handleLawyerAction(item, 'activate')}
            >
              <Ionicons name="play-circle" size={16} color={COLORS.WHITE} />
              <Text style={styles.activateBtnText}>Kích hoạt</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.lawyerDetails}>
        <Text style={styles.specialization}>{item.specialization}</Text>
        <Text style={styles.experience}>{item.experience}</Text>
        <Text style={styles.education}>{item.education}</Text>
        
        <View style={styles.lawyerStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.casesHandled}</Text>
            <Text style={styles.statLabel}>Vụ việc</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{item.rating}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.joinDate}>Tham gia: {item.joinDate}</Text>
          </View>
        </View>
        
        {item.status === 'suspended' && (
          <View style={styles.suspendedIndicator}>
            <Ionicons name="pause-circle" size={16} color={COLORS.ORANGE} />
            <Text style={styles.suspendedText}>Đã tạm khóa</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderPendingApplicationItem = ({ item }) => (
    <View style={styles.applicationCard}>
      <View style={styles.applicationHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.applicationInfo}>
          <Text style={styles.applicantName}>{item.name}</Text>
          <Text style={styles.applicantEmail}>{item.email}</Text>
          <Text style={styles.applicantPhone}>{item.phone}</Text>
          <Text style={styles.applicationDate}>Nộp đơn: {item.applicationDate}</Text>
        </View>
        <View style={styles.pendingBadge}>
          <Ionicons name="time" size={16} color={COLORS.WHITE} />
          <Text style={styles.pendingText}>Chờ duyệt</Text>
        </View>
      </View>
      
      <View style={styles.applicationDetails}>
        <Text style={styles.specialization}>{item.specialization}</Text>
        <Text style={styles.experience}>{item.experience}</Text>
        <Text style={styles.education}>{item.education}</Text>
        <Text style={styles.additionalInfo} numberOfLines={3}>{item.additionalInfo}</Text>
        
        <View style={styles.documentsSection}>
          <Text style={styles.documentsTitle}>Tài liệu đính kèm:</Text>
          <View style={styles.documentsList}>
            {item.documents?.documentUrls && item.documents.documentUrls.length > 0 ? (
              item.documents.documentUrls.map((url, index) => (
                <Text key={index} style={styles.documentItem}>• {url}</Text>
              ))
            ) : (
              <Text style={styles.documentItem}>• Không có tài liệu đính kèm</Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.applicationActions}>
        <TouchableOpacity
          style={styles.viewDetailBtn}
          onPress={() => {
            setSelectedApplication(item);
            setShowApplicationDetail(true);
          }}
        >
          <Ionicons name="eye" size={16} color={COLORS.BLUE} />
          <Text style={styles.viewDetailText}>Chi tiết</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleApplicationAction(item, 'rejected')}
        >
          <Ionicons name="close-circle" size={16} color={COLORS.WHITE} />
          <Text style={styles.rejectBtnText}>Từ chối</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => handleApplicationAction(item, 'approved')}
        >
          <Ionicons name="checkmark-circle" size={16} color={COLORS.WHITE} />
          <Text style={styles.approveBtnText}>Phê duyệt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProcessedApplicationItem = ({ item }) => (
    <View style={[styles.applicationCard, styles.processedCard]}>
      <View style={styles.applicationHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.applicationInfo}>
          <Text style={styles.applicantName}>{item.name}</Text>
          <Text style={styles.applicantEmail}>{item.email}</Text>
          <Text style={styles.applicantPhone}>{item.phone}</Text>
          <Text style={styles.applicationDate}>Nộp đơn: {item.applicationDate}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'approved' ? COLORS.GREEN : COLORS.RED }
        ]}>
          <Ionicons 
            name={item.status === 'approved' ? 'checkmark-circle' : 'close-circle'} 
            size={16} 
            color={COLORS.WHITE} 
          />
          <Text style={styles.statusText}>
            {item.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
          </Text>
        </View>
      </View>
      
      <View style={styles.applicationDetails}>
        <Text style={styles.specialization}>{item.specialization}</Text>
        <Text style={styles.experience}>{item.experience}</Text>
        <Text style={styles.education}>{item.education}</Text>
        
        <View style={styles.processedInfo}>
          <Text style={styles.processedText}>
            Xử lý bởi: {item.processedBy} • {item.processedDate}
          </Text>
          <Text style={styles.processedReason}>
            Lý do: {item.processedReason}
          </Text>
        </View>
      </View>
      
      <View style={styles.applicationActions}>
        <TouchableOpacity
          style={styles.viewDetailBtn}
          onPress={() => {
            setSelectedApplication(item);
            setShowApplicationDetail(true);
          }}
        >
          <Ionicons name="eye" size={16} color={COLORS.BLUE} />
          <Text style={styles.viewDetailText}>Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Quản lý luật sư</Text>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderTabButton('lawyers', 'Danh sách luật sư', 'people', lawyers.length)}
          {renderTabButton('pending', 'Đơn chờ duyệt', 'time', pendingApplications.length)}
          {renderTabButton('processed', 'Đơn đã xử lý', 'checkmark-circle', processedApplications.length)}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.BLUE} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}
        {!loading && activeTab === 'lawyers' ? (
          <FlatList
            data={lawyers}
            renderItem={renderLawyerItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshing={loading}
            onRefresh={loadLawyers}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people" size={64} color={COLORS.GRAY} />
                <Text style={styles.emptyText}>Chưa có luật sư nào</Text>
              </View>
            }
          />
        ) : !loading && activeTab === 'pending' ? (
          <FlatList
            data={pendingApplications}
            renderItem={renderPendingApplicationItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshing={loading}
            onRefresh={loadPendingApplications}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle" size={64} color={COLORS.GREEN} />
                <Text style={styles.emptyText}>Không có đơn xin nào cần xử lý</Text>
              </View>
            }
          />
        ) : !loading ? (
          <FlatList
            data={processedApplications}
            renderItem={renderProcessedApplicationItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshing={loading}
            onRefresh={loadProcessedApplications}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text" size={64} color={COLORS.GRAY} />
                <Text style={styles.emptyText}>Chưa có đơn xin nào được xử lý</Text>
              </View>
            }
          />
        ) : null}
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
            <Text style={styles.modalTitle}>
              {selectedAction === 'approved' ? 'Phê duyệt đơn xin' : 'Từ chối đơn xin'}
            </Text>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn {selectedAction === 'approved' ? 'phê duyệt' : 'từ chối'} đơn xin của {selectedApplication?.name}?
            </Text>
            
            <TextInput
              style={styles.reasonInput}
              placeholder={selectedAction === 'approved' ? 'Nhập lý do phê duyệt (tùy chọn)' : 'Nhập lý do từ chối (bắt buộc)'}
              value={actionReason}
              onChangeText={setActionReason}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => {
                  setShowActionModal(false);
                  setActionReason('');
                }}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn, 
                  selectedAction === 'approved' ? styles.approveBtn : styles.rejectBtn,
                  selectedAction === 'rejected' && !actionReason.trim() && styles.disabledBtn
                ]}
                onPress={confirmApplicationAction}
                disabled={selectedAction === 'rejected' && !actionReason.trim()}
              >
                <Text style={[styles.confirmBtnText, { color: COLORS.WHITE }]}>
                  {selectedAction === 'approved' ? 'Phê duyệt' : 'Từ chối'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Application Detail Modal */}
      <Modal
        visible={showApplicationDetail}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowApplicationDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn xin</Text>
              <TouchableOpacity
                onPress={() => setShowApplicationDetail(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.GRAY} />
              </TouchableOpacity>
            </View>
            
            {selectedApplication && (
              <ScrollView style={styles.detailModalBody}>
                <View style={styles.applicantProfile}>
                  <Image source={{ uri: selectedApplication.avatar }} style={styles.detailAvatar} />
                  <Text style={styles.detailName}>{selectedApplication.name}</Text>
                  <Text style={styles.detailEmail}>{selectedApplication.email}</Text>
                  <Text style={styles.detailPhone}>{selectedApplication.phone}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Chuyên môn</Text>
                  <Text style={styles.detailSectionContent}>{selectedApplication.specialization}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Kinh nghiệm</Text>
                  <Text style={styles.detailSectionContent}>{selectedApplication.experience}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Học vấn</Text>
                  <Text style={styles.detailSectionContent}>{selectedApplication.education}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Thông tin bổ sung</Text>
                  <Text style={styles.detailSectionContent}>{selectedApplication.additionalInfo}</Text>
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.detailSectionTitle}>Tài liệu đính kèm</Text>
                  <View style={styles.documentsList}>
                    {selectedApplication.documents?.documentUrls && selectedApplication.documents.documentUrls.length > 0 ? (
                      selectedApplication.documents.documentUrls.map((url, index) => (
                        <Text key={index} style={styles.documentItem}>• {url}</Text>
                      ))
                    ) : (
                      <Text style={styles.documentItem}>• Không có tài liệu đính kèm</Text>
                    )}
                  </View>
                </View>
                
                {selectedApplication.licenseNumber && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Số chứng chỉ hành nghề</Text>
                    <Text style={styles.detailSectionContent}>{selectedApplication.licenseNumber}</Text>
                  </View>
                )}
                
                {selectedApplication.currentFirm && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Văn phòng luật sư hiện tại</Text>
                    <Text style={styles.detailSectionContent}>{selectedApplication.currentFirm}</Text>
                  </View>
                )}
                
                {selectedApplication.officeAddress && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Địa chỉ văn phòng</Text>
                    <Text style={styles.detailSectionContent}>{selectedApplication.officeAddress}</Text>
                  </View>
                )}
                
                {selectedApplication.status !== 'pending' && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Thông tin xử lý</Text>
                    <Text style={styles.detailSectionContent}>
                      Xử lý bởi: {selectedApplication.processedBy}
                    </Text>
                    <Text style={styles.detailSectionContent}>
                      Ngày xử lý: {selectedApplication.processedDate}
                    </Text>
                    <Text style={styles.detailSectionContent}>
                      Lý do: {selectedApplication.processedReason}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
            
            {selectedApplication?.status === 'pending' && (
              <View style={styles.detailModalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.rejectBtn]}
                  onPress={() => {
                    setShowApplicationDetail(false);
                    handleApplicationAction(selectedApplication, 'rejected');
                  }}
                >
                  <Text style={styles.confirmBtnText}>Từ chối</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalBtn, styles.approveBtn]}
                  onPress={() => {
                    setShowApplicationDetail(false);
                    handleApplicationAction(selectedApplication, 'approved');
                  }}
                >
                  <Text style={styles.confirmBtnText}>Phê duyệt</Text>
                </TouchableOpacity>
              </View>
            )}
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
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.GRAY,
    marginTop: 12,
  },

  // Lawyer Card Styles
  lawyerCard: {
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
  lawyerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: COLORS.BLUE,
  },
  lawyerInfo: {
    flex: 1,
  },
  lawyerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  lawyerEmail: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  lawyerPhone: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  lawyerActions: {
    alignItems: 'flex-end',
  },
  suspendBtn: {
    backgroundColor: COLORS.ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  suspendBtnText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  activateBtn: {
    backgroundColor: COLORS.GREEN,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  activateBtnText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  lawyerDetails: {
    marginTop: 8,
  },
  specialization: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLUE,
    marginBottom: 4,
  },
  experience: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    marginBottom: 2,
  },
  education: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    marginBottom: 8,
  },
  lawyerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statItem: {
    marginRight: 16,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  joinDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  suspendedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ORANGE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  suspendedText: {
    color: COLORS.ORANGE,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Application Card Styles
  applicationCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.ORANGE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  processedCard: {
    borderLeftColor: COLORS.GREEN,
    opacity: 0.9,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 2,
  },
  applicantEmail: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  applicantPhone: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  applicationDate: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ORANGE,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
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
  applicationDetails: {
    marginBottom: 12,
  },
  additionalInfo: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 8,
    lineHeight: 20,
  },
  documentsSection: {
    backgroundColor: COLORS.GRAY_BG,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  documentsList: {
    marginLeft: 8,
  },
  documentItem: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    marginBottom: 2,
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
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewDetailBtn: {
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
  viewDetailText: {
    color: COLORS.BLUE,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.RED,
    borderRadius: 6,
    flex: 1,
    marginRight: 6,
    justifyContent: 'center',
  },
  rejectBtnText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.GREEN,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
  },
  approveBtnText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Modal Styles
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
  cancelBtnText: {
    color: COLORS.GRAY_DARK,
    fontWeight: '500',
  },
  confirmBtnText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
  disabledBtn: {
    opacity: 0.5,
  },

  // Detail Modal Styles
  detailModalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 16,
    width: '95%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  detailModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  closeButton: {
    padding: 4,
  },
  detailModalBody: {
    padding: 16,
    maxHeight: '75%',
  },
  applicantProfile: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: COLORS.BLUE,
  },
  detailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  detailEmail: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginBottom: 2,
  },
  detailPhone: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 6,
  },
  detailSectionContent: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    lineHeight: 20,
    marginBottom: 4,
  },
  detailModalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_BG,
  },
});

export default LawyerManagement;