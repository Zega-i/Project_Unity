import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, ScrollView,
  Pressable, KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator, Image, Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { aiAPI } from '../../services/api';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useTheme } from '../../contexts/ThemeContext';

const PURPLE = '#7C3AED';
const AI_GRAY = '#F1F5F9';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const AITutorScreen = () => {
  const navigation = useNavigation<any>();
  const { triggerMedium, triggerLight } = useHapticFeedback();
  const { colors, isDarkMode } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Aku AI Tutor EduBridge 👋\n\nAda yang bisa aku bantu? Kamu bisa tanya soal pelajaran, minta penjelasan materi, atau latihan soal apa saja.',
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), text: msg, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiAPI.tutorChat(msg);
      const aiReply = res.data?.response || res.response || 'Maaf, saya tidak mengerti. Bisa ulangi?';
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiReply, isUser: false }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: 'Koneksi bermasalah, coba lagi ya!', isUser: false }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.isUser ? styles.msgRowUser : styles.msgRowAI]}>
      {!item.isUser && (
        <View style={[styles.aiAvatarSmall, { backgroundColor: colors.surface }]}>
          <Ionicons name="hardware-chip" size={16} color={PURPLE} />
        </View>
      )}
      <View style={[styles.bubble, item.isUser ? styles.bubbleUser : [styles.bubbleAI, { backgroundColor: colors.surface }]]}>
        <Text style={[styles.bubbleText, { color: colors.text }, item.isUser && styles.bubbleTextUser]}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => { triggerLight(); Keyboard.dismiss(); navigation.goBack(); }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerProfile}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="hardware-chip" size={24} color={PURPLE} />
          </View>
          <View>
            <Text style={[styles.headerName, { color: colors.text }]}>AI Tutor</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.keyboardAvoid}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatArea}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          scrollEnabled={true}
        />

        {/* Quick Chips */}
        <View style={[styles.chipsRow, { backgroundColor: colors.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Beri contoh soal', 'Cara menyelesaikan', 'Latihan'].map((chip, i) => (
              <Pressable key={i} style={[styles.chip, { backgroundColor: colors.primaryLight, borderColor: colors.border }]} onPress={() => { triggerLight(); sendMessage(chip); }}>
                <Text style={[styles.chipText, { color: colors.primary }]}>{chip}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ketik pertanyaanmu..."
            placeholderTextColor={colors.placeholder}
            onFocus={() => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200)}
            multiline={true}
            numberOfLines={4}
          />
          <Pressable style={styles.sendBtn} onPress={() => { triggerMedium(); sendMessage(); }}>
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { marginRight: 16 },
  headerProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  statusText: { fontSize: 12, color: '#64748B' },
  chatArea: { padding: 20, paddingBottom: 90 },
  msgRow: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgRowAI: { alignSelf: 'flex-start' },
  aiAvatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 4 },
  bubble: { borderRadius: 20, padding: 16 },
  bubbleAI: { backgroundColor: AI_GRAY, borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: PURPLE, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22, color: '#1E293B' },
  bubbleTextUser: { color: '#FFFFFF' },
  chipsRow: { paddingHorizontal: 16, paddingVertical: 12 },
  chip: { backgroundColor: '#F5F3FF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderWidth: 1, borderColor: '#E9E4FF' },
  chipText: { fontSize: 13, color: PURPLE, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 12, paddingBottom: 20 },
  textInput: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 14, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0', maxHeight: 150 },
  sendBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, marginBottom: 0 },
});

export default AITutorScreen;