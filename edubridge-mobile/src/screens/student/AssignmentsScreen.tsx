import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, ActivityIndicator, RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  relatedMaterial: string;
  dueDate: string;
  daysLeft: number;
  type: 'essay' | 'multiple' | 'project' | 'quiz';
  color: string;
  icon: string;
  description: string;
  maxScore: number;
  score?: number; // only for completed
}

const TYPE_META: Record<Assignment['type'], { icon: string; label: string }> = {
  essay:    { icon: 'create-outline',           label: 'Esai'           },
  multiple: { icon: 'list-outline',             label: 'Pilihan Ganda'  },
  project:  { icon: 'briefcase-outline',        label: 'Proyek'         },
  quiz:     { icon: 'extension-puzzle-outline', label: 'Kuis'           },
};

const PENDING: Assignment[] = [
  { id: '1', title: 'Latihan Soal PLSV Bab 3', subject: 'Matematika', teacher: 'Bu Sari', relatedMaterial: 'Pengantar Persamaan Linear Satu Variabel', dueDate: '16 Mei 2026', daysLeft: 2, type: 'multiple', color: '#6366F1', icon: '📐', description: 'Kerjakan 20 soal pilihan ganda mengenai PLSV dari bab 3. Waktu pengerjaan 60 menit.', maxScore: 100 },
  { id: '2', title: 'Analisis Hukum Newton dalam Kehidupan Sehari-hari', subject: 'Fisika', teacher: 'Pak Budi', relatedMaterial: 'Hukum Newton & Aplikasinya', dueDate: '18 Mei 2026', daysLeft: 4, type: 'essay', color: '#F59E0B', icon: '⚡', description: 'Tulis minimal 3 contoh penerapan hukum Newton. Sertakan gambar/diagram.', maxScore: 100 },
  { id: '3', title: 'Diagram Proses Fotosintesis', subject: 'Biologi', teacher: 'Bu Dewi', relatedMaterial: 'Fotosintesis & Respirasi Sel', dueDate: '20 Mei 2026', daysLeft: 6, type: 'project', color: '#10B981', icon: '🌱', description: 'Buat diagram alur proses fotosintesis secara lengkap dengan keterangan setiap tahap.', maxScore: 100 },
  { id: '4', title: 'Kuis Simple Past Tense', subject: 'Bahasa Inggris', teacher: 'Pak Arif', relatedMaterial: 'Simple Past Tense – Grammar Guide', dueDate: '15 Mei 2026', daysLeft: 1, type: 'quiz', color: '#06B6D4', icon: '📚', description: '15 soal kuis grammar Simple Past Tense. Dikerjakan langsung dalam sistem.', maxScore: 100 },
  { id: '5', title: 'Peta Konsep Peradaban Mesopotamia', subject: 'Sejarah', teacher: 'Bu Ratna', relatedMaterial: 'Peradaban Mesopotamia', dueDate: '22 Mei 2026', daysLeft: 8, type: 'project', color: '#EF4444', icon: '📜', description: 'Buat peta konsep mencakup aspek politik, ekonomi, dan kebudayaan.', maxScore: 100 },
];

const COMPLETED: Assignment[] = [
  { id: 'c1', title: 'Ulangan Harian Aljabar', subject: 'Matematika', teacher: 'Bu Sari', relatedMaterial: 'Aljabar Dasar', dueDate: '5 Mei 2026', daysLeft: -9, type: 'multiple', color: '#6366F1', icon: '📐', description: 'Ulangan harian materi aljabar dasar bab 1-2.', maxScore: 100, score: 85 },
  { id: 'c2', title: 'Laporan Praktikum Gerak Lurus', subject: 'Fisika', teacher: 'Pak Budi', relatedMaterial: 'Gerak Lurus Beraturan', dueDate: '3 Mei 2026', daysLeft: -11, type: 'essay', color: '#F59E0B', icon: '⚡', description: 'Laporan hasil praktikum GLB dan GLBB.', maxScore: 100, score: 92 },
  { id: 'c3', title: 'Esai Sel Tumbuhan vs Sel Hewan', subject: 'Biologi', teacher: 'Bu Dewi', relatedMaterial: 'Sel dan Fungsinya', dueDate: '1 Mei 2026', daysLeft: -13, type: 'essay', color: '#10B981', icon: '🌱', description: 'Bandingkan struktur dan fungsi sel tumbuhan dan sel hewan.', maxScore: 100, score: 78 },
];

