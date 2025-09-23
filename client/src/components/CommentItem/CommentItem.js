import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const CommentItem = ({ 
  comment, 
  onReply, 
  onDelete, 
  onEdit,
  currentUserId = null,
  formatTimeAgo,
  style
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const isOwnComment = currentUserId && comment.authorId === currentUserId;
  const maxLines = 3;
  const shouldShowExpand = comment.content.length > 100;

  const handleLongPress = () => {
    if (isOwnComment) {
      setShowActions(!showActions);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa bình luận',
      'Bạn có chắc chắn muốn xóa bình luận này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              onDelete && onDelete(comment.id);
            });
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    setShowActions(false);
    onEdit && onEdit(comment);
  };

  const handleReply = () => {
    onReply && onReply(comment.author);
  };

  return (
    <Animated.View style={[styles.container, style, { opacity: fadeAnim }]}>
      <TouchableOpacity
        style={styles.commentWrapper}
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        {/* Comment Header */}
        <View style={styles.commentHeader}>
          <View style={styles.authorContainer}>
            <View style={[
              styles.authorAvatar,
              isOwnComment && styles.ownCommentAvatar
            ]}>
              <Text style={styles.authorAvatarText}>
                {comment.author.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={[
                styles.authorName,
                isOwnComment && styles.ownCommentAuthor
              ]}>
                {comment.author}
                {isOwnComment && (
                  <Text style={styles.youText}> (Bạn)</Text>
                )}
              </Text>
              <Text style={styles.commentTime}>
                {formatTimeAgo(comment.createdAt)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.replyButton}
            onPress={handleReply}
          >
            <Ionicons name="return-down-forward" size={14} color={COLORS.BLUE} />
          </TouchableOpacity>
        </View>

        {/* Reply To Indicator */}
        {comment.replyTo && (
          <View style={styles.replyToContainer}>
            <Ionicons name="return-down-forward" size={12} color={COLORS.GRAY} />
            <Text style={styles.replyToText}>
              Trả lời {comment.replyTo}
            </Text>
          </View>
        )}

        {/* Comment Content */}
        <View style={styles.contentContainer}>
          <Text 
            style={styles.commentContent}
            numberOfLines={isExpanded ? undefined : (shouldShowExpand ? maxLines : undefined)}
          >
            {comment.content}
          </Text>
          
          {shouldShowExpand && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <Text style={styles.expandButtonText}>
                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons for Own Comments */}
        {showActions && isOwnComment && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={14} color={COLORS.BLUE} />
              <Text style={styles.actionButtonText}>Sửa</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={14} color={COLORS.RED} />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                Xóa
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  commentWrapper: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.GRAY_LIGHT,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ownCommentAvatar: {
    backgroundColor: COLORS.GREEN,
  },
  authorAvatarText: {
    color: COLORS.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  ownCommentAuthor: {
    color: COLORS.GREEN,
  },
  youText: {
    fontSize: 11,
    fontWeight: '400',
    color: COLORS.GRAY,
  },
  commentTime: {
    fontSize: 11,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  replyButton: {
    padding: 4,
  },
  replyToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingLeft: 36,
  },
  replyToText: {
    fontSize: 11,
    color: COLORS.GRAY,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  contentContainer: {
    paddingLeft: 36,
  },
  commentContent: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
  },
  expandButton: {
    marginTop: 4,
  },
  expandButtonText: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.BLUE_LIGHT,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: COLORS.RED_LIGHT,
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.BLUE,
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: COLORS.RED,
  },
});

export default CommentItem;
