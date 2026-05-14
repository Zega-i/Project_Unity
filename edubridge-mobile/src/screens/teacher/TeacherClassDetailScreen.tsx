import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable,
  ScrollView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

const TeacherClassDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const { class: classData } = route.params;
  const [activeTab, setActiveTab] = useState('Materials');

  const tabs = [
    { id: 'Materials', icon: 'book', label: 'Materi' },
    { id: 'Assignments', icon: 'clipboard', label: 'Tugas' },
    { id: 'Discussions', icon: 'chatbubbles', label: 'Diskusi' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{classData.name}</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Token: {classData.token}</Text>
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

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.emptyContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name={tabs.find(t => t.id === activeTab)?.icon + '-outline' as any} size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum ada {tabs.find(t => t.id === activeTab)?.label}</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Klik tombol tambah di bawah untuk membuat {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} baru.
          </Text>
        </View>
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => triggerLight()}>
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
  content: { padding: 20 },
  emptyContent: { borderRadius: 20, padding: 40, alignItems: 'center', borderStyle: 'dashed', borderWidth: 2 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: GREEN, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 },
});

export default TeacherClassDetailScreen;
