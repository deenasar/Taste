import React, { useContext, useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, TouchableOpacity, Image, Dimensions } from 'react-native';
import { AppContext } from '@/App';
import { QUIZ_QUESTIONS, CATEGORY_ICONS, OPTION_AFFINITY } from '@/constants';
import { SparklesIcon, XCircleIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface MirrorItem {
  id: string;
  title: string;
  category: string;
  sparkles: number;
  reflection: string;
  archetypeQuote: string;
  image: string;
  score: number;
}

const getSparkleCount = (score: number): number => {
  if (score >= 0.75) return 3;
  if (score >= 0.5) return 2;
  if (score >= 0.3) return 1;
  return 0;
};

const MirrorShimmer: React.FC<{ children: React.ReactNode; intensity: number; archetype: any }> = ({ children, intensity, archetype }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (intensity === 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [intensity, shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.shimmerContainer}>
      {children}
      {intensity === 3 && (
        <Animated.View 
          style={[
            styles.shimmerOverlay,
            { opacity: shimmerOpacity, backgroundColor: `${archetype.gradientColors[0]}20` }
          ]}
        />
      )}
    </View>
  );
};

const SparkleRating: React.FC<{ score: number; onPress?: () => void }> = ({ score, onPress }) => {
  const scaleAnims = useRef([new Animated.Value(1), new Animated.Value(1), new Animated.Value(1)]).current;

  const handlePress = () => {
    scaleAnims.forEach((anim, index) => {
      if (index < score) {
        Animated.sequence([
          Animated.timing(anim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 1, duration: 150, useNativeDriver: true }),
        ]).start();
      }
    });
    onPress?.();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.sparkleContainer}>
      {[1, 2, 3].map(i => (
        <Animated.View key={i} style={{ transform: [{ scale: scaleAnims[i - 1] }] }}>
          <SparklesIcon 
            size={18} 
            color={i <= score ? '#FFD700' : '#e5e7eb'} 
            style={{ opacity: i <= score ? 1 : 0.3 }} 
          />
        </Animated.View>
      ))}
    </TouchableOpacity>
  );
};

const MirrorCard: React.FC<{ item: MirrorItem; archetype: any; darkMode: boolean; index: number }> = ({ 
  item, archetype, darkMode, index 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]).start();
    }, delay);

    // Pulse animation for high-sparkle items
    if (item.sparkles >= 2) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [index]);

  const getCardStyle = () => {
    const archetypeColor = archetype.gradientColors[0];
    const baseStyle = {
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 12,
      borderColor: archetypeColor,
      shadowColor: archetypeColor,
    };

    switch (item.sparkles) {
      case 3:
        return {
          ...baseStyle,
          borderWidth: 2,
          shadowOpacity: 0.4,
        };
      case 2:
        return {
          ...baseStyle,
          borderWidth: 1.5,
          shadowOpacity: 0.3,
        };
      case 1:
        return {
          ...baseStyle,
          borderWidth: 1,
          shadowOpacity: 0.2,
        };
      default:
        return {
          ...baseStyle,
          borderWidth: 1,
          borderStyle: 'dashed',
          shadowOpacity: 0.1,
        };
    }
  };

  const getGradientColors = () => {
    const archetypeColor = archetype.gradientColors[0];
    return ['#ffffff', `${archetypeColor}40`];
  };

  const CategoryIcon = CATEGORY_ICONS[item.category.toLowerCase()];

  return (
    <Animated.View 
      style={[
        { 
          opacity: fadeAnim, 
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim }
          ] 
        }
      ]}
    >
      <MirrorShimmer intensity={item.sparkles} archetype={archetype}>
        <View
          style={[
            styles.mirrorCard,
            { backgroundColor: darkMode ? '#374151' : '#ffffff' },
            getCardStyle()
          ]}
        >
          {!darkMode && (
            <LinearGradient
              colors={getGradientColors()}
              style={styles.gradientOverlay}
            />
          )}
          {/* Mirror reflection effect */}
          <View style={styles.mirrorReflection} />
          
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <View style={styles.thumbnailContainer}>
                {CategoryIcon && (
                  <CategoryIcon size={24} color={darkMode ? '#ffffff' : archetype.color} />
                )}
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.cardThumbnail}
                  defaultSource={{ uri: 'https://via.placeholder.com/40x40/cccccc/ffffff?text=?' }}
                />
              </View>
              <View style={styles.cardTitleContainer}>
                <Text style={[styles.cardTitle, { color: darkMode ? '#ffffff' : '#1f2937' }]}>
                  {item.title}
                </Text>
                <Text style={[styles.cardCategory, { color: darkMode ? '#d1d5db' : '#6b7280' }]}>
                  {item.category}
                </Text>
              </View>
            </View>
            <SparkleRating score={item.sparkles} />
          </View>

          <Text style={[styles.cardReflection, { color: darkMode ? '#e5e7eb' : '#4b5563' }]}>
            {item.reflection}
          </Text>

          <View style={[styles.quoteContainer, { backgroundColor: darkMode ? '#374151' : `${archetype.color}25` }]}>
            <View style={styles.quoteBubble}>
              <Text style={styles.quoteEmoji}>🪞</Text>
              <Text style={[styles.cardQuote, { color: darkMode ? '#ffffff' : archetype.color }]}>
                "{item.archetypeQuote}"
              </Text>
            </View>
          </View>
        </View>
      </MirrorShimmer>
    </Animated.View>
  );
};

