import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable,
  SafeAreaView, StatusBar, TextInput, ScrollView, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClassItem {
  id: string;
  name: string;
  subject: string;
  grade: string;
  totalStudents: number;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_CLASSES: ClassItem[] = [
  { id: '1', name: 'Matematika 10A', subject: 'Matematika', grade: '10', totalStudents: 120 },
  { id: '2', name: 'Matematika 10B', subject: 'Matematika', grade: '10', totalStudents: 115 },
  { id: '3', name: 'Matematika 11A', subject: 'Matematika', grade: '11', totalStudents: 110 },
  { id: '4', name: 'Matematika 11B', subject: 'Matematika', grade: '11', totalStudents: 100 },
  { id: '5', name: 'Matematika 12A', subject: 'Matematika', grade: '12', totalStudents:  95 },
];

const SUBJECTS  = ['Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Inggris', 'Bahasa Indonesia', 'Sejarah', 'Geografi'];
const GRADES    = ['7', '8', '9', '10', '11', '12'];

// ─── Sub-screen: Kelas Saya ───────────────────────────────────────────────────

const KelasSaya = () => {
  const navigation = useNavigation<any>();
  const { colors }       = useTheme();
  const { triggerLight } = useHapticFeedback();

  const renderItem = ({ item }: { item: ClassItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.classRow,
        { borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.surface },
      ]}
      onPress={() => { triggerLight(); navigation.navigate('TeacherClassDetail', { className: item.name }); }}
    >
      <View style={styles.classRowInfo}>
        <Text style={[styles.classRowName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.classRowCount, { color: colors.textSecondary }]}>
          {item.totalStudents} Siswa
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={MOCK_CLASSES}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={[styles.listHeader, { color: colors.text }]}>Kelas Saya</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={52} color={GREEN + '50'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada kelas</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Buat kelas pertama Anda dengan menekan tombol di bawah
            </Text>
          </View>
        }
      />
    </View>
  );
};

// ─── Sub-screen: Buat Kelas ───────────────────────────────────────────────────

