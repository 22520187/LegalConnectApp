import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constant/colors';
import LegalDocumentFilter from '../components/LegalDocumentFilter/LegalDocumentFilter';
import LegalDocumentCard from '../components/LegalDocumentCard/LegalDocumentCard';
import SCREENS from './index';
import { loadLegalDocumentDataset } from '../services/LegalDocumentDataset';

const { width } = Dimensions.get('window');

const BASE_LEGAL_FIELDS = [
  {
    id: 'all',
    name: 'Tất cả',
    icon: 'library-outline',
    count: 0,
    color: COLORS.BLUE,
    description: 'Tất cả văn bản pháp luật',
  },
  {
    id: 'administrative',
    name: 'Bộ máy hành chính',
    icon: 'business-outline',
    count: 0,
    color: COLORS.GREEN,
    description: 'Văn bản về tổ chức bộ máy',
  },
  {
    id: 'finance',
    name: 'Tài chính nhà nước',
    icon: 'card-outline',
    count: 0,
    color: COLORS.ORANGE,
    description: 'Văn bản về tài chính công',
  },
  {
    id: 'tax',
    name: 'Thuế - Phí - Lệ phí',
    icon: 'receipt-outline',
    count: 0,
    color: COLORS.PURPLE,
    description: 'Văn bản về thuế và phí',
  },
  {
    id: 'commerce',
    name: 'Thương mại',
    icon: 'storefront-outline',
    count: 0,
    color: COLORS.RAJAH,
    description: 'Văn bản về hoạt động thương mại',
  },
  {
    id: 'investment',
    name: 'Đầu tư',
    icon: 'trending-up-outline',
    count: 0,
    color: COLORS.RED,
    description: 'Văn bản về đầu tư',
  },
  {
    id: 'realestate',
    name: 'Bất động sản',
    icon: 'home-outline',
    count: 0,
    color: COLORS.GREEN,
    description: 'Văn bản về bất động sản',
  },
  {
    id: 'education',
    name: 'Giáo dục',
    icon: 'school-outline',
    count: 0,
    color: COLORS.BLUE,
    description: 'Văn bản về giáo dục',
  },
  {
    id: 'environment',
    name: 'Tài nguyên Môi trường',
    icon: 'leaf-outline',
    count: 0,
    color: COLORS.GREEN,
    description: 'Văn bản về môi trường',
  },
];

