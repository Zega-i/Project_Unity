import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const PURPLE = '#7C3AED';

const MaterialDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { title } = route.params || { title: 'Detail Materi' };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color="#1E293B" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.contentTitle}>{title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.metaText}>10 Menit baca</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={14} color="#64748B" />
            <Text style={styles.metaText}>Aljabar</Text>
          </View>
        </View>

        <Text style={styles.paragraph}>
          Persamaan linear adalah sebuah persamaan aljabar, yang tiap sukunya mengandung konstanta, atau perkalian konstanta dengan variabel tunggal. Persamaan ini dikatakan linear karena hubungan matematis ini dapat digambarkan sebagai garis lurus dalam Sistem koordinat Kartesius.
        </Text>

        <View style={styles.illustrationPlaceholder}>
          <LinearGradient colors={['#F5F3FF', '#EDE9FE']} style={styles.illusBox}>
            <Ionicons name="image-outline" size={40} color={PURPLE} />
            <Text style={styles.illusText}>Ilustrasi Grafik Linear</Text>
          </LinearGradient>
        </View>

        <Text style={styles.paragraph}>
          Bentuk umum untuk persamaan linear satu variabel adalah:{"\n"}
          <Text style={styles.formula}>ax + b = c</Text>{"\n\n"}
          Dimana:{"\n"}
          • a dan b adalah konstanta{"\n"}
          • x adalah variabel{"\n"}
          • a ≠ 0
        </Text>

        <View style={styles.tipBox}>
          <Ionicons name="bulb" size={24} color="#F59E0B" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Tips Cepat</Text>
            <Text style={styles.tipText}>Untuk menyelesaikan ax + b = c, pindahkan b ke ruas kanan menjadi ax = c - b, lalu bagi dengan a.</Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Floating AI Button */}
      <Pressable 
        style={styles.floatingAI}
        onPress={() => navigation.navigate('AITutor')}
      >
        <LinearGradient colors={[PURPLE, '#5B21B6']} style={styles.aiCircle}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        </LinearGradient>
        <View style={styles.aiLabel}>
          <Text style={styles.aiLabelText}>Tanya AI</Text>
        </View>
      </Pressable>

      {/* Footer Action */}
      <View style={styles.footer}>
        <Pressable style={styles.finishBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.finishBtnText}>Selesai & Lanjut</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', flex: 1, marginHorizontal: 16, textAlign: 'center' },
  backBtn: { width: 40 },
  shareBtn: { width: 40, alignItems: 'flex-end' },
  scrollContent: { padding: 24 },
  contentTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#64748B' },
  paragraph: { fontSize: 16, lineHeight: 26, color: '#475569', marginBottom: 20 },
  formula: { fontWeight: 'bold', color: PURPLE, fontSize: 18 },
  illustrationPlaceholder: { width: '100%', height: 200, marginBottom: 24 },
  illusBox: { flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 10 },
  illusText: { fontSize: 14, color: PURPLE, fontWeight: '600' },
  tipBox: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, gap: 12, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400E', marginBottom: 4 },
  tipText: { fontSize: 13, color: '#B45309', lineHeight: 20 },
  bottomSpace: { height: 100 },
  floatingAI: { position: 'absolute', right: 24, bottom: 100, alignItems: 'center' },
  aiCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  aiLabel: { backgroundColor: '#1E293B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 6 },
  aiLabelText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  footer: { padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  finishBtn: { backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  finishBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default MaterialDetailScreen;
