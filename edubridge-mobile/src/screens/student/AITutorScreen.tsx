import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

const PURPLE = '#7C3AED';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AITutorScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya adalah AI Tutor Anda. Ada yang ingin Anda tanyakan tentang pelajaran hari ini?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Terima kasih atas pertanyaan Anda. Mari saya jelaskan dengan lebih detail...',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 500);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.isUser ? styles.userText : styles.aiText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          scrollEnabled={true}
        />

        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder="Tanyakan sesuatu..."
            placeholderTextColor="#ccc"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleSend}
          >
            <Text style={styles.sendIcon}>📤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  messageContainer: {
    marginVertical: 8,
    flexDirection: 'row',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: PURPLE,
  },
  aiBubble: {
    backgroundColor: '#f0f0f0',
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#1a1a1a',
  },
  inputSection: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1a1a1a',
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 20,
  },
});

export default AITutorScreen;