const MismatchReflection: React.FC<{ items: MirrorItem[]; archetype: any; darkMode: boolean }> = ({ 
  items, archetype, darkMode 
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (items.length > 0) {
      setTimeout(() => {
        Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      }, 1000);
    }
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <Animated.View 
      style={[
        styles.mismatchContainer,
        { 
          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
          transform: [{ scale: bounceAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
        style={styles.mismatchGradient}
      >
        <View style={styles.mismatchHeader}>
          <XCircleIcon size={28} color="#ef4444" />
          <Text style={[styles.mismatchTitle, { color: darkMode ? '#ffffff' : '#1f2937' }]}>
            Hmm... This doesn't quite reflect you
          </Text>
        </View>
        
        <Text style={[styles.mismatchSubtitle, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
          These choices don't mirror your {archetype.name} essence. Exploring new territories? 🤔
        </Text>

        {items.slice(0, 3).map((item, index) => (
          <View key={item.id} style={styles.mismatchItem}>
            <View style={styles.mismatchThumbnail}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.mismatchImage}
                defaultSource={{ uri: 'https://via.placeholder.com/32x32/cccccc/ffffff?text=?' }}
              />
              <View style={styles.crackedOverlay} />
            </View>
            <Text style={[styles.mismatchItemText, { color: darkMode ? '#d1d5db' : '#4b5563' }]}>
              {item.title}
            </Text>
            <View style={styles.brokenSparkle}>
              <SparklesIcon size={14} color="#9ca3af" style={{ opacity: 0.5 }} />
              <Text style={styles.brokenEmoji}>💔</Text>
            </View>
          </View>
        ))}

        {items.length > 3 && (
          <Text style={[styles.moreItems, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
            +{items.length - 3} more items don't quite fit...
          </Text>
        )}
      </LinearGradient>
    </Animated.View>
  );
};

const MirrorOfYou: React.FC = () => {
  const context = useContext(AppContext);
  const [totalScore, setTotalScore] = useState(0);
  
  if (!context || !context.result) return null;

  const { darkMode, preferences = {}, result: { archetype } } = context;

  const mirrorItems = useMemo(() => {
    const items: MirrorItem[] = [];
    let scoreSum = 0;
    let itemCount = 0;
    
    QUIZ_QUESTIONS.forEach(question => {
      const category = question.id;
      const selectedOptions = preferences[category] || [];
      
      selectedOptions.forEach((option: string) => {
        const rawScore = (OPTION_AFFINITY[option]?.[archetype.name] || 0) / 3;
        const sparkles = getSparkleCount(rawScore);
        
        scoreSum += rawScore;
        itemCount++;
        
        const reflections = {
          3: `This perfectly mirrors your ${archetype.name} soul - it's like looking into your cultural DNA!`,
          2: `A beautiful reflection of your ${archetype.name} nature, showing your authentic taste.`,
          1: `This somewhat reflects your ${archetype.name} spirit, adding an interesting dimension.`,
          0: `This creates an intriguing contrast to your ${archetype.name} essence.`
        };

        const quotes = {
          3: [`This is pure you!`, `Your essence shines here`, `Perfect reflection!`, `So authentically you`],
          2: [`Great taste showing`, `Your vibe is strong`, `Nice reflection`, `I see your soul`],
          1: [`Interesting choice`, `Expanding horizons`, `Curious reflection`, `New territory`],
          0: [`Plot twist moment`, `Breaking the mirror`, `Unexpected path`, `Rebel choice`]
        };

        items.push({
          id: `${category}-${option}`,
          title: option,
          category: category.charAt(0).toUpperCase() + category.slice(1),
          sparkles,
          reflection: reflections[sparkles as keyof typeof reflections],
          archetypeQuote: quotes[sparkles as keyof typeof quotes][Math.floor(Math.random() * quotes[sparkles as keyof typeof quotes].length)],
          image: `https://picsum.photos/40/40?random=${items.length + 1}`,
          score: rawScore
        });
      });
    });

    setTotalScore(itemCount > 0 ? Math.round((scoreSum / itemCount) * 100) : 0);
    return items.sort((a, b) => b.sparkles - a.sparkles);
  }, [preferences, archetype]);

  const mismatchItems = mirrorItems.filter(item => item.sparkles === 0);
  const reflectionItems = mirrorItems.filter(item => item.sparkles > 0);

  const renderItem = ({ item, index }: { item: MirrorItem; index: number }) => (
    <MirrorCard item={item} archetype={archetype} darkMode={darkMode} index={index} />
  );

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#111827' : '#f9fafb' }]}>
      <LinearGradient
        colors={darkMode ? ['#374151', archetype.color + '20'] : ['#ffffff', archetype.color + '20']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: darkMode ? '#000000' : '#1f2937' }]}>
            🪞 Mirror of You
          </Text>
          <Text style={[styles.subtitle, { color: darkMode ? '#000000' : '#6b7280' }]}>
            Your cultural reflection as a {archetype.name}
          </Text>
          <View style={styles.scoreContainer}>
            <Text style={[styles.scoreLabel, { color: darkMode ? '#000000' : '#4b5563' }]}>
              Mirror Clarity
            </Text>
            <Text style={[styles.scoreValue, { color: darkMode ? '#000000' : archetype.color }]}>
              {totalScore}%
            </Text>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={reflectionItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={() => (
          <MismatchReflection items={mismatchItems} archetype={archetype} darkMode={darkMode} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Rubik',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Lato',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  scoreLabel: {
    fontFamily: 'Lato',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: 'Rubik',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 12,
  },
  shimmerContainer: {
    position: 'relative',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  mirrorCard: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  mirrorReflection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  cardThumbnail: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginTop: 4,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cardCategory: {
    fontFamily: 'Lato',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 1,
  },
  sparkleContainer: {
    flexDirection: 'row',
    gap: 6,
    padding: 8,
  },
  cardReflection: {
    fontFamily: 'Lato',
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  quoteContainer: {
    borderRadius: 12,
    padding: 12,
  },
  quoteBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  cardQuote: {
    fontFamily: 'Rubik',
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    flex: 1,
    lineHeight: 16,
  },
  mismatchContainer: {
    borderRadius: 16,
    marginTop: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ef4444',
    borderStyle: 'dashed',
  },
  mismatchGradient: {
    padding: 16,
  },
  mismatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mismatchTitle: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  mismatchSubtitle: {
    fontFamily: 'Lato',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  mismatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(239, 68, 68, 0.2)',
  },
  mismatchThumbnail: {
    position: 'relative',
    marginRight: 12,
  },
  mismatchImage: {
    width: 28,
    height: 28,
    borderRadius: 6,
    opacity: 0.6,
  },
  crackedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 6,
  },
  mismatchItemText: {
    fontFamily: 'Lato',
    fontSize: 13,
    flex: 1,
  },
  brokenSparkle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brokenEmoji: {
    fontSize: 14,
  },
  moreItems: {
    fontFamily: 'Lato',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
});

export default MirrorOfYou;