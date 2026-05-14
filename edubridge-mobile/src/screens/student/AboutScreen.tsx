import React from 'react';
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
const APP_VERSION = '1.0.0';

const TEAM_MEMBERS = [
  { name: 'Ross Agustian', role: 'Lead Developer & UI/UX', icon: '👨‍💻' },
  { name: 'Tim EduBridge', role: 'Backend & AI Integration', icon: '🛠️' },
];

const FEATURES = [
  { icon: 'people-outline', label: 'Kelas Virtual', desc: 'Bergabung ke kelas dengan kode unik dari guru', color: '#8B5CF6' },
  { icon: 'chatbubble-ellipses-outline', label: 'AI Tutor', desc: 'Tanya pelajaran apa saja, kapan saja', color: '#10B981' },
  { icon: 'extension-puzzle-outline', label: 'Kuis Interaktif', desc: 'Uji pemahaman dengan soal pilihan ganda', color: '#F59E0B' },
  { icon: 'trending-up-outline', label: 'Progres Belajar', desc: 'Pantau perkembangan belajar secara visual', color: '#3B82F6' },
];

const AboutScreen = () => {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tentang Aplikasi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* App Identity */}
        <View style={styles.appIdentity}>
          <View style={styles.appLogoBox}>
            <Text style={styles.appLogoText}>🎓</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>EduBridge</Text>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
            Jembatan Menuju Prestasi Akademik
          </Text>
          <View style={[styles.versionBadge, { backgroundColor: PURPLE + '15' }]}>
            <Text style={styles.versionText}>Versi {APP_VERSION}</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={[styles.missionCard, { backgroundColor: PURPLE, }]}>
          <Ionicons name="flag" size={20} color="rgba(255,255,255,0.8)" />
          <View style={styles.missionText}>
            <Text style={styles.missionTitle}>Misi Kami</Text>
            <Text style={styles.missionDesc}>
              Menghadirkan pengalaman belajar yang adaptif, personal, dan menyenangkan bagi setiap siswa Indonesia melalui teknologi AI.
            </Text>
          </View>
        </View>

        {/* Competition Info */}
        <View style={[styles.competitionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="trophy-outline" size={22} color="#F59E0B" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.compTitle, { color: colors.text }]}>UNITY Competition #14</Text>
            <Text style={[styles.compDesc, { color: colors.textSecondary }]}>
              EduBridge dikembangkan sebagai proyek inovatif pada ajang UNITY Competition ke-14, kategori Aplikasi Edukatif Berbasis AI.
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Fitur Unggulan</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((feat, idx) => (
            <View key={idx} style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.featureIconBox, { backgroundColor: feat.color + '15' }]}>
                <Ionicons name={feat.icon as any} size={22} color={feat.color} />
              </View>
              <Text style={[styles.featureLabel, { color: colors.text }]}>{feat.label}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feat.desc}</Text>
            </View>
          ))}
        </View>

        {/* Team Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tim Pengembang</Text>
        <View style={[styles.teamCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {TEAM_MEMBERS.map((member, idx) => (
            <View
              key={idx}
              style={[styles.teamMember, idx < TEAM_MEMBERS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            >
              <Text style={styles.memberIcon}>{member.icon}</Text>
              <View>
                <Text style={[styles.memberName, { color: colors.text }]}>{member.name}</Text>
                <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tech Stack */}
        <View style={[styles.techCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.techTitle, { color: colors.text }]}>Dibangun dengan</Text>
          <View style={styles.techRow}>
            {['React Native', 'Expo', 'Node.js', 'AI API'].map((tech) => (
              <View key={tech} style={[styles.techBadge, { backgroundColor: PURPLE + '15' }]}>
                <Text style={styles.techBadgeText}>{tech}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Legal */}
        <View style={styles.legalRow}>
          <Pressable onPress={() => { triggerLight(); }}>
            <Text style={[styles.legalLink, { color: PURPLE }]}>Kebijakan Privasi</Text>
          </Pressable>
          <Text style={[styles.legalDot, { color: colors.textSecondary }]}>•</Text>
          <Pressable onPress={() => { triggerLight(); }}>
            <Text style={[styles.legalLink, { color: PURPLE }]}>Syarat & Ketentuan</Text>
          </Pressable>
        </View>

        <Text style={[styles.copyright, { color: colors.textSecondary }]}>
          © 2025 EduBridge. Semua hak dilindungi.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 24, paddingBottom: 50 },

  appIdentity: { alignItems: 'center', marginBottom: 28 },
  appLogoBox: { width: 90, height: 90, borderRadius: 28, backgroundColor: PURPLE + '15', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appLogoText: { fontSize: 44 },
  appName: { fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  appTagline: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 12 },
  versionBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  versionText: { fontSize: 12, fontWeight: '700', color: PURPLE },

  missionCard: { borderRadius: 20, padding: 20, marginBottom: 16, flexDirection: 'row', gap: 14 },
  missionText: { flex: 1 },
  missionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  missionDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 20 },

  competitionCard: { flexDirection: 'row', alignItems: 'flex-start', borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 28 },
  compTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  compDesc: { fontSize: 13, lineHeight: 19 },

  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 14 },
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  featureCard: { width: '47%', borderRadius: 16, padding: 16, borderWidth: 1 },
  featureIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  featureLabel: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  featureDesc: { fontSize: 11, lineHeight: 16 },

  teamCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 28 },
  teamMember: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  memberIcon: { fontSize: 28 },
  memberName: { fontSize: 15, fontWeight: '700' },
  memberRole: { fontSize: 12, marginTop: 2 },

  techCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 28 },
  techTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  techBadgeText: { fontSize: 12, fontWeight: '600', color: PURPLE },

  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 12 },
  legalLink: { fontSize: 13, fontWeight: '600' },
  legalDot: { fontSize: 13 },
  copyright: { textAlign: 'center', fontSize: 12 },
});

export default AboutScreen;
