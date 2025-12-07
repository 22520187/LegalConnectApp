import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { 
  LineChart, 
  BarChart, 
  PieChart 
} from 'react-native-gifted-charts'
import { LinearGradient } from 'expo-linear-gradient'
import { getDashboardStats } from '../../services/AdminService'

const { width: screenWidth } = Dimensions.get('window')

const Statistic = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [statsData, setStatsData] = useState(null)
  const [error, setError] = useState(null)

  // Fetch dữ liệu từ API
  const fetchStats = async () => {
    try {
      setError(null)
      const data = await getDashboardStats()
      setStatsData(data)
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err.message || 'Không thể tải dữ liệu thống kê')
      Alert.alert('Lỗi', 'Không thể tải dữ liệu thống kê. Vui lòng thử lại.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const onRefresh = () => {
    setRefreshing(true)
    fetchStats()
  }

  // Format số với dấu phẩy
  const formatNumber = (num) => {
    return num?.toLocaleString('vi-VN') || '0'
  }

  // Tính phần trăm thay đổi (so sánh tháng này với tháng trước)
  const calculateChange = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? '+100%' : '0%'
    const change = ((current - previous) / previous) * 100
    return change >= 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`
  }

  // Chuyển đổi dữ liệu weeklyActivity thành format cho LineChart
  const getPostsData = () => {
    if (!statsData?.weeklyActivity || statsData.weeklyActivity.length === 0) {
      return []
    }

    const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    return statsData.weeklyActivity.map((item, index) => {
      const dayName = item.day || dayLabels[index] || `Ngày ${index + 1}`
      return {
        value: item.posts || 0,
        label: dayName.substring(0, 2),
        date: dayName
      }
    })
  }

  // Chuyển đổi dữ liệu usersByRole thành format cho PieChart
  const getUserTypeData = () => {
    if (!statsData?.usersByRole || statsData.usersByRole.length === 0) {
      return { data: [], labels: [] }
    }

    const colors = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B', '#9B59B6']
    const roleLabels = {
      'USER': 'Người dùng thường',
      'LAWYER': 'Luật sư',
      'ADMIN': 'Quản trị viên'
    }

    const total = statsData.usersByRole.reduce((sum, item) => sum + (item.count || 0), 0)
    
    const data = statsData.usersByRole.map((item, index) => {
      const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
      return {
        value: percentage,
        color: colors[index % colors.length],
        text: `${percentage}%`
      }
    })

    const labels = statsData.usersByRole.map((item, index) => ({
      color: colors[index % colors.length],
      label: roleLabels[item.role] || item.role
    }))

    return { data, labels, total }
  }

  // Tính toán overview stats
  const getOverviewStats = () => {
    if (!statsData) return []

    // Lấy dữ liệu tháng trước để tính phần trăm thay đổi
    const monthlyGrowth = statsData.monthlyGrowth || []
    const currentMonth = monthlyGrowth[monthlyGrowth.length - 1]
    const previousMonth = monthlyGrowth[monthlyGrowth.length - 2]

    return [
      { 
        title: 'Tổng bài viết', 
        value: formatNumber(statsData.totalPosts), 
        change: previousMonth && currentMonth ? calculateChange(currentMonth.posts, previousMonth.posts) : '0%',
        color: '#4A90E2' 
      },
      { 
        title: 'Người dùng mới', 
        value: formatNumber(statsData.newUsersThisMonth), 
        change: previousMonth && currentMonth ? calculateChange(currentMonth.users, previousMonth.users) : '0%',
        color: '#50C878' 
      },
      { 
        title: 'Luật sư', 
        value: formatNumber(statsData.totalLawyers), 
        change: previousMonth && currentMonth ? calculateChange(currentMonth.lawyers, previousMonth.lawyers) : '0%',
        color: '#FFB347' 
      },
      { 
        title: 'Tương tác', 
        value: formatNumber(statsData.totalMessages || 0), 
        change: '+0%',
        color: '#FF6B6B' 
      },
    ]
  }

  // Chuyển đổi dữ liệu popularPosts thành format cho BarChart
  const getPostTypeData = () => {
    if (!statsData?.popularPosts || statsData.popularPosts.length === 0) {
      return []
    }

    // Nhóm theo category và đếm
    const categoryCount = {}
    statsData.popularPosts.forEach(post => {
      const category = post.categoryName || 'Khác'
      categoryCount[category] = (categoryCount[category] || 0) + 1
    })

    const colors = ['#4A90E2', '#50C878', '#FFB347', '#FF6B6B']
    return Object.entries(categoryCount).slice(0, 4).map(([label, count], index) => ({
      value: count,
      label: label.length > 8 ? label.substring(0, 8) : label,
      frontColor: colors[index % colors.length]
    }))
  }

  // Chuyển đổi recentActivities
  const getRecentActivities = () => {
    if (!statsData?.recentActivities || statsData.recentActivities.length === 0) {
      return []
    }

    const activityIcons = {
      'USER_REGISTERED': '👥',
      'POST_CREATED': '📝',
      'LAWYER_APPLIED': '⚖️',
      'LAWYER_APPROVED': '✅',
      'POST_REPORTED': '🚨'
    }

    const activityTitles = {
      'USER_REGISTERED': 'Người dùng mới',
      'POST_CREATED': 'Bài viết mới',
      'LAWYER_APPLIED': 'Đơn xin luật sư',
      'LAWYER_APPROVED': 'Luật sư được duyệt',
      'POST_REPORTED': 'Bài viết bị báo cáo'
    }

    return statsData.recentActivities.slice(0, 10).map(activity => {
      const timestamp = activity.timestamp ? new Date(activity.timestamp) : new Date()
      const hoursAgo = Math.floor((Date.now() - timestamp.getTime()) / (1000 * 60 * 60))
      
      return {
        icon: activityIcons[activity.type] || '📌',
        title: activityTitles[activity.type] || activity.type,
        description: activity.description || '',
        time: hoursAgo < 1 ? 'Vừa xong' : `${hoursAgo}h`
      }
    })
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStats}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (!statsData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Không có dữ liệu</Text>
      </View>
    )
  }

  const postsData = getPostsData()
  const { data: userTypeData, labels: userTypeLabels, total: totalUsers } = getUserTypeData()
  const overviewStats = getOverviewStats()
  const postTypeData = getPostTypeData()
  const recentActivities = getRecentActivities()

  const periodOptions = [
    { key: '7days', label: '7 ngày' },
    { key: '30days', label: '30 ngày' },
    { key: '90days', label: '90 ngày' },
  ]

  const StatCard = ({ title, value, change, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={[styles.statChange, { color: change.startsWith('+') ? '#50C878' : '#FF6B6B' }]}>
        {change}
      </Text>
    </View>
  )

  const ChartContainer = ({ title, children }) => (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      {children}
    </View>
  )

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#4A90E2', '#357ABD']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Thống kê hệ thống</Text>
        <Text style={styles.headerSubtitle}>Tổng quan hoạt động</Text>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {periodOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.periodButton,
              selectedPeriod === option.key && styles.periodButtonActive
            ]}
            onPress={() => setSelectedPeriod(option.key)}
          >
            <Text style={[
              styles.periodButtonText,
              selectedPeriod === option.key && styles.periodButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Overview Stats */}
      <View style={styles.statsGrid}>
        {overviewStats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            color={stat.color}
          />
        ))}
      </View>

      {/* Biểu đồ đường - Số bài viết theo ngày */}
      <ChartContainer title="Số bài viết theo ngày (7 ngày qua)">
        {postsData.length > 0 ? (
          <LineChart
            data={postsData}
            width={screenWidth - 60}
            height={220}
            color="#4A90E2"
            thickness={3}
            dataPointsColor="#4A90E2"
            dataPointsRadius={6}
            textColor="#666"
            textFontSize={12}
            areaChart
            startFillColor="#4A90E2"
            startOpacity={0.3}
            endFillColor="#4A90E2"
            endOpacity={0.1}
            spacing={45}
            backgroundColor="transparent"
            rulesColor="#E0E0E0"
            rulesType="solid"
            initialSpacing={20}
            yAxisColor="#E0E0E0"
            xAxisColor="#E0E0E0"
            showVerticalLines
            verticalLinesColor="#F0F0F0"
            xAxisThickness={1}
            yAxisThickness={1}
            yAxisTextStyle={{ color: '#666' }}
            xAxisLabelTextStyle={{ color: '#666', textAlign: 'center' }}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>Chưa có dữ liệu</Text>
          </View>
        )}
      </ChartContainer>

      {/* Biểu đồ cột - Thống kê theo loại bài viết */}
      <ChartContainer title="Phân loại bài viết phổ biến">
        {postTypeData.length > 0 ? (
          <BarChart
            data={postTypeData}
            width={screenWidth - 60}
            height={220}
            barWidth={40}
            spacing={25}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={1}
            yAxisThickness={1}
            yAxisTextStyle={{ color: '#666' }}
            noOfSections={4}
            maxValue={Math.max(...postTypeData.map(d => d.value), 10)}
            backgroundColor="transparent"
            xAxisColor="#E0E0E0"
            yAxisColor="#E0E0E0"
            initialSpacing={20}
          />
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>Chưa có dữ liệu</Text>
          </View>
        )}
      </ChartContainer>

      {/* Biểu đồ tròn - Phân bố người dùng */}
      <ChartContainer title="Phân bố người dùng">
        {userTypeData.length > 0 ? (
          <View style={styles.pieChartContainer}>
            <PieChart
              data={userTypeData}
              radius={80}
              innerRadius={30}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text style={styles.centerLabelText}>Tổng</Text>
                  <Text style={styles.centerLabelValue}>{formatNumber(totalUsers)}</Text>
                </View>
              )}
            />
            <View style={styles.legendContainer}>
              {userTypeLabels.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>Chưa có dữ liệu</Text>
          </View>
        )}
      </ChartContainer>

      {/* Thống kê bổ sung */}
      <ChartContainer title="Hoạt động gần đây">
        {recentActivities.length > 0 ? (
          <View style={styles.activityList}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityIconText}>{activity.icon}</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDesc}>{activity.description}</Text>
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyChartText}>Chưa có hoạt động nào</Text>
          </View>
        )}
      </ChartContainer>

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  periodSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#4A90E2',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: '1%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerLabelText: {
    fontSize: 12,
    color: '#666',
  },
  centerLabelValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  legendContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  activityList: {
    marginTop: 10,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityDesc: {
    fontSize: 12,
    color: '#666',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  bottomPadding: {
    height: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyChart: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 14,
    color: '#999',
  },
})

export default Statistic