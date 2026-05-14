import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, StatusBar, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'materi' | 'tugas' | 'diskusi';

interface Chapter {
  id: string;
  title: string;
  count: number;
}

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  submitted: number;
  total: number;
  type: 'essay' | 'multiple' | 'project' | 'quiz';
}

interface Discussion {
  id: string;
  author: string;
  message: string;
  time: string;
  replies: number;
  avatarColor: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CHAPTERS: Chapter[] = [
  { id: '1', title: 'Bab 1: Persamaan Linear',       count: 4 },
  { id: '2', title: 'Bab 2: Fungsi Linear',           count: 3 },
  { id: '3', title: 'Bab 3: SPLDV',                  count: 4 },
  { id: '4', title: 'Bab 4: Sistem Pertidaksamaan',   count: 3 },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: '1', title: 'Latihan Soal PLSV',         dueDate: '16 Mei 2026', submitted: 24, total: 32, type: 'multiple' },
  { id: '2', title: 'Tugas Analisis Fungsi',      dueDate: '18 Mei 2026', submitted: 10, total: 32, type: 'essay'    },
  { id: '3', title: 'Project Grafik SPLDV',       dueDate: '22 Mei 2026', submitted: 0,  total: 32, type: 'project'  },
];

const MOCK_DISCUSSIONS: Discussion[] = [
  { id: '1', author: 'Dika Pratama',   message: 'Bu, saya tidak mengerti cara mencari nilai x pada soal no. 5.',        time: '10 menit lalu', replies: 2,  avatarColor: '#6366F1' },
  { id: '2', author: 'Siti Nurhaliza', message: 'Apakah tugas bisa dikumpulkan lewat foto atau harus diketik?',          time: '1 jam lalu',    replies: 1,  avatarColor: '#EC4899' },
  { id: '3', author: 'Budi Santoso',   message: 'Pak, untuk soal fungsi linear, apakah kita perlu menggambar grafik?',   time: '3 jam lalu',    replies: 4,  avatarColor: '#F59E0B' },
];

const TYPE_LABEL: Record<Assignment['type'], string> = {
  essay: 'Esai', multiple: 'Pilihan Ganda', project: 'Proyek', quiz: 'Kuis',
};
const TYPE_COLOR: Record<Assignment['type'], string> = {
  essay: '#6366F1', multiple: '#F59E0B', project: '#10B981', quiz: '#EC4899',
};

// ─── Tab: Materi ──────────────────────────────────────────────────────────────

const MateriTab = ({ colors, triggerLight }: any) => (
  <View style={{ flex: 1 }}>
    <FlatList
      data={MOCK_CHAPTERS}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.tabContent}
      renderItem={({ item }) => (
        <View style={[styles.chapterRow, { borderBottomColor: colors.border }]}>
          <View style={styles.chapterInfo}>
            <Text style={[styles.chapterTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.chapterCount, { color: colors.textSecondary }]}>
              {item.count} Materi
            </Text>
          </View>
          <Pressable
            style={[styles.editBtn, { backgroundColor: colors.surface }]}
            onPress={() => triggerLight()}
          >
            <Ionicons name="create-outline" size={18} color={GREEN} />
          </Pressable>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={48} color={GREEN + '50'} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada materi</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            Tambahkan materi pertama untuk kelas ini
          </Text>
        </View>
      }
    />
    {/* FAB */}
    <Pressable
      style={({ pressed }) => [styles.fab, { backgroundColor: GREEN, opacity: pressed ? 0.85 : 1 }]}
      onPress={() => triggerLight()}
    >
      <Ionicons name="add" size={20} color="#FFF" />
      <Text style={styles.fabText}>Tambah Materi</Text>
    </Pressable>
  </View>
);

// ─── Tab: Tugas ───────────────────────────────────────────────────────────────

const TugasTab = ({ colors, triggerLight }: any) => (
  <View style={{ flex: 1 }}>
    <FlatList
      data={MOCK_ASSIGNMENTS}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.tabContent}
      renderItem={({ item }) => {
        const pct = Math.round((item.submitted / item.total) * 100);
        return (
          <Pressable
            style={({ pressed }) => [
              styles.assignCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => triggerLight()}
          >
            <View style={styles.assignTop}>
              <View style={[styles.typeBadge, { backgroundColor: TYPE_COLOR[item.type] + '15' }]}>
                <Text style={[styles.typeBadgeText, { color: TYPE_COLOR[item.type] }]}>
                  {TYPE_LABEL[item.type]}
                </Text>
              </View>
              <Pressable onPress={() => triggerLight()}>
                <Ionicons name="create-outline" size={18} color={GREEN} />
              </Pressable>
            </View>
            <Text style={[styles.assignTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.assignDue, { color: colors.textSecondary }]}>
              Deadline: {item.dueDate}
            </Text>
            {/* Submission progress */}
            <View style={styles.assignProgress}>
              <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: TYPE_COLOR[item.type] }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {item.submitted}/{item.total} dikumpulkan
              </Text>
            </View>
          </Pressable>
        );
      }}
    />
    {/* FAB */}
    <Pressable
      style={({ pressed }) => [styles.fab, { backgroundColor: GREEN, opacity: pressed ? 0.85 : 1 }]}
      onPress={() => triggerLight()}
    >
      <Ionicons name="add" size={20} color="#FFF" />
      <Text style={styles.fabText}>Tambah Tugas</Text>
    </Pressable>
  </View>
);

