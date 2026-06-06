import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput,
  SafeAreaView, Alert, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { classAPI } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

const ClassScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<'aktif' | 'selesai'>('aktif');
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredClasses = classes
    .filter(cls => {
      const isArchived = cls.archived === true;
      if (activeTab === 'aktif') {
        return !isArchived;
      } else {
        return isArchived;
      }
    })
    .filter(cls =>
      cls.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const fetchClasses = useCallback(async () => {
    try {
      const res = await classAPI.getMyClasses();
      setClasses(res.data || res);
    } catch (err) {
      console.log(err);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchClasses(); }, [fetchClasses]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  }, [fetchClasses]);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PURPLE]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          {showSearch ? (
            <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Cari kelas..."
                placeholderTextColor={colors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              <Pressable onPress={() => { triggerLight(); setShowSearch(false); setSearchQuery(''); }}>
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Kelas Saya</Text>
              <Pressable style={[styles.searchBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { triggerLight(); setShowSearch(true); }}>
                <Ionicons name="search-outline" size={24} color={colors.text} />
              </Pressable>
            </>
          )}
        </View>

        {/* Tab Pills */}
        <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
          <Pressable
            style={[styles.tab, activeTab === 'aktif' && [styles.tabActive, { backgroundColor: colors.card }]]}
            onPress={() => { triggerLight(); setActiveTab('aktif'); }}
          >
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'aktif' && [styles.tabTextActive, { color: PURPLE }]]}>Sedang Aktif</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'selesai' && [styles.tabActive, { backgroundColor: colors.card }]]}
            onPress={() => { triggerLight(); setActiveTab('selesai'); }}
          >
            <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'selesai' && [styles.tabTextActive, { color: PURPLE }]]}>Selesai</Text>
          </Pressable>
        </View>

        {/* Class List */}
        <View style={styles.classList}>
          {filteredClasses.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ color: colors.textSecondary }}>
                {classes.length === 0 ? 'Belum bergabung di kelas mana pun.' : 'Kelas tidak ditemukan'}
              </Text>
            </View>
          ) : filteredClasses.map((cls) => (
            <Pressable
              key={cls.id}
              style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { triggerLight(); navigation.navigate('SubjectModules', { classId: cls.id, className: cls.name }); }}
            >
              <View style={styles.classCardTop}>
                <View style={[styles.classIconBox, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.classEmoji}>{cls.icon || '📗'}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={[styles.className, { color: colors.text }]}>{cls.name}</Text>
                  <Text style={[styles.teacherName, { color: colors.textSecondary }]}>{cls.teacher?.name || 'Guru'}</Text>
                </View>
                <Text style={styles.progressPercent}>{cls.progress || 0}%</Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                <View style={[styles.progressBarFill, { width: `${cls.progress || 0}%` }]} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Join Class Button */}
        <Pressable
          style={[styles.joinBtn, { borderColor: colors.border }]}
          onPress={() => { triggerLight(); navigation.navigate('JoinClass'); }}
        >
          <View style={[styles.joinIconBox, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="add" size={30} color={PURPLE} />
          </View>
          <View>
            <Text style={[styles.joinTitle, { color: colors.text }]}>Gabung Kelas Baru</Text>
            <Text style={[styles.joinSub, { color: colors.textSecondary }]}>Masukkan kode kelas</Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 90 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  searchBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  searchInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 14, gap: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 16, color: '#1E293B' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 14, padding: 4, marginBottom: 25 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  tabTextActive: { color: PURPLE },
  classList: { gap: 16 },
  classCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 1 },
  classCardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  classIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  classEmoji: { fontSize: 24 },
  classInfo: { flex: 1 },
  className: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  teacherName: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  progressPercent: { fontSize: 14, fontWeight: 'bold', color: PURPLE },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4 },
  progressBarFill: { height: '100%', backgroundColor: PURPLE, borderRadius: 4 },
  joinBtn: { marginTop: 30, flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  joinIconBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  joinTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  joinSub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
});

export default ClassScreen;
