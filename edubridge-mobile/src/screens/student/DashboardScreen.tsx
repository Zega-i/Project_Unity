import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Image, ActivityIndicator, RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { authStore } from '../../store/authStore';
import { authAPI } from '../../services/api';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const PURPLE = '#7C3AED';

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { triggerLight } = useHapticFeedback();
  const { colors, isDarkMode } = useTheme();
  const [user, setUser] = useState<any>(authStore.getUserSync());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        const notifs = JSON.parse(stored);
        setUnreadCount(notifs.filter((n: any) => !n.read).length);
      } else {
        setUnreadCount(2);
      }
    } catch {
      setUnreadCount(0);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadCount();
    }, [])
  );

  const loadProfile = async () => {
    try {
      // Pertama cek dari authStore
      const cachedUser = authStore.getUserSync();
      console.log('[DashboardScreen] Cached user:', cachedUser?.name);
      if (cachedUser?.name) {
        setUser(cachedUser);
      }

      // Fetch dari API untuk get fresh data
      const res = await authAPI.getProfile();
      console.log('[DashboardScreen] API response:', res?.name, res?.school);
      if (res && res.id) {
        setUser(res);
        const token = await authStore.getToken();
        await authStore.setAuth(token || '', res);
      }
    } catch (err) {
      console.log('[DashboardScreen] Error loading profile:', err);
      // Use cached data if API fails
      const cachedUser = authStore.getUserSync();
      if (cachedUser) {
        setUser(cachedUser);
      }
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Halo, {user?.name?.split(' ')[0] || 'Siswa'} 👋</Text>
            <Text style={[styles.subWelcome, { color: colors.textSecondary }]}>Mari lanjutkan belajarmu hari ini</Text>
          </View>
          <Pressable style={[styles.notificationBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { triggerLight(); navigation.navigate('Notifications' as any); }}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Learning Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Ringkasan Belajar</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Sudah Dipelajari</Text>
                <Text style={styles.statValue}>5</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Belum Dipelajari</Text>
                <Text style={styles.statValue}>3</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>63%</Text>
            <Text style={styles.progressSub}>Selesai</Text>
          </View>
        </View>

        {/* Recommendations - Vertical List (Max 3 items) */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rekomendasi Belajar</Text>
          <Pressable style={[styles.seeAllBtn, { backgroundColor: colors.primary + '15' }]} onPress={() => { triggerLight(); navigation.navigate('Recommendations' as any); }}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>Lihat Semua</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.recomList}>
          {[
            { id: '1', title: 'Persamaan Linear', subject: 'Matematika', level: 'Dasar', duration: '15 Min', progress: 60, color: '#6366F1', icon: '📐' },
            { id: '2', title: 'Hukum Newton', subject: 'Fisika', level: 'Menengah', duration: '20 Min', progress: 40, color: '#F59E0B', icon: '⚡' },
            { id: '3', title: 'Fungsi Kuadrat', subject: 'Matematika', level: 'Menengah', duration: '25 Min', progress: 35, color: '#8B5CF6', icon: '📊' },
          ].slice(0, 3).map((item) => (
            <Pressable key={item.id} style={[styles.recomCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => triggerLight()}>
              <View style={[styles.recomIconBox, { backgroundColor: item.color + '10' }]}>
                <Text style={styles.recomIconText}>{item.icon}</Text>
              </View>
              <View style={styles.recomInfo}>
                <Text style={[styles.recomSubject, { color: colors.textSecondary }]}>{item.subject} • {item.level}</Text>
                <Text style={[styles.recomTitle, { color: colors.text }]}>{item.title}</Text>
                <View style={styles.recomFooter}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.recomTime, { color: colors.textSecondary }]}>{item.duration}</Text>
                  <View style={[styles.miniProgressBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.miniProgressFill, { width: `${item.progress}%`, backgroundColor: item.color }]} />
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        {/* Spacer - Push Menu Cepat to bottom */}
        <View style={styles.spacer} />

        {/* Menu Cepat (Quick Menu) */}
        <View style={[styles.sectionHeader, { marginTop: 35 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Menu Cepat</Text>
        </View>

        <View style={styles.menuGrid}>
          {[
            { id: '1', name: 'AI Tutor', icon: 'chatbubble-ellipses', color: '#10B981', route: 'AITutor', desc: 'Bantuan belajar' },
            { id: '2', name: 'Kuis', icon: 'extension-puzzle', color: '#F59E0B', route: 'Quiz', desc: 'Tes pengetahuan' },
            { id: '3', name: 'Materi', icon: 'book', color: '#6366F1', route: 'Materials', desc: 'Materi dari guru' },
            { id: '4', name: 'Tugas', icon: 'clipboard', color: '#EF4444', route: 'Assignments', desc: 'Tugas belum selesai' },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={styles.menuItem}
              onPress={() => { triggerLight(); navigation.navigate(item.route as any); }}
            >
              <View style={[styles.menuIconBox, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 90, flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  welcomeText: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  subWelcome: { fontSize: 14, color: '#64748B', marginTop: 4 },
  notificationBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9', position: 'relative' },
  notificationBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },
  
  summaryCard: { backgroundColor: PURPLE, borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: PURPLE, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 8, marginBottom: 15 },
  summaryInfo: { flex: 1 },
  summaryTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '500' },
  statValue: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  progressText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  progressSub: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: PURPLE + '10', gap: 4 },
  seeAll: { fontSize: 13, color: PURPLE, fontWeight: '600' },
  
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15, gap: 12 },
  menuItem: { width: '22%', alignItems: 'center' },
  menuIconBox: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  menuText: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  menuDesc: { fontSize: 10, color: '#94A3B8', textAlign: 'center' },
  
  recomList: { gap: 10, marginBottom: 8 },
  spacer: { minHeight: 5 },
  recomCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
  recomIconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  recomIconText: { fontSize: 22 },
  recomInfo: { flex: 1 },
  recomSubject: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
  recomTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginVertical: 4 },
  recomFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  recomTime: { fontSize: 12, color: '#94A3B8', marginLeft: 4, marginRight: 10 },
  miniProgressBg: { flex: 1, height: 4, backgroundColor: '#F1F5F9', borderRadius: 2 },
  miniProgressFill: { height: '100%', borderRadius: 2 },
});

export default DashboardScreen;