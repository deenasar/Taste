import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Share,
  Dimensions,
  Modal,
} from 'react-native';
import { getDailyPuzzle } from '@/constants';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface CompactTastePuzzleProps {
  darkMode?: boolean;
}

const CompactTastePuzzle: React.FC<CompactTastePuzzleProps> = ({ darkMode = false }) => {
  const [puzzle] = useState(getDailyPuzzle());
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const archetypeEmojis = ['🌊', '🎭', '✨', '🔮'];

  useEffect(() => {
    AsyncStorage.getItem('taste_puzzle_streak').then(val => setStreak(parseInt(val || '0', 10)));
    AsyncStorage.getItem('taste_puzzle_last_played').then(val => setHasPlayed(val === new Date().toISOString().split('T')[0]));
    
    // Gentle float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleChoiceSelect = (choice: string) => {
    console.log('Choice selected:', choice);
    if (isRevealed) {
      console.log('Already revealed');
      return;
    }

    const isCorrect = choice === puzzle.correct_answer;
    console.log('Is correct:', isCorrect);
    
    // Bounce animation
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setSelectedChoice(choice);
    setIsRevealed(true);
    
    AsyncStorage.getItem('taste_puzzle_streak').then(val => {
      const currentStreak = parseInt(val || '0', 10);
      const newStreak = isCorrect ? currentStreak + 1 : 0;
      AsyncStorage.setItem('taste_puzzle_streak', newStreak.toString());
      AsyncStorage.setItem('taste_puzzle_last_played', new Date().toISOString().split('T')[0]);
      setStreak(newStreak);
      setHasPlayed(true);
      
      if (isCorrect) {
        setTimeout(() => setShowSuccessPopup(true), 500);
      }
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎯 Nailed today's Taste Puzzle! I'm a ${puzzle.correct_answer}! 🔥 ${streak}-day streak #TasteTribe`
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const styles = createStyles(darkMode);

  return (
    <View style={styles.container}>
      {/* Streak Indicator */}
      <View style={styles.streakBadge}>
        <Text style={styles.streakText}>🔥 {streak}</Text>
      </View>

      {/* Compact Puzzle Card */}
      <Animated.View style={[
        styles.puzzleCard,
        {
          transform: [{
            translateY: floatAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -4],
            }),
          }],
        },
      ]}>
        <LinearGradient
          colors={['#FFF8E1', '#F3E5AB', '#E8D5A3']}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.cardTitle}>🧩 Daily Taste Puzzle</Text>
          <View style={styles.cluesContainer}>
            {puzzle.clues.slice(0, 3).map((clue, index) => (
              <Text key={index} style={styles.clueText}>
                {clue.length > 45 ? clue.substring(0, 45) + '...' : clue}
              </Text>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Compact Choice Pills */}
      <View style={styles.choicesGrid}>
        {puzzle.choices.map((choice, index) => {
          const isSelected = selectedChoice === choice;
          const isCorrect = choice === puzzle.correct_answer;
          const showResult = isRevealed && (isSelected || isCorrect);
          
          return (
            <Animated.View key={index} style={{ transform: [{ scale: bounceAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.choicePill,
                  hasPlayed && styles.pillDisabled,
                  showResult && isCorrect && styles.pillCorrect,
                  showResult && isSelected && !isCorrect && styles.pillWrong,
                ]}
                onPress={() => {
                  console.log('TouchableOpacity pressed:', choice);
                  handleChoiceSelect(choice);
                }}
disabled={isRevealed}
                activeOpacity={0.8}
              >
                <Text style={styles.pillEmoji}>{archetypeEmojis[index]}</Text>
                <Text style={[
                  styles.pillText,
                  showResult && isCorrect && styles.pillTextCorrect,
                  showResult && isSelected && !isCorrect && styles.pillTextWrong,
                ]}>
                  {choice.length > 12 ? choice.substring(0, 12) + '...' : choice}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Wrong Answer Message */}
      {isRevealed && selectedChoice !== puzzle.correct_answer && (
        <View style={styles.wrongMessage}>
          <Text style={styles.wrongText}>Try again tomorrow! 😊</Text>
          <Text style={styles.revealText}>Answer: {puzzle.correct_answer}</Text>
        </View>
      )}

      {/* Success Popup */}
      <Modal visible={showSuccessPopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.successPopup}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Nailed it!</Text>
            <Text style={styles.successSubtitle}>You're like a {puzzle.correct_answer}!</Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <Text style={styles.btnIcon}>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.leaderBtn} onPress={() => setShowSuccessPopup(false)}>
                <Text style={styles.btnIcon}>📊</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  streakBadge: {
    position: 'absolute',
    top: 8,
    right: 16,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
  },
  puzzleCard: {
    width: width * 0.9,
    height: height * 0.25,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: 16,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 12,
  },
  cluesContainer: {
    alignItems: 'center',
  },
  clueText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#8B4513',
    marginBottom: 4,
    fontWeight: '500',
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: width * 0.9,
    gap: 8,
  },
  choicePill: {
    width: (width * 0.9 - 8) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    minHeight: 48,
  },
  pillDisabled: {
    opacity: 0.6,
  },
  pillCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  pillWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  pillEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  pillTextCorrect: {
    color: '#065F46',
  },
  pillTextWrong: {
    color: '#991B1B',
  },
  wrongMessage: {
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  wrongText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  revealText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successPopup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: width * 0.75,
    elevation: 10,
  },
  successEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  shareBtn: {
    backgroundColor: '#8B5CF6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderBtn: {
    backgroundColor: '#F3F4F6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIcon: {
    fontSize: 18,
  },
});

export default CompactTastePuzzle;