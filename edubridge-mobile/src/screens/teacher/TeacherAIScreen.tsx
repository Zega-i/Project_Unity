import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, TextInput, Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { authStore } from '../../store/authStore';
import { aiAPI } from '../../services/api';
import PremiumModal from '../../components/PremiumModal';

const GREEN = '#16A34A';

const AI_TOOLS = [
  { 
    id: '1', 
    title: 'Buat Kuis Instan', 
    desc: 'Buat kuis dari materi yang Anda unggah hanya dalam beberapa detik.', 
    icon: 'document-text-outline', 
    color: '#8B5CF6' 
  },
  { 
    id: '2', 
    title: 'Deteksi Topik Lemah', 
    desc: 'AI menganalisis hasil belajar dan menemukan topik yang perlu diperkuat.', 
    icon: 'analytics-outline', 
    color: '#F59E0B' 
  },
  { 
    id: '3', 
    title: 'Rancang Remedial', 
    desc: 'Dapatkan rekomendasi materi dan aktivitas remedial untuk siswa.', 
    icon: 'construct-outline', 
    color: '#10B981' 
  },
  { 
    id: '4', 
    title: 'Ringkas Materi', 
    desc: 'Ringkas materi panjang menjadi poin-poin penting secara otomatis.', 
    icon: 'list-outline', 
    color: '#3B82F6' 
  },
  { 
    id: '5', 
    title: 'Buat RPP Otomatis', 
    desc: 'Ubah materi menjadi Rencana Pelaksanaan Pembelajaran (RPP) yang kreatif.', 
    icon: 'calendar-outline', 
    color: '#EC4899' 
  },
];

const TeacherAIScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const user = authStore.getUserSync();
  const firstName = user?.name?.split(' ')[0] || 'Guru';

  const { studentName, recommendation, performanceData, type, classStats } = route.params || {};

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string; type: string; base64?: string } | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const initContextualChat = async () => {
    if (type === 'CLASS_STRATEGY' && classStats) {
      const promptText = `Bagaimana rancangan strategi pengajaran detail untuk kelas saya berdasarkan statistik berikut?\n- Rata-rata Nilai Kelas: ${classStats.summary?.avgScore || 0}%\n- Tingkat Keaktifan Kehadiran: ${classStats.summary?.activeRate || 0}%\n- Total Siswa: ${classStats.summary?.totalStudents || 0}\n\nSiswa yang perlu perhatian khusus:\n${(classStats.atRisk || []).map((s: any) => `- ${s.name} (${s.kelas || ''}): Rerata ${s.avg || 'N/A'}, Masalah: ${s.issue}`).join('\n')}`;
      const userMsg = { id: Date.now().toString(), text: promptText, sender: 'user' };
      setMessages([userMsg]);
      setLoading(true);
      try {
        const response = await aiAPI.tutorChat(promptText, {
          role: 'TEACHER',
          type,
          classStats,
          history: []
        });
        const aiMsg = { 
          id: (Date.now() + 1).toString(), 
          text: response.data?.response || 'Maaf, saya sedang tidak bisa menjawab.', 
          sender: 'ai' 
        };
        setMessages([userMsg, aiMsg]);
      } catch (error) {
        setAlertModal({
          visible: true,
          type: 'error',
          title: 'Gagal',
          message: 'Gagal menghubungi asisten AI.',
        });
      } finally {
        setLoading(false);
      }
    } else if (studentName && recommendation) {
      const promptText = `Bagaimana langkah konkret membantu siswa bernama ${studentName} berdasarkan rekomendasi berikut: "${recommendation}"?`;
      const userMsg = { id: Date.now().toString(), text: promptText, sender: 'user' };
      setMessages([userMsg]);
      setLoading(true);
      try {
        const response = await aiAPI.tutorChat(promptText, { 
          role: 'TEACHER',
          studentName,
          recommendation,
          performanceData,
          history: []
        });
        const aiMsg = { 
          id: (Date.now() + 1).toString(), 
          text: response.data?.response || 'Maaf, saya sedang tidak bisa menjawab.', 
          sender: 'ai' 
        };
        setMessages([userMsg, aiMsg]);
      } catch (error) {
        setAlertModal({
          visible: true,
          type: 'error',
          title: 'Gagal',
          message: 'Gagal menghubungi asisten AI.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      setMessages([]);
    }
  };

  useEffect(() => {
    initContextualChat();
  }, [studentName, recommendation, type, classStats]);

  const handleReset = () => {
    triggerLight();
    setMessage('');
    setSelectedFile(null);
    if (studentName || type) {
      initContextualChat();
    } else {
      setMessages([]);
    }
  };

  const handlePickFile = async () => {
    triggerLight();
    setUploadingFile(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileSizeMB = asset.size ? asset.size / (1024 * 1024) : 0;
        if (fileSizeMB > 2) {
          setAlertModal({
            visible: true,
            type: 'warning',
            title: 'File Terlalu Besar',
            message: 'Ukuran file PDF melebihi batas maksimal 2MB. Silakan pilih file yang lebih kecil.',
          });
          setUploadingFile(false);
          return;
        }

        setSelectedFile({
          name: asset.name,
          uri: asset.uri,
          type: asset.mimeType || 'application/pdf',
        });
      }
    } catch (err: any) {
      console.log('DocumentPicker error:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setLoading(true);
    triggerLight();

    const fileToUpload = selectedFile;
    setSelectedFile(null); // Clear attached file from UI immediately

    let fileBase64: string | undefined;

    if (fileToUpload) {
      try {
        const decodedUri = decodeURIComponent(fileToUpload.uri);
        const tempUri = `${FileSystem.cacheDirectory}temp_ai_${Date.now()}_${fileToUpload.name.replace(/\s+/g, '_')}`;

        try {
          await FileSystem.copyAsync({
            from: decodedUri,
            to: tempUri
          });
          fileBase64 = await FileSystem.readAsStringAsync(tempUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          await FileSystem.deleteAsync(tempUri, { idempotent: true });
        } catch (copyErr) {
          console.log("[FileSystem AI Copy Error] Copy failed, attempting direct read:", copyErr);
          fileBase64 = await FileSystem.readAsStringAsync(decodedUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      } catch (error) {
        console.log("[FileSystem AI Error] Gagal membaca file as base64:", error);
      }
    }

    try {
      const response = await aiAPI.tutorChat(
        text,
        { 
          role: 'TEACHER',
          studentName,
          recommendation,
          performanceData,
          type,
          classStats,
          history: messages
        },
        fileBase64,
        fileToUpload?.name
      );
      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        text: response.data?.response || 'Maaf, saya sedang tidak bisa menjawab.', 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      if (fileToUpload) setSelectedFile(fileToUpload); // Restore attachment on failure
      
      setAlertModal({
        visible: true,
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menghubungi asisten AI.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!message.trim() || uploadingFile) return;
    sendMessage(message);
    setMessage('');
  };

  const handleToolPress = (toolTitle: string) => {
    let prompt = '';
    switch (toolTitle) {
      case 'Buat Kuis Instan':
        prompt = selectedFile
          ? `Bantu saya membuat kuis instan berdasarkan dokumen pelajaran yang saya unggah (${selectedFile.name}). Harap buat kuis pilihan ganda lengkap dengan kunci jawabannya.`
          : 'Bantu saya membuat kuis instan untuk kelas saya. Apa saja materi yang perlu saya persiapkan?';
        break;
      case 'Deteksi Topik Lemah':
        prompt = selectedFile 
          ? `Bantu saya mendeteksi topik lemah siswa berdasarkan dokumen evaluasi yang saya unggah (${selectedFile.name}).`
          : 'Bagaimana cara mendeteksi topik lemah siswa secara efektif menggunakan data evaluasi di EduBridge?';
        break;
      case 'Rancang Remedial':
        prompt = selectedFile
          ? `Bantu saya merancang materi dan aktivitas remedial yang menarik berdasarkan dokumen pelajaran yang saya unggah (${selectedFile.name}).`
          : 'Bantu saya merancang materi dan aktivitas remedial yang menarik untuk siswa yang tertinggal.';
        break;
      case 'Ringkas Materi':
        prompt = selectedFile
          ? `Bantu saya meringkas materi pelajaran dari dokumen yang saya unggah (${selectedFile.name}) menjadi poin-poin penting yang padat dan mudah dipahami.`
          : 'Bantu saya meringkas materi pelajaran yang panjang menjadi poin-poin penting secara otomatis.';
        break;
      case 'Buat RPP Otomatis':
        prompt = selectedFile
          ? `Bantu saya menyusun Rencana Pelaksanaan Pembelajaran (RPP) yang kreatif dan terstruktur berdasarkan materi dalam dokumen yang saya unggah (${selectedFile.name}).`
          : 'Bantu saya menyusun Rencana Pelaksanaan Pembelajaran (RPP) yang kreatif dan terstruktur untuk materi pelajaran saya.';
        break;
      default:
        prompt = selectedFile
          ? `Bantu saya mengenai hal ini berdasarkan dokumen yang saya unggah (${selectedFile.name}): ${toolTitle}`
          : `Bantu saya mengenai: ${toolTitle}`;
    }
    sendMessage(prompt);
  };

  const isContextual = !!(studentName || type);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isContextual && (
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          )}
          <View style={styles.botIcon}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {type === 'CLASS_STRATEGY' ? 'AI Strategist' : studentName ? 'AI Siswa' : 'AI Assistant'}
            </Text>
            <View style={styles.badge}><Text style={styles.badgeText}>GURU</Text></View>
          </View>
        </View>
        
        {messages.length > 0 ? (
          <Pressable onPress={handleReset} style={styles.resetHeaderBtn}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.resetHeaderLabel}>Reset</Text>
          </Pressable>
        ) : (
          !isContextual ? (
            <Pressable 
              style={styles.notifBtn} 
              onPress={() => { triggerLight(); navigation.navigate('Notifications' as any); }}
            >
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
            </Pressable>
          ) : null
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Hai {user?.role === 'TEACHER' ? 'Pak/Bu' : ''} {firstName}! 👋</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            Saya siap membantu Anda mengajar lebih cerdas. Pilih bantuan yang Anda butuhkan atau langsung tanya di bawah.
          </Text>
        </View>

        {messages.length === 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Alat Bantu AI</Text>
            
            {AI_TOOLS.map((tool) => (
              <Pressable 
                key={tool.id} 
                style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  triggerLight();
                  handleToolPress(tool.title);
                }}
              >
                <View style={[styles.iconBox, { backgroundColor: tool.color + '15' }]}>
                  <Ionicons name={tool.icon as any} size={24} color={tool.color} />
                </View>
                <View style={styles.toolInfo}>
                  <Text style={[styles.toolTitle, { color: colors.text }]}>{tool.title}</Text>
                  <Text style={[styles.toolDesc, { color: colors.textSecondary }]}>{tool.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
          </>
        )}

        {messages.length > 0 && (
          <View style={styles.chatWrap}>
            {messages.map((msg) => (
              <View 
                key={msg.id} 
                style={[
                  styles.msgBubble, 
                  msg.sender === 'user' ? styles.userBubble : [styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border }]
                ]}
              >
                <Text style={[styles.msgText, { color: msg.sender === 'user' ? '#FFF' : colors.text }]}>
                  {msg.text}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.aiBubble, { backgroundColor: colors.card, borderColor: colors.border, width: 60, alignItems: 'center' }]}>
                <ActivityIndicator size="small" color={GREEN} />
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Chat Input Container */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {selectedFile && (
          <View style={[styles.fileBanner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="document-text" size={18} color={GREEN} />
            <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
              {selectedFile.name}
            </Text>
            <Pressable style={styles.clearFileBtn} onPress={() => { triggerLight(); setSelectedFile(null); }}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
            </Pressable>
          </View>
        )}

        <View style={styles.inputRow}>
          <Pressable 
            style={[styles.attachBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} 
            onPress={handlePickFile}
            disabled={loading || uploadingFile}
          >
            {uploadingFile ? (
              <ActivityIndicator size="small" color={GREEN} />
            ) : (
              <Ionicons name="attach-outline" size={22} color={selectedFile ? GREEN : colors.textSecondary} />
            )}
          </Pressable>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Tanya AI Assistant..."
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline={false}
            onSubmitEditing={handleSend}
            editable={!loading && !uploadingFile}
          />
          <Pressable style={[styles.sendBtn, (loading || uploadingFile) && { opacity: 0.5 }]} onPress={handleSend} disabled={loading || uploadingFile}>
            <Ionicons name="arrow-forward" size={24} color="#FFF" />
          </Pressable>
        </View>
      </View>
      {alertModal && (
        <PremiumModal
          visible={alertModal.visible}
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
          onConfirm={() => setAlertModal(null)}
          accentColor={GREEN}
          minimal
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4, marginRight: 4 },
  resetHeaderBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EF444415', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  resetHeaderLabel: { fontSize: 12, fontWeight: 'bold', color: '#EF4444' },
  botIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  badge: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  notifBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20 },
  hero: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 28 },
  heroTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  heroSub: { fontSize: 14, lineHeight: 22 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  toolCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 14 },
  iconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  toolInfo: { flex: 1 },
  toolTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  toolDesc: { fontSize: 12, lineHeight: 18 },
  inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', gap: 12, alignItems: 'center', width: '100%' },
  input: { flex: 1, height: 50, borderRadius: 25, paddingHorizontal: 20, borderWidth: 1 },
  sendBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
  attachBtn: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  fileBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 8 },
  fileName: { flex: 1, fontSize: 13, fontWeight: '500' },
  clearFileBtn: { padding: 2 },
  chatWrap: { gap: 16 },
  msgBubble: { padding: 16, borderRadius: 20, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: GREEN },
  aiBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1 },
  msgText: { fontSize: 14, lineHeight: 20 },
});

export default TeacherAIScreen;
