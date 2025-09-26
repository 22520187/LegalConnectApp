import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constant/colors';

const ChatMessage = ({ message, isUser, timestamp }) => {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.botContainer]}>
      <View style={[styles.messageWrapper, isUser ? styles.userMessage : styles.botMessage]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.BLUE} />
          </View>
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {message}
          </Text>
          {timestamp && (
            <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp]}>
              {timestamp}
            </Text>
          )}
        </View>

        {isUser && (
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={20} color={COLORS.BLUE} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  botContainer: {
    alignItems: 'flex-start',
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userMessage: {
    flexDirection: 'row-reverse',
  },
  botMessage: {
    flexDirection: 'row',
  },
  avatarContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.GRAY_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: COLORS.BLUE,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.WHITE,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.GRAY_BG,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: COLORS.WHITE,
  },
  botText: {
    color: COLORS.BLACK,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: COLORS.WHITE,
    textAlign: 'right',
  },
  botTimestamp: {
    color: COLORS.GRAY,
    textAlign: 'left',
  },
});

export default ChatMessage;









