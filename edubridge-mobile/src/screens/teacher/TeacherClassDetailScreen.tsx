import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable,
  ScrollView, Dimensions, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

const TeacherClassDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();
  const { class: classData } = route.params || {};
  const [activeTab, setActiveTab] = useState('Materials');

  const MOCK_MATERIALS = [
    { id: '1', title: '1. Persamaan Linear', type: 'PDF', size: '2.3 MB' },
    { id: '2', title: '2. Sistem Persamaan', type: 'PDF', size: '1.8 MB' },
  ];

  const MOCK_TASKS = [
    { id: 't1', title: 'Latihan Persamaan Linear', deadline: '18 Mei 2025', count: '32/32' },
    { id: 't2', title: 'Tugas 2 - Aljabar', deadline: '25 Mei 2025', count: '28/32' },
  ];

  const MOCK_QUIZZES = [
    { id: 'q1', title: 'Kuis Logika Dasar', questions: 10, duration: '15 Menit' },
  ];

  const tabs = [
    { id: 'Materials', icon: 'book', label: 'Materi' },
    { id: 'Assignments', icon: 'clipboard', label: 'Tugas' },
    { id: 'Quizzes', icon: 'extension-puzzle', label: 'Kuis' },
    { id: 'Discussions', icon: 'chatbubbles', label: 'Diskusi' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{classData?.name || 'Detail Kelas'}</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Token: {classData?.token || '------'}</Text>
        </View>
        <Pressable onPress={() => triggerLight()}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={[styles.tabBar, { borderBottomColor: colors.border }]}>
        {tabs.map(tab => (
          <Pressable 
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => { triggerLight(); setActiveTab(tab.id); }}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? GREEN : colors.textSecondary} 
            />
            <Text style={[styles.tabText, { color: activeTab === tab.id ? GREEN : colors.textSecondary }]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'Materials' && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Modul Pembelajaran</Text>
            {MOCK_MATERIALS.map(m => (
              <View key={m.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.itemIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="document-text" size={24} color="#EF4444" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{m.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{m.type} • {m.size}</Text>
                </View>
                <Pressable><Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} /></Pressable>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Assignments' && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tugas Kelas</Text>
            {MOCK_TASKS.map(t => (
              <View key={t.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.itemIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="clipboard" size={24} color={GREEN} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Tenggat: {t.deadline}</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{t.count}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Quizzes' && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Kuis Baru</Text>
            {MOCK_QUIZZES.map(q => (
              <View key={q.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.itemIconBox, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="extension-puzzle" size={24} color="#4F46E5" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{q.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{q.questions} Soal • {q.duration}</Text>
                </View>
                <Pressable><Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} /></Pressable>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Pressable 
        style={styles.fab} 
        onPress={() => {
          triggerMedium();
          if (activeTab === 'Materials') {
            navigation.navigate('TeacherAddMaterial', { classId: classData?.id });
          } else if (activeTab === 'Assignments') {
            navigation.navigate('TeacherAddAssignment', { classId: classData?.id });
          } else if (activeTab === 'Quizzes') {
            navigation.navigate('TeacherAddQuiz', { classId: classData?.id });
          } else {
            Alert.alert('Info', 'Fitur diskusi segera hadir!');
          }
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSub: { fontSize: 12 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 4 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: GREEN },
  tabText: { fontSize: 12, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingTop: 20 },
  listSection: { marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '800', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12, gap: 14 },
  itemIconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  itemSub: { fontSize: 12 },
  countBadge: { backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  countText: { fontSize: 12, fontWeight: '800', color: GREEN },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
});

export default TeacherClassDetailScreen;
