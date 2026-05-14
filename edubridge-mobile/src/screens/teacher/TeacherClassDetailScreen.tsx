import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, StatusBar,
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
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<'materi' | 'tugas' | 'diskusi'>('materi');

  const className = route.params?.className || 'Nama Kelas';

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Pressable onPress={() => { triggerLight(); navigation.goBack(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{className}</Text>
        <Pressable style={styles.settingsBtn}><Ionicons name="settings-outline" size={22} color={colors.text} /></Pressable>
      </View>

      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        {['materi', 'tugas', 'diskusi'].map((tab) => (
          <Pressable 
            key={tab} 
            style={[styles.tab, activeTab === tab && { borderBottomColor: GREEN, borderBottomWidth: 3 }]}
            onPress={() => { triggerLight(); setActiveTab(tab as any); }}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? GREEN : colors.textSecondary }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'materi' && (
          <View>
            <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: colors.text }]}>Daftar Materi</Text><Pressable style={[styles.addBtn, { backgroundColor: GREEN }]}><Ionicons name="add" size={20} color="#FFF" /></Pressable></View>
            {[
              { id: '1', title: 'Pengenalan Aljabar', date: '12 Mei 2024', reads: 28 },
              { id: '2', title: 'Persamaan Kuadrat', date: '15 Mei 2024', reads: 25 },
            ].map(m => (
              <View key={m.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="document-text" size={24} color={GREEN} />
                <View style={styles.itemInfo}><Text style={[styles.itemTitle, { color: colors.text }]}>{m.title}</Text><Text style={styles.itemSub}>{m.date} • {m.reads} Siswa membaca</Text></View>
                <Ionicons name="ellipsis-vertical" size={18} color="#999" />
              </View>
            ))}
          </View>
        )}
        {activeTab !== 'materi' && (
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={48} color="#CCC" />
            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Fitur {activeTab} segera hadir</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', flex: 1 },
  settingsBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 14, fontWeight: 'bold' },
  content: { padding: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  addBtn: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  itemInfo: { flex: 1, marginLeft: 16 },
  itemTitle: { fontSize: 15, fontWeight: 'bold' },
  itemSub: { fontSize: 12, color: '#999', marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 100 },
});

export default TeacherClassDetailScreen;
