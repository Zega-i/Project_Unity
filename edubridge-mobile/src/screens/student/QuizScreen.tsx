import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  SafeAreaView, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const PURPLE = '#7C3AED';
const PURPLE_LIGHT = '#F5F3FF';

const QUESTIONS = [
  {
    id: '1',
    question: 'Jika 2x + 5 = 15, maka nilai dari 3x - 2 adalah...',
    options: [
      { id: 'A', label: '13' },
      { id: 'B', label: '17' },
      { id: 'C', label: '18' },
      { id: 'D', label: '19' },
      { id: 'E', label: '20' },
    ],
    correct: 'B'
  }
];

const QuizScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(525); // 08:45 in seconds

  // Timer logic
  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = QUESTIONS[0];

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </Pressable>
        <View style={styles.timerBoxTop}>
          <Ionicons name="time-outline" size={18} color={PURPLE} />
          <Text style={styles.timerTextTop}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.questionCounter}>Soal 4 dari 10</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: '40%' }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Question Text */}
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardActive
                ]}
                onPress={() => setSelectedOption(opt.id)}
              >
                <View style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelActive
                ]}>
                  <Text style={[
                    styles.optionLabelText,
                    isSelected && styles.optionLabelTextActive
                  ]}>{opt.id}</Text>
                </View>
                <Text style={[
                  styles.optionText,
                  isSelected && styles.optionTextActive
                ]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <Pressable 
          style={[styles.nextBtn, !selectedOption && styles.nextBtnDisabled]} 
          disabled={!selectedOption}
          onPress={() => alert('Jawaban tersimpan!')}
        >
          <Text style={styles.nextBtnText}>Selanjutnya</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  timerBoxTop: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: PURPLE + '10', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  timerTextTop: { fontSize: 14, fontWeight: 'bold', color: PURPLE },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 15,
    paddingBottom: 15,
  },
  questionCounter: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  timerBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  progressBg: { height: 6, backgroundColor: '#F1F5F9', marginHorizontal: 25, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PURPLE, borderRadius: 3 },
  scrollContent: { paddingHorizontal: 25, paddingTop: 40, paddingBottom: 40 },
  questionText: { fontSize: 18, fontWeight: '700', color: '#1E293B', lineHeight: 28, marginBottom: 40 },
  optionsContainer: { gap: 12 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  optionCardActive: {
    backgroundColor: PURPLE_LIGHT,
    borderColor: PURPLE,
  },
  optionLabel: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionLabelActive: {
    backgroundColor: PURPLE,
  },
  optionLabelText: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  optionLabelTextActive: { color: '#FFFFFF' },
  optionText: { fontSize: 16, color: '#1E293B', fontWeight: '500' },
  optionTextActive: { color: PURPLE, fontWeight: '700' },
  footer: { padding: 25, backgroundColor: '#FFFFFF' },
  nextBtn: {
    backgroundColor: PURPLE,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default QuizScreen;