import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Platform,
  KeyboardAvoidingView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const ChatInput = ({ onSendMessage, placeholder = "Nhập câu hỏi của bạn...", disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, disabled && styles.disabledInput]}
            value={message}
            onChangeText={setMessage}
            placeholder={placeholder}
            placeholderTextColor={COLORS.GRAY}
            multiline
            maxLength={1000}
            editable={!disabled}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || disabled) && styles.sendButtonDisabled
            ]}
            onPress={handleSend}
            disabled={!message.trim() || disabled}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={(!message.trim() || disabled) ? COLORS.GRAY : COLORS.WHITE} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_BG,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.GRAY_BG,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.BLACK,
    maxHeight: 120,
    paddingVertical: 8,
    paddingRight: 12,
  },
  disabledInput: {
    color: COLORS.GRAY,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.GRAY_BG,
  },
});

export default ChatInput;
