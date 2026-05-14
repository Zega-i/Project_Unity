import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, ActivityIndicator, RefreshControl,
  StatusBar, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { authStore } from '../../store/authStore';

const PURPLE = '#7C3AED';
const READ_KEY = 'read_materials';

interface Material {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  type: 'pdf' | 'video' | 'doc' | 'link';
  size: string;
  uploadedAt: string;
  isNew: boolean;
  color: string;
  icon: string;
  description: string;
}

const TYPE_META: Record<Material['type'], { icon: string; label: string; color: string }> = {
  pdf:   { icon: 'document-text', label: 'PDF',     color: '#EF4444' },
  video: { icon: 'play-circle',   label: 'Video',   color: '#3B82F6' },
  doc:   { icon: 'document',      label: 'Dokumen', color: '#6366F1' },
  link:  { icon: 'link',          label: 'Tautan',  color: '#10B981' },
};

const MOCK_MATERIALS: Material[] = [
  { id: '1', title: 'Pengantar Persamaan Linear Satu Variabel', subject: 'Matematika',    teacher: 'Bu Sari',  type: 'pdf',   size: '2.4 MB', uploadedAt: '12 Mei 2026', isNew: true,  color: '#6366F1', icon: '📐', description: 'Materi dasar PLSV meliputi definisi, contoh soal, dan latihan mandiri.' },
  { id: '2', title: 'Hukum Newton & Aplikasinya',              subject: 'Fisika',         teacher: 'Pak Budi', type: 'video', size: '45 Min', uploadedAt: '11 Mei 2026', isNew: true,  color: '#F59E0B', icon: '⚡', description: 'Video pembelajaran hukum I, II, III Newton beserta contoh kasus nyata.' },
  { id: '3', title: 'Fotosintesis & Respirasi Sel',            subject: 'Biologi',        teacher: 'Bu Dewi',  type: 'doc',   size: '1.8 MB', uploadedAt: '10 Mei 2026', isNew: true,  color: '#10B981', icon: '🌱', description: 'Penjelasan lengkap proses fotosintesis dan respirasi sel tumbuhan.' },
  { id: '4', title: 'Simple Past Tense – Grammar Guide',       subject: 'Bahasa Inggris', teacher: 'Pak Arif', type: 'pdf',   size: '1.2 MB', uploadedAt: '9 Mei 2026',  isNew: false, color: '#06B6D4', icon: '📚', description: 'Panduan lengkap penggunaan Simple Past Tense disertai latihan soal.' },
  { id: '5', title: 'Peradaban Mesopotamia',                   subject: 'Sejarah',        teacher: 'Bu Ratna', type: 'link',  size: '—',      uploadedAt: '8 Mei 2026',  isNew: false, color: '#EF4444', icon: '📜', description: 'Referensi eksternal mengenai peradaban Mesopotamia dan kontribusinya.' },
  { id: '6', title: 'Fungsi Kuadrat & Grafiknya',              subject: 'Matematika',     teacher: 'Bu Sari',  type: 'video', size: '32 Min', uploadedAt: '7 Mei 2026',  isNew: false, color: '#8B5CF6', icon: '📊', description: 'Video eksplorasi fungsi kuadrat, vertex, dan cara menggambar grafik.' },
  { id: '7', title: 'Gelombang & Bunyi',                       subject: 'Fisika',         teacher: 'Pak Budi', type: 'pdf',   size: '3.1 MB', uploadedAt: '6 Mei 2026',  isNew: false, color: '#F59E0B', icon: '🔊', description: 'Konsep gelombang mekanik dan elektromagnetik serta aplikasinya.' },
  { id: '8', title: 'Sistem Pencernaan Manusia',               subject: 'Biologi',        teacher: 'Bu Dewi',  type: 'doc',   size: '2.0 MB', uploadedAt: '5 Mei 2026',  isNew: false, color: '#10B981', icon: '🧬', description: 'Anatomi dan fisiologi sistem pencernaan manusia secara lengkap.' },
];

const TYPE_FILTERS: Array<{ key: 'all' | Material['type']; label: string }> = [
  { key: 'all',   label: 'Semua'   },
  { key: 'pdf',   label: 'PDF'     },
  { key: 'video', label: 'Video'   },
  { key: 'doc',   label: 'Dokumen' },
  { key: 'link',  label: 'Tautan'  },
];

const MaterialsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();

  const [readIds, setReadIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'semua' | 'baru'>('semua');
  const [activeFilter, setActiveFilter] = useState<'all' | Material['type']>('all');

  const loadReadIds = async () => {
    try {
      const stored = await AsyncStorage.getItem(READ_KEY);
      setReadIds(stored ? JSON.parse(stored) : []);
    } catch {
      setReadIds([]);
    }
  };

  const markAsRead = async (id: string) => {
    if (readIds.includes(id)) return;
    const updated = [...readIds, id];
    setReadIds(updated);
    await AsyncStorage.setItem(READ_KEY, JSON.stringify(updated));
  };

  useFocusEffect(useCallback(() => {
    loadReadIds().finally(() => setLoading(false));
  }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReadIds();
    setRefreshing(false);
  };

  const hasClass = !!(authStore.getUserSync()?.className || authStore.getUserSync()?.class);
  const SOURCE   = hasClass ? MOCK_MATERIALS : [];

  // Filter pipeline — tab filter and type filter are fully independent
  const filtered = SOURCE.filter(m => {
    if (activeTab === 'baru' && !m.isNew) return false;
    if (activeFilter !== 'all' && m.type !== activeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.teacher.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group by subject
  const grouped: Record<string, Material[]> = {};
  filtered.forEach(m => {
    if (!grouped[m.subject]) grouped[m.subject] = [];
    grouped[m.subject].push(m);
  });
  const subjects = Object.keys(grouped);

  const newCount    = MOCK_MATERIALS.filter(m => m.isNew).length;
  const unreadCount = MOCK_MATERIALS.filter(m => !readIds.includes(m.id)).length;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={PURPLE} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => { triggerLight(); navigation.goBack(); }} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Materi</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {([
          { key: 'semua', label: 'Semua' },
          { key: 'baru',  label: `Baru${newCount > 0 ? ` (${newCount})` : ''}` },
        ] as const).map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => { triggerLight(); setActiveTab(tab.key); setActiveFilter('all'); setSearch(''); }}
          >
            <Text style={[styles.tabText, { color: activeTab === tab.key ? PURPLE : colors.textSecondary }]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={[styles.tabUnderline, { backgroundColor: PURPLE }]} />}
          </Pressable>
        ))}
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Cari materi, mata pelajaran, guru…"
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Filter chips — flexGrow: 0 prevents vertical layout push */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterRow}
      >
        {TYPE_FILTERS.map(f => {
          const active = f.key === activeFilter;
          return (
            <Pressable
              key={f.key}
              style={[
                styles.chip,
                { backgroundColor: active ? PURPLE : colors.surface, borderColor: active ? PURPLE : colors.border },
              ]}
              onPress={() => { triggerLight(); setActiveFilter(f.key); }}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : colors.textSecondary }]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Main content — flex: 1 fills remaining space correctly */}
      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />}
      >
        {subjects.length > 0 ? (
          subjects.map(subject => (
            <View key={subject} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{subject}</Text>
                <Text style={[styles.sectionCount, { color: colors.textSecondary }]}>
                  {grouped[subject].length} materi
                </Text>
              </View>

              <View style={styles.list}>
                {grouped[subject].map(item => {
                  const typeMeta = TYPE_META[item.type];
                  const isRead = readIds.includes(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.card,
                        {
                          backgroundColor: colors.card,
                          borderColor: isRead ? colors.border : PURPLE + '50',
                        },
                      ]}
                      onPress={() => { triggerLight(); markAsRead(item.id); }}
                    >
                      {/* Icon */}
                      <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                        <Text style={styles.iconText}>{item.icon}</Text>
                        {!isRead && <View style={styles.unreadDot} />}
                      </View>

                      {/* Body */}
                      <View style={styles.cardBody}>
                        <View style={styles.badgeRow}>
                          <View style={[styles.typeBadge, { backgroundColor: typeMeta.color + '20' }]}>
                            <Ionicons name={typeMeta.icon as any} size={11} color={typeMeta.color} />
                            <Text style={[styles.typeBadgeText, { color: typeMeta.color }]}>{typeMeta.label}</Text>
                          </View>
                          {item.isNew && (
                            <View style={styles.newBadge}>
                              <Text style={styles.newBadgeText}>BARU</Text>
                            </View>
                          )}
                          {!isRead && (
                            <Text style={[styles.unreadLabel, { color: PURPLE }]}>Belum Dibaca</Text>
                          )}
                        </View>

                        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                          {item.title}
                        </Text>
                        <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                          {item.description}
                        </Text>

                        <View style={styles.cardFooter}>
                          <Ionicons name="person-outline" size={12} color={colors.textSecondary} />
                          <Text style={[styles.footerText, { color: colors.textSecondary }]}>{item.teacher}</Text>
                          <View style={styles.dot} />
                          <Text style={[styles.footerText, { color: colors.textSecondary }]}>{item.uploadedAt}</Text>
                          <View style={styles.dot} />
                          <Text style={[styles.footerText, { color: colors.textSecondary }]}>{item.size}</Text>
                        </View>
                      </View>

                      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={56} color={PURPLE + '60'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Tidak ada materi</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              {search
                ? 'Coba kata kunci lain atau ubah filter'
                : activeTab === 'baru'
                  ? 'Belum ada materi baru'
                  : 'Belum ada materi yang diupload guru'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  headerRight: { width: 40, alignItems: 'flex-end' },
  unreadBadge: { backgroundColor: PURPLE, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, position: 'relative' },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: '700' },
  tabUnderline: { position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2, borderRadius: 1 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 20, marginTop: 14, marginBottom: 4,
    borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },

  // flexGrow: 0 is the key fix — prevents the horizontal ScrollView from
  // pushing the content area down when a chip is selected
  filterScrollView: { flexGrow: 0 },
  filterRow: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },

  // flex: 1 ensures the main scroll fills remaining vertical space
  mainScroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 50 },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  sectionCount: { fontSize: 12 },

  list: { gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, padding: 14, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, position: 'relative',
  },
  iconText: { fontSize: 22 },
  unreadDot: {
    position: 'absolute', top: 4, right: 4,
    width: 8, height: 8, borderRadius: 4, backgroundColor: PURPLE,
  },

  cardBody: { flex: 1, gap: 4 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  newBadge: { backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  newBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  unreadLabel: { fontSize: 10, fontWeight: '700' },

  cardTitle: { fontSize: 14, fontWeight: 'bold', lineHeight: 20 },
  cardDesc: { fontSize: 12, lineHeight: 17 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  footerText: { fontSize: 11 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1' },

  emptyState: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold' },
  emptyDesc: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});

export default MaterialsScreen;
