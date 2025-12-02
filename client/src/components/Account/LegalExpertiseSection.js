import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import ForumService from '../../services/ForumService';

const LegalExpertiseSection = ({
  title,
  value = [],
  onSave,
  icon,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedExpertises, setSelectedExpertises] = useState(value);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Load categories when component expands
  useEffect(() => {
    if (isExpanded && categories.length === 0) {
      loadCategories();
    }
  }, [isExpanded]);

  // Update selectedExpertises when value prop changes
  useEffect(() => {
    setSelectedExpertises(value);
  }, [value]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await ForumService.getCategories();
      if (categoriesData && Array.isArray(categoriesData)) {
        // Extract category names and filter active ones
        const categoryNames = categoriesData
          .filter(cat => cat.isActive !== false)
          .map(cat => cat.name)
          .sort();
        setCategories(categoryNames);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi tải danh mục',
        text2: 'Không thể tải danh sách chuyên môn. Vui lòng thử lại.'
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleToggleExpertise = (expertise) => {
    setSelectedExpertises(prev => {
      if (prev.includes(expertise)) {
        return prev.filter(item => item !== expertise);
      } else {
        return [...prev, expertise];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedExpertises);
    setIsExpanded(false);
    Toast.show({
      type: 'success',
      text1: `${title} đã được cập nhật thành công`
    });
  };

  const handleCancel = () => {
    setSelectedExpertises(value);
    setIsExpanded(false);
  };

  if (isExpanded) {
    return (
      <View style={[styles.container, styles.borderTop, style]}>
        <View style={styles.headerContainer}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        {loadingCategories ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tải danh mục...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có danh mục nào</Text>
          </View>
        ) : (
          <ScrollView style={styles.optionsContainer} nestedScrollEnabled>
            {categories.map((expertise) => (
              <Pressable
                key={expertise}
                style={[
                  styles.optionItem,
                  selectedExpertises.includes(expertise) && styles.selectedOption
                ]}
                onPress={() => handleToggleExpertise(expertise)}
              >
                <Text style={[
                  styles.optionText,
                  selectedExpertises.includes(expertise) && styles.selectedOptionText
                ]}>
                  {expertise}
                </Text>
                {selectedExpertises.includes(expertise) && (
                  <Feather name="check" size={16} color="#007AFF" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}
        <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.button, styles.cancelButton]} 
            onPress={handleCancel}
          >
            <Feather name="x" size={16} color="#000" />
            <Text style={styles.buttonText}>Hủy</Text>
          </Pressable>
          <Pressable 
            style={[styles.button, styles.saveButton]} 
            onPress={handleSave}
            disabled={loadingCategories}
          >
            <Feather name="check" size={16} color="#fff" />
            <Text style={[styles.buttonText, styles.saveButtonText]}>Lưu</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <Pressable 
      style={[styles.container, styles.borderTop, style]} 
      onPress={() => setIsExpanded(true)}
    >
      <View style={styles.rowContainer}>
        <View style={styles.headerContainer}>
          {icon}
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={[
          styles.valueContainer,
          value && value.length <= 1 ? styles.valueRight : styles.valueLeft
        ]}>
          <Text style={[
            styles.valueText,
            value && value.length <= 1 ? styles.valueTextRight : styles.valueTextLeft
          ]} numberOfLines={2}>
            {value && value.length > 0 ? value.join(', ') : 'Chưa chọn chuyên môn'}
          </Text>
          <Feather name="chevron-down" size={20} color="#666" />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsContainer: {
    maxHeight: 200,
    marginVertical: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginVertical: 2,
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  cancelButton: {
    backgroundColor: '#f1f1f1',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#000',
  },
  saveButtonText: {
    color: '#fff',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginLeft: 8,
  },
  valueRight: {
    justifyContent: 'flex-end',
  },
  valueLeft: {
    justifyContent: 'flex-start',
  },
  valueText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  valueTextRight: {
    textAlign: 'right',
  },
  valueTextLeft: {
    textAlign: 'left',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});

export default LegalExpertiseSection;
