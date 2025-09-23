import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const CommentInput = ({ 
  onSubmit, 
  onCancel, 
  placeholder = "Viết bình luận của bạn...",
  visible = true,
  autoFocus = false,
  replyTo = null,
  initialText = ''
}) => {
  const [comment, setComment] = useState(initialText);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(visible ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  React.useEffect(() => {
    setComment(initialText);
  }, [initialText]);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bình luận');
      return;
    }

    if (comment.trim().length < 5) {
      Alert.alert('Lỗi', 'Bình luận phải có ít nhất 5 ký tự');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(comment.trim());
      setComment('');
      if (onCancel) onCancel(); // Close input after successful submit
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setComment('');
    if (onCancel) onCancel();
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {replyTo && (
        <View style={styles.replyToContainer}>
          <Ionicons name="return-down-forward" size={16} color={COLORS.BLUE} />
          <Text style={styles.replyToText}>
            Trả lời cho <Text style={styles.replyToAuthor}>{replyTo}</Text>
          </Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={COLORS.GRAY}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={3}
          maxLength={500}
          autoFocus={autoFocus}
          editable={!isSubmitting}
        />
        
        <View style={styles.inputFooter}>
          <View style={styles.charCount}>
            <Text style={[
              styles.charCountText,
              comment.length > 450 && styles.charCountWarning
            ]}>
              {comment.length}/500
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!comment.trim() || isSubmitting) && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!comment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Ionicons name="hourglass" size={16} color={COLORS.WHITE} />
              ) : (
                <Ionicons name="send" size={16} color={COLORS.WHITE} />
              )}
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
  },
  replyToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.BLUE_LIGHT,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  replyToText: {
    fontSize: 12,
    color: COLORS.BLUE,
    marginLeft: 6,
  },
  replyToAuthor: {
    fontWeight: '600',
  },
  inputContainer: {
    padding: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.GRAY_LIGHT,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.BLACK,
    textAlignVertical: 'top',
    minHeight: 80,
    maxHeight: 120,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    flex: 1,
  },
  charCountText: {
    fontSize: 12,
    color: COLORS.GRAY,
  },
  charCountWarning: {
    color: COLORS.ORANGE,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.GRAY,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BLUE,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.GRAY,
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default CommentInput;
