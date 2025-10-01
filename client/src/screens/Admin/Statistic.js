import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions,
  TouchableOpacity,
  Alert
} from 'react-native'
import { 
  LineChart, 
  BarChart, 
  PieChart 
} from 'react-native-gifted-charts'
import { LinearGradient } from 'expo-linear-gradient'

const { width: screenWidth } = Dimensions.get('window')

const Statistic = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days')
  const [loading, setLoading] = useState(false)

  // Dữ liệu mẫu cho biểu đồ số bài viết theo ngày
  const postsData = [
    { value: 15, date: '1/10', label: 'T2' },
    { value: 23, date: '2/10', label: 'T3' },
    { value: 18, date: '3/10', label: 'T4' },
    { value: 32, date: '4/10', label: 'T5' },
    { value: 28, date: '5/10', label: 'T6' },
    { value: 45, date: '6/10', label: 'T7' },
    { value: 38, date: '7/10', label: 'CN' },
  ]

  // Dữ liệu cho biểu đồ cột - Thống kê theo loại bài viết
  const postTypeData = [
    { value: 120, label: 'Hỏi đáp', frontColor: '#4A90E2' },
    { value: 85, label: 'Tài liệu', frontColor: '#50C878' },
    { value: 65, label: 'Thảo luận', frontColor: '#FFB347' },
    { value: 45, label: 'Khác', frontColor: '#FF6B6B' },
  ]

  // Dữ liệu cho biểu đồ tròn - Phân bố người dùng
  const userTypeData = [
    { value: 45, color: '#4A90E2', text: '45%' },
    { value: 30, color: '#50C878', text: '30%' },
    { value: 25, color: '#FFB347', text: '25%' },
  ]

  const userTypeLabels = [
    { color: '#4A90E2', label: 'Người dùng thường' },
    { color: '#50C878', label: 'Luật sư' },
    { color: '#FFB347', label: 'Quản trị viên' },
  ]

  // Dữ liệu tổng quan
  const overviewStats = [
    { title: 'Tổng bài viết', value: '1,234', change: '+12%', color: '#4A90E2' },
    { title: 'Người dùng mới', value: '89', change: '+8%', color: '#50C878' },
    { title: 'Luật sư', value: '156', change: '+5%', color: '#FFB347' },
    { title: 'Tương tác', value: '2,567', change: '+15%', color: '#FF6B6B' },
  ]

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
      <ChartContainer title="Số bài viết theo ngày">
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
      </ChartContainer>

      {/* Biểu đồ cột - Thống kê theo loại bài viết */}
      <ChartContainer title="Phân loại bài viết">
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
          maxValue={150}
          backgroundColor="transparent"
          xAxisColor="#E0E0E0"
          yAxisColor="#E0E0E0"
          initialSpacing={20}
        />
      </ChartContainer>

      {/* Biểu đồ tròn - Phân bố người dùng */}
      <ChartContainer title="Phân bố người dùng">
        <View style={styles.pieChartContainer}>
          <PieChart
            data={userTypeData}
            radius={80}
            innerRadius={30}
            centerLabelComponent={() => (
              <View style={styles.centerLabel}>
                <Text style={styles.centerLabelText}>Tổng</Text>
                <Text style={styles.centerLabelValue}>1,489</Text>
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
      </ChartContainer>

      {/* Thống kê bổ sung */}
      <ChartContainer title="Hoạt động gần đây">
        <View style={styles.activityList}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>📝</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Bài viết mới</Text>
              <Text style={styles.activityDesc}>23 bài viết được đăng hôm nay</Text>
            </View>
            <Text style={styles.activityTime}>2h</Text>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>👥</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Người dùng mới</Text>
              <Text style={styles.activityDesc}>5 người dùng đăng ký mới</Text>
            </View>
            <Text style={styles.activityTime}>4h</Text>
          </View>
          
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>⚖️</Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Luật sư xác thực</Text>
              <Text style={styles.activityDesc}>2 luật sư được xác thực</Text>
            </View>
            <Text style={styles.activityTime}>6h</Text>
          </View>
        </View>
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
})

export default Statistic