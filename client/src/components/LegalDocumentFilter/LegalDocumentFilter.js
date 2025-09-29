import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const LegalDocumentFilter = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'newest', label: 'Mới nhất', icon: 'time-outline' },
    { key: 'popular', label: 'Phổ biến', icon: 'trending-up-outline' },
    { key: 'effective', label: 'Hiệu lực', icon: 'checkmark-circle-outline' },
    { key: 'category', label: 'Theo lĩnh vực', icon: 'folder-outline' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => onTabChange(tab.key)}
          >
            <Ionicons 
              name={tab.icon} 
              size={16} 
              color={activeTab === tab.key ? COLORS.WHITE : COLORS.GRAY_DARK}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY_BG,
    minHeight: 36,
  },
  activeTab: {
    backgroundColor: COLORS.BLUE,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.GRAY_DARK,
  },
  activeTabText: {
    color: COLORS.WHITE,
    fontWeight: '600',
  },
});

export default LegalDocumentFilter;

