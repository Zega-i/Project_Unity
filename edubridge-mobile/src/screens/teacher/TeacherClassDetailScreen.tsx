import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable,
  ScrollView, Dimensions, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

import { teacherAPI } from '../../services/api';

const GREEN = '#16A34A';

const TeacherClassDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();
  const { class: classData } = route.params || {};
  const [activeTab, setActiveTab] = useState('Materials');
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClassContent = async () => {
    if (!classData?.id) return;
    setLoading(true);
    try {
      if (activeTab === 'Materials') {
        const res = await teacherAPI.getClassMaterials(classData.id);
        if (res.success) setMaterials(res.data);
      } else if (activeTab === 'Assignments') {
        const res = await teacherAPI.getClassAssignments(classData.id);
        if (res.success) setAssignments(res.data);
      } else if (activeTab === 'Quizzes') {
        const res = await teacherAPI.getClassQuizzes(classData.id);
        if (res.success) setQuizzes(res.data);
      }
    } catch (error) {
      console.log('Error fetching class content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassContent();
  }, [classData?.id, activeTab]);

  const handleDelete = (id: string, type: 'material' | 'quiz' | 'assignment') => {
    triggerMedium();
    Alert.alert(
      'Hapus Konten',
      `Apakah Anda yakin ingin menghapus ${type} ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              if (type === 'material') await teacherAPI.deleteMaterial(id);
              else if (type === 'quiz') await teacherAPI.deleteQuiz(id);
              else if (type === 'assignment') await teacherAPI.deleteAssignment(id);
              
              Alert.alert('Sukses', 'Konten berhasil dihapus');
              fetchClassContent();
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus konten');
            }
          }
        }
      ]
    );
  };

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
            {loading ? (
              <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} />
            ) : materials.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>Belum ada materi.</Text>
            ) : materials.map(m => (
              <View key={m.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.itemIconBox, { backgroundColor: '#FEE2E2' }]}>
                  <Ionicons name="document-text" size={24} color="#EF4444" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{m.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{m.type || 'PDF'} • {m.size || 'Materi'}</Text>
                </View>
                <Pressable onPress={() => handleDelete(m.id, 'material')}>
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Assignments' && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Tugas Kelas</Text>
            {loading ? (
              <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} />
            ) : assignments.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>Belum ada tugas.</Text>
            ) : assignments.map(t => (
              <View key={t.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.itemIconBox, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="clipboard" size={24} color={GREEN} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{t.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>Tenggat: {t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID') : 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{t.points || 100} Pts</Text>
                  </View>
                  <Pressable onPress={() => handleDelete(t.id, 'assignment')} style={styles.deleteBtn}>
                    <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Quizzes' && (
          <View style={styles.listSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Kuis Baru</Text>
            {loading ? (
              <ActivityIndicator color={GREEN} style={{ marginTop: 20 }} />
            ) : quizzes.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textSecondary }}>Belum ada kuis.</Text>
            ) : quizzes.map(q => (
              <View key={q.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.itemIconBox, { backgroundColor: '#E0E7FF' }]}>
                  <Ionicons name="extension-puzzle" size={24} color="#4F46E5" />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{q.title}</Text>
                  <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{q.questionsCount || 0} Soal • {q.timeLimit || 0} Min</Text>
                </View>
                <Pressable onPress={() => handleDelete(q.id, 'quiz')}>
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                </Pressable>
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
  deleteBtn: { padding: 4 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
});

export default TeacherClassDetailScreen;
