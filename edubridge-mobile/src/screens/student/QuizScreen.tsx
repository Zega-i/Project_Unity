import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, StatusBar, ActivityIndicator, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { aiAPI, classAPI, progressAPI } from '../../services/api';
import PremiumModal from '../../components/PremiumModal';
import { authStore } from '../../store/authStore';
import { USE_MOCK_DATA } from '../../constants';

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
  { id: 'math',      name: 'Matematika',     icon: '📐', color: '#6366F1', desc: 'Aljabar, Geometri, Kalkulus' },
  { id: 'physics',   name: 'Fisika',         icon: '⚡', color: '#F59E0B', desc: 'Mekanika, Termodinamika' },
  { id: 'biology',   name: 'Biologi',        icon: '🧬', color: '#10B981', desc: 'Sel, Ekosistem, Genetika' },
  { id: 'english',   name: 'Bahasa Inggris', icon: '📚', color: '#3B82F6', desc: 'Grammar, Reading, Vocabulary' },
  { id: 'history',   name: 'Sejarah',        icon: '📜', color: '#EF4444', desc: 'Sejarah Indonesia & Dunia' },
  { id: 'chemistry', name: 'Kimia',          icon: '⚗️', color: '#8B5CF6', desc: 'Unsur, Reaksi, Stoikiometri' },
];

const QUIZ_TIME = 600;

