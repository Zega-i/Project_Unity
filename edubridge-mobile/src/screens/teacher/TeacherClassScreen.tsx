import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, FlatList, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

import { teacherAPI } from '../../services/api';
import PremiumModal from '../../components/PremiumModal';

const GREEN = '#16A34A';


const TeacherClassScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState('active');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    classId: string;
    className: string;
    type: 'archive' | 'unarchive';
  }>({
    visible: false,
    classId: '',
    className: '',
    type: 'archive',
  });

  const fetchClasses = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await teacherAPI.getMyClasses();
      if (res.success) {
        setClasses(res.data.map((c: any) => ({ ...c, archived: c.archived ?? false })));
      }
    } catch (error) {
      console.log('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(React.useCallback(() => { fetchClasses(); }, [fetchClasses]));

  const handleArchive = (id: string, name: string) => {
    triggerMedium();
    setConfirmModal({
      visible: true,
      classId: id,
      className: name,
      type: 'archive',
    });
  };

  const handleUnarchive = (id: string, name: string) => {
    triggerMedium();
    setConfirmModal({
      visible: true,
      classId: id,
      className: name,
      type: 'unarchive',
    });
  };

  const handleConfirmAction = async () => {
    const { classId, type } = confirmModal;
    setConfirmModal(prev => ({ ...prev, visible: false }));
    triggerLight();
    setLoading(true);
    try {
      const targetStatus = type === 'archive';
      const res = await teacherAPI.archiveClass(classId, targetStatus);
      if (res.success) {
        await fetchClasses();
      } else {
        Alert.alert('Gagal', `Gagal ${targetStatus ? 'mengarsipkan' : 'mengaktifkan'} kelas.`);
      }
    } catch (error) {
      console.log('Error archiving/unarchiving class:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  const renderClassItem = ({ item }: { item: any }) => (
    <Pressable 
      style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => { triggerLight(); navigation.navigate('TeacherClassDetail', { class: item }); }}
    >
      <View style={[styles.classIcon, { backgroundColor: GREEN + '15' }]}>
        <Ionicons name="library" size={24} color={GREEN} />
      </View>
      <View style={styles.classInfo}>
        <Text style={[styles.className, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.classSub, { color: colors.textSecondary }]}>
          {item._count?.students ?? 0} Siswa • Kelas {item.grade}
        </Text>
        <View style={styles.tokenBadge}>
          <Text style={styles.tokenText}>Token: {item.code}</Text>
        </View>
      </View>
      <Pressable 
        style={styles.archiveAction} 
        onPress={() => item.archived ? handleUnarchive(item.id, item.name) : handleArchive(item.id, item.name)}
      >
        <Ionicons 
          name={item.archived ? "arrow-undo-circle" : "archive-outline"} 
          size={24} 
          color={item.archived ? GREEN : colors.textSecondary} 
        />
      </Pressable>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Manajemen Kelas</Text>
        <Pressable style={styles.addBtn} onPress={() => { triggerLight(); navigation.navigate('TeacherAddClass'); }}>
          <Ionicons name="add-circle" size={32} color={GREEN} />
        </Pressable>
      </View>
 
      <View style={styles.tabBar}>
        <Pressable 
          style={[styles.tab, activeTab === 'active' && styles.activeTab]} 
          onPress={() => { triggerLight(); setActiveTab('active'); }}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Aktif</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'archived' && styles.activeTab]} 
          onPress={() => { triggerLight(); setActiveTab('archived'); }}
        >
          <Text style={[styles.tabText, activeTab === 'archived' && styles.activeTabText]}>Arsip</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Memuat kelas...</Text>
        </View>
      ) : (
        <FlatList
          data={classes.filter(c => activeTab === 'active' ? !c.archived : c.archived)}
          renderItem={renderClassItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={60} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tidak ada kelas di kategori ini</Text>
            </View>
          }
        />
      )}

      <PremiumModal
        visible={confirmModal.visible}
        type={confirmModal.type === 'archive' ? 'success' : 'success'}
        icon={confirmModal.type === 'archive' ? 'archive-outline' : 'arrow-undo-circle'}
        title={confirmModal.type === 'archive' ? 'Arsipkan Kelas' : 'Aktifkan Kelas'}
        message={
          confirmModal.type === 'archive'
            ? `Apakah Anda yakin ingin mengarsipkan kelas "${confirmModal.className}"? Siswa tidak akan bisa mengunggah atau melihat aktivitas baru.`
            : `Apakah Anda yakin ingin mengaktifkan kembali kelas "${confirmModal.className}"?`
        }
        confirmText={confirmModal.type === 'archive' ? 'Arsipkan' : 'Aktifkan'}
        cancelText="Batal"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
        minimal
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  addBtn: { padding: 4 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15 },
  tab: { marginRight: 25, paddingBottom: 8 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: GREEN },
  tabText: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
  activeTabText: { color: GREEN },
  listContainer: { padding: 20 },
  classCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 12 },
  classIcon: { width: 50, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  classInfo: { flex: 1 },
  className: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  classSub: { fontSize: 13, marginBottom: 8 },
  tokenBadge: { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tokenText: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  archiveAction: { padding: 8, marginRight: 4 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16 },
});

export default TeacherClassScreen;