const LegalDocuments = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('newest');
  const [selectedField, setSelectedField] = useState('all');
  const [legalDocuments, setLegalDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dataset = await loadLegalDocumentDataset();
      setLegalDocuments(dataset);
    } catch (err) {
      console.error('Không thể tải dữ liệu văn bản:', err);
      setError('Không thể tải dữ liệu văn bản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const legalFields = useMemo(() => {
    if (!legalDocuments.length) return BASE_LEGAL_FIELDS;
    const fieldCounts = legalDocuments.reduce((acc, doc) => {
      if (doc.field) {
        acc[doc.field] = (acc[doc.field] || 0) + 1;
      }
      return acc;
    }, {});

    const total = legalDocuments.length;

    return BASE_LEGAL_FIELDS.map((field) => {
      if (field.id === 'all') {
        return { ...field, count: total };
      }
      return { ...field, count: fieldCounts[field.id] || 0 };
    });
  }, [legalDocuments]);

  const filteredDocuments = useMemo(() => {
    let baseList = legalDocuments;
    if (selectedField !== 'all') {
      baseList = legalDocuments.filter((doc) => doc.field === selectedField);
    }

    const sorted = [...baseList];

    switch (activeFilter) {
      case 'newest':
        return sorted.sort((a, b) => {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA;
        });
      case 'popular':
        return sorted.sort((a, b) => (b.summary?.length || 0) - (a.summary?.length || 0));
      case 'effective': {
        const effectiveDocs = sorted.filter((doc) =>
          (doc.status || '').toLowerCase().includes('hiệu lực')
        );
        return effectiveDocs.length ? effectiveDocs : sorted;
      }
      case 'category':
        return sorted.sort((a, b) =>
          (a.field || '').localeCompare(b.field || '')
        );
      default:
        return sorted;
    }
  }, [legalDocuments, selectedField, activeFilter]);

  const renderLegalFieldCard = (field) => (
    <TouchableOpacity
      key={field.id}
      style={[
        styles.fieldCard,
        selectedField === field.id && styles.selectedFieldCard,
        { borderLeftColor: field.color }
      ]}
      onPress={() => setSelectedField(field.id)}
    >
      <View style={styles.fieldCardContent}>
        <View style={styles.fieldCardHeader}>
          <View style={[styles.fieldIcon, { backgroundColor: field.color + '20' }]}>
            <Ionicons name={field.icon} size={24} color={field.color} />
          </View>
          <View style={styles.fieldInfo}>
            <Text style={styles.fieldName}>{field.name}</Text>
            <Text style={styles.fieldCount}>{field.count} văn bản</Text>
          </View>
        </View>
        <Text style={styles.fieldDescription}>{field.description}</Text>
      </View>
    </TouchableOpacity>
  );

  const uniqueProvinces = useMemo(() => {
    const provinceSet = new Set(legalDocuments.map((doc) => doc.province));
    provinceSet.delete('Không rõ cơ quan ban hành');
    return provinceSet.size;
  }, [legalDocuments]);

  const effectiveCount = useMemo(() => {
    if (!legalDocuments.length) return 0;
    return legalDocuments.filter(
      (doc) => !(doc.status || '').toLowerCase().includes('hết hiệu lực')
    ).length;
  }, [legalDocuments]);

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{legalDocuments.length}</Text>
        <Text style={styles.statsLabel}>Văn bản pháp luật</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{uniqueProvinces}</Text>
        <Text style={styles.statsLabel}>Cơ quan ban hành</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>{effectiveCount}</Text>
        <Text style={styles.statsLabel}>Văn bản hiệu lực</Text>
      </View>
    </View>
  );

  const handleViewDetail = (document) => {
    navigation.navigate(SCREENS.LEGAL_DOCUMENT_DETAIL, { document });
  };

  const handleDownload = (document) => {
    // Implement download functionality
    console.log('Download document:', document.title);
  };

  const handleViewSource = (document) => {
    // Implement view source functionality
    console.log('View source:', document.title);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar backgroundColor={COLORS.WHITE} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Legal Connect</Text>
          <Text style={styles.headerSubtitle}>Tra cứu văn bản pháp luật</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={styles.signupButtonText}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Banner thông báo */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerText}>NÓNG</Text>
          <Text style={styles.bannerMessage}>
            Bộ Tư pháp ban hành Thông tư 04/2024 về quy định mới trong đăng ký kinh doanh
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.WHITE} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        {renderStatsCard()}

        {/* Lĩnh vực pháp luật */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="folder-outline" size={24} color={COLORS.BLUE} />
            <Text style={styles.sectionTitle}>Lĩnh vực pháp luật</Text>
            <Text style={styles.sectionCount}>14 lĩnh vực</Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.fieldsContainer}
          >
            {legalFields.map(renderLegalFieldCard)}
          </ScrollView>
        </View>

        {/* Văn bản pháp luật mới nhất */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.BLUE} />
            <Text style={styles.sectionTitle}>Văn bản pháp luật mới nhất</Text>
            <Text style={styles.sectionCount}>{filteredDocuments.length} văn bản</Text>
          </View>

          {/* Filter */}
          <LegalDocumentFilter 
            activeTab={activeFilter} 
            onTabChange={setActiveFilter} 
          />

          {/* Documents List */}
          <View style={styles.documentsContainer}>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.BLUE} />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            )}

            {!loading && error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchDocuments}>
                  <Ionicons name="refresh-outline" size={16} color={COLORS.WHITE} />
                  <Text style={styles.retryText}>Thử lại</Text>
                </TouchableOpacity>
              </View>
            )}

            {!loading && !error && !filteredDocuments.length && (
              <Text style={styles.emptyText}>
                Không tìm thấy văn bản phù hợp với bộ lọc hiện tại.
              </Text>
            )}

            {!loading && !error && filteredDocuments.map((document) => (
              <LegalDocumentCard
                key={document.id}
                document={document}
                onViewDetail={handleViewDetail}
                onDownload={handleDownload}
                onViewSource={handleViewSource}
              />
            ))}
          </View>
        </View>

        {/* Tương tác nhanh
        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Tương tác nhanh</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.WHITE} />
            <Text style={styles.actionButtonText}>Đặt câu hỏi pháp lý</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Ionicons name="robot-outline" size={24} color={COLORS.BLUE} />
            <Text style={styles.actionButtonSecondaryText}>Chat với AI Lawyer</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Ionicons name="search-outline" size={24} color={COLORS.BLUE} />
            <Text style={styles.actionButtonSecondaryText}>Tra cứu văn bản</Text>
          </TouchableOpacity>
        </View> */}

        {/* Newsletter */}
        {/* <View style={styles.newsletter}>
          <View style={styles.newsletterIcon}>
            <Ionicons name="mail-outline" size={40} color={COLORS.BLUE} />
          </View>
          <Text style={styles.newsletterTitle}>Nhận tin pháp luật</Text>
          <Text style={styles.newsletterSubtitle}>
            Đăng ký để nhận những tin tức pháp luật mới nhất qua email
          </Text>
          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLUE,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.BLUE,
    borderRadius: 20,
  },
  loginButtonText: {
    color: COLORS.BLUE,
    fontSize: 14,
    fontWeight: '500',
  },
  signupButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.BLUE,
    borderRadius: 20,
  },
  signupButtonText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  banner: {
    backgroundColor: COLORS.RED,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    backgroundColor: COLORS.YELLOW,
    color: COLORS.BLACK,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  bannerMessage: {
    color: COLORS.WHITE,
    fontSize: 14,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: COLORS.BLUE,
    flexDirection: 'row',
    paddingVertical: 20,
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.WHITE,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.WHITE,
    marginTop: 12,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginLeft: 8,
    flex: 1,
  },
  sectionCount: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
  fieldsContainer: {
    paddingLeft: 16,
  },
  fieldCard: {
    width: width * 0.7,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    marginRight: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedFieldCard: {
    backgroundColor: COLORS.BLUE_LIGHT,
  },
  fieldCardContent: {
    padding: 16,
  },
  fieldCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldInfo: {
    flex: 1,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  fieldCount: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  fieldDescription: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    lineHeight: 20,
  },
  documentsContainer: {
    marginTop: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    color: COLORS.GRAY_DARK,
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: COLORS.RED_LIGHT,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.RED,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.RED,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.GRAY,
    paddingVertical: 24,
  },
  quickActions: {
    backgroundColor: COLORS.WHITE,
    marginTop: 12,
    padding: 16,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: COLORS.BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.BLUE_LIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  actionButtonSecondaryText: {
    color: COLORS.BLUE,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  newsletter: {
    backgroundColor: COLORS.WHITE,
    marginTop: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  newsletterIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.BLUE_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  newsletterTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 8,
  },
  newsletterSubtitle: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  subscribeButton: {
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  subscribeButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LegalDocuments;
