import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

const TeacherStudentDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const { student } = route.params || {};
  const isTeacher = true; // Context for this screen

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Detail Siswa</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: (student?.color || GREEN) + '15' }]}>
            <Text style={[styles.avatarText, { color: student?.color || GREEN }]}>{student?.name?.charAt(0) || 'S'}</Text>
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{student?.name || 'Nama Siswa'}</Text>
          <Text style={[styles.class, { color: colors.textSecondary }]}>{student?.kelas || 'Kelas tidak diketahui'}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rerata Skor</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{student?.avg || 0}</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Kehadiran</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>95%</Text>
          </View>
        </View>

        <View style={[styles.aiSection, { backgroundColor: isDarkMode ? '#064E3B' : '#F0FDF4', borderColor: isDarkMode ? '#065F46' : '#BBF7D0' }]}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={20} color={isDarkMode ? '#34D399' : GREEN} />
            <Text style={[styles.aiTitle, { color: isDarkMode ? '#34D399' : GREEN }]}>AI Recommendation</Text>
          </View>
          <Text style={[styles.aiText, { color: isDarkMode ? '#D1FAE5' : '#166534' }]}>
            Siswa ini memiliki performa yang sangat baik di materi {student?.kelas?.split(' ')[0] || 'Aljabar'}, namun memerlukan latihan tambahan pada topik Geometri. Disarankan untuk memberikan tugas pengayaan berbasis visual.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  content: { padding: 20 },
  profileCard: { alignItems: 'center', padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  class: { fontSize: 14 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  aiSection: { padding: 20, borderRadius: 20, borderWidth: 1 },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  aiTitle: { fontSize: 16, fontWeight: 'bold' },
  aiText: { fontSize: 14, lineHeight: 20 },
});

export default TeacherStudentDetailScreen;
