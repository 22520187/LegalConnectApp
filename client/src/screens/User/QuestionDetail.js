import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';
import CommentInput from '../../components/CommentInput/CommentInput';
import CommentItem from '../../components/CommentItem/CommentItem';

const { width } = Dimensions.get('window');

const QuestionDetail = ({ route, navigation }) => {
  const { question } = route.params;
  const [userVote, setUserVote] = useState(null); // 'upvote', 'downvote', or null
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [voteCount, setVoteCount] = useState(question.voteCount);
  const [expandedComments, setExpandedComments] = useState({});
  const [showCommentInput, setShowCommentInput] = useState({});
  const [replyTo, setReplyTo] = useState(null);
  const [answersData, setAnswersData] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [showAddAnswer, setShowAddAnswer] = useState(false);
  const currentUserId = 'current_user_id'; // In real app, get from auth context

  // Initialize answers data
  useEffect(() => {
    setAnswersData([
    {
      id: 1,
      content: 'Để khởi nghiệp tại Việt Nam, bạn cần thực hiện các bước sau:\n\n1. **Đăng ký kinh doanh**: Nộp hồ sơ tại Sở Kế hoạch và Đầu tư hoặc trực tuyến qua cổng dịch vụ công quốc gia.\n\n2. **Giấy tờ cần thiết**:\n   - Giấy chứng minh nhân dân/Căn cước công dân\n   - Tờ khai đăng ký doanh nghiệp\n   - Bản sao công chứng hợp đồng thuê văn phòng\n\n3. **Vốn pháp định**: Tối thiểu 15 tỷ đồng cho công ty cổ phần, không quy định tối thiểu cho công ty TNHH.\n\n4. **Thủ tục thuế**: Đăng ký mã số thuế, khai báo thuế hàng tháng/quý.\n\nThời gian xử lý thường là 15-20 ngày làm việc.',
      author: {
        id: 1,
        name: 'Luật sư Nguyễn Văn A',
        avatar: null,
        title: 'Chuyên gia luật doanh nghiệp',
        reputation: 1250,
      },
      voteCount: 24,
      userVote: null,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isAccepted: true,
      comments: [
        {
          id: 1,
          author: 'Mai Thu',
          authorId: 'user_1',
          content: 'Cảm ơn bạn, thông tin rất hữu ích! Tôi đang cần thông tin này để chuẩn bị cho việc khởi nghiệp.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: 2,
          author: 'Phạm Minh',
          authorId: 'user_2',
          content: 'Có cần giấy phép kinh doanh riêng không? Và thời gian xử lý thủ tục thường là bao lâu?',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: 3,
          author: 'Bạn',
          authorId: 'current_user_id',
          content: 'Trả lời @Phạm Minh: Thời gian thường là 15-20 ngày làm việc như luật sư đã nói.',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          replyTo: 'Phạm Minh'
        }
      ]
    },
    {
      id: 2,
      content: 'Bổ sung thêm một số lưu ý quan trọng:\n\n- **Chọn loại hình doanh nghiệp**: Công ty TNHH phù hợp với startup nhỏ, công ty cổ phần cho dự án lớn có nhiều nhà đầu tư.\n\n- **Địa chỉ đăng ký**: Phải có địa chỉ cụ thể, có thể thuê chỗ làm việc chung (co-working space).\n\n- **Ngành nghề kinh doanh**: Khai báo đầy đủ các ngành nghề dự kiến, tránh phải sửa đổi sau này.\n\n- **Chi phí**: Khoảng 1-3 triệu đồng cho toàn bộ thủ tục.',
      author: {
        id: 2,
        name: 'Trần Thị B',
        avatar: null,
        title: 'Kế toán trưởng',
        reputation: 890,
      },
      voteCount: 12,
      userVote: null,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isAccepted: false,
      comments: [
        {
          id: 4,
          author: 'Hoàng Nam',
          authorId: 'user_3',
          content: 'Tôi đã làm theo hướng dẫn này và rất thành công. Nhớ chuẩn bị đầy đủ giấy tờ trước khi nộp hồ sơ.',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
        }
      ]
    },
    {
      id: 3,
      content: 'Theo kinh nghiệm của tôi, nên tìm hiểu thêm về:\n\n1. **Ưu đãi cho startup**: Chính phủ có nhiều chương trình hỗ trợ startup công nghệ.\n\n2. **Bảo hiểm xã hội**: Bắt buộc cho nhân viên, tự nguyện cho chủ doanh nghiệp.\n\n3. **Hóa đơn điện tử**: Bắt buộc từ 2022, cần đăng ký sớm.\n\nNếu cần hỗ trợ cụ thể, có thể liên hệ trực tiếp.',
      author: {
        id: 3,
        name: 'Lê Văn C',
        avatar: null,
        title: 'Doanh nhân',
        reputation: 650,
      },
      voteCount: 8,
      userVote: null,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      isAccepted: false,
      comments: []
    }
    ]);
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

  const handleVote = (type) => {
    if (userVote === type) {
      // Remove vote
      setUserVote(null);
      setVoteCount(prev => type === 'upvote' ? prev - 1 : prev + 1);
    } else {
      // Add or change vote
      const oldVote = userVote;
      setUserVote(type);
      
      if (oldVote === null) {
        setVoteCount(prev => type === 'upvote' ? prev + 1 : prev - 1);
      } else {
        setVoteCount(prev => type === 'upvote' ? prev + 2 : prev - 2);
      }
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

  const handleShare = () => {
    Alert.alert('Chia sẻ', 'Chức năng chia sẻ đang được phát triển');
  };

  const handleAnswerVote = (answerId, type) => {
    Alert.alert('Vote Answer', `${type} answer ${answerId}`);
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

  const handleReplyToComment = (answerId, commentAuthor) => {
    setShowCommentInput(prev => ({
      ...prev,
      [answerId]: true
    }));
    setReplyTo(commentAuthor);
  };

  const handleSubmitComment = async (answerId, commentText) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (editingComment) {
      // Edit existing comment
      setAnswersData(prev => 
        prev.map(answer => 
          answer.id === answerId
            ? {
                ...answer,
                comments: answer.comments.map(comment => 
                  comment.id === editingComment.id
                    ? { ...comment, content: commentText, isEdited: true }
                    : comment
                )
              }
            : answer
        )
      );
      setEditingComment(null);
      Alert.alert('Thành công', 'Đã cập nhật bình luận!');
    } else {
      // Add new comment
      const newComment = {
        id: Date.now(),
        author: 'Bạn', // Current user name
        authorId: currentUserId,
        content: commentText,
        createdAt: new Date(),
        replyTo: replyTo
      };

      setAnswersData(prev => 
        prev.map(answer => 
          answer.id === answerId
            ? {
                ...answer,
                comments: [...answer.comments, newComment]
              }
            : answer
        )
      );
      Alert.alert('Thành công', 'Đã thêm bình luận của bạn!');
    }

    // Close comment input
    setShowCommentInput(prev => ({
      ...prev,
      [answerId]: false
    }));
    setReplyTo(null);

    // Expand comments to show the new one
    setExpandedComments(prev => ({
      ...prev,
      [answerId]: true
    }));
  };

  const handleCancelComment = (answerId) => {
    setShowCommentInput(prev => ({
      ...prev,
      [answerId]: false
    }));
    setReplyTo(null);
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newAnswer = {
      id: Date.now(),
      content: answerText,
      author: {
        id: currentUserId,
        name: 'Bạn',
        avatar: null,
        title: 'Thành viên',
        reputation: 0,
      },
      voteCount: 0,
      userVote: null,
      createdAt: new Date(),
      isAccepted: false,
      comments: []
    };

    setAnswersData(prev => [...prev, newAnswer]);
    setShowAddAnswer(false);
    Alert.alert('Thành công', 'Đã thêm câu trả lời của bạn!');
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
          {voteCount}
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
        onPress={handleShare}
      >
        <Ionicons name="warning-outline" size={24} color={COLORS.RED} />
      </TouchableOpacity>
    </View>
  );

  const renderAnswer = (answer) => (
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
            <Ionicons name="arrow-up" size={20} color={COLORS.GRAY} />
            <Text style={styles.voteText}>{answer.voteCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.voteButton}
            onPress={() => handleAnswerVote(answer.id, 'downvote')}
          >
            <Ionicons name="arrow-down" size={20} color={COLORS.GRAY} />
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
          
          {answersData.map(renderAnswer)}
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
});

export default QuestionDetail;
