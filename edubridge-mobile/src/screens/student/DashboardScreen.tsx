import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Image, ActivityIndicator, RefreshControl,
  StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { authStore } from '../../store/authStore';
import { authAPI, aiAPI, progressAPI, notificationsAPI, classAPI } from '../../services/api';
import PremiumModal from '../../components/PremiumModal';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useTheme } from '../../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { USE_MOCK_DATA } from '../../constants';

const PURPLE = '#7C3AED';

const getRemainingTimeText = (dateStr: string) => {
  const now = new Date();
  const deadline = new Date(dateStr);
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (diffHours <= 24) {
    const hours = Math.max(1, diffHours);
    return `${hours} jam lagi`;
  }
  const days = Math.ceil(diffHours / 24);
  return `${days} hari lagi`;
};

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} mnt lalu`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} hari lalu`;
};

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { triggerLight } = useHapticFeedback();
  const { colors, isDarkMode } = useTheme();
  const [user, setUser] = useState<any>(authStore.getUserSync());
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingPath, setLoadingPath] = useState(false);
  const [learningPath, setLearningPath] = useState({ visible: false, content: '' });
  const [recommendationPath, setRecommendationPath] = useState<any[]>([]);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [progress, setProgress] = useState({ overallProgress: 0, totalMaterials: 0, viewedMaterials: 0 });
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const loadUnreadCount = async () => {
    try {
      const res = await notificationsAPI.getAll();
      if (res && res.success && res.data && Array.isArray(res.data.notifications)) {
        setUnreadCount(res.data.notifications.filter((n: any) => !n.read).length);
      } else {
        setUnreadCount(0);
      }
    } catch {
      setUnreadCount(0);
    }
  };

  const loadProgress = async () => {
    if (USE_MOCK_DATA) {
      setProgress({ overallProgress: 82, totalMaterials: 15, viewedMaterials: 12 });
      return;
    }
    try {
      const res = await progressAPI.getMyProgress();
      if (res.success && res.data) {
        setProgress(res.data);
      }
    } catch {
      // tetap tampilkan 0 jika gagal
    }
  };

  const loadDashboardAlerts = async () => {
    if (USE_MOCK_DATA) {
      setUpcomingAssignments([
        {
          id: 'mock-assign-1',
          title: 'Tugas Kalkulus: Limit & Turunan Fungsi',
          className: 'Kalkulus XI-A',
          classIcon: '📐',
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        }
      ]);
      setRecentActivities([
        {
          id: 'mock-notif-1',
          title: 'Materi Baru',
          message: 'Materi baru "Integral Lipat Dua" telah diunggah di kelas Kalkulus XI-A. Yuk pelajari sekarang!',
          type: 'NEW_MATERIAL',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'mock-notif-2',
          title: 'Kuis Baru',
          message: 'Kuis baru "Kuis 1: SPLDV" kini tersedia di kelas Matematika 11-A. Durasi: 15 menit.',
          type: 'SYSTEM',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        }
      ]);
      return;
    }

    try {
      // 1. Fetch upcoming assignments across all joined classes
      const classRes = await classAPI.getMyClasses();
      const myClasses: any[] = classRes.data || [];
      
      const results = await Promise.all(
        myClasses.map((cls: any) =>
          classAPI.getClassAssignments(cls.id)
            .then((r: any) => (r && r.data || []).map((a: any) => ({
              ...a,
              className: cls.name,
              classIcon: cls.subject === 'Matematika' || cls.subject === 'Fisika' ? '📐' : '📗'
            })))
            .catch(() => [])
        )
      );

      const allAssignments = results.flat();
      const now = new Date();
      const upcoming = allAssignments.filter((a: any) => {
        const deadline = new Date(a.deadline);
        const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 72; // within 3 days (72 hours)
      });
      upcoming.sort((a: any, b: any) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      setUpcomingAssignments(upcoming);

      // 2. Fetch notifications and filter for recent class activities
      const notifRes = await notificationsAPI.getAll();
      if (notifRes && notifRes.success && notifRes.data && Array.isArray(notifRes.data.notifications)) {
        const classActivities = notifRes.data.notifications.filter((n: any) =>
          n.type === 'NEW_MATERIAL' || (n.type === 'SYSTEM' && (n.title.toLowerCase().includes('kuis') || n.title.toLowerCase().includes('tugas') || n.title.toLowerCase().includes('materi')))
        );
        setRecentActivities(classActivities.slice(0, 3));
      } else {
        setRecentActivities([]);
      }
    } catch (err) {
      console.log('Error loading dashboard alerts:', err);
    }
  };

  const loadSavedPath = async () => {
    try {
      const userData = authStore.getUserSync();
      if (userData?.id) {
        const stored = await AsyncStorage.getItem(`@learning_path_${userData.id}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setRecommendationPath(parsed);
              const storedCompleted = await AsyncStorage.getItem(`@learning_path_completed_${userData.id}`);
              if (storedCompleted) {
                setCompletedDays(JSON.parse(storedCompleted));
              } else {
                setCompletedDays([]);
              }
              return;
            }
          } catch {}
        }
        setRecommendationPath([]);
        setCompletedDays([]);
      }
    } catch (err) {
      console.log('[DashboardScreen] Error loading saved path:', err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadCount();
      loadProgress();
      loadDashboardAlerts();
      loadSavedPath();
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
    await Promise.all([
      loadProfile(),
      loadUnreadCount(),
      loadProgress(),
      loadDashboardAlerts(),
      loadSavedPath()
    ]);
    setRefreshing(false);
  };

  const handleGeneratePath = async () => {
    console.log('[DashboardScreen] handleGeneratePath - Triggered');
    setLoadingPath(true);
    triggerLight();
    try {
      const res = await aiAPI.getLearningPath();
      console.log('[DashboardScreen] handleGeneratePath - Response success:', res?.success);
      console.log('[DashboardScreen] handleGeneratePath - Response data keys:', res?.data ? Object.keys(res.data) : null);
      if (res.success && res.data && res.data.recommendation) {
        const pathData = res.data.recommendation; // This is the JSON array
        console.log('[DashboardScreen] handleGeneratePath - Loaded recommendation path array length:', Array.isArray(pathData) ? pathData.length : typeof pathData);
        setRecommendationPath(pathData);
        setCompletedDays([]);
        const userData = authStore.getUserSync();
        if (userData?.id) {
          await AsyncStorage.setItem(`@learning_path_${userData.id}`, JSON.stringify(pathData));
          await AsyncStorage.removeItem(`@learning_path_completed_${userData.id}`);
        }
      } else {
        console.log('[DashboardScreen] handleGeneratePath - Failed validation:', JSON.stringify(res));
      }
    } catch (error) {
      console.log('[DashboardScreen] handleGeneratePath - Error:', error);
      Alert.alert('Error', 'Gagal membuat jalur belajar AI.');
    } finally {
      setLoadingPath(false);
    }
  };

  const toggleDayCompleted = async (index: number) => {
    triggerLight();
    const userData = authStore.getUserSync();
    if (!userData?.id) return;
    
    const isCompleted = completedDays.includes(index);
    let updated: number[];
    if (isCompleted) {
      updated = completedDays.filter(i => i !== index);
    } else {
      updated = [...completedDays, index];
    }
    setCompletedDays(updated);
    await AsyncStorage.setItem(`@learning_path_completed_${userData.id}`, JSON.stringify(updated));
  };

  const hasClass = !!(user?.className || user?.['class']);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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

        {/* Urgent Deadline Alert Banner */}
        {upcomingAssignments.length > 0 && (
          <Pressable 
            style={[styles.deadlineBanner, { backgroundColor: isDarkMode ? '#3F2C00' : '#FEF3C7', borderColor: isDarkMode ? '#D97706' : '#FDE68A' }]} 
            onPress={() => { triggerLight(); navigation.navigate('Assignments' as any); }}
          >
            <View style={styles.deadlineBannerHeader}>
              <Ionicons name="alert-circle" size={18} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={[styles.deadlineBannerTitle, { color: isDarkMode ? '#FBBF24' : '#B45309' }]}>Tugas Mendekati Deadline!</Text>
            </View>
            <Text style={[styles.deadlineBannerText, { color: isDarkMode ? '#FDE68A' : '#78350F' }]} numberOfLines={2}>
              "{upcomingAssignments[0].title}" ({upcomingAssignments[0].className}) batas akhir {getRemainingTimeText(upcomingAssignments[0].deadline)}
            </Text>
          </Pressable>
        )}

        {/* Learning Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Ringkasan Belajar</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Sudah Dipelajari</Text>
                <Text style={styles.statValue}>{progress.viewedMaterials}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Belum Dipelajari</Text>
                <Text style={styles.statValue}>{progress.totalMaterials - progress.viewedMaterials}</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressCircle}>
            <Text style={styles.progressText}>{progress.overallProgress}%</Text>
            <Text style={styles.progressSub}>Selesai</Text>
          </View>
        </View>

        {/* Recent Class Activity Feed */}
        {recentActivities.length > 0 && (
          <View style={styles.activitySection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Aktivitas Kelas Terbaru</Text>
            <View style={styles.activityList}>
              {recentActivities.map((item) => {
                const isMaterial = item.type === 'NEW_MATERIAL';
                const isQuiz = item.title.toLowerCase().includes('kuis');
                const isAssignment = item.title.toLowerCase().includes('tugas');
                
                let iconName = 'notifications-outline';
                let iconColor = '#6B7280';
                let targetRoute = 'Notifications';
                
                if (isMaterial) {
                  iconName = 'book';
                  iconColor = '#6366F1';
                  targetRoute = 'Materials';
                } else if (isQuiz) {
                  iconName = 'extension-puzzle';
                  iconColor = '#F59E0B';
                  targetRoute = 'Quiz';
                } else if (isAssignment) {
                  iconName = 'clipboard';
                  iconColor = '#EF4444';
                  targetRoute = 'Assignments';
                }

                return (
                  <Pressable
                    key={item.id}
                    style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => { triggerLight(); navigation.navigate(targetRoute as any); }}
                  >
                    <View style={[styles.activityIconBox, { backgroundColor: iconColor + '12' }]}>
                      <Ionicons name={iconName as any} size={20} color={iconColor} />
                    </View>
                    <View style={styles.activityInfo}>
                      <View style={styles.activityHeaderRow}>
                        <Text style={[styles.activityType, { color: iconColor }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                          {formatRelativeTime(item.createdAt)}
                        </Text>
                      </View>
                      <Text style={[styles.activityMessage, { color: colors.text }]} numberOfLines={1}>
                        {item.message}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rekomendasi Belajar</Text>
          {Array.isArray(recommendationPath) && recommendationPath.length > 0 ? (
            <Pressable 
              style={[styles.seeAllBtn, { backgroundColor: PURPLE + '10', borderWidth: 0, paddingHorizontal: 12, paddingVertical: 6 }]} 
              onPress={handleGeneratePath}
              disabled={loadingPath}
            >
              {loadingPath ? (
                <ActivityIndicator size="small" color={PURPLE} />
              ) : (
                <>
                  <Ionicons name="sync-outline" size={14} color={PURPLE} />
                  <Text style={[styles.seeAll, { color: PURPLE }]}>Perbarui</Text>
                </>
              )}
            </Pressable>
          ) : null}
        </View>

        {Array.isArray(recommendationPath) && recommendationPath.length > 0 ? (
          <View style={[styles.emptyRecom, { backgroundColor: colors.card, borderColor: colors.border, alignItems: 'stretch', padding: 16 }]}>
            <View style={[styles.aiHeader, { justifyContent: 'center', marginBottom: 12 }]}>
              <Ionicons name="sparkles" size={20} color={PURPLE} />
              <Text style={[styles.aiHeaderTitle, { color: PURPLE }]}>JALUR BELAJAR 7 HARI KAMU</Text>
            </View>
            <ScrollView 
              style={{ maxHeight: 280 }} 
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              <View style={styles.timelineContainer}>
                {(recommendationPath || []).map((item: any, idx: number) => {
                  const isHigh = item.priority === 'high';
                  const isMedium = item.priority === 'medium';
                  const badgeBg = isHigh ? '#FEE2E2' : isMedium ? '#FEF3C7' : '#D1FAE5';
                  const badgeText = isHigh ? '#EF4444' : isMedium ? '#D97706' : '#10B981';
                  const priorityLabel = isHigh ? 'Penting' : isMedium ? 'Sedang' : 'Rendah';
                  const isCompleted = completedDays.includes(idx);

                  return (
                    <View key={idx} style={styles.timelineItem}>
                      {/* Left timeline line and dot */}
                      <View style={styles.timelineLeft}>
                        <View style={[styles.timelineDot, { backgroundColor: PURPLE }]}>
                          <Text style={styles.timelineDotText}>{item.day}</Text>
                        </View>
                        {idx < (recommendationPath || []).length - 1 && (
                          <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                        )}
                      </View>

                      {/* Right card content */}
                      <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: isCompleted ? 0.6 : 1 }]}>
                        <View style={styles.cardHeader}>
                          <View style={[styles.subjectBadge, { backgroundColor: colors.primary + '15' }]}>
                            <Text style={[styles.subjectBadgeText, { color: colors.primary, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>{item.subject}</Text>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[styles.priorityBadge, { backgroundColor: badgeBg }]}>
                              <Text style={[styles.priorityBadgeText, { color: badgeText }]}>{priorityLabel}</Text>
                            </View>
                            <Pressable 
                              style={[styles.checkBtn, { backgroundColor: isCompleted ? '#D1FAE5' : colors.border + '30', borderColor: isCompleted ? '#10B981' : colors.border }]} 
                              onPress={() => toggleDayCompleted(idx)}
                            >
                              <Ionicons 
                                name={isCompleted ? "checkmark-sharp" : "ellipse-outline"} 
                                size={12} 
                                color={isCompleted ? '#10B981' : colors.textSecondary} 
                              />
                            </Pressable>
                          </View>
                        </View>
                        <Text style={[styles.taskTitle, { color: colors.text, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>{item.task}</Text>
                        <Text style={[styles.taskDesc, { color: colors.textSecondary, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>{item.desc}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        ) : (
          <View style={[styles.emptyRecom, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={24} color={PURPLE} />
              <Text style={[styles.aiHeaderTitle, { color: PURPLE }]}>AI LEARNING PATH</Text>
            </View>
            <Text style={[styles.emptyRecomTitle, { color: colors.text }]}>Jalur Belajar Personal</Text>
            <Text style={[styles.emptyRecomDesc, { color: colors.textSecondary }]}>
              {hasClass
                ? 'Dapatkan rencana belajar 7 hari kedepan yang disusun khusus oleh AI berdasarkan performamu.'
                : 'Bergabung ke kelas terlebih dahulu untuk mendapatkan rekomendasi belajarmu.'}
            </Text>
            {hasClass ? (
              <Pressable 
                style={[styles.joinClassBtn, { backgroundColor: PURPLE }]} 
                onPress={handleGeneratePath}
                disabled={loadingPath}
              >
                {loadingPath ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="map-outline" size={18} color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.joinClassText}>Buat Jalur Belajar AI</Text>
                  </>
                )}
              </Pressable>
            ) : (
              <Pressable style={[styles.joinClassBtn, { backgroundColor: colors.primary }]} onPress={() => { triggerLight(); navigation.navigate('JoinClass' as any); }}>
                <Text style={styles.joinClassText}>Gabung Kelas</Text>
              </Pressable>
            )}
          </View>
        )}

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

      <PremiumModal
        visible={learningPath.visible}
        type="info"
        icon="map"
        title="Jalur Belajar AI"
        message={learningPath.content}
        confirmText="Mulai Belajar!"
        onConfirm={() => setLearningPath({ ...learningPath, visible: false })}
      />
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
  emptyRecom: {
    borderRadius: 20, borderWidth: 1, padding: 24,
    alignItems: 'center', gap: 8, marginBottom: 8,
  },
  emptyRecomTitle: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  emptyRecomDesc:  { fontSize: 13, textAlign: 'center', lineHeight: 19 },
  joinClassBtn:    { marginTop: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center' },
  joinClassText:   { color: '#FFF', fontSize: 14, fontWeight: '700' },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  aiHeaderTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
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
  deadlineBanner: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 15 },
  deadlineBannerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  deadlineBannerTitle: { fontSize: 13, fontWeight: '700' },
  deadlineBannerText: { fontSize: 12, lineHeight: 18 },
  activitySection: { marginBottom: 20 },
  activityList: { gap: 10, marginTop: 8 },
  activityCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 20, borderWidth: 1 },
  activityIconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityInfo: { flex: 1, marginRight: 8 },
  activityHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  activityType: { fontSize: 12, fontWeight: '700' },
  activityTime: { fontSize: 10 },
  activityMessage: { fontSize: 12, lineHeight: 18 },
  timelineContainer: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 12,
    width: 28,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  timelineDotText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  timelineLine: {
    position: 'absolute',
    top: 24,
    bottom: -16,
    width: 2,
    zIndex: 0,
  },
  timelineCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  subjectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  checkBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DashboardScreen;