import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { quizAPI, aiAPI } from '../../services/api';

const PURPLE = '#7C3AED';

// Default class ID — in production, this comes from navigation params
const DEFAULT_CLASS_ID = 'default-class';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

const QuizScreen = () => {
  const [phase, setPhase] = useState<'start' | 'playing' | 'result'>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(8 * 60); // 8 menit
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (phase === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleFinish(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startQuiz = async () => {
    setLoading(true);
    try {
      const res = await quizAPI.startQuiz(DEFAULT_CLASS_ID, 10);
      const data = res.data || res;
      setSessionId(data.sessionId);
      // Map questions from backend format
      const qs: Question[] = (data.questions || []).map((q: any) => ({
        id: q.id,
        text: q.text,
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
      if (qs.length === 0) throw new Error('no questions');
      setQuestions(qs);
      setCurrentIndex(0);
      setSelected(null);
      setAnswered(false);
      setCorrectCount(0);
      setTimer(8 * 60);
      setPhase('playing');
    } catch {
      // Fallback to AI-generated quiz
      try {
        const aiRes = await aiAPI.generateQuiz('Matematika SMA - Persamaan Linear dan Kuadrat', 5);
        const generated = aiRes.data || aiRes;
        const qs: Question[] = (generated.questions || generated || []).map((q: any, i: number) => ({
          id: `q${i}`,
          text: q.question || q.text || '',
          options: q.options ? Object.values(q.options) : [],
          correctAnswer: q.correct_answer || q.correctAnswer || 'A',
          explanation: q.explanation || '',
        }));
        if (qs.length > 0) {
          setQuestions(qs);
          setCurrentIndex(0);
          setSelected(null);
          setAnswered(false);
          setCorrectCount(0);
          setTimer(8 * 60);
          setPhase('playing');
        } else {
          Alert.alert('Info', 'Belum ada soal di kelas ini. Minta guru untuk menambahkan soal.');
        }
      } catch {
        Alert.alert('Info', 'Belum ada soal tersedia. Hubungi guru kamu ya!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (opt: string) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    const q = questions[currentIndex];
    const correct = opt === q.correctAnswer;
    setIsCorrect(correct);
    if (correct) setCorrectCount(c => c + 1);

    if (sessionId) {
      try {
        await quizAPI.answerQuestion(sessionId, q.id, opt, 30);
      } catch {}
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      handleFinish();
    } else {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setAnswered(false);
      setIsCorrect(null);
    }
  };

  const handleFinish = async () => {
    clearInterval(timerRef.current);
    const finalScore = Math.round((correctCount / questions.length) * 100);
    setScore(finalScore);
    if (sessionId) {
      try { await quizAPI.finishQuiz(sessionId); } catch {}
    }
    setPhase('result');
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E'];

  // START SCREEN
  if (phase === 'start') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startContainer}>
          <LinearGradient colors={[PURPLE, '#5B21B6']} style={styles.startIcon}>
            <Ionicons name="help-circle" size={48} color="#fff" />
          </LinearGradient>
          <Text style={styles.startTitle}>Quiz Adaptif</Text>
          <Text style={styles.startSub}>
            Sistem akan menyesuaikan tingkat kesulitan soal berdasarkan jawabanmu secara otomatis.
          </Text>
          <View style={styles.startInfoRow}>
            {[['📝', '10 Soal'], ['⏱️', '8 Menit'], ['🧠', 'Adaptif']].map(([icon, label], i) => (
              <View key={i} style={styles.startInfoItem}>
                <Text style={styles.startInfoIcon}>{icon}</Text>
                <Text style={styles.startInfoLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.startBtn} onPress={startQuiz} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>Mulai Quiz</Text>}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // RESULT SCREEN
  if (phase === 'result') {
    const emoji = score >= 80 ? '🎉' : score >= 60 ? '👍' : '💪';
    const msg = score >= 80 ? 'Luar Biasa!' : score >= 60 ? 'Bagus!' : 'Tetap Semangat!';
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <LinearGradient colors={[PURPLE, '#5B21B6']} style={styles.resultCircle}>
            <Text style={styles.resultEmoji}>{emoji}</Text>
            <Text style={styles.resultScore}>{score}%</Text>
          </LinearGradient>
          <Text style={styles.resultTitle}>{msg}</Text>
          <Text style={styles.resultSub}>{correctCount} dari {questions.length} soal benar</Text>
          <View style={styles.resultCards}>
            {[['Benar', correctCount, '#10B981'], ['Salah', questions.length - correctCount, '#EF4444'], ['Skor', `${score}%`, PURPLE]].map(([label, val, color], i) => (
              <View key={i} style={styles.resultCard}>
                <Text style={[styles.resultCardVal, { color: color as string }]}>{val}</Text>
                <Text style={styles.resultCardLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Pressable style={styles.startBtn} onPress={() => setPhase('start')}>
            <Text style={styles.startBtnText}>Ulangi Quiz</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // PLAYING SCREEN
  const q = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.quizHeader}>
        <Pressable onPress={() => Alert.alert('Keluar?', 'Progres quiz akan hilang', [
          { text: 'Batal', style: 'cancel' },
          { text: 'Keluar', onPress: () => setPhase('start'), style: 'destructive' },
        ])}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.quizCounter}>Soal {currentIndex + 1} dari {questions.length}</Text>
        <View style={[styles.timerBadge, timer < 60 && { backgroundColor: '#FEE2E2' }]}>
          <Ionicons name="time-outline" size={14} color={timer < 60 ? '#EF4444' : PURPLE} />
          <Text style={[styles.timerText, timer < 60 && { color: '#EF4444' }]}>{formatTime(timer)}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.quizBody}>
        {/* Question */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{q?.text}</Text>
        </View>

        {/* Options */}
        {q?.options.map((opt, idx) => {
          const label = optionLabels[idx];
          let bg = '#fff', borderColor = '#E2E8F0', textColor = '#1E293B', labelBg = '#F1F5F9', labelColor = '#64748B';
          if (answered && selected === opt) {
            if (isCorrect) {
              bg = '#F0FDF4'; borderColor = '#10B981'; textColor = '#065F46'; labelBg = '#10B981'; labelColor = '#fff';
            } else {
              bg = '#FFF1F2'; borderColor = '#EF4444'; textColor = '#991B1B'; labelBg = '#EF4444'; labelColor = '#fff';
            }
          } else if (answered && opt === q.correctAnswer && !isCorrect) {
            bg = '#F0FDF4'; borderColor = '#10B981'; textColor = '#065F46';
          }
          return (
            <Pressable key={idx} style={[styles.option, { backgroundColor: bg, borderColor }]} onPress={() => handleSelect(opt)}>
              <View style={[styles.optionLabel, { backgroundColor: labelBg }]}>
                <Text style={[styles.optionLabelText, { color: labelColor }]}>{label}</Text>
              </View>
              <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
            </Pressable>
          );
        })}

        {answered && q?.explanation && (
          <View style={styles.explanation}>
            <Text style={styles.explanationTitle}>💡 Penjelasan</Text>
            <Text style={styles.explanationText}>{q.explanation}</Text>
          </View>
        )}
      </ScrollView>

      {answered && (
        <View style={styles.nextBtnContainer}>
          <Pressable style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {currentIndex + 1 >= questions.length ? 'Lihat Hasil' : 'Selanjutnya'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  // Start
  startContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  startIcon: { width: 100, height: 100, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  startTitle: { fontSize: 26, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  startSub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  startInfoRow: { flexDirection: 'row', gap: 24, marginBottom: 40 },
  startInfoItem: { alignItems: 'center' },
  startInfoIcon: { fontSize: 28, marginBottom: 6 },
  startInfoLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  startBtn: { width: '100%', backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  startBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  // Result
  resultContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  resultCircle: { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  resultEmoji: { fontSize: 32, marginBottom: 4 },
  resultScore: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  resultTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  resultSub: { fontSize: 14, color: '#64748B', marginBottom: 32 },
  resultCards: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  resultCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  resultCardVal: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  resultCardLabel: { fontSize: 12, color: '#64748B' },
  // Playing
  quizHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  quizCounter: { fontSize: 15, fontWeight: '600', color: '#1E293B' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EDE9FE', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  timerText: { fontSize: 13, fontWeight: 'bold', color: PURPLE },
  progressBarBg: { height: 4, backgroundColor: '#E2E8F0', marginHorizontal: 20 },
  progressBarFill: { height: '100%', backgroundColor: PURPLE, borderRadius: 2 },
  quizBody: { padding: 20 },
  questionCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  questionText: { fontSize: 16, fontWeight: '600', color: '#1E293B', lineHeight: 26 },
  option: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 2, padding: 14, marginBottom: 10 },
  optionLabel: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  optionLabelText: { fontSize: 14, fontWeight: 'bold' },
  optionText: { flex: 1, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  explanation: { backgroundColor: '#FFF7ED', borderRadius: 12, padding: 16, marginTop: 8 },
  explanationTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400E', marginBottom: 6 },
  explanationText: { fontSize: 13, color: '#78350F', lineHeight: 20 },
  nextBtnContainer: { padding: 20 },
  nextBtn: { backgroundColor: PURPLE, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextBtnText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});

export default QuizScreen;