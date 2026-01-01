import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import { QuestionCard } from '../../components';

const Search = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, questions, tags
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Mock data - sử dụng dữ liệu từ Home
  const mockQuestions = [
    {
      id: 1,
      title: 'What are the legal requirements for starting a business in Vietnam?',
      summary: 'I want to start a small business and need to understand the legal procedures, required documents, and regulations...',
      voteCount: 15,
      answerCount: 3,
      viewCount: 124,
      tags: ['Business Law', 'Startup', 'Vietnam'],
      author: {
        id: 1,
        name: 'Alice Johnson',
        avatar: null,
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      hasAcceptedAnswer: true,
    },
    {
      id: 2,
      title: 'Employment contract termination rights in Vietnam',
      summary: 'My employer wants to terminate my contract. What are my rights and what compensation should I expect?',
      voteCount: 8,
      answerCount: 5,
      viewCount: 89,
      tags: ['Employment Law', 'Contract', 'Rights'],
      author: {
        id: 2,
        name: 'Mike Chen',
        avatar: null,
      },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      hasAcceptedAnswer: false,
    },
    {
      id: 3,
      title: 'Intellectual property protection for software developers',
      summary: 'How can I protect my mobile app idea and source code from being copied by competitors?',
      voteCount: 12,
      answerCount: 0,
      viewCount: 67,
      tags: ['IP Law', 'Software', 'Copyright'],
      author: {
        id: 3,
        name: 'Sarah Wilson',
        avatar: null,
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      hasAcceptedAnswer: false,
    },
    {
      id: 4,
      title: 'Real estate purchase agreement review needed',
      summary: 'I am buying my first house and the contract seems complex. What should I look out for?',
      voteCount: 6,
      answerCount: 2,
      viewCount: 45,
      tags: ['Real Estate', 'Contract Review', 'Property'],
      author: {
        id: 4,
        name: 'David Brown',
        avatar: null,
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      hasAcceptedAnswer: false,
    },
    {
      id: 5,
      title: 'Divorce proceedings and child custody laws',
      summary: 'What should I know about divorce procedures and how child custody is determined in Vietnamese law?',
      voteCount: 20,
      answerCount: 7,
      viewCount: 203,
      tags: ['Family Law', 'Divorce', 'Child Custody'],
      author: {
        id: 5,
        name: 'Emma Davis',
        avatar: null,
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      hasAcceptedAnswer: true,
    },
  ];

  // Mock recent searches
  const mockRecentSearches = [
    'business law',
    'contract',
    'employment rights',
    'divorce',
  ];

  // Mock popular tags
  const mockPopularTags = [
    'Business Law',
    'Employment Law',
    'Contract',
    'Family Law',
    'IP Law',
    'Real Estate',
    'Rights',
    'Vietnam',
    'Property',
    'Software',
  ];

  useEffect(() => {
    setRecentSearches(mockRecentSearches);
    setPopularTags(mockPopularTags);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
      setShowSuggestions(false);
    } else {
      setSearchResults([]);
      setShowSuggestions(true);
    }
  }, [searchQuery, activeFilter]);

  const performSearch = (query) => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      let results = [];
      const lowerQuery = query.toLowerCase();

      if (activeFilter === 'all' || activeFilter === 'questions') {
        // Tìm kiếm theo tiêu đề và nội dung câu hỏi
        const questionResults = mockQuestions.filter(question => 
          question.title.toLowerCase().includes(lowerQuery) ||
          question.summary.toLowerCase().includes(lowerQuery)
        );
        results = [...results, ...questionResults];
      }

      if (activeFilter === 'all' || activeFilter === 'tags') {
        // Tìm kiếm theo tag
        const tagResults = mockQuestions.filter(question =>
          question.tags && question.tags.some(tag => 
            tag.toLowerCase().includes(lowerQuery)
          )
        );
        
        // Loại bỏ duplicate nếu đã có trong kết quả từ questions
        tagResults.forEach(tagResult => {
          if (!results.find(result => result.id === tagResult.id)) {
            results.push(tagResult);
          }
        });
      }

      // Sắp xếp kết quả theo độ liên quan
      results.sort((a, b) => {
        const aScore = calculateRelevanceScore(a, lowerQuery);
        const bScore = calculateRelevanceScore(b, lowerQuery);
        return bScore - aScore;
      });

      setSearchResults(results);
      setLoading(false);
    }, 300);
  };

  const calculateRelevanceScore = (question, query) => {
    let score = 0;
    
    // Tiêu đề chứa từ khóa được điểm cao hơn
    if (question.title.toLowerCase().includes(query)) {
      score += 10;
    }
    
    // Tag khớp chính xác được điểm cao
    if (question.tags && question.tags.some(tag => 
      tag.toLowerCase() === query
    )) {
      score += 8;
    }
    
    // Tag chứa từ khóa
    if (question.tags && question.tags.some(tag => 
      tag.toLowerCase().includes(query)
    )) {
      score += 5;
    }
    
    // Nội dung chứa từ khóa
    if (question.summary.toLowerCase().includes(query)) {
      score += 3;
    }
    
    // Bonus cho câu hỏi có nhiều vote và answer
    score += question.voteCount * 0.1 + question.answerCount * 0.2;
    
    return score;
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      // Thêm vào recent searches
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches(prev => [searchQuery.trim(), ...prev.slice(0, 4)]);
      }
      Keyboard.dismiss();
    }
  };

  const handleTagPress = (tag) => {
    setSearchQuery(tag);
    setActiveFilter('tags');
  };

  const handleRecentSearchPress = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSuggestions(true);
  };

  const handleQuestionPress = (question) => {
    navigation.navigate('QuestionDetail', { question });
  };

  const filterOptions = [
    { key: 'all', label: 'Tất cả', icon: 'search' },
    { key: 'questions', label: 'Câu hỏi', icon: 'help-circle' },
    { key: 'tags', label: 'Tags', icon: 'pricetag' },
  ];

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter.key}
      style={[styles.filterButton, activeFilter === filter.key && styles.activeFilterButton]}
      onPress={() => setActiveFilter(filter.key)}
    >
      <Ionicons 
        name={filter.icon} 
        size={16} 
        color={activeFilter === filter.key ? COLORS.WHITE : COLORS.GRAY} 
      />
      <Text style={[
        styles.filterButtonText, 
        activeFilter === filter.key && styles.activeFilterButtonText
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSuggestionsContent = () => (
    <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tìm kiếm gần đây</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={`recent-search-${search}-${index}`}
              style={styles.recentSearchItem}
              onPress={() => handleRecentSearchPress(search)}
            >
              <Ionicons name="time-outline" size={20} color={COLORS.GRAY} />
              <Text style={styles.recentSearchText}>{search}</Text>
              <TouchableOpacity
                onPress={() => {
                  setRecentSearches(prev => prev.filter((_, i) => i !== index));
                }}
              >
                <Ionicons name="close" size={16} color={COLORS.GRAY} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Popular Tags */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tags phổ biến</Text>
        <View style={styles.tagsContainer}>
          {popularTags.map((tag, index) => (
            <TouchableOpacity
              key={`popular-tag-${tag}-${index}`}
              style={styles.tagChip}
              onPress={() => handleTagPress(tag)}
            >
              <Text style={styles.tagChipText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

    </ScrollView>
  );

  const renderResultsContent = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {searchResults.length} kết quả cho "{searchQuery}"
        </Text>
      </View>
      
      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <QuestionCard
            question={item}
            onPress={handleQuestionPress}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color={COLORS.GRAY} />
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyText}>
              Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả
            </Text>
          </View>
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.WHITE} 
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.GRAY} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm câu hỏi, tag..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              autoFocus={true}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Ionicons name="close-circle" size={20} color={COLORS.GRAY} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filterOptions.map(renderFilterButton)}
          </ScrollView>
        </View>

        {/* Content */}
        {showSuggestions ? renderSuggestionsContent() : renderResultsContent()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
    color: COLORS.BLACK,
  },
  filtersContainer: {
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY_BG,
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
  },
  activeFilterButton: {
    backgroundColor: COLORS.BLUE,
    borderColor: COLORS.BLUE,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.GRAY,
    marginLeft: 6,
  },
  activeFilterButtonText: {
    color: COLORS.WHITE,
  },
  suggestionsContainer: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
   sectionTitle: {
     fontSize: 16,
     fontWeight: 'bold',
     color: COLORS.BLACK,
     marginBottom: 12,
   },
  recentSearchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  recentSearchText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginLeft: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: COLORS.BLUE_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagChipText: {
    fontSize: 14,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginLeft: 8,
    lineHeight: 20,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
   emptyTitle: {
     fontSize: 18,
     fontWeight: 'bold',
     color: COLORS.BLACK,
     marginTop: 16,
     marginBottom: 8,
   },
  emptyText: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Search;
