import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar, TextInput, Image, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { authStore } from '../../store/authStore';

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
];

const TeacherAIScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const user = authStore.getUserSync();
  const firstName = user?.name?.split(' ')[0] || 'Budi';

  const [message, setMessage] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botIcon}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Assistant</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>GURU</Text></View>
          </View>
        </View>
        <Pressable style={styles.notifBtn}><Ionicons name="notifications-outline" size={24} color={colors.text} /></Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Hai Pak {firstName}! 👋</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            Saya siap membantu Anda mengajar lebih cerdas. Pilih bantuan yang Anda butuhkan di bawah ini.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Rekomendasi AI</Text>
        
        {AI_TOOLS.map((tool) => (
          <Pressable 
            key={tool.id} 
            style={[styles.toolCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => triggerLight()}
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

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Chat Input Container */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="Tanya AI Assistant..."
          placeholderTextColor={colors.textSecondary}
          value={message}
          onChangeText={setMessage}
        />
        <Pressable style={styles.sendBtn} onPress={() => triggerLight()}>
          <Ionicons name="arrow-forward" size={24} color="#FFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 16, borderTopWidth: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  input: { flex: 1, height: 50, borderRadius: 25, paddingHorizontal: 20, borderWidth: 1 },
  sendBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center' },
});

export default TeacherAIScreen;
