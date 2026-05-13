import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Pressable, KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { aiAPI } from '../../services/api';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';

interface Message { id: string; text: string; isUser: boolean; time: string; }

const getTime = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

const QUICK_CHIPS = ['Beri contoh soal', 'Cara menyelesaikan', 'Latihan'];

const AITutorScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: 'Halo! Saya AI Tutor EduBridge. Ada yang bisa saya bantu hari ini? 😊', isUser: false, time: getTime() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const user = authStore.getUserSync();

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), text: msg, isUser: true, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const context = { subject: 'Umum', grade: user?.grade?.toString() || 'SMA', role: 'student' };
      const res = await aiAPI.tutorChat(msg, context);
      const reply = res.data?.response || res.data || res.response || 'Maaf, saya tidak mengerti. Coba ulangi pertanyaan Anda.';
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: typeof reply === 'string' ? reply : JSON.stringify(reply), isUser: false, time: getTime() };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: 'Maaf, terjadi kesalahan. Pastikan koneksi internet Anda stabil.', isUser: false, time: getTime() }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.msgRow, item.isUser && styles.msgRowUser]}>
      {!item.isUser && (
        <LinearGradient colors={[PURPLE, '#5B21B6']} style={styles.aiAvatar}>
          <Ionicons name="hardware-chip" size={16} color="#fff" />
        </LinearGradient>
      )}
      <View style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, item.isUser && styles.bubbleTextUser]}>{item.text}</Text>
        <Text style={[styles.bubbleTime, item.isUser && styles.bubbleTimeUser]}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient colors={[PURPLE, '#5B21B6']} style={styles.headerAvatar}>
          <Ionicons name="hardware-chip" size={20} color="#fff" />
        </LinearGradient>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>AI Tutor</Text>
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online • Siap membantu</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatArea}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={loading ? (
          <View style={styles.typingIndicator}>
            <LinearGradient colors={[PURPLE, '#5B21B6']} style={styles.aiAvatar}>
              <Ionicons name="hardware-chip" size={16} color="#fff" />
            </LinearGradient>
            <View style={styles.typingBubble}>
              <Text style={styles.typingText}>AI sedang mengetik...</Text>
            </View>
          </View>
        ) : null}
      />

      {/* Quick Chips */}
      <View style={styles.chipsRow}>
        {QUICK_CHIPS.map((chip, i) => (
          <Pressable key={i} style={styles.chip} onPress={() => sendMessage(chip)}>
            <Text style={styles.chipText}>{chip}</Text>
          </Pressable>
        ))}
      </View>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Ketik pertanyaanmu di sini..."
            placeholderTextColor="#94A3B8"
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
          />
          <Pressable
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <LinearGradient colors={[PURPLE, '#5B21B6']} style={styles.sendBtnInner}>
              <Ionicons name="send" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerInfo: {},
  headerName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  onlineText: { fontSize: 12, color: '#64748B' },
  chatArea: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  msgRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  bubble: { maxWidth: '75%', borderRadius: 18, padding: 12 },
  bubbleAI: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  bubbleUser: { backgroundColor: PURPLE, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: '#1E293B', lineHeight: 22 },
  bubbleTextUser: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: '#94A3B8', marginTop: 6, textAlign: 'right' },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)' },
  typingIndicator: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16 },
  typingBubble: { backgroundColor: '#fff', borderRadius: 18, borderBottomLeftRadius: 4, padding: 12, marginLeft: 8 },
  typingText: { fontSize: 13, color: '#94A3B8', fontStyle: 'italic' },
  chipsRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: { backgroundColor: '#EDE9FE', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 12, fontWeight: '600', color: PURPLE },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 16, gap: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  textInput: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 18, paddingVertical: 12, fontSize: 14, color: '#1E293B', maxHeight: 120 },
  sendBtn: { borderRadius: 22 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnInner: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});

export default AITutorScreen;