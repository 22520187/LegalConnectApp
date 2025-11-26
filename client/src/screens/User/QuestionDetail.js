import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import CommentInput from '../../components/CommentInput/CommentInput';
import CommentItem from '../../components/CommentItem/CommentItem';
import ReportModal from '../../components/ReportModal/ReportModal';
import ForumService from '../../services/ForumService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const QuestionDetail = ({ route, navigation }) => {
  const { question } = route.params;
  const { user } = useAuth();
  const postId = question.id || question.postId; // Get postId from question
  const initialUpvotes = question?.upvoteCount ?? question?.upvotes ?? 0;
  const initialDownvotes = question?.downvoteCount ?? question?.downvotes ?? 0;
  const initialUserVote = question?.userVote ? question.userVote.toLowerCase() : null;
  const [voteStats, setVoteStats] = useState({
    upvoteCount: initialUpvotes,
    downvoteCount: initialDownvotes,
  });
  const [userVote, setUserVote] = useState(initialUserVote); // 'upvote', 'downvote', or null
  const [isBookmarked, setIsBookmarked] = useState(false);
  const netVoteCount = (voteStats.upvoteCount || 0) - (voteStats.downvoteCount || 0);
  const [expandedComments, setExpandedComments] = useState({});
  const [showCommentInput, setShowCommentInput] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [replyToId, setReplyToId] = useState(null); // Store reply ID for nested replies
  const [answersData, setAnswersData] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [showAddAnswer, setShowAddAnswer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const currentUserId = user?.id || user?.userId;

  const loadPostVotes = async () => {
    if (!postId) return;
    try {
      const stats = await ForumService.getPostVotes(postId);
      if (stats) {
        setVoteStats({
          upvoteCount: stats.upvoteCount ?? 0,
          downvoteCount: stats.downvoteCount ?? 0,
        });
        setUserVote(stats.userVote ? stats.userVote.toLowerCase() : null);
      }
    } catch (error) {
      console.error('Error loading post votes:', error);
    }
  };

  useEffect(() => {
    if (postId) {
      loadPostVotes();
    }
  }, [postId]);

  // Load replies from API
  useEffect(() => {
    if (postId) {
      loadReplies();
    }
  }, [postId]);

  const loadReplies = async () => {
    try {
      setLoadingReplies(true);
      const replies = await ForumService.getReplies(postId);
      
      // Map API response to component format
      const mappedReplies = replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        author: {
          id: reply.author?.id,
          name: reply.author?.name || 'Người dùng',
          avatar: reply.author?.avatar,
          title: reply.author?.role || '',
          reputation: 0, // Backend doesn't provide this
        },
        upvoteCount: reply.upvoteCount || 0,
        downvoteCount: reply.downvoteCount || 0,
        voteCount: (reply.upvoteCount || 0) - (reply.downvoteCount || 0),
        userVote: reply.userVote || null, // 'UPVOTE', 'DOWNVOTE', or null
        createdAt: new Date(reply.createdAt),
        isAccepted: reply.isSolution || false,
        comments: reply.children ? reply.children.map(child => ({
          id: child.id,
          author: child.author?.name || 'Người dùng',
          authorId: child.author?.id,
          content: child.content,
          createdAt: new Date(child.createdAt),
          replyTo: null, // Can be enhanced later
        })) : [],
      }));
      
      setAnswersData(mappedReplies);
    } catch (error) {
      console.error('Error loading replies:', error);
      Alert.alert('Lỗi', 'Không thể tải bình luận. Vui lòng thử lại.');
      setAnswersData([]);
    } finally {
      setLoadingReplies(false);
    }
  };

  // Initialize answers data (fallback to empty if API fails)
  useEffect(() => {
    if (answersData.length === 0 && !loadingReplies) {
      // Keep empty array, API will populate it
    }
  }, []);

  // Mock related questions
  const relatedQuestions = [
    {
      id: 6,
      title: 'Thủ tục đăng ký bảo hộ thương hiệu cho startup',
      voteCount: 5,
      answerCount: 2,
    },
    {
      id: 7,
      title: 'Luật lao động áp dụng cho doanh nghiệp nhỏ',
      voteCount: 8,
      answerCount: 4,
    },
    {
      id: 8,
      title: 'Cách tính thuế thu nhập doanh nghiệp cho startup',
      voteCount: 12,
      answerCount: 3,
    }
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} phút trước`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
    }
  };

  const handleVote = async (type) => {
    if (!postId) {
      Alert.alert('Lỗi', 'Không tìm thấy bài viết');
      return;
    }

    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình chọn.');
      return;
    }

    const isRemoving = userVote === type;
    const votePayload = isRemoving ? 'NONE' : (type === 'upvote' ? 'UPVOTE' : 'DOWNVOTE');

    try {
      const response = await ForumService.votePost(postId, votePayload);
      if (response) {
        setVoteStats({
          upvoteCount: response.upvoteCount ?? voteStats.upvoteCount,
          downvoteCount: response.downvoteCount ?? voteStats.downvoteCount,
        });
        setUserVote(response.userVote ? response.userVote.toLowerCase() : null);
      }
    } catch (error) {
      console.error('Error voting post:', error);
      const message = error?.response?.data?.message || 'Không thể thực hiện bình chọn. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    Alert.alert(
      'Bookmark',
      isBookmarked ? 'Đã bỏ lưu câu hỏi' : 'Đã lưu câu hỏi'
    );
  };

  const handleUserPress = (userId, userName, userAvatar) => {
    navigation.navigate('UserProfile', {
      userId: userId,
      userName: userName,
      userAvatar: userAvatar,
    });
  };

  const handleReport = () => {
    setReportTarget({
      type: 'post',
      id: question.id,
      title: question.title
    });
    setShowReportModal(true);
  };

  const handleReportUser = (userId, userName) => {
    setReportTarget({
      type: 'user',
      id: userId,
      title: userName
    });
    setShowReportModal(true);
  };

  const handleReportSubmit = (reportData) => {
    console.log('Report submitted:', reportData);
    // Here you would typically send the report to your backend
    setShowReportModal(false);
    setReportTarget(null);
  };

  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportTarget(null);
  };

  const handleAnswerVote = async (answerId, type) => {
    if (!user) {
      Alert.alert('Thông báo', 'Vui lòng đăng nhập để bình chọn câu trả lời.');
      return;
    }

    const targetAnswer = answersData.find(answer => answer.id === answerId);
    if (!targetAnswer) {
      console.warn('Answer not found for voting:', answerId);
      return;
    }

    const normalizedVote = targetAnswer.userVote ? targetAnswer.userVote.toLowerCase() : null;
    const votePayload = normalizedVote === type ? 'NONE' : (type === 'upvote' ? 'UPVOTE' : 'DOWNVOTE');

    try {
      const response = await ForumService.voteReply(answerId, votePayload);
      if (response) {
        setAnswersData(prev =>
          prev.map(answer =>
            answer.id === answerId
              ? {
                  ...answer,
                  voteCount: (response.upvoteCount || 0) - (response.downvoteCount || 0),
                  upvoteCount: response.upvoteCount ?? 0,
                  downvoteCount: response.downvoteCount ?? 0,
                  userVote: response.userVote || null,
                }
              : answer
          )
        );
      }
    } catch (error) {
      console.error('Error voting reply:', error);
      const message = error?.response?.data?.message || 'Không thể bình chọn câu trả lời. Vui lòng thử lại.';
      Alert.alert('Lỗi', message);
    }
  };

  const handleMarkAsAccepted = (answerId) => {
    Alert.alert('Mark as Accepted', `Mark answer ${answerId} as accepted`);
  };

  const toggleComments = (answerId) => {
    setExpandedComments(prev => ({
      ...prev,
      [answerId]: !prev[answerId]
    }));
  };

  const handleAddComment = (answerId) => {
    setShowCommentInput(prev => ({
      ...prev,
      [answerId]: !prev[answerId]
    }));
    setReplyTo(null);
  };

  const handleReplyToComment = (answerId, commentAuthor, commentId = null) => {
    setShowCommentInput(prev => ({
      ...prev,
      [answerId]: true
    }));
    setReplyTo(commentAuthor);
    setReplyToId(commentId); // Store comment/reply ID for nested reply
  };

  const handleSubmitComment = async (answerId, commentText) => {
    if (!postId) {
      Alert.alert('Lỗi', 'Không tìm thấy bài viết');
      return;
    }

    if (editingComment) {
      // Edit existing comment - Not supported by API yet
      Alert.alert('Thông báo', 'Chức năng chỉnh sửa bình luận chưa được hỗ trợ');
      setEditingComment(null);
      return;
    }

    try {
      // Prepare reply data
      const replyData = {
        content: commentText.trim(),
      };

      // If replying to a comment, set parentId
      if (replyToId) {
        replyData.parentId = replyToId;
      }

      // Call API to create reply
      const newReply = await ForumService.createReply(postId, replyData);

      // Reload replies to get updated list
      await loadReplies();

      Alert.alert('Thành công', 'Đã thêm bình luận của bạn!');

      // Close comment input
      setShowCommentInput(prev => ({
        ...prev,
        [answerId]: false
      }));
      setReplyTo(null);
      setReplyToId(null);

      // Expand comments to show the new one
      setExpandedComments(prev => ({
        ...prev,
        [answerId]: true
      }));
    } catch (error) {
      console.error('Error submitting comment:', error);
      let message = 'Không thể gửi bình luận. Vui lòng thử lại.';
      
      // Extract error message
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.data && typeof errorData.data === 'object') {
          const validationErrors = Object.values(errorData.data);
          message = validationErrors.join('\n') || errorData.message || message;
        } else if (errorData.message) {
          message = errorData.message;
        }
      } else if (error?.message) {
        message = error.message;
      }
      
      Alert.alert('Lỗi', message);
    }
  };

  const handleCancelComment = (answerId) => {
    setShowCommentInput(prev => ({
      ...prev,
      [answerId]: false
    }));
    setReplyTo(null);
    setReplyToId(null);
    setEditingComment(null);
  };

  const handleDeleteComment = (answerId, commentId) => {
    setAnswersData(prev => 
      prev.map(answer => 
        answer.id === answerId
          ? {
              ...answer,
              comments: answer.comments.filter(comment => comment.id !== commentId)
            }
          : answer
      )
    );
  };

  const handleEditComment = (answerId, comment) => {
    setEditingComment(comment);
    setShowCommentInput(prev => ({
      ...prev,
      [answerId]: true
    }));
    setReplyTo(null);
  };

  const handleAddAnswer = () => {
    setShowAddAnswer(!showAddAnswer);
  };

  const handleSubmitAnswer = async (answerText) => {
    if (!postId) {
      Alert.alert('Lỗi', 'Không tìm thấy bài viết');
      return;
    }

    try {
      // Call API to create top-level reply (no parentId)
      const replyData = {
        content: answerText.trim(),
      };

      await ForumService.createReply(postId, replyData);

      // Reload replies to get updated list
      await loadReplies();

      setShowAddAnswer(false);
      Alert.alert('Thành công', 'Câu trả lời của bạn đã được đăng!');
    } catch (error) {
      console.error('Error submitting answer:', error);
      let message = 'Không thể đăng câu trả lời. Vui lòng thử lại.';
      
      // Extract error message
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.data && typeof errorData.data === 'object') {
          const validationErrors = Object.values(errorData.data);
          message = validationErrors.join('\n') || errorData.message || message;
        } else if (errorData.message) {
          message = errorData.message;
        }
      } else if (error?.message) {
        message = error.message;
      }
      
      Alert.alert('Lỗi', message);
    }
  };

  const handleCancelAnswer = () => {
    setShowAddAnswer(false);
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
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, userVote === 'upvote' && styles.activeUpvote]}
        onPress={() => handleVote('upvote')}
      >
        <Ionicons 
          name="arrow-up" 
          size={24} 
          color={userVote === 'upvote' ? COLORS.WHITE : COLORS.GRAY} 
        />
        <Text style={[
          styles.actionButtonText,
          userVote === 'upvote' && styles.activeUpvoteText
        ]}>
          {netVoteCount}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, userVote === 'downvote' && styles.activeDownvote]}
        onPress={() => handleVote('downvote')}
      >
        <Ionicons 
          name="arrow-down" 
          size={24} 
          color={userVote === 'downvote' ? COLORS.WHITE : COLORS.GRAY} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, isBookmarked && styles.activeBookmark]}
        onPress={handleBookmark}
      >
        <Ionicons 
          name={isBookmarked ? "bookmark" : "bookmark-outline"} 
          size={24} 
          color={isBookmarked ? COLORS.WHITE : COLORS.GRAY} 
        />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleReport}
      >
        <Ionicons name="flag-outline" size={24} color={COLORS.RED} />
        <Text style={styles.reportButtonText}>Báo cáo</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAnswer = (answer) => {
    const normalizedVote = answer.userVote ? answer.userVote.toLowerCase() : null;

    return (
    <View key={answer.id} style={styles.answerContainer}>
      {answer.isAccepted && (
        <View style={styles.acceptedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.GREEN} />
          <Text style={styles.acceptedText}>Câu trả lời được chấp nhận</Text>
        </View>
      )}

      <View style={styles.answerHeader}>
        <View style={styles.answerAuthor}>
          <TouchableOpacity 
            style={styles.authorAvatar}
            onPress={() => handleUserPress(answer.author.id || Math.random(), answer.author.name, answer.author.avatar)}
          >
            <Text style={styles.authorAvatarText}>
              {answer.author.name.charAt(0).toUpperCase()}
            </Text>
          </TouchableOpacity>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{answer.author.name}</Text>
            <Text style={styles.authorTitle}>{answer.author.title}</Text>
            <Text style={styles.authorReputation}>{answer.author.reputation} điểm uy tín</Text>
          </View>
          {answer.author.id !== currentUserId && (
            <TouchableOpacity 
              style={styles.reportUserButton}
              onPress={() => handleReportUser(answer.author.id, answer.author.name)}
            >
              <Ionicons name="flag-outline" size={16} color={COLORS.RED} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.answerTime}>{formatTimeAgo(answer.createdAt)}</Text>
      </View>

      <Text style={styles.answerContent}>{answer.content}</Text>

      <View style={styles.answerActions}>
        <View style={styles.answerVotes}>
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => handleAnswerVote(answer.id, 'upvote')}
          >
            <Ionicons 
              name="arrow-up" 
              size={20} 
              color={normalizedVote === 'upvote' ? COLORS.GREEN : COLORS.GRAY} 
            />
            <Text style={[
              styles.voteText,
              normalizedVote === 'upvote' && styles.voteTextUpvote
            ]}>
              {answer.voteCount}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => handleAnswerVote(answer.id, 'downvote')}
          >
            <Ionicons 
              name="arrow-down" 
              size={20} 
              color={normalizedVote === 'downvote' ? COLORS.RED : COLORS.GRAY} 
            />
          </TouchableOpacity>
        </View>

        {!answer.isAccepted && (
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleMarkAsAccepted(answer.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.GREEN} />
            <Text style={styles.acceptButtonText}>Chấp nhận</Text>
          </TouchableOpacity>
        )}

        <View style={styles.commentActionsContainer}>
          {answer.comments.length > 0 && (
            <TouchableOpacity 
              style={styles.commentsToggle}
              onPress={() => toggleComments(answer.id)}
            >
              <Ionicons 
                name={expandedComments[answer.id] ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={COLORS.BLUE} 
              />
              <Text style={styles.commentsToggleText}>
                {answer.comments.length} bình luận
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.addCommentButton}
            onPress={() => handleAddComment(answer.id)}
          >
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.BLUE} />
            <Text style={styles.addCommentText}>
              {showCommentInput[answer.id] ? 'Hủy' : 'Bình luận'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {expandedComments[answer.id] && answer.comments.length > 0 && (
        <View style={styles.commentsContainer}>
          {answer.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              formatTimeAgo={formatTimeAgo}
              onReply={(author) => handleReplyToComment(answer.id, author)}
              onDelete={(commentId) => handleDeleteComment(answer.id, commentId)}
              onEdit={(comment) => handleEditComment(answer.id, comment)}
            />
          ))}
        </View>
      )}
      
      {showCommentInput[answer.id] && (
        <CommentInput
          visible={showCommentInput[answer.id]}
          onSubmit={(text) => handleSubmitComment(answer.id, text)}
          onCancel={() => handleCancelComment(answer.id)}
          replyTo={replyTo}
          autoFocus={true}
          initialText={editingComment ? editingComment.content : ''}
          placeholder={editingComment ? 'Chỉnh sửa bình luận...' : 'Viết bình luận của bạn...'}
        />
      )}
    </View>
  );
  };

  const renderRelatedQuestions = () => (
    <View style={styles.relatedSection}>
      <Text style={styles.relatedTitle}>Câu hỏi liên quan</Text>
      {relatedQuestions.map((q) => (
        <TouchableOpacity key={q.id} style={styles.relatedQuestion}>
          <Text style={styles.relatedQuestionTitle} numberOfLines={2}>
            {q.title}
          </Text>
          <View style={styles.relatedQuestionStats}>
            <Text style={styles.relatedQuestionStat}>{q.voteCount} votes</Text>
            <Text style={styles.relatedQuestionStat}>{q.answerCount} answers</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết câu hỏi</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question Content */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>{question.title}</Text>
          
          <View style={styles.questionMeta}>
            <View style={styles.questionAuthor}>
              <TouchableOpacity 
                style={styles.questionAuthorAvatar}
                onPress={() => handleUserPress(question.author.id || Math.random(), question.author.name, question.author.avatar)}
              >
                <Text style={styles.questionAuthorAvatarText}>
                  {question.author.name.charAt(0).toUpperCase()}
                </Text>
              </TouchableOpacity>
              <View>
                <Text style={styles.questionAuthorName}>{question.author.name}</Text>
                <Text style={styles.questionTime}>{formatTimeAgo(question.createdAt)}</Text>
              </View>
            </View>
            <View style={styles.questionStats}>
              <Text style={styles.questionStat}>{question.viewCount} lượt xem</Text>
            </View>
          </View>

          <Text style={styles.questionDescription}>{question.summary}</Text>
          
          {renderTags(question.tags)}
          {renderActionButtons()}
        </View>

        {/* Answers Section */}
        <View style={styles.answersSection}>
          <View style={styles.answersSectionHeader}>
            <Text style={styles.answersTitle}>
              {answersData.length} Câu trả lời
            </Text>
            <TouchableOpacity 
              style={styles.addAnswerButton}
              onPress={handleAddAnswer}
            >
              <Ionicons 
                name={showAddAnswer ? "close" : "add"} 
                size={20} 
                color={COLORS.WHITE} 
              />
              <Text style={styles.addAnswerButtonText}>
                {showAddAnswer ? 'Hủy' : 'Trả lời'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showAddAnswer && (
            <View style={styles.addAnswerContainer}>
              <CommentInput
                visible={showAddAnswer}
                onSubmit={handleSubmitAnswer}
                onCancel={handleCancelAnswer}
                placeholder="Viết câu trả lời của bạn..."
                autoFocus={true}
              />
            </View>
          )}
          
          {loadingReplies ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.BLUE} />
              <Text style={styles.loadingText}>Đang tải bình luận...</Text>
            </View>
          ) : answersData.length > 0 ? (
            answersData.map(renderAnswer)
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có bình luận nào. Hãy là người đầu tiên trả lời!</Text>
            </View>
          )}
        </View>

        {/* Related Questions */}
        {renderRelatedQuestions()}

        {/* Related Tags */}
        <View style={styles.relatedTagsSection}>
          <Text style={styles.relatedTitle}>Tags liên quan</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.relatedTagsContainer}>
              {question.tags.map((tag, index) => (
                <TouchableOpacity key={index} style={styles.relatedTag}>
                  <Text style={styles.relatedTagText}>{tag}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.relatedTag}>
                <Text style={styles.relatedTagText}>Legal Advice</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.relatedTag}>
                <Text style={styles.relatedTagText}>Compliance</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <ReportModal
        visible={showReportModal}
        onClose={handleCloseReportModal}
        reportType={reportTarget?.type}
        targetId={reportTarget?.id}
        targetTitle={reportTarget?.title}
        onSubmit={handleReportSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK, 
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
    lineHeight: 28,
  },
  questionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questionAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  questionAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionAuthorAvatarText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  questionTime: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginTop: 2,
  },
  questionStats: {
    alignItems: 'flex-end',
  },
  questionStat: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  questionDescription: {
    fontSize: 16,
    color: COLORS.GRAY_DARK,
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tag: {
    backgroundColor: COLORS.BLUE_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: COLORS.BLUE,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY_BG,
    marginRight: 12,
  },
  reportButton: {
    backgroundColor: COLORS.RED,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeUpvote: {
    backgroundColor: COLORS.GREEN,
  },
  activeDownvote: {
    backgroundColor: COLORS.RED,
  },
  activeBookmark: {
    backgroundColor: COLORS.ORANGE,
  },
  actionButtonText: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginLeft: 4,
    fontWeight: '600',
  },
  activeUpvoteText: {
    color: COLORS.WHITE,
  },
  reportButtonText: {
    fontSize: 12,
    color: COLORS.RED,
    marginLeft: 4,
    fontWeight: '500',
  },
  answersSection: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    marginBottom: 8,
  },
  answersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  answersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  addAnswerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addAnswerButtonText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: '600',
    marginLeft: 6,
  },
  addAnswerContainer: {
    marginBottom: 20,
  },
  answerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
    paddingBottom: 16,
    marginBottom: 16,
  },
  acceptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.Light_Cyan,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  acceptedText: {
    fontSize: 12,
    color: COLORS.GREEN,
    fontWeight: '600',
    marginLeft: 4,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  answerAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorAvatarText: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  authorTitle: {
    fontSize: 12,
    color: COLORS.BLUE,
    marginTop: 2,
  },
  authorReputation: {
    fontSize: 11,
    color: COLORS.GRAY,
    marginTop: 1,
  },
  reportUserButton: {
    padding: 8,
    marginLeft: 8,
  },
  answerTime: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  answerContent: {
    fontSize: 15,
    color: COLORS.GRAY_DARK,
    lineHeight: 22,
    marginBottom: 12,
  },
  answerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerVotes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  voteText: {
    fontSize: 14,
    color: COLORS.GRAY,
    marginLeft: 4,
    fontWeight: '600',
  },
  voteTextUpvote: {
    color: COLORS.GREEN,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.Light_Cyan,
  },
  acceptButtonText: {
    fontSize: 12,
    color: COLORS.GREEN,
    marginLeft: 4,
    fontWeight: '600',
  },
  commentActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 'auto',
  },
  commentsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  commentsToggleText: {
    fontSize: 12,
    color: COLORS.BLUE,
    marginLeft: 4,
  },
  addCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 12,
  },
  addCommentText: {
    fontSize: 12,
    color: COLORS.BLUE,
    marginLeft: 4,
    fontWeight: '500',
  },
  commentsContainer: {
    marginTop: 12,
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 8,
    padding: 12,
  },
  comment: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.BLACK,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  replyButtonText: {
    fontSize: 11,
    color: COLORS.BLUE,
    marginLeft: 3,
  },
  commentReplyTo: {
    fontSize: 11,
    color: COLORS.GRAY,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 13,
    color: COLORS.GRAY_DARK,
    marginTop: 2,
    lineHeight: 18,
  },
  commentTime: {
    fontSize: 11,
    color: COLORS.GRAY,
    marginTop: 4,
  },
  relatedSection: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    marginBottom: 8,
  },
  relatedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  relatedQuestion: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_BG,
  },
  relatedQuestionTitle: {
    fontSize: 14,
    color: COLORS.BLUE,
    marginBottom: 4,
    lineHeight: 20,
  },
  relatedQuestionStats: {
    flexDirection: 'row',
  },
  relatedQuestionStat: {
    fontSize: 12,
    color: COLORS.GRAY,
    marginRight: 12,
  },
  relatedTagsSection: {
    backgroundColor: COLORS.WHITE,
    padding: 16,
    marginBottom: 16,
  },
  relatedTagsContainer: {
    flexDirection: 'row',
  },
  relatedTag: {
    backgroundColor: COLORS.GRAY_BG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  relatedTagText: {
    fontSize: 12,
    color: COLORS.GRAY_DARK,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.GRAY,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.GRAY,
    textAlign: 'center',
  },
});

export default QuestionDetail;
