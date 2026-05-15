import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { aiAPI } from '../../services/api';
import { authStore } from '../../store/authStore';
import PremiumModal from '../../components/PremiumModal';

const PURPLE = '#7C3AED';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
}

interface Question {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  correct: string;
}

const SUBJECTS: Subject[] = [
  { id: 'math',     name: 'Matematika',     icon: '📐', color: '#6366F1', desc: 'Aljabar, Geometri, Kalkulus' },
  { id: 'physics',  name: 'Fisika',         icon: '⚡', color: '#F59E0B', desc: 'Mekanika, Termodinamika' },
  { id: 'biology',  name: 'Biologi',        icon: '🧬', color: '#10B981', desc: 'Sel, Ekosistem, Genetika' },
  { id: 'english',  name: 'Bahasa Inggris', icon: '📚', color: '#3B82F6', desc: 'Grammar, Reading, Vocabulary' },
  { id: 'history',  name: 'Sejarah',        icon: '📜', color: '#EF4444', desc: 'Sejarah Indonesia & Dunia' },
  { id: 'chemistry',name: 'Kimia',          icon: '⚗️', color: '#8B5CF6', desc: 'Unsur, Reaksi, Stoikiometri' },
];

const QUIZ_TIME = 600;

const parseQuestions = (raw: any[]): Question[] =>
  raw.map((q: any, i: number) => ({
    id: String(q.id ?? i + 1),
    question: q.question || q.text || '',
    options: Array.isArray(q.options)
      ? q.options.map((o: any, j: number) => ({
          id: typeof o === 'string' ? String.fromCharCode(65 + j) : (o.id || String.fromCharCode(65 + j)),
          label: typeof o === 'string' ? o : (o.label || o.text || ''),
        }))
      : [],
    correct: q.correct || q.answer || q.correctAnswer || 'A',
  }));

const QuizScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<any[]>([]);
  const [analyzingErrors, setAnalyzingErrors] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ visible: boolean; text: string }>({ visible: false, text: '' });

  useEffect(() => {
    if (!selectedSubject || quizFinished || questionsLoading || questions.length === 0) return;
    if (timeLeft === 0) { handleFinish(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [selectedSubject, timeLeft, quizFinished, questionsLoading, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchQuestions = async (subject: Subject) => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    setQuestions([]);
    try {
      const res = await aiAPI.generateQuiz(subject.name, 5);
      const raw: any[] = res?.data?.questions || res?.questions || [];
      const parsed = parseQuestions(raw);
      if (parsed.length === 0) throw new Error('empty');
      setQuestions(parsed);
    } catch {
      setQuestionsError('Gagal memuat soal. Periksa koneksi internetmu.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleSelectSubject = (subject: Subject) => {
    triggerMedium();
    setSelectedSubject(subject);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers({});
    setTimeLeft(QUIZ_TIME);
    setQuizFinished(false);
    setScore(0);
    fetchQuestions(subject);
  };

  const handleNext = () => {
    if (!selectedOption) return;
    triggerLight();
    const newAnswers = { ...answers, [questions[currentIndex].id]: selectedOption };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(newAnswers[questions[currentIndex + 1]?.id] || null);
    } else {
      handleFinish(newAnswers);
    }
  };

  const handleFinish = (finalAnswers?: Record<string, string>) => {
    const ans = finalAnswers || answers;
    let correct = 0;
    const wrongs: any[] = [];
    
    questions.forEach(q => {
      if (ans[q.id] === q.correct) {
        correct++;
      } else {
        wrongs.push({
          question: q.question,
          userAnswer: ans[q.id],
          correctAnswer: q.correct,
          options: q.options
        });
      }
    });
    
    setScore(correct);
    setWrongAnswers(wrongs);
    setQuizFinished(true);
  };

  const handleAnalyzeErrors = async () => {
    if (wrongAnswers.length === 0) {
      Alert.alert('EduBridge AI', 'Luar biasa! Kamu menjawab semua dengan benar. Tidak ada kesalahan untuk dianalisis.');
      return;
    }

    setAnalyzingErrors(true);
    triggerMedium();

    try {
      const res = await aiAPI.analyzeErrors(wrongAnswers);
      if (res.success) {
        setAiAnalysis({ visible: true, text: res.data.analysis });
      }
    } catch (error) {
      Alert.alert('Error', 'Gagal mendapatkan analisis AI.');
    } finally {
      setAnalyzingErrors(false);
    }
  };

  const handleBack = () => {
    if (selectedSubject && !quizFinished && !questionsLoading) {
      Alert.alert(
        'Keluar Kuis?',
        'Progres kuis akan hilang. Yakin ingin keluar?',
        [
          { text: 'Lanjutkan', style: 'cancel' },
          { text: 'Keluar', style: 'destructive', onPress: () => { setSelectedSubject(null); triggerMedium(); } },
        ]
      );
    } else if (quizFinished || questionsLoading || questionsError) {
      setSelectedSubject(null);
      setQuizFinished(false);
      setQuestionsError(null);
    } else {
      navigation.goBack();
    }
  };

  // --- Result Screen ---
  if (quizFinished && selectedSubject) {
    const percentage = Math.round((score / questions.length) * 100);
    const isPassed = percentage >= 60;
    return (
      <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.resultEmoji}>{isPassed ? '🎉' : '📚'}</Text>
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              {isPassed ? 'Selamat!' : 'Terus Semangat!'}
            </Text>
            <Text style={[styles.resultSubject, { color: colors.textSecondary }]}>{selectedSubject.name}</Text>

            <View style={[styles.scoreCircle, { borderColor: isPassed ? '#10B981' : '#F59E0B' }]}>
              <Text style={[styles.scoreNumber, { color: isPassed ? '#10B981' : '#F59E0B' }]}>{percentage}%</Text>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Nilai</Text>
            </View>

            <View style={styles.resultStats}>
              <View style={[styles.resultStat, { backgroundColor: '#10B981' + '15' }]}>
                <Text style={[styles.resultStatNum, { color: '#10B981' }]}>{score}</Text>
                <Text style={[styles.resultStatLabel, { color: colors.textSecondary }]}>Benar</Text>
              </View>
              <View style={[styles.resultStat, { backgroundColor: '#EF4444' + '15' }]}>
                <Text style={[styles.resultStatNum, { color: '#EF4444' }]}>{questions.length - score}</Text>
                <Text style={[styles.resultStatLabel, { color: colors.textSecondary }]}>Salah</Text>
              </View>
              <View style={[styles.resultStat, { backgroundColor: PURPLE + '15' }]}>
                <Text style={[styles.resultStatNum, { color: PURPLE }]}>{questions.length}</Text>
                <Text style={[styles.resultStatLabel, { color: colors.textSecondary }]}>Total</Text>
              </View>
            </View>

            <Pressable style={styles.retryBtn} onPress={() => handleSelectSubject(selectedSubject)}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </Pressable>
            
            {wrongAnswers.length > 0 && (
              <Pressable 
                style={[styles.aiBtn, { backgroundColor: PURPLE + '10', borderColor: PURPLE }]} 
                onPress={handleAnalyzeErrors}
                disabled={analyzingErrors}
              >
                {analyzingErrors ? (
                  <ActivityIndicator size="small" color={PURPLE} />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={18} color={PURPLE} />
                    <Text style={[styles.aiBtnText, { color: PURPLE }]}>Analisis Kesalahan (AI)</Text>
                  </>
                )}
              </Pressable>
            )}

            <Pressable style={[styles.homeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { setSelectedSubject(null); setQuizFinished(false); }}>
              <Text style={[styles.homeBtnText, { color: colors.text }]}>Pilih Materi Lain</Text>
            </Pressable>
          </View>
        </ScrollView>

        <PremiumModal
          visible={aiAnalysis.visible}
          type="info"
          icon="bulb"
          title="Analisis Kelemahanmu"
          message={aiAnalysis.text}
          confirmText="Siap Belajar Lagi!"
          onConfirm={() => setAiAnalysis({ ...aiAnalysis, visible: false })}
        />
      </SafeAreaView>
    );
  }

  // --- Questions Loading Screen ---
  if (selectedSubject && questionsLoading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={[styles.topNav, { borderBottomColor: colors.border }]}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.topNavCenter}>
            <Text style={[styles.subjectLabel, { color: colors.textSecondary }]}>{selectedSubject.icon} {selectedSubject.name}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={[styles.centerStateText, { color: colors.textSecondary }]}>Menyiapkan soal kuis…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Questions Error Screen ---
  if (selectedSubject && questionsError) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={[styles.topNav, { borderBottomColor: colors.border }]}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.topNavCenter}>
            <Text style={[styles.subjectLabel, { color: colors.textSecondary }]}>{selectedSubject.icon} {selectedSubject.name}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerState}>
          <Ionicons name="wifi-outline" size={48} color={PURPLE + '60'} />
          <Text style={[styles.centerStateTitle, { color: colors.text }]}>Gagal Memuat Soal</Text>
          <Text style={[styles.centerStateText, { color: colors.textSecondary }]}>{questionsError}</Text>
          <Pressable style={styles.retryBtn} onPress={() => fetchQuestions(selectedSubject)}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryBtnText}>Coba Lagi</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- Quiz Screen ---
  if (selectedSubject && questions.length > 0) {
    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    const isLowTime = timeLeft < 60;

    return (
      <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

        {/* Top Nav */}
        <View style={[styles.topNav, { borderBottomColor: colors.border }]}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.topNavCenter}>
            <Text style={[styles.subjectLabel, { color: colors.textSecondary }]}>{selectedSubject.icon} {selectedSubject.name}</Text>
          </View>
          <View style={[styles.timerBox, { backgroundColor: isLowTime ? '#EF4444' + '20' : PURPLE + '15' }]}>
            <Ionicons name="time-outline" size={16} color={isLowTime ? '#EF4444' : PURPLE} />
            <Text style={[styles.timerText, { color: isLowTime ? '#EF4444' : PURPLE }]}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={[styles.questionCounter, { color: colors.textSecondary }]}>
              Soal {currentIndex + 1} dari {questions.length}
            </Text>
            <Text style={[styles.progressPct, { color: PURPLE }]}>{Math.round(progress)}%</Text>
          </View>
          <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.quizContent}>
          <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.optionCard,
                    { backgroundColor: isSelected ? PURPLE + '12' : colors.card, borderColor: isSelected ? PURPLE : colors.border },
                  ]}
                  onPress={() => { triggerLight(); setSelectedOption(opt.id); }}
                >
                  <View style={[styles.optionLabel, { backgroundColor: isSelected ? PURPLE : colors.surface }]}>
                    <Text style={[styles.optionLabelText, { color: isSelected ? '#fff' : colors.textSecondary }]}>{opt.id}</Text>
                  </View>
                  <Text style={[styles.optionText, { color: isSelected ? PURPLE : colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <Pressable
            style={[styles.nextBtn, !selectedOption && { backgroundColor: colors.disabled || '#E2E8F0', elevation: 0, shadowOpacity: 0 }]}
            disabled={!selectedOption}
            onPress={handleNext}
          >
            <Text style={[styles.nextBtnText, !selectedOption && { color: colors.textSecondary }]}>
              {currentIndex === questions.length - 1 ? 'Selesai' : 'Selanjutnya'}
            </Text>
            <Ionicons
              name={currentIndex === questions.length - 1 ? 'checkmark-circle' : 'arrow-forward'}
              size={18}
              color={selectedOption ? '#fff' : (colors.textSecondary)}
            />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // --- Subject Selection Screen ---
  const currentUser = authStore.getUserSync();
  const hasClass = !!currentUser?.className;

  if (!hasClass) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={() => { triggerLight(); navigation.goBack(); }} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Kuis</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerState}>
          <Ionicons name="lock-closed-outline" size={56} color={PURPLE + '50'} />
          <Text style={[styles.centerStateTitle, { color: colors.text }]}>Kuis Belum Tersedia</Text>
          <Text style={[styles.centerStateText, { color: colors.textSecondary }]}>
            Masuk ke kelas terlebih dahulu untuk mengakses kuis
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => { triggerLight(); navigation.goBack(); }} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kuis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: PURPLE + '12' }]}>
          <View style={styles.infoBannerIcon}>
            <Ionicons name="extension-puzzle" size={28} color={PURPLE} />
          </View>
          <View style={styles.infoBannerText}>
            <Text style={[styles.infoBannerTitle, { color: colors.text }]}>Uji Kemampuanmu!</Text>
            <Text style={[styles.infoBannerDesc, { color: colors.textSecondary }]}>
              Pilih mata pelajaran dan jawab 5 soal dalam 10 menit
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { icon: 'help-circle-outline', val: '5', label: 'Soal', color: PURPLE },
            { icon: 'time-outline', val: '10 Min', label: 'Waktu', color: '#F59E0B' },
            { icon: 'trophy-outline', val: '60%', label: 'Min Lulus', color: '#10B981' },
          ].map((s, idx) => (
            <View key={idx} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={s.icon as any} size={18} color={s.color} />
              <Text style={[styles.statVal, { color: colors.text }]}>{s.val}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Subject Grid */}
        <Text style={[styles.chooseTitle, { color: colors.text }]}>Pilih Mata Pelajaran</Text>
        <View style={styles.subjectGrid}>
          {SUBJECTS.map((subj) => (
            <Pressable
              key={subj.id}
              style={[styles.subjectCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSelectSubject(subj)}
            >
              <View style={[styles.subjectIconBox, { backgroundColor: subj.color + '15' }]}>
                <Text style={styles.subjectIcon}>{subj.icon}</Text>
              </View>
              <Text style={[styles.subjectName, { color: colors.text }]}>{subj.name}</Text>
              <Text style={[styles.subjectDesc, { color: colors.textSecondary }]}>{subj.desc}</Text>
              <View style={[styles.subjectQuizBadge, { backgroundColor: subj.color + '15' }]}>
                <Text style={[styles.subjectQuizText, { color: subj.color }]}>5 Soal</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Subject Selection
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 50 },

  infoBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 20, marginBottom: 20, gap: 14 },
  infoBannerIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: PURPLE + '20', alignItems: 'center', justifyContent: 'center' },
  infoBannerTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  infoBannerText: { flex: 1 },
  infoBannerDesc: { fontSize: 13, lineHeight: 18 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 1, gap: 4 },
  statVal: { fontSize: 15, fontWeight: 'bold' },
  statLabel: { fontSize: 10 },

  chooseTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 14 },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  subjectCard: { width: '47%', borderRadius: 18, padding: 16, borderWidth: 1 },
  subjectIconBox: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  subjectIcon: { fontSize: 24 },
  subjectName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  subjectDesc: { fontSize: 11, lineHeight: 16, marginBottom: 12 },
  subjectQuizBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  subjectQuizText: { fontSize: 11, fontWeight: '700' },

  // Loading / Error
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 14 },
  centerStateTitle: { fontSize: 18, fontWeight: 'bold' },
  centerStateText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // Quiz Screen
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  topNavCenter: { flex: 1, alignItems: 'center' },
  subjectLabel: { fontSize: 14, fontWeight: '600' },
  timerBox: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  timerText: { fontSize: 14, fontWeight: 'bold' },

  progressSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  questionCounter: { fontSize: 13, fontWeight: '600' },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PURPLE, borderRadius: 3 },

  quizContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  questionText: { fontSize: 18, fontWeight: '700', lineHeight: 28, marginBottom: 32 },
  optionsContainer: { gap: 12 },
  optionCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1.5 },
  optionLabel: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  optionLabelText: { fontSize: 14, fontWeight: 'bold' },
  optionText: { fontSize: 15, flex: 1 },

  footer: { padding: 20, borderTopWidth: 1 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PURPLE, borderRadius: 16, paddingVertical: 16, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Result Screen
  resultContent: { padding: 24, paddingBottom: 50 },
  resultCard: { borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1 },
  resultEmoji: { fontSize: 56, marginBottom: 12 },
  resultTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  resultSubject: { fontSize: 14, marginBottom: 24 },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  scoreNumber: { fontSize: 26, fontWeight: 'bold' },
  scoreLabel: { fontSize: 11 },
  resultStats: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  resultStat: { flex: 1, alignItems: 'center', borderRadius: 14, paddingVertical: 14 },
  resultStatNum: { fontSize: 22, fontWeight: 'bold' },
  resultStatLabel: { fontSize: 11, marginTop: 2 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12, width: '100%', justifyContent: 'center' },
  retryBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  homeBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, borderWidth: 1, width: '100%', alignItems: 'center' },
  homeBtnText: { fontSize: 15, fontWeight: '600' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12, width: '100%', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed' },
  aiBtnText: { fontSize: 15, fontWeight: 'bold' },
});

export default QuizScreen;
