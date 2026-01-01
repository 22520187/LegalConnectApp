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
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import AdminService from '../../services/AdminService';

const { width } = Dimensions.get('window');

const CategoryManagement = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    displayOrder: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories(0);
  }, []);

  const loadCategories = async (pageNum = 0) => {
    try {
      setLoading(true);

      const response = await AdminService.getAllCategories({
        page: pageNum,
        size: 20,
        sortBy: 'displayOrder',
        sortDir: 'asc',
        search: searchQuery || null,
      });

      if (response && response.content) {
        if (pageNum === 0) {
          setCategories(response.content);
        } else {
          setCategories(prev => [...prev, ...response.content]);
        }
        setPage(response.number || pageNum);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tải danh sách danh mục';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    setCategories([]);
    loadCategories(0);
  };

  const handleSearch = () => {
    setPage(0);
    setCategories([]);
    loadCategories(0);
  };

  const loadMore = () => {
    if (!loading && page < totalPages - 1) {
      loadCategories(page + 1);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      displayOrder: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || '',
      displayOrder: category.displayOrder?.toString() || '',
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      displayOrder: '',
      isActive: true,
    });
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name),
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || formData.name.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập tên danh mục');
      return;
    }

    if (!formData.slug || formData.slug.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng nhập slug danh mục');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description?.trim() || null,
        icon: formData.icon?.trim() || null,
        displayOrder: formData.displayOrder ? parseInt(formData.displayOrder) : null,
        isActive: formData.isActive,
      };

      if (editingCategory) {
        await AdminService.updateCategory(editingCategory.id, submitData);
        Alert.alert('Thành công', 'Cập nhật danh mục thành công');
      } else {
        await AdminService.createCategory(submitData);
        Alert.alert('Thành công', 'Tạo danh mục thành công');
      }

      closeModal();
      loadCategories(0);
    } catch (error) {
      console.error('Error submitting category:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể lưu danh mục';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (category) => {
    const newStatus = !category.isActive;
    Alert.alert(
      'Xác nhận',
      newStatus
        ? `Bạn có chắc muốn kích hoạt danh mục "${category.name}"?`
        : `Bạn có chắc muốn vô hiệu hóa danh mục "${category.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: newStatus ? 'Kích hoạt' : 'Vô hiệu hóa',
          style: 'default',
          onPress: async () => {
            try {
              await AdminService.updateCategoryStatus(category.id, newStatus);
              Alert.alert('Thành công', newStatus ? 'Danh mục đã được kích hoạt' : 'Danh mục đã được vô hiệu hóa');
              loadCategories(0);
            } catch (error) {
              console.error('Error toggling category status:', error);
              const errorMessage = error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái';
              Alert.alert('Lỗi', errorMessage);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Danh mục</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color={COLORS.WHITE} />
          <Text style={styles.addButtonText}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.GRAY} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm danh mục..."
            placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setPage(0);
                setCategories([]);
                loadCategories(0);
              }}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.GRAY} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalElements}</Text>
          <Text style={styles.statLabel}>Tổng danh mục</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {categories.filter(c => c.isActive).length}
          </Text>
          <Text style={styles.statLabel}>Đang hoạt động</Text>
        </View>
      </View>

      {/* Categories List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScrollEndDrag={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && categories.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.BLUE} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={64} color={COLORS.GRAY} />
            <Text style={styles.emptyText}>Không có danh mục nào</Text>
          </View>
        ) : (
          categories.map((category, index) => (
            <View key={category?.id ? `category-${category.id}` : `category-${index}`} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  {category.icon && (
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  )}
                  <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categorySlug}>/{category.slug}</Text>
                  </View>
                </View>
                <View style={styles.statusBadge}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: category.isActive ? COLORS.GREEN : COLORS.RED },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: category.isActive ? COLORS.GREEN : COLORS.RED },
                    ]}
                  >
                    {category.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                  </Text>
                </View>
              </View>

              {category.description && (
                <Text style={styles.categoryDescription} numberOfLines={2}>
                  {category.description}
                </Text>
              )}

              <View style={styles.categoryMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="list" size={16} color={COLORS.GRAY} />
                  <Text style={styles.metaText}>Thứ tự: {category.displayOrder || 0}</Text>
                </View>
                {category.threadsCount !== undefined && (
                  <View style={styles.metaItem}>
                    <Ionicons name="document-text" size={16} color={COLORS.GRAY} />
                    <Text style={styles.metaText}>{category.threadsCount} bài viết</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={16} color={COLORS.GRAY} />
                  <Text style={styles.metaText}>{formatDate(category.createdAt)}</Text>
                </View>
              </View>

              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(category)}
                >
                  <Ionicons name="create-outline" size={18} color={COLORS.BLUE} />
                  <Text style={[styles.actionButtonText, { color: COLORS.BLUE }]}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.toggleButton]}
                  onPress={() => handleToggleStatus(category)}
                >
                  <Ionicons
                    name={category.isActive ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={category.isActive ? COLORS.ORANGE : COLORS.GREEN}
                  />
                  <Text
                    style={[
                      styles.actionButtonText,
                      { color: category.isActive ? COLORS.ORANGE : COLORS.GREEN },
                    ]}
                  >
                    {category.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {loading && categories.length > 0 && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color={COLORS.BLUE} />
          </View>
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
              </Text>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={COLORS.GRAY} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Tên danh mục *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên danh mục"
                  placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                  value={formData.name}
                  onChangeText={handleNameChange}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Slug *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="slug-danh-muc"
                  placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                  value={formData.slug}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, slug: text }))}
                />
                <Text style={styles.hint}>Slug sẽ được dùng trong URL</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Mô tả</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Nhập mô tả danh mục"
                  placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Icon</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Emoji hoặc icon"
                  placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                  value={formData.icon}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, icon: text }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Thứ tự hiển thị</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={COLORS.PLACEHOLDER_COLOR}
                  value={formData.displayOrder}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, displayOrder: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={styles.switchContainer}
                  onPress={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                >
                  <Text style={styles.label}>Trạng thái</Text>
                  <View style={styles.switch}>
                    <View
                      style={[
                        styles.switchThumb,
                        formData.isActive && styles.switchThumbActive,
                      ]}
                    />
                    <Text style={styles.switchText}>
                      {formData.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.WHITE} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {editingCategory ? 'Cập nhật' : 'Tạo mới'}
                  </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: COLORS.BLACK,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.BLUE,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.GRAY,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: COLORS.GRAY,
    fontSize: 16,
  },
  categoryCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 4,
  },
  categorySlug: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.GRAY_BG,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryDescription: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 12,
    lineHeight: 20,
  },
  categoryMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_BG,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
  },
  editButton: {
    borderColor: COLORS.BLUE,
    backgroundColor: COLORS.BLUE_LIGHT,
  },
  toggleButton: {
    borderColor: COLORS.GRAY,
    backgroundColor: COLORS.GRAY_BG,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.BLACK,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchThumb: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.GRAY,
    padding: 2,
  },
  switchThumbActive: {
    backgroundColor: COLORS.GREEN,
  },
  switchText: {
    fontSize: 14,
    color: COLORS.BLACK,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_BG,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.GRAY_BG,
  },
  cancelButtonText: {
    color: COLORS.BLACK,
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: COLORS.BLUE,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.WHITE,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CategoryManagement;
