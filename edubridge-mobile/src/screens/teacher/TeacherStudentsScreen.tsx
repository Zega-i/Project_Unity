import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

const MOCK_STUDENTS = [
  { id: '1', name: 'Dika Pratama',   kelas: 'Matematika 10A', avg: 60, color: '#6366F1' },
  { id: '2', name: 'Siti Nurhaliza', kelas: 'Fisika 10A',      avg: 65, color: '#EC4899' },
  { id: '3', name: 'Budi Santoso',   kelas: 'Biologi 10A',     avg: 55, color: '#F59E0B' },
  { id: '4', name: 'Anita Wijaya',   kelas: 'Matematika 10A', avg: 88, color: '#10B981' },
  { id: '5', name: 'Rian Hidayat',   kelas: 'Fisika 11B',      avg: 72, color: '#8B5CF6' },
];

const TeacherStudentsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { triggerLight } = useHapticFeedback();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Daftar Siswa</Text>
      </View>

      <View style={styles.searchBox}>
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput placeholder="Cari nama siswa..." placeholderTextColor="#999" style={[styles.searchInput, { color: colors.text }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {MOCK_STUDENTS.map((s) => (
          <Pressable 
            key={s.id} 
            style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => { triggerLight(); navigation.navigate('TeacherStudentDetail', { name: s.name, className: s.kelas, avgScore: s.avg, avatarColor: s.color }); }}
          >
            <View style={[styles.avatar, { backgroundColor: s.color + '20', borderColor: s.color + '50' }]}>
              <Text style={[styles.avatarText, { color: s.color }]}>{s.name.charAt(0)}</Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: colors.text }]}>{s.name}</Text>
              <Text style={[styles.studentClass, { color: colors.textSecondary }]}>{s.kelas}</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Rata-rata</Text>
              <Text style={[styles.scoreVal, { color: s.avg < 70 ? '#EF4444' : GREEN }]}>{s.avg}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#CCC" />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 15 },
  title: { fontSize: 24, fontWeight: 'bold' },
  searchBox: { paddingHorizontal: 20, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  studentCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  studentInfo: { flex: 1, marginLeft: 14 },
  studentName: { fontSize: 15, fontWeight: 'bold' },
  studentClass: { fontSize: 12, marginTop: 2 },
  scoreBox: { alignItems: 'flex-end', marginRight: 10 },
  scoreLabel: { fontSize: 10, color: '#999', marginBottom: 2 },
  scoreVal: { fontSize: 16, fontWeight: 'bold' },
});

export default TeacherStudentsScreen;
