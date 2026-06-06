import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, Pressable,
  FlatList, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { classAPI } from '../../services/api';

const PURPLE = '#7C3AED';
const AMBER = '#F59E0B';

const formatDeadline = (dateStr: string) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const getDeadlineStatus = (dateStr: string) => {
  if (!dateStr) return { label: '-', color: '#94A3B8', urgent: false };
  const now = new Date();
  const deadline = new Date(dateStr);
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: 'Sudah lewat', color: '#EF4444', urgent: true };
  if (diffDays === 0) return { label: 'Hari ini!', color: '#EF4444', urgent: true };
  if (diffDays <= 3) return { label: `${diffDays} hari lagi`, color: AMBER, urgent: true };
  return { label: `${diffDays} hari lagi`, color: '#10B981', urgent: false };
};

const AssignmentsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const insets = useSafeAreaInsets();
  const sheetBottomPadding = Math.max(24, insets.bottom + 16);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const classRes = await classAPI.getMyClasses();
      const myClasses: any[] = classRes.data || [];
      const results = await Promise.all(
        myClasses.map((cls: any) =>
          classAPI.getClassAssignments(cls.id)
            .then((r: any) => (r.data || []).map((a: any) => ({ ...a, className: cls.name, classIcon: cls.icon })))
            .catch(() => [])
        )
      );
      const all = results.flat();
      // Sort: urgent first
      all.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      setAssignments(all);
    } catch {
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadAssignments(); }, [loadAssignments]));

  const renderItem = ({ item }: { item: any }) => {
    const status = getDeadlineStatus(item.deadline);
    return (
      <Pressable
        style={[styles.card, { backgroundColor: colors.card, borderColor: status.urgent ? status.color + '40' : colors.border }]}
        onPress={() => { triggerLight(); setSelectedAssignment(item); }}
      >
        {/* Left color strip */}
        <View style={[styles.colorStrip, { backgroundColor: status.urgent ? status.color : PURPLE }]} />

        <View style={[styles.iconBox, { backgroundColor: (status.urgent ? status.color : PURPLE) + '12' }]}>
          <Ionicons name="clipboard" size={22} color={status.urgent ? status.color : PURPLE} />
        </View>

        <View style={styles.info}>
          <View style={styles.cardTopRow}>
            <Text style={[styles.className, { color: status.urgent ? status.color : PURPLE }]}>
              {item.classIcon || '📗'} {item.className}
            </Text>
            <View style={[styles.urgencyBadge, { backgroundColor: status.color + '18' }]}>
              <Text style={[styles.urgencyText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {formatDeadline(item.deadline)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="star-outline" size={13} color={colors.textSecondary} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              {item.points || 100} Poin
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ alignSelf: 'center' }} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tugas Saya</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : (
        <FlatList
          data={assignments}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIconCircle, { backgroundColor: PURPLE + '10' }]}>
                <Ionicons name="clipboard-outline" size={56} color={PURPLE} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Belum Ada Tugas</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Tugas akan muncul di sini setelah guru menambahkannya di kelasmu.
              </Text>
            </View>
          }
        />
      )}

      {/* Assignment Detail Modal */}
      <Modal
        visible={!!selectedAssignment}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedAssignment(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedAssignment(null)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: sheetBottomPadding }]}>
            {selectedAssignment && <AssignmentDetailSheet assignment={selectedAssignment} colors={colors} onClose={() => setSelectedAssignment(null)} />}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const AssignmentDetailSheet = ({ assignment, colors, onClose }: { assignment: any; colors: any; onClose: () => void }) => {
  const status = getDeadlineStatus(assignment.deadline);
  return (
    <View style={{ width: '100%', flexShrink: 1 }}>
      {/* Handle */}
      <View style={styles.sheetHandle} />

      {/* Header */}
      <View style={styles.sheetHeader}>
        <View style={[styles.sheetIconBox, { backgroundColor: (status.urgent ? status.color : PURPLE) + '15' }]}>
          <Ionicons name="clipboard" size={28} color={status.urgent ? status.color : PURPLE} />
        </View>
        <Pressable style={styles.sheetClose} onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {/* Class badge */}
        <View style={[styles.classBadge, { backgroundColor: PURPLE + '12' }]}>
          <Text style={styles.classBadgeText}>{assignment.classIcon || '📗'} {assignment.className}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.sheetTitle, { color: colors.text }]}>{assignment.title}</Text>

        {/* Info cards */}
        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: status.color + '12', borderColor: status.color + '30' }]}>
            <Ionicons name="calendar-outline" size={18} color={status.color} />
            <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Deadline</Text>
            <Text style={[styles.infoCardValue, { color: status.color }]}>{status.label}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: PURPLE + '12', borderColor: PURPLE + '30' }]}>
            <Ionicons name="star" size={18} color={PURPLE} />
            <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Poin</Text>
            <Text style={[styles.infoCardValue, { color: PURPLE }]}>{assignment.points || 100}</Text>
          </View>
        </View>

        {/* Full deadline */}
        <View style={[styles.deadlineRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.deadlineText, { color: colors.text }]}>{formatDeadline(assignment.deadline)}</Text>
        </View>

        {/* Description */}
        {assignment.description ? (
          <View style={styles.descSection}>
            <Text style={[styles.descLabel, { color: colors.textSecondary }]}>Instruksi</Text>
            <Text style={[styles.descText, { color: colors.text }]}>{assignment.description}</Text>
          </View>
        ) : (
          <View style={styles.descSection}>
            <Text style={[styles.descLabel, { color: colors.textSecondary }]}>Instruksi</Text>
            <Text style={[styles.descText, { color: colors.textSecondary }]}>
              Kerjakan tugas ini sesuai petunjuk guru. Pastikan kamu mengumpulkan sebelum deadline.
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* CTA */}
      <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
        <Pressable style={[styles.closeBtn, { backgroundColor: PURPLE }]} onPress={onClose}>
          <Text style={styles.closeBtnText}>Mengerti</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  list: { padding: 16, paddingBottom: 40 },

  card: { flexDirection: 'row', alignItems: 'stretch', borderRadius: 18, borderWidth: 1, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  colorStrip: { width: 4 },
  iconBox: { width: 52, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  info: { flex: 1, paddingVertical: 14, paddingRight: 4 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  className: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.4 },
  urgencyBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  urgencyText: { fontSize: 10, fontWeight: 'bold' },
  title: { fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  metaText: { fontSize: 12 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 24, maxHeight: '85%', width: '100%', flexShrink: 1 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  sheetIconBox: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sheetClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  classBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 10 },
  classBadgeText: { fontSize: 12, fontWeight: 'bold', color: PURPLE },
  sheetTitle: { fontSize: 20, fontWeight: 'bold', lineHeight: 28, marginBottom: 16 },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  infoCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, alignItems: 'center', gap: 4 },
  infoCardLabel: { fontSize: 11 },
  infoCardValue: { fontSize: 15, fontWeight: 'bold' },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  deadlineText: { fontSize: 13, fontWeight: '600' },
  descSection: { marginBottom: 8 },
  descLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  descText: { fontSize: 14, lineHeight: 22 },
  sheetFooter: { borderTopWidth: 1, paddingTop: 16 },
  closeBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});

export default AssignmentsScreen;
