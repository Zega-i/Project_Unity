import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { aiAPI } from '../../services/api';

const PURPLE = '#7C3AED';
const LIGHT_PURPLE = '#F5F3FF';

interface Message {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: string;
}

const AITutorScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya AI Tutor EduBridge. Ada yang bisa saya bantu hari ini?',
      isAI: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMsg,
      isAI: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.tutorChat(userMsg);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data?.response || response.response || 'Maaf, saya sedang mengalami gangguan.',
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: 'Terjadi kesalahan koneksi. Pastikan server Railway menyala.',
        isAI: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.aiAvatar}>
              <Ionicons name="hardware-chip" size={24} color="#fff" />
            </View>
            <View>
              <Text style={styles.title}>AI Tutor</Text>
              <Text style={styles.subtitle}>Aktif 24/7 siap membantumu</Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.isAI ? styles.aiRow : styles.userRow,
              ]}
            >
              {msg.isAI && (
                <View style={styles.msgAvatar}>
                  <Ionicons name="hardware-chip-outline" size={16} color={PURPLE} />
                </View>
              )}
              <View
                style={[
                  styles.bubble,
                  msg.isAI ? styles.aiBubble : styles.userBubble,
                ]}
              >
                <Text style={[styles.messageText, msg.isAI ? styles.aiText : styles.userText]}>
                  {msg.text}
                </Text>
                <Text style={[styles.timeText, msg.isAI ? styles.aiTime : styles.userTime]}>
                  {msg.timestamp}
                </Text>
              </View>
            </View>
          ))}
          {loading && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <View style={styles.msgAvatar}>
                <Ionicons name="hardware-chip-outline" size={16} color={PURPLE} />
              </View>
              <View style={[styles.bubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color={PURPLE} />
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ketik pertanyaanmu di sini..."
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || loading}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </Pressable>
          </View>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },
  messageRow: {
    flexDirection: 'row',
    maxWidth: '85%',
    gap: 8,
  },
  aiRow: {
    alignSelf: 'flex-start',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: PURPLE,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: '#1e293b',
  },
  userText: {
    color: '#fff',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  aiTime: {
    color: '#94a3b8',
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputArea: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    color: '#1e293b',
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
});

export default AITutorScreen;