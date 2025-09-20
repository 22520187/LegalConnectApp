import React from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import QuestionCard from '../QuestionCard/QuestionCard';
import COLORS from '../../constant/colors';

const QuestionList = ({ 
  questions, 
  onQuestionPress, 
  onRefresh, 
  refreshing, 
  onLoadMore,
  loading,
  emptyState 
}) => {
  const renderQuestion = ({ item }) => (
    <QuestionCard question={item} onPress={onQuestionPress} />
  );

  const renderEmptyState = () => {
    const defaultEmpty = {
      icon: '📝',
      title: 'No questions yet',
      text: 'Be the first to ask a legal question!'
    };
    
    const empty = emptyState || defaultEmpty;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>{empty.icon}</Text>
        <Text style={styles.emptyTitle}>{empty.title}</Text>
        <Text style={styles.emptyText}>{empty.text}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={questions}
      renderItem={renderQuestion}
      keyExtractor={(item) => item.id.toString()}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      ListEmptyComponent={renderEmptyState}
      ListFooterComponent={renderFooter}
      contentContainerStyle={questions.length === 0 ? styles.emptyList : null}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.GRAY,
  },
});

export default QuestionList;
