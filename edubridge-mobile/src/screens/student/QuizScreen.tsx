import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const PURPLE = '#7C3AED';
const LIGHT_PURPLE = '#F5F3FF';

const QuizScreen = () => {
  const [timeLeft, setTimeLeft] = useState(465); // 7:45 in seconds
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(3);
  const totalQuestions = 10;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answers = [
    { id: 'A', text: 'Jumlah cahaya matahari' },
    { id: 'B', text: 'Warna daun' },
    { id: 'C', text: 'Ukuran batang' },
    { id: 'D', text: 'Jenis tanah' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Soal {currentQuestion} dari {totalQuestions}</Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={18} color="#666" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentQuestion / totalQuestions) * 100}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Question Area */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>
            Manakah faktor utama yang mempengaruhi laju fotosintesis?
          </Text>
        </View>

        {/* Options Area */}
        <View style={styles.optionsArea}>
          {answers.map((item) => (
            <Pressable
              key={item.id}
              style={[
                styles.optionCard,
                selectedAnswer === item.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedAnswer(item.id)}
            >
              <View
                style={[
                  styles.radioBtn,
                  selectedAnswer === item.id && styles.radioBtnSelected,
                ]}
              >
                <Text style={[styles.optionId, selectedAnswer === item.id && styles.optionIdSelected]}>
                  {item.id}
                </Text>
              </View>
              <Text style={[styles.optionText, selectedAnswer === item.id && styles.optionTextSelected]}>
                {item.text}
              </Text>
              {selectedAnswer === item.id && (
                <Ionicons name="checkmark-circle" size={24} color={PURPLE} />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footer}>
        <Pressable style={styles.prevBtn}>
          <Text style={styles.prevBtnText}>Sebelumnya</Text>
        </Pressable>
        <Pressable style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>Selanjutnya</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: PURPLE,
  },
  content: {
    padding: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 28,
  },
  optionsArea: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  optionCardSelected: {
    borderColor: PURPLE,
    backgroundColor: LIGHT_PURPLE,
  },
  radioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  radioBtnSelected: {
    borderColor: PURPLE,
    backgroundColor: PURPLE,
  },
  optionId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  optionIdSelected: {
    color: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: PURPLE,
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  prevBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  prevBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: PURPLE,
    alignItems: 'center',
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});

export default QuizScreen;