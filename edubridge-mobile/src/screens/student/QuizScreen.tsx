import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

const PURPLE = '#7C3AED';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  totalQuestions: number;
}

interface Question {
  id: string;
  question: string;
  options: { id: string; label: string }[];
  correct: string;
}

const SUBJECTS: Subject[] = [
  { id: 'math', name: 'Matematika', icon: '📐', color: '#6366F1', desc: 'Aljabar, Geometri, Kalkulus', totalQuestions: 10 },
  { id: 'physics', name: 'Fisika', icon: '⚡', color: '#F59E0B', desc: 'Mekanika, Termodinamika', totalQuestions: 10 },
  { id: 'biology', name: 'Biologi', icon: '🧬', color: '#10B981', desc: 'Sel, Ekosistem, Genetika', totalQuestions: 10 },
  { id: 'english', name: 'Bahasa Inggris', icon: '📚', color: '#3B82F6', desc: 'Grammar, Reading, Vocabulary', totalQuestions: 10 },
  { id: 'history', name: 'Sejarah', icon: '📜', color: '#EF4444', desc: 'Sejarah Indonesia & Dunia', totalQuestions: 10 },
  { id: 'chemistry', name: 'Kimia', icon: '⚗️', color: '#8B5CF6', desc: 'Unsur, Reaksi, Stoikiometri', totalQuestions: 10 },
];