const BuatKelas = () => {
  const { colors }       = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();

  const [namaKelas,    setNamaKelas]    = useState('');
  const [mapel,        setMapel]        = useState('');
  const [tingkat,      setTingkat]      = useState('');
  const [deskripsi,    setDeskripsi]    = useState('');
  const [isPublik,     setIsPublik]     = useState(true);
  const [showMapel,    setShowMapel]    = useState(false);
  const [showTingkat,  setShowTingkat]  = useState(false);

  const handleSubmit = () => {
    if (!namaKelas.trim())  { Alert.alert('Perhatian', 'Nama kelas wajib diisi'); return; }
    if (!mapel)             { Alert.alert('Perhatian', 'Pilih mata pelajaran'); return; }
    if (!tingkat)           { Alert.alert('Perhatian', 'Pilih tingkat kelas'); return; }
    triggerMedium();
    Alert.alert('Berhasil', `Kelas "${namaKelas}" berhasil dibuat!`);
    setNamaKelas(''); setMapel(''); setTingkat(''); setDeskripsi('');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
      <Text style={[styles.formTitle, { color: colors.text }]}>Buat Kelas Baru</Text>

      {/* Nama Kelas */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>Nama Kelas</Text>
        <TextInput
          style={[styles.textField, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Contoh: Matematika 10A"
          placeholderTextColor={colors.textSecondary}
          value={namaKelas}
          onChangeText={setNamaKelas}
        />
      </View>

      {/* Mata Pelajaran (dropdown) */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>Mata Pelajaran</Text>
        <Pressable
          style={[styles.dropdownBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { triggerLight(); setShowMapel(v => !v); setShowTingkat(false); }}
        >
          <Text style={[styles.dropdownText, { color: mapel ? colors.text : colors.textSecondary }]}>
            {mapel || 'Pilih mata pelajaran'}
          </Text>
          <Ionicons name={showMapel ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
        </Pressable>
        {showMapel && (
          <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {SUBJECTS.map(s => (
              <Pressable
                key={s}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  { borderBottomColor: colors.border },
                  pressed && { backgroundColor: colors.surface },
                  mapel === s && { backgroundColor: GREEN + '10' },
                ]}
                onPress={() => { triggerLight(); setMapel(s); setShowMapel(false); }}
              >
                <Text style={[styles.dropdownItemText, { color: mapel === s ? GREEN : colors.text }]}>{s}</Text>
                {mapel === s && <Ionicons name="checkmark" size={16} color={GREEN} />}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Tingkat Kelas (dropdown) */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>Tingkat Kelas</Text>
        <Pressable
          style={[styles.dropdownBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { triggerLight(); setShowTingkat(v => !v); setShowMapel(false); }}
        >
          <Text style={[styles.dropdownText, { color: tingkat ? colors.text : colors.textSecondary }]}>
            {tingkat ? `Kelas ${tingkat}` : 'Pilih tingkat kelas'}
          </Text>
          <Ionicons name={showTingkat ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
        </Pressable>
        {showTingkat && (
          <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {GRADES.map(g => (
              <Pressable
                key={g}
                style={({ pressed }) => [
                  styles.dropdownItem,
                  { borderBottomColor: colors.border },
                  pressed && { backgroundColor: colors.surface },
                  tingkat === g && { backgroundColor: GREEN + '10' },
                ]}
                onPress={() => { triggerLight(); setTingkat(g); setShowTingkat(false); }}
              >
                <Text style={[styles.dropdownItemText, { color: tingkat === g ? GREEN : colors.text }]}>
                  Kelas {g}
                </Text>
                {tingkat === g && <Ionicons name="checkmark" size={16} color={GREEN} />}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Deskripsi */}
      <View style={styles.fieldGroup}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Deskripsi <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>(Opsional)</Text>
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Tuliskan deskripsi kelas"
          placeholderTextColor={colors.textSecondary}
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Kelas Publik toggle */}
      <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.toggleInfo}>
          <Text style={[styles.toggleLabel, { color: colors.text }]}>Kelas Publik</Text>
          <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>
            Siswa dapat mencari kelas ini
          </Text>
        </View>
        <Switch
          value={isPublik}
          onValueChange={v => { triggerLight(); setIsPublik(v); }}
          trackColor={{ false: '#D1D5DB', true: GREEN + '70' }}
          thumbColor={isPublik ? GREEN : '#9CA3AF'}
        />
      </View>

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.submitBtn,
          { backgroundColor: GREEN, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Buat Kelas</Text>
      </Pressable>
    </ScrollView>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const TeacherClassScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const { triggerLight }       = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background },
      ]}
    >
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* ── Segment Control ── */}
      <View style={[styles.segmentWrap, { borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Kelas</Text>

        <View style={[styles.segmentBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            style={[
              styles.segmentBtn,
              activeTab === 'list' && { backgroundColor: GREEN },
            ]}
            onPress={() => { triggerLight(); setActiveTab('list'); }}
          >
            <Ionicons
              name="library-outline"
              size={15}
              color={activeTab === 'list' ? '#FFF' : colors.textSecondary}
            />
            <Text style={[styles.segmentText, { color: activeTab === 'list' ? '#FFF' : colors.textSecondary }]}>
              Kelas Saya
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentBtn,
              activeTab === 'create' && { backgroundColor: GREEN },
            ]}
            onPress={() => { triggerLight(); setActiveTab('create'); }}
          >
            <Ionicons
              name="add-circle-outline"
              size={15}
              color={activeTab === 'create' ? '#FFF' : colors.textSecondary}
            />
            <Text style={[styles.segmentText, { color: activeTab === 'create' ? '#FFF' : colors.textSecondary }]}>
              Buat Kelas
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ── Content ── */}
      {activeTab === 'list' ? <KelasSaya /> : <BuatKelas />}

      {/* ── FAB: Buat Kelas Baru (only on list tab) ── */}
      {activeTab === 'list' && (
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: GREEN, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => { triggerLight(); setActiveTab('create'); }}
        >
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.fabText}>Buat Kelas Baru</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Segment header ──
  segmentWrap: {
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  pageTitle: { fontSize: 22, fontWeight: 'bold' },
  segmentBar: {
    flexDirection: 'row',
    borderRadius: 14, borderWidth: 1, overflow: 'hidden', padding: 4,
  },
  segmentBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 9, borderRadius: 10,
  },
  segmentText: { fontSize: 13, fontWeight: '700' },

  // ── Kelas Saya list ──
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  listHeader:  { fontSize: 17, fontWeight: 'bold', marginTop: 16, marginBottom: 4 },
  classRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1,
  },
  classRowInfo: { flex: 1 },
  classRowName: { fontSize: 15, fontWeight: '600' },
  classRowCount:{ fontSize: 13, marginTop: 3 },

  // Empty
  emptyState: { alignItems: 'center', marginTop: 80, gap: 10, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold' },
  emptyDesc:  { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // ── Buat Kelas form ──
  formScroll: { paddingHorizontal: 20, paddingBottom: 50 },
  formTitle:  { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 24 },

  fieldGroup: { marginBottom: 18 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },

  textField: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingTop: 13,
    fontSize: 14, minHeight: 100,
  },

  dropdownBtn: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
  },
  dropdownText: { fontSize: 14 },
  dropdownList: {
    borderWidth: 1, borderRadius: 12, marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1,
  },
  dropdownItemText: { fontSize: 14 },

  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 24,
  },
  toggleInfo:  { flex: 1 },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  toggleDesc:  { fontSize: 12, marginTop: 3 },

  submitBtn: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // ── FAB ──
  fab: {
    position: 'absolute', bottom: 90, left: 20, right: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 16, paddingVertical: 16, gap: 8,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  fabText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
});

export default TeacherClassScreen;
