import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import COLORS from '../../constant/colors';

const QuestionCard = ({ question, onPress }) => {
  const navigation = useNavigation();
  const [avatarError, setAvatarError] = useState(false);

  // Reset avatar error when avatar URL changes
  useEffect(() => {
    setAvatarError(false);
  }, [question.author?.avatar]);
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const questionTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - questionTime) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const handleAvatarPress = (e) => {
    e.stopPropagation(); // Prevent triggering the card press
    navigation.navigate('UserProfile', {
      userId: question.author.id || Math.random(), // Fallback if no ID
      userName: question.author.name,
      userAvatar: question.author.avatar,
    });
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tagsContainer}
      >
        {tags.map((tag, index) => (
          <View key={`question-card-tag-${tag}-${index}`} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderAvatar = () => {
    const avatarUrl = question.author?.avatar;
    const authorName = question.author?.name || 'Unknown';
    
    // Show image if avatar URL exists and no error occurred
    if (avatarUrl && !avatarError) {
      return (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.userAvatarImage}
          onError={() => setAvatarError(true)}
        />
      );
    }
    
    // Fallback to initials if no avatar or error loading
    return (
      <View style={styles.userAvatarFallback}>
        <Text style={styles.userAvatarText}>
          {authorName.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress(question)}>
      <View style={styles.content}>
        {/* Question Title */}
        <Text style={styles.title} numberOfLines={2}>
          {question.title}
        </Text>

        {/* Category */}
        {!!question.categoryName && (
          <View style={styles.categoryRow}>
            <Ionicons name="folder-outline" size={14} color={COLORS.GRAY_DARK} />
            <Text style={styles.categoryText} numberOfLines={1}>
              {question.categoryName}
            </Text>
          </View>
        )}

        {/* Question Summary */}
        <Text style={styles.summary} numberOfLines={3}>
          {question.summary}
        </Text>

        {/* Tags */}
        {renderTags(question.tags)}

        {/* Stats and User Info */}
        <View style={styles.footer}>
          <View style={styles.stats}>
            {/* Vote Count */}
            <View style={styles.statItem}>
              <Ionicons 
                name="arrow-up" 
                size={16} 
                color={question.voteCount > 0 ? COLORS.GREEN : COLORS.GRAY} 
              />
              <Text style={[
                styles.statText,
                question.voteCount > 0 && { color: COLORS.GREEN }
              ]}>
                {question.voteCount}
              </Text>
            </View>

            {/* Answer Count */}
            <View style={styles.statItem}>
              <Ionicons 
                name="chatbubble-outline" 
                size={16} 
                color={question.answerCount > 0 ? COLORS.BLUE : COLORS.GRAY} 
              />
              <Text style={[
                styles.statText,
                question.answerCount > 0 && { color: COLORS.BLUE }
              ]}>
                {question.answerCount}
              </Text>
            </View>

            {/* View Count */}
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color={COLORS.GRAY} />
              <Text style={styles.statText}>{question.viewCount}</Text>
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={handleAvatarPress}>
              {renderAvatar()}
            </TouchableOpacity>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{question.author.name}</Text>
              <Text style={styles.timeAgo}>{formatTimeAgo(question.createdAt)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Answered Indicator */}
      {question.hasAcceptedAnswer && (
        <View style={styles.answeredIndicator}>
          <Ionicons name="checkmark" size={16} color={COLORS.WHITE} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 8,
    lineHeight: 22,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    fontWeight: '600',
    flex: 1,
  },
  summary: {
    fontSize: 14,
    color: COLORS.GRAY_DARK,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    marginBottom: 12,
  },
  tag: {
    backgroundColor: COLORS.BLUE_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  stats: {
    flexDirection: 'row',
    flex: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginLeft: 4,
    fontWeight: '500',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: COLORS.GRAY_BG,
  },
  userAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatarText: {
    color: COLORS.WHITE,
    fontSize: 10,
    fontWeight: 'bold',
  },
  userDetails: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    fontWeight: '500',
  },
  timeAgo: {
    fontSize: 10,
    color: COLORS.GRAY,
  },
  answeredIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuestionCard;