const QUESTIONS_BY_SUBJECT: Record<string, Question[]> = {
  math: [
    { id: '1', question: 'Jika 2x + 5 = 15, maka nilai dari 3x - 2 adalah...', options: [{ id: 'A', label: '13' }, { id: 'B', label: '17' }, { id: 'C', label: '18' }, { id: 'D', label: '19' }, { id: 'E', label: '20' }], correct: 'A' },
    { id: '2', question: 'Hasil dari 3² + 4² adalah...', options: [{ id: 'A', label: '7' }, { id: 'B', label: '14' }, { id: 'C', label: '25' }, { id: 'D', label: '49' }, { id: 'E', label: '50' }], correct: 'C' },
    { id: '3', question: 'Luas lingkaran dengan jari-jari 7 cm adalah... (π = 22/7)', options: [{ id: 'A', label: '44 cm²' }, { id: 'B', label: '88 cm²' }, { id: 'C', label: '154 cm²' }, { id: 'D', label: '176 cm²' }, { id: 'E', label: '308 cm²' }], correct: 'C' },
    { id: '4', question: 'Nilai dari √144 adalah...', options: [{ id: 'A', label: '10' }, { id: 'B', label: '11' }, { id: 'C', label: '12' }, { id: 'D', label: '13' }, { id: 'E', label: '14' }], correct: 'C' },
    { id: '5', question: 'FPB dari 24 dan 36 adalah...', options: [{ id: 'A', label: '4' }, { id: 'B', label: '6' }, { id: 'C', label: '8' }, { id: 'D', label: '12' }, { id: 'E', label: '18' }], correct: 'D' },
  ],
  physics: [
    { id: '1', question: 'Hukum Newton I menyatakan bahwa benda diam akan...', options: [{ id: 'A', label: 'Bergerak jika ada gaya' }, { id: 'B', label: 'Tetap diam jika tidak ada gaya luar' }, { id: 'C', label: 'Selalu bergerak' }, { id: 'D', label: 'Bergerak melingkar' }, { id: 'E', label: 'Jatuh bebas' }], correct: 'B' },
    { id: '2', question: 'Satuan gaya dalam SI adalah...', options: [{ id: 'A', label: 'Joule' }, { id: 'B', label: 'Watt' }, { id: 'C', label: 'Newton' }, { id: 'D', label: 'Pascal' }, { id: 'E', label: 'Ohm' }], correct: 'C' },
    { id: '3', question: 'Kecepatan cahaya di ruang hampa adalah...', options: [{ id: 'A', label: '3 × 10⁶ m/s' }, { id: 'B', label: '3 × 10⁷ m/s' }, { id: 'C', label: '3 × 10⁸ m/s' }, { id: 'D', label: '3 × 10⁹ m/s' }, { id: 'E', label: '3 × 10¹⁰ m/s' }], correct: 'C' },
    { id: '4', question: 'Energi potensial gravitasi dirumuskan sebagai...', options: [{ id: 'A', label: 'E = mc²' }, { id: 'B', label: 'Ep = mgh' }, { id: 'C', label: 'Ep = ½mv²' }, { id: 'D', label: 'F = ma' }, { id: 'E', label: 'P = mv' }], correct: 'B' },
    { id: '5', question: 'Gelombang elektromagnetik yang memiliki panjang gelombang terpendek adalah...', options: [{ id: 'A', label: 'Gelombang radio' }, { id: 'B', label: 'Cahaya tampak' }, { id: 'C', label: 'Sinar inframerah' }, { id: 'D', label: 'Sinar gamma' }, { id: 'E', label: 'Gelombang mikro' }], correct: 'D' },
  ],
  biology: [
    { id: '1', question: 'Organel sel yang berfungsi sebagai tempat respirasi sel adalah...', options: [{ id: 'A', label: 'Ribosom' }, { id: 'B', label: 'Mitokondria' }, { id: 'C', label: 'Kloroplas' }, { id: 'D', label: 'Nukleus' }, { id: 'E', label: 'Vakuola' }], correct: 'B' },
    { id: '2', question: 'Proses fotosintesis menghasilkan...', options: [{ id: 'A', label: 'CO₂ dan H₂O' }, { id: 'B', label: 'O₂ dan Glukosa' }, { id: 'C', label: 'ATP saja' }, { id: 'D', label: 'CO₂ dan Glukosa' }, { id: 'E', label: 'H₂O dan ATP' }], correct: 'B' },
    { id: '3', question: 'DNA memiliki basa nitrogen...', options: [{ id: 'A', label: 'A, T, G, U' }, { id: 'B', label: 'A, U, G, C' }, { id: 'C', label: 'A, T, G, C' }, { id: 'D', label: 'A, U, T, C' }, { id: 'E', label: 'A, G, C, X' }], correct: 'C' },
    { id: '4', question: 'Tingkatan organisasi kehidupan dari kecil ke besar adalah...', options: [{ id: 'A', label: 'Sel → Jaringan → Organ → Organisme' }, { id: 'B', label: 'Organ → Sel → Jaringan → Organisme' }, { id: 'C', label: 'Jaringan → Sel → Organ → Organisme' }, { id: 'D', label: 'Organisme → Organ → Jaringan → Sel' }, { id: 'E', label: 'Sel → Organ → Jaringan → Organisme' }], correct: 'A' },
    { id: '5', question: 'Hewan yang termasuk kelompok mamalia adalah...', options: [{ id: 'A', label: 'Katak' }, { id: 'B', label: 'Ikan paus' }, { id: 'C', label: 'Buaya' }, { id: 'D', label: 'Penyu' }, { id: 'E', label: 'Ular' }], correct: 'B' },
  ],
  english: [
    { id: '1', question: 'Which sentence is grammatically correct?', options: [{ id: 'A', label: 'She go to school' }, { id: 'B', label: 'She goes to school' }, { id: 'C', label: 'She going to school' }, { id: 'D', label: 'She goed to school' }, { id: 'E', label: 'She gone to school' }], correct: 'B' },
    { id: '2', question: 'The synonym of "happy" is...', options: [{ id: 'A', label: 'Sad' }, { id: 'B', label: 'Angry' }, { id: 'C', label: 'Joyful' }, { id: 'D', label: 'Tired' }, { id: 'E', label: 'Lonely' }], correct: 'C' },
    { id: '3', question: 'What is the past tense of "write"?', options: [{ id: 'A', label: 'Writed' }, { id: 'B', label: 'Writing' }, { id: 'C', label: 'Wrote' }, { id: 'D', label: 'Written' }, { id: 'E', label: 'Writes' }], correct: 'C' },
    { id: '4', question: '"She has been studying for 3 hours." This sentence uses...', options: [{ id: 'A', label: 'Simple Present' }, { id: 'B', label: 'Present Perfect' }, { id: 'C', label: 'Present Perfect Continuous' }, { id: 'D', label: 'Past Perfect' }, { id: 'E', label: 'Future Perfect' }], correct: 'C' },
    { id: '5', question: 'Choose the correct article: "I saw ___ elephant at the zoo."', options: [{ id: 'A', label: 'a' }, { id: 'B', label: 'an' }, { id: 'C', label: 'the' }, { id: 'D', label: 'No article needed' }, { id: 'E', label: 'one' }], correct: 'B' },
  ],
  history: [
    { id: '1', question: 'Proklamasi kemerdekaan Indonesia dibacakan pada tanggal...', options: [{ id: 'A', label: '17 Agustus 1944' }, { id: 'B', label: '17 Agustus 1945' }, { id: 'C', label: '18 Agustus 1945' }, { id: 'D', label: '19 Agustus 1945' }, { id: 'E', label: '17 September 1945' }], correct: 'B' },
    { id: '2', question: 'Siapakah pendiri Budi Utomo?', options: [{ id: 'A', label: 'Soekarno' }, { id: 'B', label: 'Mohammad Hatta' }, { id: 'C', label: 'Dr. Wahidin Sudirohusodo' }, { id: 'D', label: 'Ki Hajar Dewantara' }, { id: 'E', label: 'Diponegoro' }], correct: 'C' },
    { id: '3', question: 'Perang Dunia I berlangsung pada tahun...', options: [{ id: 'A', label: '1910-1914' }, { id: 'B', label: '1914-1918' }, { id: 'C', label: '1918-1922' }, { id: 'D', label: '1939-1945' }, { id: 'E', label: '1941-1945' }], correct: 'B' },
    { id: '4', question: 'Kerajaan Hindu tertua di Indonesia adalah...', options: [{ id: 'A', label: 'Majapahit' }, { id: 'B', label: 'Sriwijaya' }, { id: 'C', label: 'Kutai' }, { id: 'D', label: 'Tarumanagara' }, { id: 'E', label: 'Mataram' }], correct: 'C' },
    { id: '5', question: 'Konferensi Meja Bundar diadakan di...', options: [{ id: 'A', label: 'Jakarta' }, { id: 'B', label: 'New York' }, { id: 'C', label: 'Den Haag' }, { id: 'D', label: 'London' }, { id: 'E', label: 'Paris' }], correct: 'C' },
  ],
  chemistry: [
    { id: '1', question: 'Unsur dengan nomor atom 6 adalah...', options: [{ id: 'A', label: 'Nitrogen (N)' }, { id: 'B', label: 'Oksigen (O)' }, { id: 'C', label: 'Karbon (C)' }, { id: 'D', label: 'Boron (B)' }, { id: 'E', label: 'Helium (He)' }], correct: 'C' },
    { id: '2', question: 'Rumus kimia air adalah...', options: [{ id: 'A', label: 'HO' }, { id: 'B', label: 'H₂O' }, { id: 'C', label: 'H₂O₂' }, { id: 'D', label: 'HO₂' }, { id: 'E', label: 'H₃O' }], correct: 'B' },
    { id: '3', question: 'pH larutan yang bersifat netral adalah...', options: [{ id: 'A', label: '0' }, { id: 'B', label: '5' }, { id: 'C', label: '7' }, { id: 'D', label: '10' }, { id: 'E', label: '14' }], correct: 'C' },
    { id: '4', question: 'Tabel periodik disusun oleh...', options: [{ id: 'A', label: 'Albert Einstein' }, { id: 'B', label: 'Isaac Newton' }, { id: 'C', label: 'Dmitri Mendeleev' }, { id: 'D', label: 'Marie Curie' }, { id: 'E', label: 'John Dalton' }], correct: 'C' },
    { id: '5', question: 'Ikatan yang terbentuk antara logam dan non-logam disebut ikatan...', options: [{ id: 'A', label: 'Kovalen' }, { id: 'B', label: 'Ionik' }, { id: 'C', label: 'Hidrogen' }, { id: 'D', label: 'Koordinasi' }, { id: 'E', label: 'Logam' }], correct: 'B' },
  ],
};

