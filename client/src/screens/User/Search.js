import React, { useState, useEffect, useRef } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import COLORS from '../../constant/colors';
import { QuestionCard } from '../../components';
import ForumService from '../../services/ForumService';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_SEARCH_HISTORY = 10;

const Search = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, questions, tags
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const debounceTimeoutRef = useRef(null);
  const requestIdRef = useRef(0);

  // Load search history and popular tags on mount
  useEffect(() => {
    loadSearchHistory();
    loadPopularTags();
  }, []);

  // Load search history from AsyncStorage
  const loadSearchHistory = async () => {
    try {
      const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      if (historyJson) {
        const history = JSON.parse(historyJson);
        setRecentSearches(Array.isArray(history) ? history : []);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  // Save search history to AsyncStorage
  const saveSearchHistory = async (query) => {
    try {
      const trimmedQuery = query.trim().toLowerCase();
      if (!trimmedQuery) return;

      const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      let history = historyJson ? JSON.parse(historyJson) : [];
      
      // Remove duplicate and add to front
      history = history.filter(item => item.toLowerCase() !== trimmedQuery);
      history.unshift(query.trim()); // Keep original case for display
      
      // Limit to MAX_SEARCH_HISTORY items
      history = history.slice(0, MAX_SEARCH_HISTORY);
      
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
      setRecentSearches(history);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  // Load popular tags from API
  const loadPopularTags = async () => {
    try {
      const tags = await ForumService.getPopularTags(5);
      // Extract tag names from PopularTagDto (which has tag and count properties)
      const tagNames = tags.map(tag => tag.tag || tag);
      setPopularTags(tagNames);
    } catch (error) {
      console.error('Error loading popular tags:', error);
      setPopularTags([]);
    }
  };

  useEffect(() => {
    // Clear previous debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchQuery.trim().length > 0) {
      // Debounce: wait 500ms after user stops typing before searching
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
        setShowSuggestions(false);
      }, 500);
    } else {
      setSearchResults([]);
      setShowSuggestions(true);
    }

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchQuery, activeFilter]);

  // Map PostDto from API to QuestionCard format
  const mapPostToQuestion = (post) => {
    // Parse tags - backend returns Set<String> or comma-separated string
    let tags = [];
    if (post.tags) {
      if (Array.isArray(post.tags)) {
        tags = post.tags;
      } else if (typeof post.tags === 'string') {
        tags = post.tags.split(',').map(t => t.trim()).filter(t => t);
      }
    }

    // Calculate vote count (upvote - downvote)
    const voteCount = (post.upvoteCount || 0) - (post.downvoteCount || 0);

    return {
      id: post.id,
      title: post.title || '',
      summary: post.content ? post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '') : '',
      voteCount: voteCount,
      answerCount: post.replyCount || 0,
      viewCount: post.views || 0,
      tags: tags,
      author: {
        id: post.author?.id || 0,
        name: post.author?.name || 'Unknown',
        avatar: post.author?.avatar || null,
      },
      createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
      hasAcceptedAnswer: post.solved || false,
      categoryName: post.category?.name || null,
    };
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Increment request ID to track the latest request
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    setLoading(true);
    
    try {
      const response = await ForumService.searchPosts(query.trim(), {
        page: 0,
        size: 20,
        sort: 'createdAt,desc'
      });

      // Only update state if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      // Handle paginated response
      const posts = response.content || response || [];
      const mappedResults = posts.map(mapPostToQuestion);
      
      setSearchResults(mappedResults);
    } catch (error) {
      // Only update state if this is still the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      console.error('Error searching posts:', error);
      setSearchResults([]);
    } finally {
      // Only update loading state if this is still the latest request
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      saveSearchHistory(searchQuery.trim());
      Keyboard.dismiss();
    }
  };

  const handleTagPress = (tag) => {
    setSearchQuery(tag);
    setActiveFilter('tags');
  };

  const handleRecentSearchPress = (query) => {
    setSearchQuery(query);
    // Trigger search immediately when clicking recent search
    if (query.trim().length > 0) {
      performSearch(query);
      setShowSuggestions(false);
    }
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

  // const renderFilterButton = (filter) => (
  //   <TouchableOpacity
  //     key={filter.key}
  //     style={[styles.filterButton, activeFilter === filter.key && styles.activeFilterButton]}
  //     onPress={() => setActiveFilter(filter.key)}
  //   >
  //     <Ionicons 
  //       name={filter.icon} 
  //       size={16} 
  //       color={activeFilter === filter.key ? COLORS.WHITE : COLORS.GRAY} 
  //     />
  //     <Text style={[
  //       styles.filterButtonText, 
  //       activeFilter === filter.key && styles.activeFilterButtonText
  //     ]}>
  //       {filter.label}
  //     </Text>
  //   </TouchableOpacity>
  // );

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
                onPress={async () => {
                  const newHistory = recentSearches.filter((_, i) => i !== index);
                  setRecentSearches(newHistory);
                  try {
                    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
                  } catch (error) {
                    console.error('Error removing search history item:', error);
                  }
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
      
      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Đang tìm kiếm...</Text>
        </View>
      ) : (
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
      )}
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
        {/* <View style={styles.filtersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {filterOptions.map(renderFilterButton)}
          </ScrollView>
        </View> */}

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
