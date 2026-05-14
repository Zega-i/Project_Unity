import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, TextInput, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const GREEN = '#16A34A';

const MOCK_CLASSES = [
  { id: '1', name: 'Matematika 10A', students: 32, schedule: 'Senin, 08:00', code: 'MTK10A' },
  { id: '2', name: 'Fisika 11B',     students: 28, schedule: 'Selasa, 10:00', code: 'FSK11B' },
  { id: '3', name: 'Matematika 12C', students: 30, schedule: 'Rabu, 08:00', code: 'MTK12C' },
];

const TeacherClassScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<'mine' | 'create'>('mine');

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Manajemen Kelas</Text>
      </View>

      <View style={[styles.segmentContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable 
          style={[styles.segmentBtn, activeTab === 'mine' && { backgroundColor: GREEN }]} 
          onPress={() => { triggerLight(); setActiveTab('mine'); }}
        >
          <Text style={[styles.segmentText, activeTab === 'mine' ? { color: '#FFF' } : { color: colors.textSecondary }]}>Kelas Saya</Text>
        </Pressable>
        <Pressable 
          style={[styles.segmentBtn, activeTab === 'create' && { backgroundColor: GREEN }]} 
          onPress={() => { triggerLight(); setActiveTab('create'); }}
        >
          <Text style={[styles.segmentText, activeTab === 'create' ? { color: '#FFF' } : { color: colors.textSecondary }]}>Buat Kelas</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'mine' ? (
          MOCK_CLASSES.map((c) => (
            <Pressable 
              key={c.id} 
              style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { triggerLight(); navigation.navigate('TeacherClassDetail', { className: c.name }); }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBg}><Ionicons name="book" size={20} color={GREEN} /></View>
                <View style={styles.headerInfo}>
                  <Text style={[styles.className, { color: colors.text }]}>{c.name}</Text>
                  <Text style={[styles.classCode, { color: colors.textSecondary }]}>Kode: {c.code}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </View>
              <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
              <View style={styles.cardFooter}>
                <View style={styles.footerItem}><Ionicons name="people-outline" size={14} color="#666" /><Text style={styles.footerText}>{c.students} Siswa</Text></View>
                <View style={styles.footerItem}><Ionicons name="time-outline" size={14} color="#666" /><Text style={styles.footerText}>{c.schedule}</Text></View>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={[styles.formContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.text }]}>Nama Kelas</Text>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} placeholder="Contoh: Matematika 10A" placeholderTextColor="#999" />
            
            <Text style={[styles.formLabel, { color: colors.text }]}>Mata Pelajaran</Text>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} placeholder="Contoh: Matematika" placeholderTextColor="#999" />
            
            <Text style={[styles.formLabel, { color: colors.text }]}>Tahun Ajaran</Text>
            <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text }]} placeholder="Contoh: 2023/2024" placeholderTextColor="#999" />
            
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: GREEN }]} onPress={() => triggerLight()}>
              <Text style={styles.submitText}>Buat Kelas Sekarang</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 15 },
  title: { fontSize: 24, fontWeight: 'bold' },
  segmentContainer: { flexDirection: 'row', marginHorizontal: 20, padding: 4, borderRadius: 12, borderWidth: 1, marginBottom: 20 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: 'bold' },
  scroll: { paddingHorizontal: 20, paddingBottom: 100 },
  classCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, marginLeft: 12 },
  className: { fontSize: 16, fontWeight: 'bold' },
  classCode: { fontSize: 12, marginTop: 2 },
  cardDivider: { height: 1, marginVertical: 14 },
  cardFooter: { flexDirection: 'row', gap: 20 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: '#666' },
  formContainer: { padding: 20, borderRadius: 20, borderWidth: 1 },
  formLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 16, fontSize: 14 },
  submitBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default TeacherClassScreen;