const QUIZ_TIME = 600; // 10 minutes in seconds

const QuizScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

  const questions = selectedSubject ? (QUESTIONS_BY_SUBJECT[selectedSubject.id] || []) : [];

  useEffect(() => {
    if (!selectedSubject || quizFinished) return;
    if (timeLeft === 0) { handleFinish(); return; }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [selectedSubject, timeLeft, quizFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    questions.forEach(q => {
      if (ans[q.id] === q.correct) correct++;
    });
    setScore(correct);
    setQuizFinished(true);
  };

  const handleBack = () => {
    if (selectedSubject && !quizFinished) {
      Alert.alert(
        'Keluar Kuis?',
        'Progres kuis akan hilang. Yakin ingin keluar?',
        [
          { text: 'Lanjutkan', style: 'cancel' },
          { text: 'Keluar', style: 'destructive', onPress: () => { setSelectedSubject(null); triggerMedium(); } },
        ]
      );
    } else if (quizFinished) {
      setSelectedSubject(null);
      setQuizFinished(false);
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
            <Pressable style={[styles.homeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => { setSelectedSubject(null); setQuizFinished(false); }}>
              <Text style={[styles.homeBtnText, { color: colors.text }]}>Pilih Materi Lain</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Quiz Screen ---
  if (selectedSubject) {
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
});

export default QuizScreen;
