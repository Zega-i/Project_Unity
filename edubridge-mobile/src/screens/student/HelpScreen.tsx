import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, StatusBar, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

const FAQ_DATA = [
  {
    category: 'Kelas',
    icon: 'people-outline',
    color: '#8B5CF6',
    items: [
      {
        q: 'Bagaimana cara bergabung ke kelas?',
        a: 'Pergi ke tab "Kelas" lalu klik tombol "Gabung Kelas Baru" di bagian bawah. Masukkan kode kelas yang diberikan gurumu dan tekan "Gabung ke Kelas".',
      },
      {
        q: 'Di mana saya bisa menemukan kode kelas?',
        a: 'Kode kelas diberikan langsung oleh gurumu. Hubungi guru atau lihat pengumuman di grup kelas kamu.',
      },
      {
        q: 'Berapa banyak kelas yang bisa saya ikuti?',
        a: 'Kamu dapat mengikuti beberapa kelas sekaligus tanpa batasan. Semua kelas aktif akan muncul di tab "Kelas".',
      },
    ],
  },
  {
    category: 'AI Tutor',
    icon: 'chatbubble-ellipses-outline',
    color: '#10B981',
    items: [
      {
        q: 'Apa itu AI Tutor?',
        a: 'AI Tutor adalah asisten belajar berbasis kecerdasan buatan yang siap membantu menjawab pertanyaan pelajaran kapan saja dan di mana saja.',
      },
      {
        q: 'Pelajaran apa saja yang bisa ditanyakan ke AI Tutor?',
        a: 'AI Tutor dapat membantu hampir semua mata pelajaran seperti Matematika, Fisika, Biologi, Bahasa Inggris, Sejarah, dan lainnya.',
      },
      {
        q: 'Apakah percakapan dengan AI Tutor tersimpan?',
        a: 'Ya, riwayat percakapan tersimpan selama sesi aktif. Untuk menjaga privasi, riwayat dihapus saat kamu logout.',
      },
    ],
  },
  {
    category: 'Kuis',
    icon: 'extension-puzzle-outline',
    color: '#F59E0B',
    items: [
      {
        q: 'Bagaimana cara mengerjakan kuis?',
        a: 'Buka menu "Kuis" dari beranda, pilih mata pelajaran yang ingin kamu uji, lalu jawab setiap soal yang muncul sebelum waktu habis.',
      },
      {
        q: 'Berapa banyak soal dalam setiap kuis?',
        a: 'Setiap kuis terdiri dari 10 soal pilihan ganda dengan waktu pengerjaan 10 menit.',
      },
      {
        q: 'Apakah nilai kuis tersimpan?',
        a: 'Ya, semua hasil kuis tersimpan dan dapat dilihat di halaman "Progress Belajar" untuk memantau perkembanganmu.',
      },
    ],
  },
  {
    category: 'Akun',
    icon: 'person-circle-outline',
    color: '#3B82F6',
    items: [
      {
        q: 'Bagaimana cara mengganti foto profil?',
        a: 'Buka tab "Profil" lalu tekan foto profilmu. Pilih "Ambil Foto" atau "Pilih dari Galeri" untuk menggantinya.',
      },
      {
        q: 'Bagaimana cara mengganti kata sandi?',
        a: 'Pergi ke "Profil" → "Pengaturan" → "Ganti Kata Sandi". Masukkan kata sandi lama dan kata sandi baru kamu.',
      },
    ],
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();
  const { triggerLight } = useHapticFeedback();

  return (
    <Pressable
      style={[styles.faqItem, { borderColor: colors.border }]}
      onPress={() => { triggerLight(); setExpanded(!expanded); }}
    >
      <View style={styles.faqQuestion}>
        <Text style={[styles.faqQuestionText, { color: colors.text }]}>{q}</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </View>
      {expanded && (
        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{a}</Text>
      )}
    </Pressable>
  );
};

const HelpScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight } = useHapticFeedback();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => { triggerLight(); navigation.goBack(); }} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bantuan</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={[styles.heroBanner, { backgroundColor: PURPLE + '15' }]}>
          <View style={styles.heroIconBox}>
            <Ionicons name="help-circle" size={36} color={PURPLE} />
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.heroTitle, { color: colors.text }]}>Pusat Bantuan</Text>
            <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
              Temukan jawaban atas pertanyaan umum seputar EduBridge
            </Text>
          </View>
        </View>

        {/* Search Hint */}
        <View style={[styles.searchHint, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.searchHintText, { color: colors.textSecondary }]}>Cari topik pertanyaan di bawah ini...</Text>
        </View>

        {/* FAQ Sections */}
        {FAQ_DATA.map((section) => (
          <View key={section.category} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBox, { backgroundColor: section.color + '15' }]}>
                <Ionicons name={section.icon as any} size={20} color={section.color} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.category}</Text>
            </View>

            <View style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, idx) => (
                <FAQItem key={idx} q={item.q} a={item.a} />
              ))}
            </View>
          </View>
        ))}

        {/* Contact Support */}
        <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="mail-outline" size={24} color={PURPLE} />
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Masih butuh bantuan?</Text>
            <Text style={[styles.contactSub, { color: colors.textSecondary }]}>
              Hubungi tim dukungan kami
            </Text>
          </View>
          <Pressable
            style={styles.contactBtn}
            onPress={() => { triggerLight(); Linking.openURL('mailto:support@edubridge.id'); }}
          >
            <Text style={styles.contactBtnText}>Kirim Email</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 50 },

  heroBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 20, marginBottom: 20, gap: 16 },
  heroIconBox: { width: 64, height: 64, borderRadius: 20, backgroundColor: PURPLE + '20', alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  heroSub: { fontSize: 13, lineHeight: 18 },

  searchHint: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1, marginBottom: 24 },
  searchHintText: { fontSize: 14 },

  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold' },
  faqCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },

  faqItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestionText: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20, marginRight: 8 },
  faqAnswer: { fontSize: 13, lineHeight: 20, marginTop: 10 },

  contactCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 20, borderWidth: 1, gap: 14, marginTop: 8 },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  contactSub: { fontSize: 12 },
  contactBtn: { backgroundColor: PURPLE, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  contactBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});

export default HelpScreen;