const parseQuestions = (raw: any[]): Question[] =>
  (raw || []).map((q: any, i: number) => ({
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

const parseTeacherQuestions = (raw: any[]): Question[] =>
  (raw || []).map((q: any, i: number) => {
    let opts: any[] = [];
    try {
      opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []);
    } catch { opts = []; }

    const mappedOptions = Array.isArray(opts)
      ? opts.map((o: any, j: number) => ({
          id: String.fromCharCode(65 + j),
          label: typeof o === 'string' ? o : (o.label || o.text || ''),
        }))
      : [];

    const correctText = q.correctAnswer || q.correct || '';
    const matchedOption = mappedOptions.find(o => o.label === correctText);
    const correctId = matchedOption ? matchedOption.id : (mappedOptions[0]?.id || 'A');

    return {
      id: String(q.id ?? i + 1),
      question: q.text || q.question || '',
      options: mappedOptions,
      correct: correctId,
    };
  });

// Simple markdown-like renderer for AI analysis text
const renderAnalysisLine = (line: string, index: number, colors: any) => {
  if (!line.trim()) return <View key={index} style={{ height: 12 }} />;

  if (line.startsWith('## ')) {
    const content = line.replace(/^## /, '').replace(/\*\*/g, '');
    return (
      <Text key={index} style={[styles.analysisH2, { color: colors.text }]}>
        {content}
      </Text>
    );
  }
  if (line.startsWith('# ')) {
    const content = line.replace(/^# /, '').replace(/\*\*/g, '');
    return (
      <Text key={index} style={[styles.analysisH1, { color: colors.text }]}>
        {content}
      </Text>
    );
  }
  if (line.startsWith('- ') || line.startsWith('• ')) {
    const content = line.replace(/^[-•] /, '').replace(/\*\*(.*?)\*\*/g, '$1');
    return (
      <View key={index} style={styles.analysisBulletRow}>
        <View style={[styles.analysisBulletDot, { backgroundColor: PURPLE }]} />
        <Text style={[styles.analysisBulletText, { color: colors.text }]}>{content}</Text>
      </View>
    );
  }
  if (/^\d+\. /.test(line)) {
    const numMatch = line.match(/^(\d+)\. (.*)/);
    if (numMatch) {
      const content = numMatch[2].replace(/\*\*(.*?)\*\*/g, '$1');
      return (
        <View key={index} style={styles.analysisBulletRow}>
          <View style={[styles.analysisNumBadge, { backgroundColor: PURPLE + '20' }]}>
            <Text style={[styles.analysisNumText, { color: PURPLE }]}>{numMatch[1]}</Text>
          </View>
          <Text style={[styles.analysisBulletText, { color: colors.text }]}>{content}</Text>
        </View>
      );
    }
  }
  if (line.startsWith('---')) {
    return <View key={index} style={[styles.analysisDivider, { backgroundColor: colors.border }]} />;
  }

  const boldReplaced = line.replace(/\*\*(.*?)\*\*/g, '$1');
  return (
    <Text key={index} style={[styles.analysisBody, { color: colors.text }]}>
      {boldReplaced}
    </Text>
  );
};

const QuizScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const { triggerLight, triggerMedium } = useHapticFeedback();
  const useInsets = useSafeAreaInsets();
  const sheetBottomPadding = Math.max(24, useInsets.bottom + 16);

  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [selectedQuizTitle, setSelectedQuizTitle] = useState<string>('');
  const [currentQuizData, setCurrentQuizData] = useState<any>(null); // tracks teacher quiz
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
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysisText, setAiAnalysisText] = useState('');
  const [completedQuizIds, setCompletedQuizIds] = useState<Set<string>>(new Set());
  const [submittingResult, setSubmittingResult] = useState(false);

  // PremiumModal States
  const [showExitModal, setShowExitModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [teacherQuizzes, setTeacherQuizzes] = useState<any[]>([]);
  const [loadingTeacherQuizzes, setLoadingTeacherQuizzes] = useState(false);
  const [showResultEnabled, setShowResultEnabled] = useState(true);

  // Load completed quiz IDs from storage
  const loadCompletedQuizzes = useCallback(async () => {
    try {
      const userId = authStore.getUserSync()?.id;
      const quizzesKey = userId ? `@completed_quizzes_${userId}` : '@completed_quizzes';
      const stored = await AsyncStorage.getItem(quizzesKey);
      setCompletedQuizIds(new Set(stored ? JSON.parse(stored) : []));
    } catch { 
      setCompletedQuizIds(new Set());
    }
  }, []);

  const saveCompletedQuiz = async (quizId: string, details?: { score: number; totalQuestions: number; correctAnswers: number }) => {
    try {
      const userId = authStore.getUserSync()?.id;
      const quizzesKey = userId ? `@completed_quizzes_${userId}` : '@completed_quizzes';
      const detailsKey = userId ? `@completed_quiz_details_${userId}` : '@completed_quiz_details';

      const updated = new Set([...completedQuizIds, quizId]);
      setCompletedQuizIds(updated);
      await AsyncStorage.setItem(quizzesKey, JSON.stringify([...updated]));

      if (details) {
        const storedDetails = await AsyncStorage.getItem(detailsKey);
        const detailsMap = storedDetails ? JSON.parse(storedDetails) : {};
        detailsMap[quizId] = {
          ...details,
          completedAt: new Date().toISOString()
        };
        await AsyncStorage.setItem(detailsKey, JSON.stringify(detailsMap));
      }
    } catch { /* ignore */ }
  };

  const loadTeacherQuizzes = useCallback(async () => {
    setLoadingTeacherQuizzes(true);
    if (USE_MOCK_DATA) {
      setTeacherQuizzes([
        {
          id: 'mock_tq_1',
          title: 'Kuis Harian 1: Persamaan Kuadrat',
          className: 'Kelas 10-A',
          classId: 'mock_class_1',
          timeLimit: 10,
          shuffle: false,
          showResult: true,
          questions: [
            {
              id: 'q1',
              text: 'Himpunan penyelesaian dari x^2 - 5x + 6 = 0 adalah...',
              options: JSON.stringify(['{2, 3}', '{1, 6}', '{-2, -3}', '{-1, -6}']),
              correctAnswer: '{2, 3}'
            },
            {
              id: 'q2',
              text: 'Diskriminan dari persamaan kuadrat x^2 - 4x + 4 = 0 adalah...',
              options: JSON.stringify(['0', '4', '8', '16']),
              correctAnswer: '0'
            }
          ]
        },
        {
          id: 'mock_tq_2',
          title: 'Evaluasi Bab 2: Gerak Lurus',
          className: 'Kelas 10-A',
          classId: 'mock_class_1',
          timeLimit: 15,
          shuffle: false,
          showResult: true,
          questions: [
            {
              id: 'q1',
              text: 'Sebuah mobil bergerak dengan kecepatan tetap 20 m/s. Jarak yang ditempuh mobil dalam waktu 5 detik adalah...',
              options: JSON.stringify(['100 m', '80 m', '50 m', '20 m']),
              correctAnswer: '100 m'
            }
          ]
        }
      ]);
      setLoadingTeacherQuizzes(false);
      return;
    }
    try {
      const classRes = await classAPI.getMyClasses();
      const myClasses: any[] = classRes.data || [];
      const results = await Promise.all(
        myClasses.map((cls: any) =>
          classAPI.getClassQuizzes(cls.id)
            .then((r: any) => (r && r.data || []).map((q: any) => ({ ...q, className: cls.name, classId: cls.id })))
            .catch(() => [])
        )
      );
      const flatQuizzes = results.flat();
      setTeacherQuizzes(flatQuizzes);

      const userId = authStore.getUserSync()?.id;
      const quizzesKey = userId ? `@completed_quizzes_${userId}` : '@completed_quizzes';
      const detailsKey = userId ? `@completed_quiz_details_${userId}` : '@completed_quiz_details';

      const [storedQuizzes, storedDetails] = await Promise.all([
        AsyncStorage.getItem(quizzesKey),
        AsyncStorage.getItem(detailsKey),
      ]);

      const localCompletedIds = storedQuizzes ? JSON.parse(storedQuizzes) : [];
      const completedSet = new Set<string>(localCompletedIds);
      const detailsMap = storedDetails ? JSON.parse(storedDetails) : {};
      let hasUpdates = false;

      flatQuizzes.forEach((q: any) => {
        if (q.isCompleted || q.sessionDetails) {
          if (!completedSet.has(q.id)) {
            completedSet.add(q.id);
            hasUpdates = true;
          }
          if (q.sessionDetails && (!detailsMap[q.id] || detailsMap[q.id].score !== q.sessionDetails.score)) {
            detailsMap[q.id] = {
              score: q.sessionDetails.score,
              totalQuestions: q.sessionDetails.totalQuestions,
              correctAnswers: q.sessionDetails.correctAnswers,
              completedAt: q.sessionDetails.completedAt || new Date().toISOString()
            };
            hasUpdates = true;
          }
        }
      });

      if (hasUpdates) {
        await Promise.all([
          AsyncStorage.setItem(quizzesKey, JSON.stringify([...completedSet])),
          AsyncStorage.setItem(detailsKey, JSON.stringify(detailsMap))
        ]);
      }
      setCompletedQuizIds(completedSet);
    } catch {
      setTeacherQuizzes([]);
    } finally {
      setLoadingTeacherQuizzes(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    loadTeacherQuizzes();
    loadCompletedQuizzes();
  }, [loadTeacherQuizzes, loadCompletedQuizzes]));

  useEffect(() => {
    const initialQuiz = route?.params?.initialQuiz;
    if (!initialQuiz) return;
    const userId = authStore.getUserSync()?.id;
    const quizzesKey = userId ? `@completed_quizzes_${userId}` : '@completed_quizzes';
    AsyncStorage.getItem(quizzesKey).then(stored => {
      const ids: Set<string> = stored ? new Set(JSON.parse(stored)) : new Set();
      setCompletedQuizIds(ids);
      if (ids.has(initialQuiz.id)) {
        setAlertModal({
          visible: true,
          type: 'warning',
          title: 'Kuis Sudah Selesai',
          message: 'Kamu sudah mengerjakan kuis ini. Hasil kamu sudah tercatat di pantauan guru.',
          confirmText: 'OK',
          onConfirm: () => {
            setAlertModal(prev => ({ ...prev, visible: false }));
            navigation.goBack();
          }
        });
        return;
      }
      startTeacherQuiz(initialQuiz);
    });
  }, [route?.params?.initialQuiz, navigation]);

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

  const startQuizWithQuestions = (parsed: Question[], title: string, durationSecs?: number) => {
    setSelectedSubject({ id: 'custom', name: title, icon: '📝', color: PURPLE, desc: '' });
    setSelectedQuizTitle(title);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers({});
    setTimeLeft(durationSecs !== undefined ? durationSecs : QUIZ_TIME);
    setQuizFinished(false);
    setScore(0);
    setQuestions(parsed);
    setQuestionsError(null);
    setQuestionsLoading(false);
  };

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const startTeacherQuiz = (quizToStart: any) => {
    if (!quizToStart.questions || quizToStart.questions.length === 0) {
      setAlertModal({
        visible: true,
        type: 'warning',
        title: 'Kuis Kosong',
        message: 'Kuis ini belum memiliki soal.',
        confirmText: 'OK',
        onConfirm: () => {
          setAlertModal(prev => ({ ...prev, visible: false }));
          if (route?.params?.initialQuiz) {
            navigation.goBack();
          }
        }
      });
      return;
    }
    let parsed = parseTeacherQuestions(quizToStart.questions);
    if (parsed.length === 0) {
      setAlertModal({
        visible: true,
        type: 'error',
        title: 'Gagal',
        message: 'Gagal memuat soal kuis.',
        confirmText: 'OK',
        onConfirm: () => {
          setAlertModal(prev => ({ ...prev, visible: false }));
          if (route?.params?.initialQuiz) {
            navigation.goBack();
          }
        }
      });
      return;
    }
    if (quizToStart.shuffle !== false) parsed = shuffleArray(parsed);
    setShowResultEnabled(quizToStart.showResult !== false);
    setCurrentQuizData(quizToStart);
    const timeSecs = quizToStart.timeLimit ? quizToStart.timeLimit * 60 : QUIZ_TIME;
    startQuizWithQuestions(parsed, quizToStart.title, timeSecs);
  };

  const handleSelectTeacherQuiz = (quiz: any) => {
    triggerMedium();
    setSelectedQuiz({ ...quiz, className: quiz.className || 'Umum' });
  };

  const fetchQuestions = async (subject: Subject) => {
    setQuestionsLoading(true);
    setQuestionsError(null);
    setQuestions([]);
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        const mockRaw = [
          {
            id: 'mock_q_1',
            question: 'Jika 3x + 2 = 11, berapakah nilai x?',
            options: ['2', '3', '4', '5'],
            correct: 'B'
          },
          {
            id: 'mock_q_2',
            question: 'Hasil dari operasi aljabar (2x + 3)(x - 1) adalah...',
            options: ['2x^2 + x - 3', '2x^2 - x - 3', '2x^2 + 5x - 3', '2x^2 - 5x - 3'],
            correct: 'A'
          },
          {
            id: 'mock_q_3',
            question: 'Penyelesaian dari pertidaksamaan 2x - 4 < 6 adalah...',
            options: ['x < 5', 'x > 5', 'x < 1', 'x > 1'],
            correct: 'A'
          },
          {
            id: 'mock_q_4',
            question: 'Sistem persamaan linear berikut:\nx + y = 5\nx - y = 1\nMemiliki himpunan penyelesaian...',
            options: ['x=3, y=2', 'x=4, y=1', 'x=2, y=3', 'x=5, y=0'],
            correct: 'A'
          },
          {
            id: 'mock_q_5',
            question: 'Koefisien dari suku x pada bentuk aljabar 3x^2 - 5x + 7 adalah...',
            options: ['3', '5', '-5', '7'],
            correct: 'C'
          }
        ];
        const parsed = parseQuestions(mockRaw);
        setQuestions(parsed);
        setQuestionsLoading(false);
      }, 500);
      return;
    }
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
    setCurrentQuizData(null);
    setSelectedSubject(subject);
    setSelectedQuizTitle(subject.name);
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

  const handleFinish = async (finalAnswers?: Record<string, string>) => {
    const ans = finalAnswers || answers;
    let correct = 0;
    const wrongs: any[] = [];

    questions.forEach(q => {
      if (ans[q.id] === q.correct) {
        correct++;
      } else {
        // Enrich with labels for better AI analysis
        const userAnswerLabel = q.options.find(o => o.id === ans[q.id])?.label || ans[q.id] || 'Tidak dijawab';
        const correctAnswerLabel = q.options.find(o => o.id === q.correct)?.label || q.correct;
        wrongs.push({
          question: q.question,
          userAnswer: ans[q.id],
          correctAnswer: q.correct,
          userAnswerLabel,
          correctAnswerLabel,
          allOptions: q.options,
        });
      }
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    setScore(correct);
    setWrongAnswers(wrongs);
    setQuizFinished(true);

    // Submit and lock for teacher quizzes
    if (currentQuizData?.id) {
      setSubmittingResult(true);
      try {
        await progressAPI.submitQuizResult({
          classId: currentQuizData.classId || currentQuizData.id,
          quizId: currentQuizData.id,
          score: finalScore,
          totalQuestions: questions.length,
          correctAnswers: correct,
        });
        await saveCompletedQuiz(currentQuizData.id, { score: finalScore, totalQuestions: questions.length, correctAnswers: correct });
      } catch {
        // Result stored locally even if API fails
        await saveCompletedQuiz(currentQuizData.id, { score: finalScore, totalQuestions: questions.length, correctAnswers: correct });
      } finally {
        setSubmittingResult(false);
      }
    }
  };

  const handleAnalyzeErrors = async () => {
    if (wrongAnswers.length === 0) {
      setAlertModal({
        visible: true,
        type: 'success',
        title: 'EduBridge AI',
        message: 'Luar biasa! Kamu menjawab semua dengan benar!',
        confirmText: 'OK',
        onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
      });
      return;
    }
    setAnalyzingErrors(true);
    triggerMedium();
    if (USE_MOCK_DATA) {
      setTimeout(() => {
        const mockAnalysis = `## 🔍 Diagnosis Kesalahan

Berdasarkan jawaban Anda pada kuis Matematika Aljabar, terdapat beberapa pola kesalahan:
1. **Pemahaman Konsep Persamaan Linear**: Pada soal nomor 1 dan 4, Anda tampaknya keliru dalam melakukan operasi pindah ruas atau substitusi nilai variabel.
2. **Operasi Aljabar Perkalian**: Pada soal nomor 2, ada sedikit ketidaktelitian dalam perkalian tanda negatif saat mengalikan suku-suku binomial.

## 📌 Topik yang Perlu Dikuasai

- **Sistem Persamaan Linear Dua Variabel (SPLDV)** — penting untuk memahami metode eliminasi dan substitusi secara bertahap.
- **Operasi Hitung Aljabar Dasar** — pelajari kembali distribusi perkalian bentuk aljabar dan aturan tanda (+/-).

## 📚 Rencana Belajar

1. **Review SPLDV**: Tonton video panduan eliminasi di modul Matematika Bab 3.
2. **Latihan Distribusi**: Selesaikan 5 latihan soal perkalian bentuk aljabar.
3. **Gunakan AI Tutor**: Tanyakan pada AI Tutor jika Anda ragu dengan langkah pemindahan ruas variabel.

## 💡 Tips Khusus

Cobalah selalu membubuhkan tanda kurung pada bilangan negatif saat melakukan perhitungan untuk menghindari kesalahan tanda (+/-).

## 🌟 Semangat!

Setiap kesalahan adalah langkah awal menuju pemahaman yang lebih baik. Kamu sudah menguasai konsep koefisien aljabar dengan sangat baik, pertahaman fokusmu! 💪📚`;
        setAiAnalysisText(mockAnalysis);
        setShowAIAnalysis(true);
        setAnalyzingErrors(false);
      }, 500);
      return;
    }
    try {
      const res = await aiAPI.analyzeErrors(wrongAnswers);
      if (res.success) {
        setAiAnalysisText(res.data.analysis);
        setShowAIAnalysis(true);
      }
    } catch {
      setAlertModal({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Gagal mendapatkan analisis AI. Periksa koneksi internet.',
        confirmText: 'OK',
        onConfirm: () => setAlertModal(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setAnalyzingErrors(false);
    }
  };

  const handleBack = () => {
    if (selectedSubject && !quizFinished && !questionsLoading) {
      setShowExitModal(true);
    } else if (quizFinished || questionsLoading || questionsError) {
      setSelectedSubject(null);
      setCurrentQuizData(null);
      setQuizFinished(false);
      setQuestionsError(null);
      setShowAIAnalysis(false);
      if (route?.params?.initialQuiz) {
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  };

  // --- AI Analysis Full Screen ---
  if (quizFinished && selectedSubject && showAIAnalysis) {
    const lines = aiAnalysisText.split('\n');
    return (
      <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable
            style={styles.backBtn}
            onPress={() => setShowAIAnalysis(false)}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.analysisHeaderCenter}>
            <View style={[styles.analysisHeaderIcon, { backgroundColor: PURPLE + '15' }]}>
              <Ionicons name="sparkles" size={16} color={PURPLE} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Analisis AI</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.analysisScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Score context banner */}
          <View style={[styles.analysisBanner, { backgroundColor: PURPLE + '10', borderColor: PURPLE + '30' }]}>
            <Ionicons name="bar-chart-outline" size={20} color={PURPLE} />
            <Text style={[styles.analysisBannerText, { color: PURPLE }]}>
              {wrongAnswers.length} dari {questions.length} soal dijawab salah
            </Text>
          </View>

          {/* Render analysis lines */}
          <View style={styles.analysisContent}>
            {lines.map((line, i) => renderAnalysisLine(line, i, colors))}
          </View>

          {/* CTA */}
          <Pressable
            style={[styles.analysisDoneBtn, { backgroundColor: PURPLE }]}
            onPress={() => setShowAIAnalysis(false)}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.analysisDoneBtnText}>Siap Belajar Lagi!</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Result Screen ---
  if (quizFinished && selectedSubject) {
    const percentage = showResultEnabled ? Math.round((score / questions.length) * 100) : null;
    const isPassed = percentage !== null ? percentage >= 60 : true;
    const isTeacherQuiz = !!currentQuizData?.id;

    return (
      <SafeAreaView style={[styles.container, { paddingTop: Constants.statusBarHeight, backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.resultHeader}>
            <Text style={styles.resultEmoji}>{isPassed ? '🎉' : '📚'}</Text>
            <Text style={[styles.resultTitle, { color: colors.text }]}>
              {isPassed ? 'Selamat!' : 'Terus Semangat!'}
            </Text>
            <Text style={[styles.resultSubject, { color: colors.textSecondary }]}>
              {selectedQuizTitle || selectedSubject.name}
            </Text>
          </View>

          {/* Score display */}
          {percentage !== null ? (
            <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: isPassed ? '#10B981' + '40' : '#F59E0B' + '40' }]}>
              <View style={[styles.scoreCircle, { borderColor: isPassed ? '#10B981' : '#F59E0B', backgroundColor: (isPassed ? '#10B981' : '#F59E0B') + '10' }]}>
                <Text style={[styles.scoreNumber, { color: isPassed ? '#10B981' : '#F59E0B' }]}>{percentage}</Text>
                <Text style={[styles.scorePercent, { color: isPassed ? '#10B981' : '#F59E0B' }]}>%</Text>
              </View>
              <View style={[styles.passBadge, { backgroundColor: isPassed ? '#10B981' + '20' : '#F59E0B' + '20' }]}>
                <Ionicons name={isPassed ? 'checkmark-circle' : 'alert-circle'} size={14} color={isPassed ? '#10B981' : '#F59E0B'} />
                <Text style={[styles.passBadgeText, { color: isPassed ? '#10B981' : '#F59E0B' }]}>
                  {isPassed ? 'LULUS' : 'BELUM LULUS'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="checkmark-done-circle" size={56} color="#10B981" />
              <Text style={[styles.resultSubject, { color: colors.textSecondary, marginTop: 8 }]}>Kuis Selesai</Text>
            </View>
          )}

          {/* Stats row */}
          <View style={styles.resultStats}>
            {[
              { label: 'Benar', val: score, color: '#10B981', icon: 'checkmark-circle' },
              { label: 'Salah', val: questions.length - score, color: '#EF4444', icon: 'close-circle' },
              { label: 'Total', val: questions.length, color: PURPLE, icon: 'list-circle' },
            ].map((s, i) => (
              <View key={i} style={[styles.resultStat, { backgroundColor: s.color + '12', borderColor: s.color + '30' }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
                <Text style={[styles.resultStatNum, { color: s.color }]}>{s.val}</Text>
                <Text style={[styles.resultStatLabel, { color: colors.textSecondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Teacher quiz result notice */}
          {isTeacherQuiz && (
            <View style={[styles.resultNotice, { backgroundColor: '#10B981' + '12', borderColor: '#10B981' + '30' }]}>
              <Ionicons name="cloud-done-outline" size={18} color="#10B981" />
              <Text style={[styles.resultNoticeText, { color: '#10B981' }]}>
                Hasil kamu sudah dicatat dan bisa dipantau guru
              </Text>
            </View>
          )}

          {/* Buttons */}
          {wrongAnswers.length > 0 && (
            <Pressable
              style={[styles.aiBtn, { backgroundColor: PURPLE, opacity: analyzingErrors ? 0.7 : 1 }]}
              onPress={handleAnalyzeErrors}
              disabled={analyzingErrors}
            >
              {analyzingErrors ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.aiBtnText}>Menganalisis...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.aiBtnText}>Analisis Kesalahan (AI)</Text>
                </>
              )}
            </Pressable>
          )}

          {/* Coba lagi — hanya untuk kuis AI (bukan kuis guru) */}
          {!isTeacherQuiz && (
            <Pressable
              style={[styles.retryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSelectSubject(selectedSubject)}
            >
              <Ionicons name="refresh" size={18} color={PURPLE} />
              <Text style={[styles.retryBtnText, { color: PURPLE }]}>Coba Lagi</Text>
            </Pressable>
          )}

          <Pressable
            style={[styles.homeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => { 
              setSelectedSubject(null); 
              setCurrentQuizData(null); 
              setQuizFinished(false); 
              if (route?.params?.initialQuiz) {
                navigation.goBack();
              }
            }}
          >
            <Text style={[styles.homeBtnText, { color: colors.text }]}>Kembali ke Daftar Kuis</Text>
          </Pressable>

        </ScrollView>

        {/* Alert Modal */}
        <PremiumModal
          visible={alertModal.visible}
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
          confirmText={alertModal.confirmText}
          onConfirm={alertModal.onConfirm}
          minimal
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
          <Pressable style={[styles.aiBtn, { backgroundColor: PURPLE }]} onPress={() => fetchQuestions(selectedSubject)}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.aiBtnText}>Coba Lagi</Text>
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

        <View style={[styles.topNav, { borderBottomColor: colors.border }]}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.topNavCenter}>
            <Text style={[styles.subjectLabel, { color: colors.textSecondary }]}>{selectedSubject.icon} {selectedQuizTitle || selectedSubject.name}</Text>
          </View>
          <View style={[styles.timerBox, { backgroundColor: isLowTime ? '#EF4444' + '20' : PURPLE + '15' }]}>
            <Ionicons name="time-outline" size={16} color={isLowTime ? '#EF4444' : PURPLE} />
            <Text style={[styles.timerText, { color: isLowTime ? '#EF4444' : PURPLE }]}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

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

        {/* Exit Confirmation Modal */}
        <PremiumModal
          visible={showExitModal}
          type="warning"
          title="Keluar Kuis?"
          message="Progres kuis akan hilang. Yakin ingin keluar?"
          confirmText="Keluar"
          cancelText="Lanjutkan"
          onConfirm={() => {
            setShowExitModal(false);
            setSelectedSubject(null);
            setCurrentQuizData(null);
            triggerMedium();
            if (route?.params?.initialQuiz) {
              navigation.goBack();
            }
          }}
          onCancel={() => setShowExitModal(false)}
          minimal
        />

        {/* Alert Modal */}
        <PremiumModal
          visible={alertModal.visible}
          type={alertModal.type}
          title={alertModal.title}
          message={alertModal.message}
          confirmText={alertModal.confirmText}
          onConfirm={alertModal.onConfirm}
          minimal
        />
      </SafeAreaView>
    );
  }

  // --- Subject Selection Screen ---
  const currentUser = authStore.getUserSync();
  const hasClass = !!currentUser?.className;

  if (!hasClass && teacherQuizzes.length === 0) {
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
              Pilih kuis dari guru untuk menguji kemampuanmu
            </Text>
          </View>
        </View>

        {/* Teacher Quizzes Section */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.chooseTitle, { color: colors.text }]}>Kuis dari Guru</Text>
          {loadingTeacherQuizzes ? (
            <ActivityIndicator size="small" color={PURPLE} style={{ marginVertical: 12 }} />
          ) : teacherQuizzes.length > 0 ? (
            teacherQuizzes.map((quiz) => {
              const isDone = completedQuizIds.has(quiz.id);
              return (
                <Pressable
                  key={quiz.id}
                  style={[
                    styles.teacherQuizCard,
                    { backgroundColor: isDone ? colors.surface : colors.card, borderColor: colors.border, opacity: isDone ? 0.7 : 1 },
                  ]}
                  onPress={() => handleSelectTeacherQuiz(quiz)}
                >
                  <View style={[styles.teacherQuizIcon, { backgroundColor: isDone ? '#10B981' + '20' : PURPLE + '15' }]}>
                    <Ionicons name={isDone ? 'checkmark-done' : 'school'} size={22} color={isDone ? '#10B981' : PURPLE} />
                  </View>
                  <View style={styles.teacherQuizInfo}>
                    <Text style={[styles.teacherQuizTitle, { color: colors.text }]}>{quiz.title}</Text>
                    <Text style={[styles.teacherQuizMeta, { color: colors.textSecondary }]}>
                      {quiz.className} • {quiz.questions?.length || 0} Soal • {quiz.timeLimit || 10} Menit
                    </Text>
                  </View>
                  {isDone ? (
                    <View style={[styles.doneBadge, { backgroundColor: '#10B981' + '20' }]}>
                      <Text style={[styles.doneBadgeText, { color: '#10B981' }]}>Selesai</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  )}
                </Pressable>
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: PURPLE + '10' }]}>
                <Ionicons name="extension-puzzle-outline" size={50} color={PURPLE} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Kuis Belum Tersedia</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Belum ada kuis yang ditugaskan oleh guru di kelas kamu.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Quiz Detail Modal */}
      <Modal
        visible={!!selectedQuiz}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedQuiz(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedQuiz(null)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: sheetBottomPadding }]} onPress={e => e.stopPropagation()}>
            {selectedQuiz && (
              <QuizSheet
                quiz={selectedQuiz}
                isDone={completedQuizIds.has(selectedQuiz.id)}
                colors={colors}
                onClose={() => setSelectedQuiz(null)}
                onStart={() => {
                  const quizToStart = selectedQuiz;
                  setSelectedQuiz(null);
                  startTeacherQuiz(quizToStart);
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Exit Confirmation Modal */}
      <PremiumModal
        visible={showExitModal}
        type="warning"
        title="Keluar Kuis?"
        message="Progres kuis akan hilang. Yakin ingin keluar?"
        confirmText="Keluar"
        cancelText="Lanjutkan"
        onConfirm={() => {
          setShowExitModal(false);
          setSelectedSubject(null);
          setCurrentQuizData(null);
          triggerMedium();
          if (route?.params?.initialQuiz) {
            navigation.goBack();
          }
        }}
        onCancel={() => setShowExitModal(false)}
        minimal
      />

      {/* Alert Modal */}
      <PremiumModal
        visible={alertModal.visible}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        confirmText={alertModal.confirmText}
        onConfirm={alertModal.onConfirm}
        minimal
      />
    </SafeAreaView>
  );
};


const QuizSheet = ({
  quiz, isDone, colors, onClose, onStart,
}: {
  quiz: any; isDone: boolean; colors: any; onClose: () => void; onStart: () => void;
}) => {
  const { isDarkMode } = useTheme();
  const questionCount = quiz.questionsCount || quiz._count?.questions || quiz.questions?.length || 0;
  const timeLimit = quiz.timeLimit || 15;
  const [details, setDetails] = useState<{ score: number; totalQuestions: number; correctAnswers: number; completedAt?: string } | null>(null);

  useEffect(() => {
    if (isDone) {
      const userId = authStore.getUserSync()?.id;
      const detailsKey = userId ? `@completed_quiz_details_${userId}` : '@completed_quiz_details';
      AsyncStorage.getItem(detailsKey).then(stored => {
        if (stored) {
          const map = JSON.parse(stored);
          if (map[quiz.id]) {
            setDetails(map[quiz.id]);
            return;
          }
        }
        setDetails(null);
      }).catch(() => setDetails(null));
    } else {
      setDetails(null);
    }
  }, [quiz.id, isDone]);

  return (
    <View style={{ width: '100%', flexShrink: 1 }}>
      <View style={[styles.sheetHandle, { backgroundColor: isDarkMode ? '#475569' : '#CBD5E1' }]} />
      <View style={styles.sheetHeader}>
        <View style={[styles.sheetIconBox, { backgroundColor: (isDone ? '#10B981' : '#10B981') + '15' }]}>
          <Ionicons name={isDone ? 'checkmark-done' : 'extension-puzzle'} size={26} color="#10B981" />
        </View>
        <Pressable style={styles.sheetClose} onPress={onClose}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 8 }}>
        {quiz.className && (
          <View style={[styles.classBadge, { backgroundColor: PURPLE + '12' }]}>
            <Text style={[styles.classBadgeText, { color: PURPLE }]}>{quiz.className}</Text>
          </View>
        )}

        <Text style={[styles.sheetTitle, { color: colors.text }]}>{quiz.title}</Text>

        {isDone ? (
          <View style={styles.completedContainer}>
            <View style={[styles.trophyWrapper, { backgroundColor: '#F59E0B' + '15' }]}>
              <Text style={styles.trophyEmoji}>🏆</Text>
            </View>

            <Text style={[styles.completedHeader, { color: colors.text }]}>Hasil Kuis Kamu</Text>

            {/* Check quiz settings from teacher */}
            {quiz.showResult === false ? (
              <View style={[styles.scoreBadgeContainer, { backgroundColor: colors.surface, borderColor: colors.border, paddingVertical: 20 }]}>
                <Ionicons name="eye-off-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 8 }} />
                <Text style={[styles.doneNoticeText, { color: colors.text, textAlign: 'center', fontWeight: 'bold' }]}>
                  Nilai Disembunyikan
                </Text>
                <Text style={[styles.quizInfoText, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 12 }]}>
                  Guru menonaktifkan tampilan hasil untuk kuis ini. Hasil pengerjaan kamu sudah tercatat dengan aman.
                </Text>
              </View>
            ) : quiz.autoGrade === false ? (
              <View style={[styles.scoreBadgeContainer, { backgroundColor: colors.surface, borderColor: colors.border, paddingVertical: 20 }]}>
                <Ionicons name="time-outline" size={32} color="#F59E0B" style={{ marginBottom: 8 }} />
                <Text style={[styles.doneNoticeText, { color: colors.text, textAlign: 'center', fontWeight: 'bold' }]}>
                  Menunggu Penilaian
                </Text>
                <Text style={[styles.quizInfoText, { color: colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 12 }]}>
                  Kuis ini memerlukan pemeriksaan manual oleh guru sebelum nilaimu ditampilkan.
                </Text>
              </View>
            ) : (
              <View style={[styles.scoreBadgeContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.scoreRow}>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>SKOR AKHIR</Text>
                    <Text style={[styles.scoreValue, { color: '#10B981' }]}>
                      {details ? `${details.score}%` : 'Selesai'}
                    </Text>
                  </View>
                  <View style={[styles.scoreDivider, { backgroundColor: colors.border }]} />
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>BENAR</Text>
                    <Text style={[styles.scoreValue, { color: PURPLE }]}>
                      {details ? `${details.correctAnswers} / ${details.totalQuestions}` : '-'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={[styles.doneNotice, { backgroundColor: '#10B981' + '12', borderColor: '#10B981' + '30', marginTop: 16 }]}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={[styles.doneNoticeText, { color: '#10B981' }]}>
                Kuis ini sudah kamu kerjakan. Hasil telah terkirim dan tercatat di pantauan guru.
              </Text>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.infoGrid}>
              <View style={[styles.infoCard, { backgroundColor: PURPLE + '12', borderColor: PURPLE + '30' }]}>
                <Ionicons name="help-circle-outline" size={18} color={PURPLE} />
                <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Jumlah Soal</Text>
                <Text style={[styles.infoCardValue, { color: PURPLE }]}>{questionCount} Soal</Text>
              </View>
              <View style={[styles.infoCard, { backgroundColor: '#F59E0B' + '12', borderColor: '#F59E0B' + '30' }]}>
                <Ionicons name="time-outline" size={18} color="#F59E0B" />
                <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>Batas Waktu</Text>
                <Text style={[styles.infoCardValue, { color: '#F59E0B' }]}>{timeLimit} Menit</Text>
              </View>
            </View>

            <View style={[styles.quizInfoRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="information-circle-outline" size={15} color={colors.textSecondary} />
              <Text style={[styles.quizInfoText, { color: colors.textSecondary }]}>
                Kerjakan dengan jujur. Kuis hanya bisa dikerjakan satu kali.
              </Text>
            </View>
          </>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
        {isDone ? (
          <Pressable style={[styles.closeBtn, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.closeBtnText, { color: colors.text }]}>Tutup</Text>
          </Pressable>
        ) : (
          <Pressable style={[styles.closeBtn, { backgroundColor: '#10B981' }]} onPress={onStart}>
            <Ionicons name="play-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.closeBtnText}>Mulai Kuis</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20, paddingBottom: 50 },

  infoBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 20, marginBottom: 20, gap: 14 },
  infoBannerIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: PURPLE + '20', alignItems: 'center', justifyContent: 'center' },
  infoBannerTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  infoBannerText: { flex: 1 },
  infoBannerDesc: { fontSize: 13, lineHeight: 18 },

  sectionBlock: { marginBottom: 24 },

  teacherQuizCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  teacherQuizIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  teacherQuizInfo: { flex: 1 },
  teacherQuizTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 3 },
  teacherQuizMeta: { fontSize: 12 },
  doneBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  doneBadgeText: { fontSize: 11, fontWeight: 'bold' },

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

  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 14 },
  centerStateTitle: { fontSize: 18, fontWeight: 'bold' },
  centerStateText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

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
  optionText: { fontSize: 15, flex: 1, lineHeight: 22 },

  footer: { padding: 20, borderTopWidth: 1 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: PURPLE, borderRadius: 16, paddingVertical: 16, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Result Screen
  resultContent: { paddingHorizontal: 20, paddingTop: 30, paddingBottom: 50 },
  resultHeader: { alignItems: 'center', marginBottom: 24 },
  resultEmoji: { fontSize: 64, marginBottom: 12 },
  resultTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  resultSubject: { fontSize: 14 },

  scoreCard: { borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1.5, marginBottom: 20 },
  scoreCircle: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginBottom: 16 },
  scoreNumber: { fontSize: 34, fontWeight: 'bold' },
  scorePercent: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  passBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  passBadgeText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },

  resultStats: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  resultStat: { flex: 1, alignItems: 'center', borderRadius: 16, paddingVertical: 16, borderWidth: 1, gap: 4 },
  resultStatNum: { fontSize: 24, fontWeight: 'bold' },
  resultStatLabel: { fontSize: 11 },

  resultNotice: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  resultNoticeText: { fontSize: 13, fontWeight: '600', flex: 1 },

  aiBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, paddingVertical: 16, marginBottom: 12, width: '100%', justifyContent: 'center', shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  aiBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 16, paddingVertical: 14, marginBottom: 12, width: '100%', justifyContent: 'center', borderWidth: 1.5 },
  retryBtnText: { fontSize: 15, fontWeight: 'bold' },
  homeBtn: { borderRadius: 16, paddingVertical: 14, borderWidth: 1, width: '100%', alignItems: 'center' },
  homeBtnText: { fontSize: 15, fontWeight: '600' },

  // AI Analysis Screen
  analysisHeaderCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  analysisHeaderIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  analysisScrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  analysisBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  analysisBannerText: { fontSize: 13, fontWeight: '600', flex: 1 },
  analysisContent: { gap: 4 },
  analysisH1: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 8, lineHeight: 28 },
  analysisH2: { fontSize: 16, fontWeight: 'bold', marginTop: 18, marginBottom: 8, lineHeight: 24 },
  analysisBody: { fontSize: 14, lineHeight: 22, marginBottom: 2 },
  analysisBulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginVertical: 4 },
  analysisBulletDot: { width: 7, height: 7, borderRadius: 3.5, marginTop: 8 },
  analysisBulletText: { flex: 1, fontSize: 14, lineHeight: 22 },
  analysisNumBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  analysisNumText: { fontSize: 12, fontWeight: 'bold' },
  analysisDivider: { height: 1, marginVertical: 12 },
  analysisDoneBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, paddingVertical: 16, marginTop: 24, shadowColor: PURPLE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  analysisDoneBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  // Modal Sheet & Completed quiz card styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingBottom: 24, maxHeight: '85%', width: '100%', flexShrink: 1 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 4 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 14 },
  sheetIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sheetClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  classBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 10 },
  classBadgeText: { fontSize: 12, fontWeight: 'bold' },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', lineHeight: 26, marginBottom: 14 },
  infoGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  infoCard: { flex: 1, borderRadius: 14, padding: 12, borderWidth: 1, alignItems: 'center', gap: 4 },
  infoCardLabel: { fontSize: 11 },
  infoCardValue: { fontSize: 14, fontWeight: 'bold' },
  quizInfoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 14 },
  quizInfoText: { fontSize: 12, flex: 1, lineHeight: 18 },
  sheetFooter: { borderTopWidth: 1, paddingTop: 14 },
  closeBtn: { flexDirection: 'row', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  doneNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 14 },
  doneNoticeText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 19 },
  completedContainer: { alignItems: 'center', marginVertical: 10, width: '100%' },
  trophyWrapper: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  trophyEmoji: { fontSize: 36 },
  completedHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  scoreBadgeContainer: { width: '100%', borderRadius: 16, borderWidth: 1, padding: 16, alignItems: 'center' },
  scoreRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', alignItems: 'center' },
  scoreLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 4 },
  scoreValue: { fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  scoreDivider: { width: 1, height: 36 },

  // Empty State Styles
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 30, paddingVertical: 20 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

export default QuizScreen;
