import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface FutureEchoCardProps {
  nextArchetype: {
    name: string;
    emoji: string;
    description: string;
  };
  onUnlockNext?: () => void;
  darkMode?: boolean;
}

const FutureEchoCard: React.FC<FutureEchoCardProps> = ({
  nextArchetype,
  onUnlockNext,
  darkMode = false,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  
  const orbPulse = useRef(new Animated.Value(1)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const descriptionFade = useRef(new Animated.Value(0)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb pulsing
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(orbPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Sparkle rotation
    Animated.loop(
      Animated.timing(sparkleRotate, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();

    // Title fade in
    Animated.timing(titleFade, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleReveal = () => {
    if (!isRevealed) {
      setIsRevealed(true);
      Animated.timing(descriptionFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  };

  const CrystalOrb = () => (
    <Animated.View
      style={[
        styles.orbContainer,
        {
          transform: [{ scale: orbPulse }],
        },
      ]}
    >
      <LinearGradient
        colors={['#E8D5FF', '#A864F1', '#7C3AED']}
        style={styles.orbGradient}
      >
        <Svg width={100} height={100} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="innerGlow" cx="0.3" cy="0.3">
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <Stop offset="50%" stopColor="#A864F1" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#7C3AED" stopOpacity="0.2" />
            </RadialGradient>
          </Defs>
          <Circle
            cx="50"
            cy="50"
            r="45"
            fill="url(#innerGlow)"
          />
          <Circle
            cx="35"
            cy="35"
            r="6"
            fill="#ffffff"
            opacity="0.7"
          />
        </Svg>
      </LinearGradient>
    </Animated.View>
  );

  const FloatingSparkles = () => (
    <Animated.View
      style={[
        styles.sparklesContainer,
        {
          transform: [
            {
              rotate: sparkleRotate.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}
    >
      {['✨', '⭐', '💫', '🌟'].map((sparkle, i) => (
        <Text
          key={i}
          style={[
            styles.sparkle,
            {
              transform: [
                { rotate: `${i * 90}deg` },
                { translateY: -60 },
              ],
            },
          ]}
        >
          {sparkle}
        </Text>
      ))}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={darkMode ? ['#1F2937', '#374151'] : ['#F0F9FF', '#E0F2FE', '#BAE6FD']}
        style={styles.background}
      >
        <View style={styles.tooltipContainer}>
          <Text style={styles.tooltip}>Crystal Insight ✨</Text>
        </View>
        
        <FloatingSparkles />
        
        <View style={styles.content}>
          <CrystalOrb />
          
          <Text style={[styles.label, { color: darkMode ? '#D1D5DB' : '#6B7280' }]}>
            Your Next Archetype:
          </Text>
          
          <Animated.View style={{ opacity: titleFade }}>
            <Text style={[styles.archetypeTitle, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>
              {nextArchetype.emoji} {nextArchetype.name}
            </Text>
          </Animated.View>
          
          {!isRevealed && (
            <TouchableOpacity
              style={styles.revealButton}
              onPress={handleReveal}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#A864F1', '#8B5CF6']}
                style={styles.revealButtonGradient}
              >
                <Text style={styles.revealButtonText}>Tap to Reveal</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isRevealed && (
            <Animated.View style={[styles.descriptionContainer, { opacity: descriptionFade }]}>
              <Text style={[styles.descriptionText, { color: darkMode ? '#E5E7EB' : '#374151' }]}>
                {nextArchetype.description}
              </Text>
              
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={onUnlockNext}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF9E48', '#F59E0B']}
                  style={styles.unlockButtonGradient}
                >
                  <Text style={styles.unlockButtonText}>✨ Unlock Next Prediction</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  background: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 16,
    right: 20,
  },
  tooltip: {
    fontSize: 12,
    color: '#A864F1',
    fontWeight: '600',
    opacity: 0.8,
  },
  content: {
    alignItems: 'center',
    paddingTop: 20,
  },
  orbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  orbGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A864F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  sparklesContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    width: 32,
    height: 32,
  },
  sparkle: {
    position: 'absolute',
    left: 14,
    top: 14,
    fontSize: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  archetypeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  revealButton: {
    marginTop: 8,
  },
  revealButtonGradient: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 25,
  },
  revealButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionContainer: {
    marginTop: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  unlockButton: {
    marginTop: 8,
  },
  unlockButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  unlockButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FutureEchoCard;