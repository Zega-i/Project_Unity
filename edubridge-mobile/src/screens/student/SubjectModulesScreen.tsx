import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PURPLE = '#7C3AED';

const MODULES = [
  {
    id: '1',
    title: 'Modul 1: Dasar-dasar Aljabar',
    topics: [
      { id: 't1', title: 'Pengenalan Variabel', type: 'text', completed: true },
      { id: 't2', title: 'Operasi Hitung Aljabar', type: 'video', completed: true },
      { id: 't3', title: 'Latihan Soal Dasar', type: 'quiz', completed: false },
    ]
  },
  {
    id: '2',
    title: 'Modul 2: Persamaan Linear',
    topics: [
      { id: 't4', title: 'Konsep Persamaan Linear', type: 'text', completed: false },
      { id: 't5', title: 'Penyelesaian Satu Variabel', type: 'text', completed: false },
      { id: 't6', title: 'Kuis Persamaan Linear', type: 'quiz', completed: false },
    ]
  }
];

const SubjectModulesScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Matematika - Aljabar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {MODULES.map((module) => (
          <View key={module.id} style={styles.moduleSection}>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <View style={styles.topicsContainer}>
              {module.topics.map((topic) => (
                <Pressable 
                  key={topic.id} 
                  style={styles.topicCard}
                  onPress={() => navigation.navigate('MaterialDetail', { title: topic.title })}
                >
                  <View style={[styles.typeIconBox, { backgroundColor: topic.completed ? '#F0FDF4' : '#F1F5F9' }]}>
                    <Ionicons 
                      name={topic.type === 'video' ? 'play-circle' : topic.type === 'quiz' ? 'help-circle' : 'document-text'} 
                      size={22} 
                      color={topic.completed ? '#10B981' : '#64748B'} 
                    />
                  </View>
                  <View style={styles.topicInfo}>
                    <Text style={[styles.topicTitle, topic.completed && styles.textCompleted]}>{topic.title}</Text>
                    <Text style={styles.topicType}>{topic.type === 'video' ? 'Video Pembelajaran' : topic.type === 'quiz' ? 'Latihan Kuis' : 'Materi Bacaan'}</Text>
                  </View>
                  {topic.completed ? (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  scrollContent: { padding: 20 },
  moduleSection: { marginBottom: 24 },
  moduleTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  topicsContainer: { gap: 12 },
  topicCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F1F5F9' },
  typeIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  topicInfo: { flex: 1 },
  topicTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  textCompleted: { color: '#94A3B8', textDecorationLine: 'line-through' },
  topicType: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
});

export default SubjectModulesScreen;