const getDueBadge = (daysLeft: number) => {
  if (daysLeft < 0)   return { label: 'Terlambat',          bg: '#FEE2E2', text: '#EF4444' };
  if (daysLeft === 0) return { label: 'Hari Ini!',          bg: '#FEF3C7', text: '#D97706' };
  if (daysLeft <= 2)  return { label: `${daysLeft}h lagi`,  bg: '#FEF3C7', text: '#D97706' };
  return               { label: `${daysLeft} hari lagi`,    bg: '#DCFCE7', text: '#16A34A' };
};

const getScoreBadge = (score: number) => {
  if (score >= 80) return { color: '#10B981', label: 'Sangat Baik' };
  if (score >= 60) return { color: '#F59E0B', label: 'Cukup' };
  return { color: '#EF4444', label: 'Perlu Perbaikan' };
};

const AssignmentsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'done'>('pending');
  const [activeFilter, setActiveFilter] = useState<'all' | Assignment['type']>('all');

  const FILTERS: Array<{ key: 'all' | Assignment['type']; label: string }> = [
    { key: 'all',      label: 'Semua'         },
    { key: 'multiple', label: 'Pilihan Ganda' },
    { key: 'essay',    label: 'Esai'          },
    { key: 'quiz',     label: 'Kuis'          },
    { key: 'project',  label: 'Proyek'        },
  ];

  useEffect(() => { setTimeout(() => setLoading(false), 400); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 600));
    setRefreshing(false);
  };

  const source = activeTab === 'pending' ? PENDING : COMPLETED;
  const filtered = source.filter(a => activeFilter === 'all' || a.type === activeFilter);
  const sorted = [...filtered].sort((a, b) => a.daysLeft - b.daysLeft);

  // Group pending by urgency
  const today     = sorted.filter(a => a.daysLeft >= 0 && a.daysLeft === 0);
  const thisWeek  = sorted.filter(a => a.daysLeft > 0 && a.daysLeft <= 7);
  const later     = sorted.filter(a => a.daysLeft > 7);

  const urgentCount   = PENDING.filter(a => a.daysLeft >= 0 && a.daysLeft <= 2).length;
  const thisWeekCount = PENDING.filter(a => a.daysLeft > 2 && a.daysLeft <= 7).length;
  const avgScore      = COMPLETED.length > 0 ? Math.round(COMPLETED.reduce((s, a) => s + (a.score || 0), 0) / COMPLETED.length) : 0;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  const renderPendingCard = (item: Assignment) => {
    const dueBadge = getDueBadge(item.daysLeft);
    const typeMeta = TYPE_META[item.type];
    return (
      <Pressable
        key={item.id}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => triggerLight()}
      >
        <View style={[styles.stripe, { backgroundColor: item.color }]} />
        <View style={styles.cardInner}>
          <View style={styles.cardTopRow}>
            <View style={styles.subjectRow}>
              <Text style={styles.iconText}>{item.icon}</Text>
              <Text style={[styles.subjectText, { color: item.color }]}>{item.subject}</Text>
            </View>
            <View style={[styles.dueBadge, { backgroundColor: dueBadge.bg }]}>
              <Text style={[styles.dueBadgeText, { color: dueBadge.text }]}>{dueBadge.label}</Text>
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>

          <View style={[styles.materialChip, { backgroundColor: item.color + '12' }]}>
            <Ionicons name="document-text-outline" size={12} color={item.color} />
            <Text style={[styles.materialChipText, { color: item.color }]} numberOfLines={1}>Dari: {item.relatedMaterial}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={[styles.typePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name={typeMeta.icon as any} size={12} color={colors.textSecondary} />
              <Text style={[styles.typeText, { color: colors.textSecondary }]}>{typeMeta.label}</Text>
            </View>
            <View style={styles.footerRight}>
              <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>{item.teacher}</Text>
              <View style={styles.dot} />
              <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>{item.dueDate}</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaBtn, { backgroundColor: item.color }]} onPress={() => triggerLight()}>
            <Text style={styles.ctaText}>Kerjakan Sekarang</Text>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const renderCompletedCard = (item: Assignment) => {
    const scoreBadge = getScoreBadge(item.score || 0);
    const typeMeta = TYPE_META[item.type];
    return (
      <Pressable
        key={item.id}
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => triggerLight()}
      >
        <View style={[styles.stripe, { backgroundColor: scoreBadge.color }]} />
        <View style={styles.cardInner}>
          <View style={styles.cardTopRow}>
            <View style={styles.subjectRow}>
              <Text style={styles.iconText}>{item.icon}</Text>
              <Text style={[styles.subjectText, { color: item.color }]}>{item.subject}</Text>
            </View>
            <View style={[styles.scoreBadge, { backgroundColor: scoreBadge.color + '20' }]}>
              <Text style={[styles.scoreBadgeText, { color: scoreBadge.color }]}>{item.score}/{item.maxScore}</Text>
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>

          <View style={[styles.materialChip, { backgroundColor: item.color + '12' }]}>
            <Ionicons name="document-text-outline" size={12} color={item.color} />
            <Text style={[styles.materialChipText, { color: item.color }]} numberOfLines={1}>Dari: {item.relatedMaterial}</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={[styles.typePill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name={typeMeta.icon as any} size={12} color={colors.textSecondary} />
              <Text style={[styles.typeText, { color: colors.textSecondary }]}>{typeMeta.label}</Text>
            </View>
            <View style={styles.footerRight}>
              <View style={[styles.scoreLabel, { backgroundColor: scoreBadge.color + '15' }]}>
                <Ionicons name="checkmark-circle" size={12} color={scoreBadge.color} />
                <Text style={[styles.scoreLabelText, { color: scoreBadge.color }]}>{scoreBadge.label}</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderGroup = (title: string, items: Assignment[]) => {
    if (items.length === 0) return null;
    return (
      <View key={title} style={styles.group}>
        <Text style={[styles.groupTitle, { color: colors.textSecondary }]}>{title}</Text>
        {items.map(renderPendingCard)}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => { triggerLight(); navigation.goBack(); }} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tugas</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: PURPLE }]}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{urgentCount}</Text>
          <Text style={styles.summaryLabel}>Mendesak</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{thisWeekCount}</Text>
          <Text style={styles.summaryLabel}>Minggu Ini</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{PENDING.length}</Text>
          <Text style={styles.summaryLabel}>Total Aktif</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNum}>{avgScore}%</Text>
          <Text style={styles.summaryLabel}>Rata-rata</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {([
          { key: 'pending', label: `Belum Selesai (${PENDING.length})` },
          { key: 'done',    label: `Sudah Dikumpul (${COMPLETED.length})` },
        ] as const).map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && [styles.tabActive, { borderBottomColor: PURPLE }]]}
            onPress={() => { triggerLight(); setActiveTab(tab.key); setActiveFilter('all'); }}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? PURPLE : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView} contentContainerStyle={styles.filterRow}>
        {FILTERS.map(f => {
          const active = f.key === activeFilter;
          return (
            <Pressable
              key={f.key}
              style={[styles.chip, { backgroundColor: active ? PURPLE : colors.surface, borderColor: active ? PURPLE : colors.border }]}
              onPress={() => { triggerLight(); setActiveFilter(f.key); }}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : colors.textSecondary }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />}
      >
        {activeTab === 'pending' ? (
          sorted.length > 0 ? (
            <>
              {renderGroup('Hari Ini', today)}
              {renderGroup('Minggu Ini', thisWeek)}
              {renderGroup('Selanjutnya', later)}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={PURPLE + '60'} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Tidak ada tugas</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Semua tugas sudah selesai atau belum ada yang diberikan</Text>
            </View>
          )
        ) : (
          sorted.length > 0 ? (
            <View style={styles.group}>{sorted.map(renderCompletedCard)}</View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color={PURPLE + '60'} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada tugas selesai</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Tugas yang sudah dikumpul akan muncul di sini</Text>
            </View>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },

  summaryCard: { flexDirection: 'row', marginHorizontal: 20, marginVertical: 14, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 8 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  summaryLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: {},
  tabText: { fontSize: 13, fontWeight: '700' },

  filterScrollView: { flexGrow: 0 },
  filterRow: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  mainScroll: { flex: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },

  group: { marginBottom: 20, gap: 12 },
  groupTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },

  card: { flexDirection: 'row', borderRadius: 20, overflow: 'hidden', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  stripe: { width: 5 },
  cardInner: { flex: 1, padding: 16, gap: 8 },

  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconText: { fontSize: 16 },
  subjectText: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },

  dueBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dueBadgeText: { fontSize: 11, fontWeight: '700' },

  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreBadgeText: { fontSize: 13, fontWeight: '800' },

  cardTitle: { fontSize: 15, fontWeight: 'bold', lineHeight: 21 },
  cardDesc: { fontSize: 12, lineHeight: 17 },

  materialChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  materialChipText: { fontSize: 11, fontWeight: '600', flex: 1 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  typeText: { fontSize: 11, fontWeight: '600' },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 11 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1' },

  scoreLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  scoreLabelText: { fontSize: 11, fontWeight: '700' },

  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 10, gap: 6, marginTop: 4 },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  emptyState: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

export default AssignmentsScreen;
