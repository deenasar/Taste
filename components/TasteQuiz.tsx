import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { AppContext } from '@/App';
import type { RootStackParamList } from '@/App';
import { QUIZ_QUESTIONS, ARCHETYPES, CATEGORY_ICONS } from '@/constants';
import { generateArchetype } from '@/services/geminiService';
import type { UserPreferences } from '@/types';
import { SparklesIcon, CheckIcon } from 'react-native-heroicons/solid';

const TasteQuiz: React.FC = () => {
  const context = useContext(AppContext);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<UserPreferences>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!context) return null;

  const { darkMode, setPreferences, setResult } = context;
  const styles = createStyles(darkMode);

  const handleNext = () => {
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
      if(currentStep > 0) {
          setCurrentStep(currentStep - 1);
      }
  }

  const handleSubmit = async () => {
    setIsLoading(true);
    setPreferences(answers);
    const result = await generateArchetype(answers);
    const archetypeData = ARCHETYPES.find(a => a.name === result.archetypeName) || ARCHETYPES[0];
    
    setResult({
      archetype: archetypeData,
      summary: result.summary,
    });

    setIsLoading(false);
    navigation.navigate('ArchetypeReveal');
  };

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const Icon = CATEGORY_ICONS[currentQuestion.id];
  
  // Option colors mapping
  const getOptionData = (option: string, questionId: string) => {
    const colors = ['#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#06b6d4', '#f97316'];
    const optionIndex = currentQuestion.options.indexOf(option);
    return {
      color: colors[optionIndex % colors.length]
    };
  };

  // Option icons mapping
  const getOptionIcon = (option: string) => {
    const iconMap = {
      // Movies
      'Sci-Fi Thrillers': '🚀',
      'Historical Dramas': '🏛️',
      'A24 Films': '🎭',
      'Animated Features': '🎨',
      'Blockbuster Action': '💥',
      'Documentaries': '📹',
      'Romantic Comedies': '💕',
      'Foreign Language': '🌍',
      
      // Music
      'Indie Rock': '🎸',
      'Lofi Beats': '🎧',
      '80s Synth-pop': '🎹',
      'Classical': '🎼',
      'Hip-Hop': '🎤',
      'Folk': '🪕',
      'Electronic': '🎛️',
      'Jazz': '🎺',
      
      // Books
      'Fantasy Epics': '🐉',
      'Poetry Collections': '📝',
      'Biographies': '👤',
      'Classic Literature': '📚',
      'Non-fiction': '📖',
      'Graphic Novels': '💭',
      'Mystery & Thriller': '🔍',
      'Contemporary Fiction': '📘',
      
      // Travel
      'Backpacking SE Asia': '🎒',
      'Quiet Beach Towns': '🏖️',
      'European Capitals': '🏰',
      'National Park Hikes': '🥾',
      'Cultural Immersion': '🏛️',
      'Luxury Resorts': '🏨',
      'Road Trips': '🚗',
      'Mountain Retreats': '⛰️',
      
      // Food
      'Italian Cuisine': '🍝',
      'Asian Fusion': '🥢',
      'Street Food': '🌮',
      'Fine Dining': '🍽️',
      'Vegan/Vegetarian': '🥗',
      'BBQ & Grills': '🔥',
      'Desserts & Sweets': '🍰',
      'Coffee & Cafes': '☕',
      
      // Hobbies
      'Photography': '📷',
      'Cooking': '👨‍🍳',
      'Gardening': '🌱',
      'Fitness': '💪',
      'Gaming': '🎮',
      'Art & Crafts': '🎨',
      'Writing': '✍️',
      'Dancing': '💃',
      
      // Podcasts
      'True Crime': '🔍',
      'Comedy': '😂',
      'News & Politics': '📰',
      'Science & Tech': '🔬',
      'Self-Improvement': '📈',
      'History': '🏛️',
      'Fiction': '📚',
      'Interview Shows': '🎙️',
      
      // Video Games
      'RPGs': '⚔️',
      'FPS Games': '🔫',
      'Strategy': '♟️',
      'Indie Games': '🎮',
      'Simulation': '🏠',
      'Adventure': '🗺️',
      'Sports': '⚽',
      'Puzzle Games': '🧩',
      
      // TV Shows
      'Drama Series': '🎭',
      'Sitcoms': '😂',
      'Reality TV': '📺',
      'Anime': '🌸',
      'Crime Shows': '🕵️',
      'Fantasy/Sci-Fi': '🚀',
      'Documentaries': '📹',
      'Limited Series': '🎥',
      
      // Artists
      'Contemporary Art': '🎨',
      'Classical Paintings': '🖼️',
      'Street Art': '🎨',
      'Photography': '📷',
      'Digital Art': '💻',
      'Sculpture': '🗿',
      'Impressionism': '🌻',
      'Minimalism': '▫️',
      
      // Mirror
      'Eclectic Mix': '🌈',
      'Authentic Self': '✨',
      'Evolving Identity': '🔄',
      'Unique Perspective': '🔍',
      'Personal Journey': '🗺️',
      'Individual Expression': '🎨',
      'True Reflection': '🪞',
      'Own Path': '🚶‍♂️'
    };
    return iconMap[option] || '⭐';
  };

  const handleSelect = (option: string) => {
    const currentAnswers = answers[currentQuestion.id] || [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(item => item !== option)
      : [...currentAnswers, option];
    setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkMode ? '#8b5cf6' : '#6366f1'} />
        <Text style={styles.loadingTitle}>Analyzing your tastes...</Text>
        <Text style={styles.loadingSubtitle}>Our AI is crafting your unique personality archetype.</Text>
      </View>
    );
  }

  const hasSelection = (answers[currentQuestion.id] || []).length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View
          style={[styles.progressBar, { width: `${((currentStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }]}
        />
      </View>
      
      <ScrollView contentContainerStyle={styles.quizContent}>
        <View style={styles.questionHeader}>
          <View style={styles.iconContainer}>
            <Icon size={32} color='#10b981'/>
          </View>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>
        
        <View style={styles.optionsGrid}>
          {currentQuestion.options.map((option) => {
            const isSelected = (answers[currentQuestion.id] || []).includes(option);
            const optionData = getOptionData(option, currentQuestion.id);
            return (
              <TouchableOpacity
                key={option}
                onPress={() => handleSelect(option)}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? optionData.color : (darkMode ? '#374151' : '#ffffff'),
                    borderColor: isSelected ? optionData.color : (darkMode ? '#4b5563' : '#e5e7eb'),
                  }
                ]}
              >
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <CheckIcon size={16} color="#ffffff" />
                  </View>
                )}
                <View style={styles.optionIconContainer}>
                  <Text style={styles.optionIcon}>{getOptionIcon(option)}</Text>
                </View>
                <Text style={[
                  styles.optionText,
                  { color: isSelected ? '#ffffff' : (darkMode ? '#d1d5db' : '#374151') }
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={currentStep === 0}
          style={[styles.navButton, { opacity: currentStep === 0 ? 0.5 : 1 }]}
        >
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
      
        {currentStep < QUIZ_QUESTIONS.length - 1 ? (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navButton, hasSelection && styles.primaryButton]}
          >
            <Text style={hasSelection ? styles.primaryButtonText : styles.navButtonText}>{hasSelection ? 'Next' : 'Skip'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.navButton, styles.primaryButton, styles.revealButton]}
          >
            <SparklesIcon size={16} color="white" />
            <Text style={styles.primaryButtonText}>Reveal My Archetype</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#0f172a' : '#f0f9ff',
  },
  quizContent: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: darkMode ? '#0f172a' : '#f0f9ff',
  },
  loadingTitle: {
    fontSize: 24,
    fontFamily: 'Rubik',
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#111827',
  },
  loadingSubtitle: {
    fontSize: 16,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#374151',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: darkMode ? '#374151' : '#e5e7eb',
    marginTop: 50,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  questionHeader: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#10b98120',
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#111827',
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    minHeight: 120,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionIcon: {
    fontSize: 24,
  },
  optionText: {
    fontWeight: '600',
    fontFamily: 'Lato',
    textAlign: 'center',
    fontSize: 13,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 40,
    backgroundColor: darkMode ? '#0f172a' : '#f0f9ff',
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  revealButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButtonText: {
    fontWeight: 'bold',
    fontFamily: 'Lato',
    color: darkMode ? '#d1d5db' : '#111827',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Lato',
  },
});

export default TasteQuiz;