// ─── Tab: Diskusi ─────────────────────────────────────────────────────────────

const DiskusiTab = ({ colors, triggerLight }: any) => (
  <FlatList
    data={MOCK_DISCUSSIONS}
    keyExtractor={item => item.id}
    contentContainerStyle={styles.tabContent}
    renderItem={({ item }) => (
      <Pressable
        style={({ pressed }) => [
          styles.discussCard,
          { backgroundColor: colors.card, borderColor: colors.border },
          pressed && { opacity: 0.8 },
        ]}
        onPress={() => triggerLight()}
      >
        <View style={[styles.discussAvatar, { backgroundColor: item.avatarColor + '20' }]}>
          <Text style={[styles.discussAvatarText, { color: item.avatarColor }]}>
            {item.author.split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
          </Text>
        </View>
        <View style={styles.discussBody}>
          <View style={styles.discussTop}>
            <Text style={[styles.discussAuthor, { color: colors.text }]}>{item.author}</Text>
            <Text style={[styles.discussTime, { color: colors.textSecondary }]}>{item.time}</Text>
          </View>
          <Text style={[styles.discussMsg, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <View style={styles.discussFooter}>
            <Ionicons name="chatbubble-outline" size={13} color={GREEN} />
            <Text style={[styles.discussReplies, { color: GREEN }]}>{item.replies} balasan</Text>
          </View>
        </View>
      </Pressable>
    )}
  />
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const TeacherClassDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route      = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight }       = useHapticFeedback();

  const className = route.params?.className || 'Matematika 10A';
  const [activeTab, setActiveTab] = useState<Tab>('materi');

  const TABS: { key: Tab; label: string }[] = [
    { key: 'materi',  label: 'Materi'   },
    { key: 'tugas',   label: 'Tugas'    },
    { key: 'diskusi', label: 'Diskusi'  },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => { triggerLight(); navigation.goBack(); }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{className}</Text>
        <Pressable style={styles.moreBtn} onPress={() => triggerLight()}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* ── Inner Tab Bar ── */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {TABS.map(tab => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={styles.tabItem}
              onPress={() => { triggerLight(); setActiveTab(tab.key); }}
            >
              <Text style={[styles.tabLabel, { color: active ? GREEN : colors.textSecondary }]}>
                {tab.label}
              </Text>
              {active && <View style={styles.tabIndicator} />}
            </Pressable>
          );
        })}
      </View>

      {/* ── Tab Content ── */}
      {activeTab === 'materi'  && <MateriTab  colors={colors} triggerLight={triggerLight} />}
      {activeTab === 'tugas'   && <TugasTab   colors={colors} triggerLight={triggerLight} />}
      {activeTab === 'diskusi' && <DiskusiTab colors={colors} triggerLight={triggerLight} />}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn:    { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ flex: 1, fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  moreBtn:    { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },

  // Inner tab bar
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1,
  },
  tabItem: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
  },
  tabLabel:     { fontSize: 14, fontWeight: '700' },
  tabIndicator: {
    position: 'absolute', bottom: 0, left: '15%', right: '15%',
    height: 3, backgroundColor: GREEN, borderRadius: 2,
  },

  tabContent: { paddingHorizontal: 20, paddingBottom: 110 },

  // ── Materi ──
  chapterRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 18, borderBottomWidth: 1,
  },
  chapterInfo:  { flex: 1 },
  chapterTitle: { fontSize: 15, fontWeight: '600' },
  chapterCount: { fontSize: 13, marginTop: 3 },
  editBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Tugas ──
  assignCard: {
    borderRadius: 16, borderWidth: 1, padding: 16,
    marginTop: 12, gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  assignTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeBadgeText:{ fontSize: 11, fontWeight: '700' },
  assignTitle: { fontSize: 15, fontWeight: '600' },
  assignDue:   { fontSize: 12 },
  assignProgress: { gap: 6 },
  progressBg:  { height: 5, borderRadius: 3 },
  progressFill:{ height: '100%', borderRadius: 3 },
  progressText:{ fontSize: 11 },

  // ── Diskusi ──
  discussCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 16, borderWidth: 1, padding: 14,
    marginTop: 12, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  discussAvatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  discussAvatarText: { fontSize: 16, fontWeight: 'bold' },
  discussBody:  { flex: 1 },
  discussTop:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  discussAuthor:{ fontSize: 14, fontWeight: '700' },
  discussTime:  { fontSize: 11 },
  discussMsg:   { fontSize: 13, lineHeight: 19 },
  discussFooter:{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  discussReplies:{ fontSize: 12, fontWeight: '600' },

  // Empty state
  emptyState: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold' },
  emptyDesc:  { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // FAB
  fab: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, paddingVertical: 16, gap: 8,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  fabText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});

export default TeacherClassDetailScreen;
