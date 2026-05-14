import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, StatusBar, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

interface Student {
  id: string;
  name: string;
  avgScore: number;
  avatarColor: string;
}

// Beragam warna avatar agar terlihat seperti foto berbeda
const AVATAR_COLORS = [
  '#6366F1', '#F59E0B', '#10B981', '#EC4899',
  '#06B6D4', '#8B5CF6', '#EF4444', '#14B8A6',
  '#F97316', '#3B82F6',
];

const MOCK_STUDENTS: Student[] = [
  { id: '1',  name: 'Dika Pratama',    avgScore: 85, avatarColor: '#6366F1' },
  { id: '2',  name: 'Siti Nurhaliza',  avgScore: 85, avatarColor: '#EC4899' },
  { id: '3',  name: 'Budi Santoso',    avgScore: 75, avatarColor: '#F59E0B' },
  { id: '4',  name: 'Rina Martina',    avgScore: 70, avatarColor: '#10B981' },
  { id: '5',  name: 'Andi Wijaya',     avgScore: 65, avatarColor: '#8B5CF6' },
  { id: '6',  name: 'Layla Maharani',  avgScore: 80, avatarColor: '#06B6D4' },
  { id: '7',  name: 'Fajar Nugroho',   avgScore: 78, avatarColor: '#F97316' },
  { id: '8',  name: 'Nadia Permata',   avgScore: 90, avatarColor: '#14B8A6' },
  { id: '9',  name: 'Rizky Pratama',   avgScore: 72, avatarColor: '#EF4444' },
  { id: '10', name: 'Dewi Lestari',    avgScore: 68, avatarColor: '#3B82F6' },
  { id: '11', name: 'Ahmad Fauzan',    avgScore: 55, avatarColor: '#6366F1' },
  { id: '12', name: 'Putri Rahayu',    avgScore: 88, avatarColor: '#EC4899' },
];

const TOTAL_COUNT = 120;

const TeacherStudentsScreen = () => {
  const navigation  = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();

  const [search, setSearch] = useState('');

  const filtered = MOCK_STUDENTS.filter(s =>
    !search.trim() ||
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = useCallback(({ item }: { item: Student }) => (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.surface },
      ]}
      onPress={() => {
        triggerLight();
        navigation.navigate('TeacherStudentDetail', {
          name:        item.name,
          avgScore:    item.avgScore,
          avatarColor: item.avatarColor,
        });
      }}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: item.avatarColor + '25', borderColor: item.avatarColor + '50' }]}>
        <Text style={[styles.avatarText, { color: item.avatarColor }]}>
          {item.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.rowInfo}>
        <Text style={[styles.studentName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.studentScore, { color: colors.textSecondary }]}>
          Rata-rata {item.avgScore}
        </Text>
      </View>

      {/* Chevron */}
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  ), [colors, triggerLight]);

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
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Semua Siswa</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {TOTAL_COUNT} Siswa Terdaftar
          </Text>
        </View>
      </View>

      {/* ── Search Bar ── */}
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Cari siswa..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : (
          <Pressable onPress={() => triggerLight()}>
            <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* ── Student List ── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => null} // separator handled by border on each row
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={52} color={GREEN + '50'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Siswa tidak ditemukan</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Coba kata kunci lain
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerCenter: { flex: 1, alignItems: 'flex-start' },
  headerTitle:  { fontSize: 18, fontWeight: 'bold' },
  headerSub:    { fontSize: 13, marginTop: 2 },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 14, marginBottom: 8,
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  // List
  listContent: { paddingBottom: 30 },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  // Avatar
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, marginRight: 14,
  },
  avatarText: { fontSize: 16, fontWeight: 'bold' },

  // Info
  rowInfo:      { flex: 1 },
  studentName:  { fontSize: 15, fontWeight: '600' },
  studentScore: { fontSize: 13, marginTop: 2 },

  // Empty
  emptyState: { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold' },
  emptyDesc:  { fontSize: 13, textAlign: 'center' },
});

export default TeacherStudentsScreen;
