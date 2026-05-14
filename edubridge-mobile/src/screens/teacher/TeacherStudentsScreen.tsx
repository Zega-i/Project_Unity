import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  Pressable, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

const MOCK_STUDENTS = [
  { id: '1', name: 'Ahmad Fauzi', class: '10A', score: 88, status: 'Active' },
  { id: '2', name: 'Budi Santoso', class: '10A', score: 72, status: 'At Risk' },
  { id: '3', name: 'Citra Lestari', class: '11B', score: 95, status: 'Active' },
];

const TeacherStudentsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const [search, setSearch] = useState('');

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || s.class.includes(search)
  );

  const renderStudentItem = ({ item }: { item: any }) => (
    <Pressable 
      style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => { triggerLight(); navigation.navigate('TeacherStudentDetail', { student: item }); }}
    >
      <View style={[styles.avatar, { backgroundColor: item.status === 'At Risk' ? '#FEE2E2' : '#DCFCE7' }]}>
        <Text style={[styles.avatarText, { color: item.status === 'At Risk' ? '#EF4444' : '#16A34A' }]}>
          {item.name.charAt(0)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Kelas {item.class} • Rerata Skor: {item.score}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: item.status === 'At Risk' ? '#FEE2E2' : '#DCFCE7' }]}>
        <Text style={[styles.statusText, { color: item.status === 'At Risk' ? '#EF4444' : '#16A34A' }]}>
          {item.status}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Daftar Siswa</Text>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari nama atau kelas..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, height: 45 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  list: { padding: 20 },
  studentCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  sub: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },
});

export default TeacherStudentsScreen;
