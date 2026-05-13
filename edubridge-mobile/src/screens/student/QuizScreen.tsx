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

const PURPLE = '#7C3AED';

const QuizScreen = () => {
  const [timeLeft, setTimeLeft] = useState(465); // 7:45 in seconds
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(3);

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

  const answers = ['A', 'B', 'C', 'D'];
  const answerTexts = [
    'Percepatan adalah perubahan kecepatan per satuan waktu',
    'Gaya yang menyebabkan perubahan kecepatan benda',
    'Jarak yang ditempuh benda dalam satuan waktu',
    'Arah gerakan benda terhadap titik acuan',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with Progress and Timer */}
        <View style={styles.header}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>Soal {currentQuestion} dari 10</Text>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[PURPLE, '#5B21B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${(currentQuestion / 10) * 100}%` }]}
              />
            </View>
          </View>

          <View style={styles.timer}>
            <Text style={styles.timerIcon}>⏱️</Text>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={styles.questionText}>
            Apa yang dimaksud dengan percepatan dalam fisika?
          </Text>
        </View>

        {/* Answer Options */}
        <View style={styles.answersSection}>
          {answers.map((answer, idx) => (
            <Pressable
              key={answer}
              style={[
                styles.answerCard,
                selectedAnswer === answer && styles.answerCardSelected,
              ]}
              onPress={() => setSelectedAnswer(answer)}
            >
              <View
                style={[
                  styles.answerLetter,
                  selectedAnswer === answer && styles.answerLetterSelected,
                ]}
              >
                <Text
                  style={[
                    styles.answerLetterText,
                    selectedAnswer === answer && styles.answerLetterTextSelected,
                  ]}
                >
                  {answer}
                </Text>
              </View>
              <Text style={styles.answerText}>{answerTexts[idx]}</Text>
            </Pressable>
          ))}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationSection}>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              styles.navButtonSecondary,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.navButtonTextSecondary}>← Sebelumnya</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              styles.navButtonPrimary,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Text style={styles.navButtonTextPrimary}>Selanjutnya →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 30,
  },
  progressInfo: {
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PURPLE,
    paddingVertical: 12,
    borderRadius: 8,
  },
  timerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  questionSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    lineHeight: 24,
  },
  answersSection: {
    marginBottom: 30,
    gap: 12,
  },
  answerCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  answerCardSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  answerLetter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  answerLetterSelected: {
    backgroundColor: '#fff',
  },
  answerLetterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  answerLetterTextSelected: {
    color: PURPLE,
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  navigationSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: PURPLE,
  },
  navButtonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  navButtonTextPrimary: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  navButtonTextSecondary: {
    color: PURPLE,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default QuizScreen;