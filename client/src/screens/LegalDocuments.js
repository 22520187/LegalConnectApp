import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../constant/colors';
import LegalDocumentFilter from '../components/LegalDocumentFilter/LegalDocumentFilter';
import LegalDocumentCard from '../components/LegalDocumentCard/LegalDocumentCard';
import SCREENS from './index';

const { width } = Dimensions.get('window');

const LegalDocuments = () => {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('newest');
  const [selectedField, setSelectedField] = useState('all');

  // Mock data cho các lĩnh vực pháp luật
  const legalFields = [
    {
      id: 'all',
      name: 'Tất cả',
      icon: 'library-outline',
      count: 50,
      color: COLORS.BLUE,
      description: 'Tất cả văn bản pháp luật'
    },
    {
      id: 'administrative',
      name: 'Bộ máy hành chính',
      icon: 'business-outline',
      count: 10,
      color: COLORS.GREEN,
      description: 'Văn bản về tổ chức bộ máy'
    },
    {
      id: 'finance',
      name: 'Tài chính nhà nước',
      icon: 'card-outline',
      count: 10,
      color: COLORS.ORANGE,
      description: 'Văn bản về tài chính công'
    },
    {
      id: 'tax',
      name: 'Thuế - Phí - Lệ phí',
      icon: 'receipt-outline',
      count: 9,
      color: COLORS.PURPLE,
      description: 'Văn bản về thuế và phí'
    },
    {
      id: 'commerce',
      name: 'Thương mại',
      icon: 'storefront-outline',
      count: 5,
      color: COLORS.RAJAH,
      description: 'Văn bản về hoạt động thương mại'
    },
    {
      id: 'investment',
      name: 'Đầu tư',
      icon: 'trending-up-outline',
      count: 3,
      color: COLORS.RED,
      description: 'Văn bản về đầu tư'
    },
    {
      id: 'realestate',
      name: 'Bất động sản',
      icon: 'home-outline',
      count: 3,
      color: COLORS.GREEN,
      description: 'Văn bản về bất động sản'
    },
    {
      id: 'education',
      name: 'Giáo dục',
      icon: 'school-outline',
      count: 2,
      color: COLORS.BLUE,
      description: 'Văn bản về giáo dục'
    },
    {
      id: 'environment',
      name: 'Tài nguyên Môi trường',
      icon: 'leaf-outline',
      count: 2,
      color: COLORS.GREEN,
      description: 'Văn bản về môi trường'
    }
  ];

  // Mock data cho văn bản pháp luật
  const legalDocuments = [
    {
      id: 1,
      title: 'Nghị quyết 94/NQ-HDND năm 2017 Chương trình giám sát năm 2018 của Hội đồng nhân dân tỉnh Hà Giang khóa XVII, nhiệm kỳ...',
      summary: 'NGHỊ QUYẾT BAN HÀNH CHƯƠNG TRÌNH GIÁM SÁT NĂM 2018 CỦA HỘI ĐỒNG NHÂN DÂN TỈNH HÀ GIANG KHÓA XVII, NHIỆM KỲ 2016 - 2021 HỘI ĐỒNG NHÂN DÂN TỈNH...',
      type: 'Nghị quyết',
      status: 'Đã biết',
      code: '94/NQ-HDND',
      province: 'Tỉnh Hà Giang',
      issuer: 'Thảo Hồng Sơn',
      date: '14/07/2017',
      field: 'administrative',
      tags: ['Nghị quyết', 'Hà Giang', 'Giám sát'],
      author: {
        id: 1,
        name: 'Thảo Hồng Sơn',
        avatar: null
      },
      voteCount: 5,
      answerCount: 3,
      viewCount: 120,
      hasAcceptedAnswer: true,
      createdAt: new Date('2017-07-14')
    },
    {
      id: 2,
      title: 'Quyết định 626/QĐ-UBND năm 2017 Kế hoạch thời gian năm học 2017-2018 đối với giáo dục mầm non, giáo dục phổ thông và giáo...',
      summary: 'QUYẾT ĐỊNH BAN HÀNH KẾ HOẠCH THỜI GIAN NĂM HỌC 2017-2018 ĐỐI VỚI GIÁO DỤC MẦM NON, GIÁO DỤC PHỔ THÔNG VÀ GIÁO DỤC THƯỜNG XUYÊN TRÊN ĐỊA...',
      type: 'Quyết định',
      status: 'Đã biết',
      code: '626/QĐ-UBND',
      province: 'Tỉnh Điện Biên',
      issuer: 'Lê Văn Quý',
      date: '14/07/2017',
      field: 'education',
      tags: ['Quyết định', 'Giáo dục', 'Năm học'],
      author: {
        id: 2,
        name: 'Lê Văn Quý',
        avatar: null
      },
      voteCount: 8,
      answerCount: 5,
      viewCount: 200,
      hasAcceptedAnswer: false,
      createdAt: new Date('2017-07-14')
    },
    {
      id: 3,
      title: 'Nghị quyết 120/2017/NQ-HDND sửa đổi Khoản 3, Điều 1 Nghị quyết 23/2015/NQ-HDND quy định chính sách khuyến khích xã hội hoá...',
      summary: 'NGHỊ QUYẾT SỬA ĐỔI, BỔ SUNG MỘT SỐ ĐIỀU CỦA NGHỊ QUYẾT SỐ 23/2015/NQ-HDND NGÀY 10 THÁNG 7 NĂM 2015 CỦA HỘI ĐỒNG NHÂN DÂN TỈNH ĐỒNG THÁP...',
      type: 'Nghị quyết',
      status: 'Đã biết',
      code: '120/2017/NQ-HDND',
      province: 'Tỉnh Đồng Tháp',
      issuer: 'Phan Văn Thắng',
      date: '14/07/2017',
      field: 'administrative',
      tags: ['Nghị quyết', 'Sửa đổi', 'Khuyến khích'],
      author: {
        id: 3,
        name: 'Phan Văn Thắng',
        avatar: null
      },
      voteCount: 3,
      answerCount: 2,
      viewCount: 80,
      hasAcceptedAnswer: false,
      createdAt: new Date('2017-07-14')
    }
  ];

  const filteredDocuments = legalDocuments.filter(doc => {
    if (selectedField === 'all') return true;
    return doc.field === selectedField;
  });

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

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>50</Text>
        <Text style={styles.statsLabel}>Văn bản pháp luật</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>13</Text>
        <Text style={styles.statsLabel}>Cơ quan ban hành</Text>
      </View>
      <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>10</Text>
        <Text style={styles.statsLabel}>Văn bản hiệu lực</Text>
      </View>
      {/* <View style={styles.statsCard}>
        <Text style={styles.statsNumber}>24/7</Text>
        <Text style={styles.statsLabel}>Cập nhật thường xuyên</Text>
      </View> */}
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
            {filteredDocuments.map((document) => (
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
