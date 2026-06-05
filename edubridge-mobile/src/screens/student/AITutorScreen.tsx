import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, ScrollView,
  Pressable, KeyboardAvoidingView, Platform, SafeAreaView,
  Keyboard, Animated, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { aiAPI } from '../../services/api';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useTheme } from '../../contexts/ThemeContext';
import { authStore } from '../../store/authStore';
import { USE_MOCK_DATA } from '../../constants';
import PremiumModal from '../../components/PremiumModal';

const PURPLE = '#7C3AED';
const SCREEN_WIDTH = Dimensions.get('window').width;
const PANEL_WIDTH = SCREEN_WIDTH * 0.78;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

const INITIAL_MESSAGE: Message = {
  id: '1',
  text: 'Halo! Aku AI Tutor EduBridge 👋\n\nAda yang bisa aku bantu? Kamu bisa tanya soal pelajaran, minta penjelasan materi, atau latihan soal apa saja.',
  isUser: false,
};

const MOCK_MESSAGES: Message[] = [
  INITIAL_MESSAGE,
  {
    id: 'mock_1',
    text: 'Halo! Saya sedang kesulitan memahami materi Aljabar khususnya cara menyelesaikan sistem persamaan linear dua variabel (SPLDV). Bisa tolong berikan contoh dan penjelasannya?',
    isUser: true
  },
  {
    id: 'mock_2',
    text: 'Tentu, dengan senang hati! 😊\n\nMisalkan kita memiliki sistem persamaan berikut:\n1) 2x + y = 8\n2) x - y = 1\n\nKita bisa menyelesaikannya dengan metode **Eliminasi** atau **Substitusi**.\n\nMari gunakan metode **Eliminasi** dengan menjumlahkan kedua persamaan:\n(2x + y) + (x - y) = 8 + 1\n3x = 9\n**x = 3**\n\nSekarang substitusikan x = 3 ke persamaan (2):\n3 - y = 1\n-y = 1 - 3\n-y = -2\n**y = 2**\n\nJadi, solusinya adalah **x = 3** dan **y = 2**.\nApakah kamu ingin mencoba latihan soal serupa?',
    isUser: false
  },
  {
    id: 'mock_3',
    text: 'Wah, penjelasan langkah-langkahnya sangat jelas dan mudah diikuti! Terima kasih banyak, AI Tutor!',
    isUser: true
  },
  {
    id: 'mock_4',
    text: 'Sama-sama! Senang sekali bisa membantu. Ingat, kamu bisa meminta soal latihan kapan saja untuk menguji pemahamanmu. Semangat belajarnya! 💪📚',
    isUser: false
  }
];

const AITutorScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { subject, topic } = route.params || {};
  const { triggerMedium, triggerLight } = useHapticFeedback();
  const { colors } = useTheme();

  const [messages, setMessages] = useState<Message[]>(
    USE_MOCK_DATA ? MOCK_MESSAGES : [INITIAL_MESSAGE]
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; sessionId: string | null }>({ visible: false, sessionId: null });

  const handleDeleteSession = async () => {
    const sessionId = deleteModal.sessionId;
    if (!sessionId) return;
    try {
      const userData = authStore.getUserSync();
      if (!userData?.id) return;
      const userHistoryKey = `ai_tutor_history_${userData.id}`;
      const filtered = sessions.filter(s => s.id !== sessionId);
      setSessions(filtered);
      await AsyncStorage.setItem(userHistoryKey, JSON.stringify(filtered));
      if (currentSessionId === sessionId) {
        setMessages([INITIAL_MESSAGE]);
        setCurrentSessionId(null);
      }
    } catch (err) {
      console.log('Error deleting session:', err);
    } finally {
      setDeleteModal({ visible: false, sessionId: null });
    }
  };

  const flatListRef = useRef<FlatList>(null);
  const panelAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHistory();
    if (subject && !USE_MOCK_DATA) {
      const introMsg: Message = {
        id: 'intro-ctx',
        text: `Aku melihat kamu sedang belajar **${subject}**${topic ? ` (Topik: ${topic})` : ''}. Ada bagian yang ingin kamu tanyakan spesifik tentang materi ini?`,
        isUser: false
      };
      setMessages(prev => [...prev, introMsg]);
    }
  }, [subject, topic]);

  const loadHistory = async () => {
    try {
      const userData = authStore.getUserSync();
      if (userData?.id) {
        const userHistoryKey = `ai_tutor_history_${userData.id}`;
        const stored = await AsyncStorage.getItem(userHistoryKey);
        if (stored) setSessions(JSON.parse(stored));
      }
    } catch {}
  };

  const openHistory = () => {
    setHistoryVisible(true);
    Animated.parallel([
      Animated.spring(panelAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 0 }),
      Animated.timing(overlayAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const closeHistory = () => {
    Animated.parallel([
      Animated.spring(panelAnim, { toValue: -PANEL_WIDTH, useNativeDriver: true, speed: 20, bounciness: 0 }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => setHistoryVisible(false));
  };

  const saveSession = async (updatedMessages: Message[], sessionId: string, title: string) => {
    try {
      const userData = authStore.getUserSync();
      if (!userData?.id) return;
      
      const userHistoryKey = `ai_tutor_history_${userData.id}`;
      const stored = await AsyncStorage.getItem(userHistoryKey);
      const existing: ChatSession[] = stored ? JSON.parse(stored) : [];
      const idx = existing.findIndex(s => s.id === sessionId);
      let updated: ChatSession[];
      if (idx >= 0) {
        updated = existing.map(s => s.id === sessionId ? { ...s, messages: updatedMessages } : s);
      } else {
        updated = [{ id: sessionId, title, messages: updatedMessages, createdAt: Date.now() }, ...existing];
      }
      const limited = updated.slice(0, 20);
      setSessions(limited);
      await AsyncStorage.setItem(userHistoryKey, JSON.stringify(limited));
    } catch {}
  };

  const startNewSession = () => {
    triggerLight();
    setMessages([INITIAL_MESSAGE]);
    setCurrentSessionId(null);
    setInput('');
    closeHistory();
  };

  const loadSession = (session: ChatSession) => {
    triggerLight();
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    closeHistory();
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 150);
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), text: msg, isUser: true };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = Date.now().toString();
      setCurrentSessionId(sessionId);
    }

    try {
      const context = { 
        subject, 
        topic, 
        role: 'STUDENT',
        history: messages.map((m: any) => ({
          text: m.text,
          sender: m.isUser ? 'user' : 'ai'
        }))
      };
      const res = await aiAPI.tutorChat(msg, context);
      const aiReply = res.data?.response || res.response || 'Maaf, saya tidak mengerti. Bisa ulangi?';
      const aiMsg: Message = { id: (Date.now() + 1).toString(), text: aiReply, isUser: false };
      const finalMessages = [...newMessages, aiMsg];
      setMessages(finalMessages);
      const firstUserText = newMessages.find(m => m.isUser)?.text || msg;
      const title = firstUserText.length > 40 ? firstUserText.slice(0, 40) + '…' : firstUserText;
      await saveSession(finalMessages, sessionId, title);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: 'Koneksi bermasalah, coba lagi ya!', isUser: false }]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
  };

  const handleChip = (chip: string) => {
    triggerLight();
    if (loading) return;

    // Check if we have any active subject/topic from route params OR if the student has already sent messages
    const hasContext = !!(subject || topic || messages.some(m => m.isUser));

    if (chip === 'Beri contoh soal' && !hasContext) {
      const ts = Date.now();
      setMessages(prev => [
        ...prev,
        { id: String(ts), text: chip, isUser: true },
        { id: String(ts + 1), text: 'Mohon maaf, Anda belum memberikan informasi kepada saya terkait materi apa yang ingin kita bahas! Silakan sebutkan mata pelajaran atau topik yang ingin kamu pelajari terlebih dahulu.', isUser: false },
      ]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } else if (chip === 'Cara menyelesaikan' && !hasContext) {
      const ts = Date.now();
      setMessages(prev => [
        ...prev,
        { id: String(ts), text: chip, isUser: true },
        { id: String(ts + 1), text: 'Silakan berikan soal atau pertanyaan yang ingin kamu selesaikan terlebih dahulu, ya! Aku akan membantu menjelaskan langkah-langkahnya dengan detail.', isUser: false },
      ]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } else {
      sendMessage(chip);
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

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => { triggerLight(); Keyboard.dismiss(); navigation.goBack(); }}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={[styles.headerProfile, { flex: 1 }]}>
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
        <Pressable style={styles.historyBtn} onPress={() => { triggerLight(); openHistory(); }}>
          <Ionicons name="time-outline" size={22} color={colors.text} />
        </Pressable>
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
        />

        {/* Quick Chips */}
        <View style={[styles.chipsRow, { backgroundColor: colors.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['Beri contoh soal', 'Cara menyelesaikan', 'Latihan'].map((chip, i) => (
              <Pressable key={i} style={[styles.chip, { backgroundColor: colors.primaryLight, borderColor: colors.border }]} onPress={() => handleChip(chip)}>
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

      {/* History Sliding Panel */}
      {historyVisible && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.historyOverlay, { opacity: overlayAnim }]} pointerEvents="auto">
            <Pressable style={StyleSheet.absoluteFill} onPress={closeHistory} />
          </Animated.View>
          <Animated.View style={[styles.historyPanel, { backgroundColor: colors.card, transform: [{ translateX: panelAnim }] }]}>
            <View style={[styles.panelHeader, { borderBottomColor: colors.border, paddingTop: Constants.statusBarHeight + 16 }]}>
              <Text style={[styles.panelTitle, { color: colors.text }]}>Riwayat Chat</Text>
              <Pressable onPress={() => { triggerLight(); closeHistory(); }}>
                <Ionicons name="close" size={22} color={colors.text} />
              </Pressable>
            </View>

            <Pressable style={styles.newChatBtn} onPress={startNewSession}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={styles.newChatText}>Sesi Baru</Text>
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {sessions.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Ionicons name="chatbubble-outline" size={36} color={colors.textSecondary} />
                  <Text style={[styles.emptyHistoryText, { color: colors.textSecondary }]}>Belum ada riwayat chat</Text>
                </View>
              ) : (
                sessions.map(session => (
                  <View
                    key={session.id}
                    style={[
                      styles.sessionItemContainer,
                      { borderBottomColor: colors.border },
                      currentSessionId === session.id && { backgroundColor: PURPLE + '12' },
                    ]}
                  >
                    <Pressable
                      style={styles.sessionItemPressable}
                      onPress={() => loadSession(session)}
                    >
                      <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={15}
                        color={currentSessionId === session.id ? PURPLE : colors.textSecondary}
                        style={{ marginRight: 10, marginTop: 2, flexShrink: 0 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.sessionTitle, { color: currentSessionId === session.id ? PURPLE : colors.text }]} numberOfLines={2}>
                          {session.title}
                        </Text>
                        <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>{formatDate(session.createdAt)}</Text>
                      </View>
                    </Pressable>
                    <Pressable
                      style={styles.moreBtn}
                      onPress={() => { triggerLight(); setDeleteModal({ visible: true, sessionId: session.id }); }}
                    >
                      <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
                    </Pressable>
                  </View>
                ))
              )}
            </ScrollView>
          </Animated.View>
        </View>
      )}
      <PremiumModal
        visible={deleteModal.visible}
        type="warning"
        title="Hapus Obrolan?"
        message="Riwayat obrolan ini akan dihapus secara permanen. Yakin?"
        confirmText="Hapus"
        cancelText="Batal"
        onConfirm={handleDeleteSession}
        onCancel={() => setDeleteModal({ visible: false, sessionId: null })}
        minimal
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backBtn: { marginRight: 8 },
  historyBtn: { padding: 4 },
  headerProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerName: { fontSize: 16, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  statusText: { fontSize: 12 },
  chatArea: { padding: 20, paddingBottom: 16 },
  msgRow: { flexDirection: 'row', marginBottom: 20, maxWidth: '85%' },
  msgRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgRowAI: { alignSelf: 'flex-start' },
  aiAvatarSmall: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 4 },
  bubble: { borderRadius: 20, padding: 16 },
  bubbleAI: { borderTopLeftRadius: 4 },
  bubbleUser: { backgroundColor: PURPLE, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextUser: { color: '#FFFFFF' },
  chipsRow: { paddingHorizontal: 16, paddingVertical: 10 },
  chip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 16, borderTopWidth: 1, gap: 12, paddingBottom: 20 },
  textInput: { flex: 1, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 14, fontSize: 15, borderWidth: 1, maxHeight: 150 },
  sendBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },

  historyOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  historyPanel: { position: 'absolute', top: 0, left: 0, bottom: 0, width: PANEL_WIDTH, shadowColor: '#000', shadowOffset: { width: 3, height: 0 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 12 },
  panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
  panelTitle: { fontSize: 18, fontWeight: 'bold' },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 16, paddingVertical: 13, borderRadius: 12, backgroundColor: PURPLE },
  newChatText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  sessionItemContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingRight: 4 },
  sessionItemPressable: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 14 },
  moreBtn: { padding: 12, justifyContent: 'center', alignItems: 'center' },
  sessionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4, lineHeight: 18 },
  sessionDate: { fontSize: 11 },
  emptyHistory: { alignItems: 'center', paddingTop: 48, gap: 12 },
  emptyHistoryText: { fontSize: 13 },
});

export default AITutorScreen;
