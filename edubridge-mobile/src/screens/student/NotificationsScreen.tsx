import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, ActivityIndicator, RefreshControl,
  StatusBar, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authStore } from '../../store/authStore';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ACHIEVEMENT' | 'QUIZ_RESULT' | 'NEW_MATERIAL' | 'RISK_ALERT' | 'SYSTEM';
  read: boolean;
  createdAt: string;
}

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Materi Baru Tersedia',
      message: 'Guru telah mengunggah materi baru "Persamaan Linear" di kelas Matematika',
      type: 'NEW_MATERIAL',
      read: false,
      createdAt: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: '2',
      title: 'Quiz Menunggu',
      message: 'Masih ada 1 quiz yang belum kamu kerjakan: "Quiz Fungsi Kuadrat"',
      type: 'QUIZ_RESULT',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      title: 'Pencapaian Baru!',
      message: 'Selamat! Kamu telah menyelesaikan 5 materi dalam seminggu. Lanjutkan!',
      type: 'ACHIEVEMENT',
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4',
      title: 'Peringatan Performa',
      message: 'Performa kamu di Fisika menurun. Kami merekomendasikan lebih banyak latihan.',
      type: 'RISK_ALERT',
      read: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
      // TODO: Fetch from API when backend is ready
      // const token = await authStore.getToken();
      // const response = await fetch('http://your-backend-url/api/notifications', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setNotifications(data.data.notifications);

      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.log('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      triggerLight();
      const updated = notifications.map(n => n.id === notificationId ? { ...n, read: true } : n);
      setNotifications(updated);
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
      // TODO: Call backend when ready
      // const token = await authStore.getToken();
      // await fetch('http://your-backend-url/api/notifications/mark-read', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ notificationId })
      // });
    } catch (error) {
      console.log('Error marking as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      triggerLight();
      const updated = notifications.filter(n => n.id !== notificationId);
      setNotifications(updated);
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
      // TODO: Call backend when ready
      // const token = await authStore.getToken();
      // await fetch('http://your-backend-url/api/notifications/delete', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ notificationId })
      // });
    } catch (error) {
      console.log('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      triggerLight();
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      await AsyncStorage.setItem('notifications', JSON.stringify(updated));
      // TODO: Call backend when ready
      // const token = await authStore.getToken();
      // await fetch('http://your-backend-url/api/notifications/mark-all-read', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
    } catch (error) {
      console.log('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return { icon: 'star', color: '#F59E0B' };
      case 'QUIZ_RESULT':
        return { icon: 'checkmark-circle', color: '#10B981' };
      case 'NEW_MATERIAL':
        return { icon: 'document-text', color: PURPLE };
      case 'RISK_ALERT':
        return { icon: 'warning', color: '#EF4444' };
      case 'SYSTEM':
        return { icon: 'information-circle', color: '#3B82F6' };
      default:
        return { icon: 'notifications', color: '#94A3B8' };
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins}m yang lalu`;
    if (diffHours < 24) return `${diffHours}j yang lalu`;
    if (diffDays < 7) return `${diffDays}d yang lalu`;

    return date.toLocaleDateString('id-ID');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const iconInfo = getNotificationIcon(item.type);

    return (
      <Pressable
        style={[
          styles.notifCard,
          !item.read && [styles.notifCardUnread, { backgroundColor: colors.primary + '08' }],
          { backgroundColor: colors.surface },
        ]}
        onPress={() => !item.read && markAsRead(item.id)}
      >
        <View style={[styles.notifIconBox, { backgroundColor: iconInfo.color + '15' }]}>
          <Ionicons name={iconInfo.icon as any} size={20} color={iconInfo.color} />
        </View>

        <View style={styles.notifContent}>
          <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.notifMessage, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.notifTime, { color: colors.textSecondary }]}>{formatTime(item.createdAt)}</Text>
        </View>

        {!item.read && <View style={styles.unreadDot} />}

        <Pressable
          style={styles.deleteBtn}
          onPress={() => deleteNotification(item.id)}
          hitSlop={10}
        >
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable style={styles.backBtn} onPress={() => { triggerLight(); navigation.goBack(); }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifikasi</Text>
          {unreadCount > 0 && (
            <Text style={[styles.unreadLabel, { color: colors.textSecondary }]}>{unreadCount} notifikasi baru</Text>
          )}
        </View>
        {unreadCount > 0 ? (
          <Pressable style={[styles.markAllBtn, { backgroundColor: colors.primary + '15' }]} onPress={markAllAsRead}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>Tandai Semua</Text>
          </Pressable>
        ) : (
          <View style={styles.markAllBtn} />
        )}
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={48} color={colors.primary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Tidak ada notifikasi</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>Semua notifikasi akan muncul di sini</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, gap: 8 },
  backBtn:      { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle:  { fontSize: 20, fontWeight: 'bold' },
  unreadLabel:  { fontSize: 12, marginTop: 2 },
  markAllBtn:   { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  markAllText:  { fontSize: 12, fontWeight: '600' },

  listContent: { paddingHorizontal: 20, paddingVertical: 12, paddingBottom: 20 },
  notifCard: { borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', borderLeftWidth: 4, borderLeftColor: 'transparent' },
  notifCardUnread: { borderLeftColor: PURPLE },
  notifIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  notifMessage: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 6 },
  notifTime: { fontSize: 11, color: '#94A3B8' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: PURPLE, marginHorizontal: 8 },
  deleteBtn: { paddingLeft: 8 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 16 },
  emptyDesc: { fontSize: 14, color: '#94A3B8', marginTop: 8 },
});

export default NotificationsScreen;
