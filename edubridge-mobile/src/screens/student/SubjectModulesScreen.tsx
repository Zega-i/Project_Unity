import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

const PURPLE = '#7C3AED';

const MODULES: any[] = [];

const SubjectModulesScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Matematika - Aljabar</Text>
      </View>

      <View style={styles.emptyState}>
        <Ionicons name="book-outline" size={52} color="#CBD5E1" />
        <Text style={styles.emptyTitle}>Belum Ada Materi</Text>
        <Text style={styles.emptyDesc}>Materi akan muncul setelah guru menambahkannya ke kelasmu.</Text>
      </View>
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
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  emptyDesc:  { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },
});

export default SubjectModulesScreen;
