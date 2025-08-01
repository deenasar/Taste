import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Animated, Dimensions, ActivityIndicator, Image } from 'react-native';
import { PanGestureHandler, TapGestureHandler, State } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppContext } from '@/App';
import { ARCHETYPES } from '@/constants';
import { 
  SparklesIcon, FireIcon, ClockIcon, TagIcon, HeartIcon, XMarkIcon, ArrowRightIcon,
  SunIcon, ClockIcon as AfternoonIcon, MoonIcon, BoltIcon, GlobeAltIcon, 
  UserPlusIcon, ArrowPathIcon, ChartBarIcon, EyeIcon, HandThumbUpIcon,
  HandThumbDownIcon, SwatchIcon, ArrowPathRoundedSquareIcon
} from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList } from '@/App';

const { width } = Dimensions.get('window');





const StepOutsideBubble: React.FC = () => {
  const context = useContext(AppContext);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [showCardBack, setShowCardBack] = useState(false);
  const [exploredArchetypes, setExploredArchetypes] = useState(4);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [savedCards, setSavedCards] = useState<string[]>([]);
  const [showSwipeInstructions, setShowSwipeInstructions] = useState(true);
  const [translateX] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(0));
  const [rotate] = useState(new Animated.Value(0));
  const [cardOpacity] = useState(new Animated.Value(1));
  const [cardScale] = useState(new Animated.Value(1));
  const [journeyCards, setJourneyCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [swapDeckCards, setSwapDeckCards] = useState([]);
  const [swapDeckLoading, setSwapDeckLoading] = useState(true);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
  const [modalRecommendations, setModalRecommendations] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [itemDetails, setItemDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [iconErrors, setIconErrors] = useState({});
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(0);
  const [cardReactions, setCardReactions] = useState({});

  const getFallbackJourneyCards = () => [
    {
      time: 'Morning',
      archetype: 'Cultural Curator',
      content: 'Start your day with a curated selection of indie folk music while reading art reviews.',
      item: 'Bon Iver - For Emma',
      emoji: '🌅'
    },
    {
      time: 'Afternoon', 
      archetype: 'Tech Futurist',
      content: 'Dive into a podcast about emerging technologies and their cultural impact.',
      item: 'Lex Fridman Podcast',
      emoji: '☀️'
    },
    {
      time: 'Night',
      archetype: 'Retro Reviver', 
      content: 'Wind down with a classic film that defined a generation.',
      item: 'Blade Runner (1982)',
      emoji: '🌙'
    }
  ];

  // Fetch walk in their shoes data with daily caching
  const fetchWalkInTheirShoesData = async () => {
    try {
      setLoading(true);
      const today = new Date().toDateString();
      const mismatchCacheKey = `mismatchWalkInShoes_${today}`;
      const cachedMismatchData = await AsyncStorage.getItem(mismatchCacheKey);
      
      if (cachedMismatchData) {
        console.log('📅 Using cached mismatch walk in shoes data');
        const cachedData = JSON.parse(cachedMismatchData);
        if (cachedData.journey_cards) {
          const cardsArray = [
            { time: 'Morning', ...cachedData.journey_cards.morning, emoji: '🌅' },
            { time: 'Afternoon', ...cachedData.journey_cards.afternoon, emoji: '☀️' },
            { time: 'Night', ...cachedData.journey_cards.night, emoji: '🌙' }
          ];
          setJourneyCards(cardsArray);
          await AsyncStorage.setItem('walkInTheirShoesDate', today);
          await AsyncStorage.setItem('walkInTheirShoesData', JSON.stringify(cardsArray));
        }
        setLoading(false);
        return;
      }
      
      console.log('🔄 Fetching fresh walk in their shoes data from Flask...');
      const response = await fetch('https://taste-backend-fxwh.onrender.com/mismatch-walkin-their-shoes-gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archetype: context?.result?.archetype?.name || 'Taste Explorer'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Flask response data:', data);
        
        // Cache the mismatch response
        await AsyncStorage.setItem(mismatchCacheKey, JSON.stringify(data));
        console.log('💾 Cached mismatch walk in shoes data');
        
        if (data.journey_cards) {
          const cardsArray = [
            { time: 'Morning', ...data.journey_cards.morning, emoji: '🌅' },
            { time: 'Afternoon', ...data.journey_cards.afternoon, emoji: '☀️' },
            { time: 'Night', ...data.journey_cards.night, emoji: '🌙' }
          ];
          setJourneyCards(cardsArray);
          
          // Cache the processed data
          await AsyncStorage.setItem('walkInTheirShoesDate', today);
          await AsyncStorage.setItem('walkInTheirShoesData', JSON.stringify(cardsArray));
          console.log('💾 Successfully cached processed data');
        } else {
          console.log('❌ No journey_cards in Flask response, using fallback');
          const fallbackCards = getFallbackJourneyCards();
          setJourneyCards(fallbackCards);
          
          // Cache fallback data too
          await AsyncStorage.setItem('walkInTheirShoesDate', today);
          await AsyncStorage.setItem('walkInTheirShoesData', JSON.stringify(fallbackCards));
        }
      } else {
        console.log('❌ Flask endpoint failed, using fallback data');
        const fallbackCards = getFallbackJourneyCards();
        setJourneyCards(fallbackCards);
        
        // Cache fallback data
        await AsyncStorage.setItem('walkInTheirShoesDate', today);
        await AsyncStorage.setItem('walkInTheirShoesData', JSON.stringify(fallbackCards));
      }
    } catch (error) {
      console.error('❌ Flask endpoint error, using fallback data:', error);
      const fallbackCards = getFallbackJourneyCards();
      setJourneyCards(fallbackCards);
      
      // Cache fallback data even on error
      try {
        const today = new Date().toDateString();
        await AsyncStorage.setItem('walkInTheirShoesDate', today);
        await AsyncStorage.setItem('walkInTheirShoesData', JSON.stringify(fallbackCards));
      } catch (cacheError) {
        console.error('Error caching fallback data:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const saveUserActivity = async (action, data) => {
    try {
      const { SessionManager } = require('./SessionManager');
      const { collection, addDoc } = require('firebase/firestore');
      const { FIREBASE_DB } = require('../firebaseConfig');
      
      const currentSession = await SessionManager.getSession();
      if (!currentSession?.uid) return;
      
      await addDoc(collection(FIREBASE_DB, 'user_activities'), {
        userId: currentSession.uid,
        action,
        data,
        timestamp: new Date(),
        archetype: context?.result?.archetype?.name
      });
    } catch (error) {
      console.error('Error saving user activity:', error);
    }
  };

  const handleCardReaction = async (card, reaction) => {
    const cardKey = `${card.time}_${card.item}`;
    setCardReactions(prev => ({ ...prev, [cardKey]: reaction }));
    
    await saveUserActivity('card_reaction', {
      card: card.item,
      time: card.time,
      archetype: card.archetype,
      reaction
    });
    
    // Recalculate progress after activity
    calculateExplorationProgress();
  };

  const handleTryThis = async (card: { item: any; time: string; archetype: any; }) => {
    try {
      console.log('💆 handleTryThis called with card:', card);
      setModalLoading(true);
      setShowRecommendationsModal(true);
      
      // Save activity (non-blocking)
      saveUserActivity('try_recommendation', {
        card: card.item,
        time: card.time,
        archetype: card.archetype
      }).catch(err => console.log('Firebase save failed:', err));
      
      const requestBody = {
        item: card.item,
        category: card.time === 'Morning' ? 'music' : card.time === 'Afternoon' ? 'podcast' : 'movies'
      };
      
      // Check cache for journey card recommendations
      const today = new Date().toDateString();
      const journeyCacheKey = `journeyCardRec_${today}_${card.item}`;
      const cachedJourneyData = await AsyncStorage.getItem(journeyCacheKey);
      
      let recommendation;
      if (cachedJourneyData) {
        console.log('📅 Using cached journey card recommendations');
        const cachedData = JSON.parse(cachedJourneyData);
        recommendation = cachedData.recommendations[0];
        setModalRecommendations([recommendation]);
      } else {
        console.log('📤 Fetching fresh journey card recommendations');
        const response = await fetch('https://taste-backend-fxwh.onrender.com/discover-journey-card-recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.recommendations && data.recommendations.length > 0) {
            recommendation = data.recommendations[0];
            setModalRecommendations([recommendation]);
            // Cache the response
            await AsyncStorage.setItem(journeyCacheKey, JSON.stringify(data));
            console.log('💾 Cached journey card recommendations');
          }
        }
      }
      
      if (recommendation) {
        // Check cache for item details
        const detailsCacheKey = `itemDetails_${today}_${recommendation.name}`;
        const cachedDetailsData = await AsyncStorage.getItem(detailsCacheKey);
        
        setDetailsLoading(true);
        if (cachedDetailsData) {
          console.log('📅 Using cached item details');
          setItemDetails(JSON.parse(cachedDetailsData));
        } else {
          console.log('📤 Fetching fresh item details');
          const detailsResponse = await fetch('https://taste-backend-fxwh.onrender.com/get-item-details', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: recommendation.name,
              category: card.time === 'Morning' ? 'music' : card.time === 'Afternoon' ? 'podcast' : 'movies'
            })
          });
          
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            setItemDetails(detailsData.details);
            // Cache the details
            await AsyncStorage.setItem(detailsCacheKey, JSON.stringify(detailsData.details));
            console.log('💾 Cached item details');
          }
        }
        setDetailsLoading(false);
      }
    } catch (error) {
      console.error('❌ Error in handleTryThis:', error);
    } finally {
      setModalLoading(false);
    }
  };
  
  // Clear all discover page cache
  const clearDiscoverCache = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const discoverKeys = allKeys.filter(key => 
        key.startsWith('walkInTheirShoes') || 
        key.startsWith('mismatchWalkInShoes') || 
        key.startsWith('journeyCardRec') || 
        key.startsWith('itemDetails')
      );
      
      await AsyncStorage.multiRemove(discoverKeys);
      console.log('🗑️ Cleared all discover cache');
    } catch (error) {
      console.error('Error clearing discover cache:', error);
    }
  };

  useEffect(() => {
    checkDailyDiscoverData();
    fetchSwapDeckRecommendations();
    findUnexpectedConnections();
    fetchFriends();
    calculateExplorationProgress();
  }, []);

  const fetchSwapDeckRecommendations = async () => {
    console.log("Calling swap deck recommendation endpoiint")
    try {
      setSwapDeckLoading(true);
      const response = await fetch('https://taste-backend-fxwh.onrender.com/swap_deck-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          archetype: context?.result?.archetype?.name || 'Taste Explorer'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSwapDeckCards(data.recommendations || []);
      }
    } catch (error) {
      console.error('Error fetching swap deck recommendations:', error);
    } finally {
      setSwapDeckLoading(false);
    }
  };

  const checkDailyDiscoverData = async () => {
    try {
      const today = new Date().toDateString();
      const cachedDate = await AsyncStorage.getItem('walkInTheirShoesDate');
      const cachedData = await AsyncStorage.getItem('walkInTheirShoesData');

      if (cachedDate === today && cachedData) {
        console.log('📅 SAME DAY - Using cached discover data');
        setJourneyCards(JSON.parse(cachedData));
        setLoading(false);
      } else {
        console.log('🆕 NEW DAY - Clearing old cache and fetching fresh data');
        await clearDiscoverCache();
        await fetchWalkInTheirShoesData();
      }
    } catch (error) {
      console.error('Error checking daily discover data:', error);
      await fetchWalkInTheirShoesData();
    }
  };
  
  // Clean up old cached data
  const cleanupOldCache = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const walkInShoesKeys = allKeys.filter(key => key.startsWith('walkInTheirShoes_'));
      const today = new Date().toDateString();
      
      for (const key of walkInShoesKeys) {
        if (!key.includes(today)) {
          await AsyncStorage.removeItem(key);
          console.log('🗑️ Removed old cache:', key);
        }
      }
    } catch (error) {
      console.error('Error cleaning up cache:', error);
    }
  };

  // Helper function to lighten colors
  const lightenColor = (color: string, amount: number = 0.3) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  if (!context) return null;

  const { darkMode, result } = context;
  const styles = createStyles(darkMode);
  const userArchetype = result?.archetype || ARCHETYPES[0];
  // Temporary hardcoded progress for testing
  const explorationProgress = 25; // More reasonable progress level

  const saveToCollection = async (card, action) => {
    try {
      const { SessionManager } = require('./SessionManager');
      const { collection, addDoc } = require('firebase/firestore');
      const { FIREBASE_DB } = require('../firebaseConfig');
      
      const currentSession = await SessionManager.getSession();
      if (!currentSession?.uid) return;
      
      await addDoc(collection(FIREBASE_DB, 'user_collections'), {
        userId: currentSession.uid,
        name: card.title,
        category: card.category,
        plot: card.description,
        archetype: context?.result?.archetype?.name,
        action, // 'saved' or 'passed'
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving to collection:', error);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (swipeIndex >= 5 || swapDeckCards.length === 0) {
      return;
    }
    
    const currentCard = swapDeckCards[swipeIndex % swapDeckCards.length];
    
    
    if (direction === 'left') {
      // Left swipe: shrink and move toward green collection
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -width * 0.6,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Snap into collection with final shrink
        Animated.parallel([
          Animated.timing(cardScale, {
            toValue: 0.1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(cardOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
          // Complete the swipe
          completeSwipe(currentCard, 'saved');
        });
      });
    } else {
      // Right swipe: throw off screen
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width * 2,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -50,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 45,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Complete the swipe
        completeSwipe(currentCard, 'passed');
      });
    }
  };

  const completeSwipe = async (card: any, action: 'saved' | 'passed') => {
    try {
      if (action === 'saved') {
        setSavedCards(prev => [...prev, card.title]);
        console.log('💾 Saved to collection:', card.name);
      } else {
        console.log('👎 Passed on:', card.name);
      }
      
      await saveToCollection(card, action);
      calculateExplorationProgress();
      
      // Move to next card
      setSwipeIndex(prev => prev + 1);
      setShowCardBack(false);
      setShowSwipeInstructions(false);
      
      // Reset all animation values immediately
      translateX.setValue(0);
      translateY.setValue(0);
      rotate.setValue(0);
      cardScale.setValue(1);
      cardOpacity.setValue(1);
    } catch (error) {
      console.error('Error completing swipe:', error);
      // Reset on error
      resetCardPosition();
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        const { translationX } = event.nativeEvent;
        
        // Only update if not in animation
        if (swipeIndex < 5) {
          // Update rotation based on horizontal movement
          rotate.setValue(translationX * 0.1);
          
          // Scale down on left swipe (toward green collection)
          if (translationX < 0) {
            const scale = Math.max(0.7, 1 + (translationX / 200));
            cardScale.setValue(scale);
          } else {
            cardScale.setValue(1);
          }
        }
      }
    }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;
      
      if (swipeIndex >= 5) {
        // Reset position if daily limit reached
        resetCardPosition();
        return;
      }
      
      if (translationX < -80) {
        handleSwipe('left');
      } else if (translationX > 80) {
        handleSwipe('right');
      } else {
        // Reset card position with spring animation
        resetCardPosition();
      }
    }
  };

  const resetCardPosition = () => {
    Animated.parallel([
      Animated.spring(translateX, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.spring(translateY, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.spring(rotate, { 
        toValue: 0, 
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.spring(cardScale, { 
        toValue: 1, 
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }),
      Animated.spring(cardOpacity, { 
        toValue: 1, 
        useNativeDriver: true,
        tension: 100,
        friction: 8
      })
    ]).start();
  };

  const renderRecommendationsModal = () => (
    <Modal
      visible={showRecommendationsModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowRecommendationsModal(false);
        setItemDetails(null);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { 
          backgroundColor: darkMode ? '#1f2937' : '#fff',
          borderWidth: 5,
          borderColor: userArchetype.color
        }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: darkMode ? '#fff' : '#333' }]}>You might also like</Text>
            <TouchableOpacity onPress={() => {
              setShowRecommendationsModal(false);
              setItemDetails(null);
            }}>
              <XMarkIcon size={24} color={darkMode ? '#fff' : '#333'} />
            </TouchableOpacity>
          </View>
          {modalLoading ? (
            <View style={styles.modalLoadingContainer}>
              <ActivityIndicator size="large" color={userArchetype.color} />
              <Text style={[styles.modalLoadingText, { color: darkMode ? '#fff' : '#333' }]}>Loading recommendations...</Text>
            </View>
          ) : modalRecommendations.length > 0 ? (
            <View style={styles.recommendationDetailContainer}>
              <View style={styles.leftSection}>
                <Image 
                  source={{ uri: modalRecommendations[0].image || 'https://picsum.photos/150/200' }} 
                  style={styles.detailImage} 
                />
                <Text style={[styles.detailName, { color: darkMode ? '#fff' : '#333' }]}>
                  {modalRecommendations[0].name}
                </Text>
              </View>
              <View style={[styles.rightSection, {
                backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.3)' : 'rgba(248, 250, 252, 0.8)',
                borderRadius: 12,
                padding: 12
              }]}>
                {detailsLoading ? (
                  <ActivityIndicator size="small" color={userArchetype.color} />
                ) : itemDetails ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {Object.entries(itemDetails).map(([key, value]) => {
                      if (key === 'name' || key === 'error') return null;
                      
                      if (key === 'platforms_available' && Array.isArray(value)) {
                        return (
                          <View key={key} style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: darkMode ? '#d1d5db' : '#374151' }]}>
                              Available On:
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.platformsContainer}>
                              {value.map((platform, index) => (
                                <View key={index} style={styles.platformItem}>
                                  {platform.icon_url && !iconErrors[index] ? (
                                    <Image 
                                      source={{ uri: platform.icon_url }} 
                                      style={styles.platformIcon}
                                      onError={() => {
                                        setIconErrors(prev => ({ ...prev, [index]: true }));
                                      }}
                                    />
                                  ) : (
                                    <Text style={[styles.platformName, { color: darkMode ? '#f3f4f6' : '#1f2937' }]}>
                                      {platform.name || platform}
                                    </Text>
                                  )}
                                </View>
                              ))}
                            </ScrollView>
                          </View>
                        );
                      }
                      
                      return (
                        <View key={key} style={styles.detailRow}>
                          <Text style={[styles.detailLabel, { color: darkMode ? '#d1d5db' : '#374151' }]}>
                            {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}:
                          </Text>
                          <Text style={[styles.detailValue, { color: darkMode ? '#f3f4f6' : '#1f2937' }]}>
                            {Array.isArray(value) ? value.join(', ') : value}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <Text style={[styles.noDetailsText, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>No details available</Text>
                )}
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );

  const renderJourneyCards = () => {
    if (loading) {
      return (
        <View style={styles.journeySection}>
          <View style={styles.sectionHeader}>
            <ArrowPathRoundedSquareIcon size={24} color={userArchetype.color} />
            <Text style={styles.sectionTitle}>Walk in Their Shoes</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={userArchetype.color} />
            <Text style={styles.loadingText}>Loading recommendations...</Text>
          </View>
        </View>
      );
    }

    const timeIcons = { Morning: SunIcon, Afternoon: AfternoonIcon, Night: MoonIcon };
    const currentCard = journeyCards[selectedTimeSlot];
    
    return (
      <View style={styles.journeySection}>
        <View style={styles.sectionHeader}>
          <ArrowPathRoundedSquareIcon size={24} color={userArchetype.color} />
          <Text style={styles.sectionTitle}>Walk in Their Shoes</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Experience a day through different archetype lenses</Text>
        
        {/* Interactive Time Selector */}
        <View style={styles.timeSelectorContainer}>
          {journeyCards.map((card, index) => {
            const Icon = timeIcons[card.time] || SunIcon;
            const isSelected = selectedTimeSlot === index;
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.timeSlot,
                  isSelected && { backgroundColor: userArchetype.color }
                ]}
                onPress={() => setSelectedTimeSlot(index)}
              >
                <Icon size={20} color={isSelected ? 'white' : userArchetype.color} />
                <Text style={[
                  styles.timeSlotText,
                  { color: isSelected ? 'white' : userArchetype.color }
                ]}>
                  {card.time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Current Card Display */}
        {currentCard && (
          <View style={styles.currentCardContainer}>
            <LinearGradient
              colors={darkMode ? ['#374151', '#4b5563'] : ['#f8fafc', '#e2e8f0']}
              style={styles.currentCard}
            >
              <View style={styles.currentCardHeader}>
                <Text style={styles.currentTime}>{currentCard.time} {currentCard.emoji}</Text>
                <Text style={styles.currentArchetype}>{currentCard.archetype}</Text>
              </View>
              
              <Text style={styles.currentContent}>{currentCard.content}</Text>
              
              <TouchableOpacity 
                style={[styles.currentButton, { backgroundColor: userArchetype.color }]}
                onPress={() => handleTryThis(currentCard)}
              >
                <Text style={styles.currentButtonText}>{currentCard.item}</Text>
              </TouchableOpacity>
              
              {/* Reaction Buttons */}
              <View style={styles.reactionContainer}>
                {[
                  { id: 'watched', icon: EyeIcon, label: 'Watched', color: '#6b7280' },
                  { id: 'loved', icon: HeartIcon, label: 'Loved', color: '#ef4444' },
                  { id: 'meh', icon: HandThumbDownIcon, label: 'Meh', color: '#9ca3af' }
                ].map(reaction => {
                  const cardKey = `${currentCard.time}_${currentCard.item}`;
                  const isSelected = cardReactions[cardKey] === reaction.id;
                  
                  return (
                    <TouchableOpacity
                      key={reaction.id}
                      style={[
                        styles.reactionButton,
                        isSelected && { backgroundColor: reaction.color }
                      ]}
                      onPress={() => handleCardReaction(currentCard, reaction.id)}
                    >
                      <reaction.icon 
                        size={14} 
                        color={isSelected ? 'white' : reaction.color} 
                      />
                      <Text style={[
                        styles.reactionText,
                        { color: isSelected ? 'white' : reaction.color }
                      ]}>
                        {reaction.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </LinearGradient>
          </View>
        )}
      </View>
    );
  };





  const [unexpectedConnections, setUnexpectedConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [realExplorationProgress, setRealExplorationProgress] = useState(0);
  const [showAllConnections, setShowAllConnections] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const navigation = useNavigation();

  const calculateSimilarity = (userPrefs, otherPrefs) => {
    const categories = ['movies', 'music', 'books', 'food', 'travel', 'hobbies'];
    let totalMatches = 0;
    let totalItems = 0;
    
    categories.forEach(category => {
      const userItems = userPrefs[category] || [];
      const otherItems = otherPrefs[category] || [];
      
      if (userItems.length > 0 || otherItems.length > 0) {
        const matches = userItems.filter(item => otherItems.includes(item)).length;
        const total = Math.max(userItems.length, otherItems.length);
        totalMatches += matches;
        totalItems += total;
      }
    });
    
    return totalItems > 0 ? (totalMatches / totalItems) * 100 : 0;
  };

  const calculateExplorationProgress = async () => {
    try {
      const { SessionManager } = require('./SessionManager');
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const { FIREBASE_DB } = require('../firebaseConfig');
      
      const currentSession = await SessionManager.getSession();
      if (!currentSession?.uid) return;
      
      const userArchetype = context?.result?.archetype?.name || 'Taste Explorer';
      console.log('Using user archetype for comparison:', userArchetype);
      
      // Get all user activities (card reactions and collections)
      const activitiesQuery = query(
        collection(FIREBASE_DB, 'user_activities'),
        where('userId', '==', currentSession.uid)
      );
      
      const collectionsQuery = query(
        collection(FIREBASE_DB, 'user_collections'),
        where('userId', '==', currentSession.uid)
      );
      
      const [activitiesSnapshot, collectionsSnapshot] = await Promise.all([
        getDocs(activitiesQuery),
        getDocs(collectionsQuery)
      ]);
      
      const exploredArchetypes = new Set();
      
      // Check activities (Walk in Their Shoes reactions)
      activitiesSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.action === 'card_reaction' && data.data?.archetype) {
          const archetype = data.data.archetype;
          if (archetype !== userArchetype) {
            exploredArchetypes.add(archetype);
          }
        }
      });
      
      // Check collections (Swap Deck saves)
      collectionsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.archetype && data.archetype !== userArchetype) {
          exploredArchetypes.add(data.archetype);
        }
      });
      
      // Calculate progress percentage
      const totalArchetypes = ARCHETYPES.length - 1; // Exclude user's own archetype
      const progress = Math.round((exploredArchetypes.size / totalArchetypes) * 100);
      
      console.log('=== EXPLORATION PROGRESS DEBUG ===');
      console.log('User archetype:', userArchetype);
      console.log('User archetype type:', typeof userArchetype);
      console.log('Explored archetypes:', Array.from(exploredArchetypes));
      console.log('Total archetypes:', totalArchetypes);
      console.log('Progress:', progress);
      console.log('Collections found:', collectionsSnapshot.size);
      
      // Check each collection item
      collectionsSnapshot.forEach(doc => {
        const data = doc.data();
        const isUserArchetype = data.archetype === userArchetype;
        console.log('Collection:', data.name, 'archetype:', data.archetype, 'isUserArchetype:', isUserArchetype);
        if (!isUserArchetype) {
          console.log('  -> Adding to explored:', data.archetype);
        }
      });
      
      console.log('Setting progress to:', progress);
      setRealExplorationProgress(progress);
      console.log('State updated, realExplorationProgress should now be:', progress);
      
    } catch (error) {
      console.error('Error calculating exploration progress:', error);
    }
  };

  const fetchFriends = async () => {
    setFriendsLoading(true);
    try {
      const { SessionManager } = require('./SessionManager');
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const { FIREBASE_DB } = require('../firebaseConfig');
      
      const currentSession = await SessionManager.getSession();
      if (!currentSession?.uid) return;
      
      const friendsQuery = query(
        collection(FIREBASE_DB, 'friends'),
        where('userId', '==', currentSession.uid)
      );
      
      const friendsSnapshot = await getDocs(friendsQuery);
      const friendsList = [];
      
      friendsSnapshot.forEach(doc => {
        const friendData = doc.data();

        friendsList.push({
          id: friendData.friendId,
          name: friendData.friendName,
          archetype: friendData.friendArchetype
        });
      });
      
      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setFriendsLoading(false);
    }
  };

  const addToFriends = async (friendId, friendName, friendArchetype) => {
    try {
      const { SessionManager } = require('./SessionManager');
      const { collection, addDoc, query, where, getDocs } = require('firebase/firestore');
      const { FIREBASE_DB } = require('../firebaseConfig');
      
      const currentSession = await SessionManager.getSession();
      if (!currentSession?.uid) return;
      
      // Check if already friends
      const existingFriendQuery = query(
        collection(FIREBASE_DB, 'friends'),
        where('userId', '==', currentSession.uid),
        where('friendId', '==', friendId)
      );
      
      const existingFriends = await getDocs(existingFriendQuery);
      if (existingFriends.size > 0) {
        console.log('Already friends with this user');
        return;
      }
      
      // Add to friends list
      await addDoc(collection(FIREBASE_DB, 'friends'), {
        userId: currentSession.uid,
        friendId: friendId,
        friendName: friendName,
        friendArchetype: friendArchetype,
        addedAt: new Date(),
        status: 'connected'
      });
      
      console.log('Adding friend with archetype:', friendArchetype, 'type:', typeof friendArchetype);
      
      // Also add reverse friendship
      await addDoc(collection(FIREBASE_DB, 'friends'), {
        userId: friendId,
        friendId: currentSession.uid,
        friendName: currentSession.name || 'User',
        friendArchetype: context?.result?.archetype?.name,
        addedAt: new Date(),
        status: 'connected'
      });
      
      console.log('Successfully added friend:', friendName);
      await fetchFriends(); // Refresh friends list
      
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const findUnexpectedConnections = async () => {
    setConnectionsLoading(true);
    try {
      const { SessionManager } = require('./SessionManager');
      const currentSession = await SessionManager.getSession();
      
      if (!currentSession || !currentSession.uid) {
        console.log('No session found');
        setConnectionsLoading(false);
        return;
      }
      
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const { FIREBASE_DB } = require('../firebaseConfig');
      
      console.log('Current user archetype:', context?.result?.archetype?.name);
      
      // Query ALL users first, then filter
      const usersQuery = collection(FIREBASE_DB, 'users');
      const snapshot = await getDocs(usersQuery);
      const users = [];
      
      console.log('Total users found:', snapshot.size);
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        console.log('User:', doc.id, userData.name, userData.archetype?.name);
        
        // Skip current user and users with same archetype
        if (doc.id !== currentSession.uid && 
            userData.archetype?.name !== context?.result?.archetype?.name &&
            userData.preferences) {
          
          const similarity = calculateSimilarity(currentSession.preferences || {}, userData.preferences);
          console.log('Similarity with', userData.name, ':', similarity);
          
          // Lower threshold to 10% to include more users
          if (similarity > 10) {
            const matchingArchetype = ARCHETYPES.find(arch => arch.name === userData.archetype?.name) || ARCHETYPES[0];
            users.push({
              id: doc.id,
              name: userData.name,
              email: userData.email,
              archetype: matchingArchetype,
              preferences: userData.preferences,
              similarity: Math.round(similarity)
            });
          }
        }
      });
      
      console.log('Filtered users:', users.length);
      
      // Sort by similarity and get top 5
      users.sort((a, b) => b.similarity - a.similarity);
      setUnexpectedConnections(users.slice(0, 5));
      
    } catch (error) {
      console.error('Error finding unexpected connections:', error);
    } finally {
      setConnectionsLoading(false);
    }
  };



  const renderUnexpectedConnections = () => (
    <View style={[
      styles.mirrorContainer,
      { backgroundColor: darkMode ? '#111827' : '#f9fafb' }
    ]}>
      <LinearGradient
        colors={darkMode ? ['#374151', context?.result?.archetype?.color + '20'] : ['#ffffff', context?.result?.archetype?.color + '20']}
        style={styles.mirrorHeaderGradient}
      >
        <View style={styles.mirrorHeader}>
          <View style={styles.sectionHeader}>
            <UserPlusIcon size={24} color={context?.result?.archetype?.color || '#6C63FF'} />
            <Text style={[styles.sectionTitle, { color: darkMode ? '#ffffff' : '#000000' }]}>
              Unexpected Connections
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: darkMode ? '#ffffff' : '#000000' }]}>
            Connect with users from different archetypes who share surprising overlaps
          </Text>
        </View>
      </LinearGradient>
      
      <View style={styles.mirrorContent}>
        
        {connectionsLoading || friendsLoading ? (
          <View style={styles.twinLoadingContainer}>
            <ActivityIndicator size="small" color={context?.result?.archetype?.color || '#6C63FF'} />
            <Text style={[styles.twinLoadingText, { color: darkMode ? '#d1d5db' : '#6b7280' }]}>Loading...</Text>
          </View>
        ) : (
          <>
            {/* Friends Section */}
            {friends.filter(friend => friend.archetype !== context?.result?.archetype?.name).length > 0 && (
              <>
                <Text style={[styles.subsectionTitle, { color: darkMode ? '#ffffff' : '#000000' }]}>Friends</Text>
                {friends.filter(friend => friend.archetype !== context?.result?.archetype?.name).map((friend, index) => {
              const friendConnection = unexpectedConnections.find(conn => conn.id === friend.id);
              const overlapPercentage = friendConnection ? friendConnection.similarity : 0;
              // Debug logging
              console.log('Friend archetype:', friend.archetype, 'type:', typeof friend.archetype);
              const friendArchetype = ARCHETYPES.find(arch => arch.name === friend.archetype) || ARCHETYPES[0];
              console.log('Found archetype:', friendArchetype.name, 'color:', friendArchetype.color);
              
              return (
                <View key={`friend-${friend.id}`} style={[
                  styles.suggestionTile,
                  {
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    shadowColor: friendArchetype.color,
                    marginBottom: 6
                  }
                ]}>
                  <View style={styles.suggestionContent}>
                    <View style={[styles.suggestionAvatar, { backgroundColor: friendArchetype.color }]}>
                      <Text style={styles.suggestionAvatarText}>{friend.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    
                    <View style={styles.suggestionInfo}>
                      <Text style={[styles.suggestionName, { color: darkMode ? '#ffffff' : '#000000' }]}>{friend.name}</Text>
                      <View style={styles.suggestionDetails}>
                        <View style={[styles.archetypeContainer, { backgroundColor: friendArchetype.color + '20', borderColor: friendArchetype.color }]}>
                          <Text style={[styles.suggestionArchetype, { color: friendArchetype.color }]}>{friend.archetype}</Text>
                        </View>
                        <View style={[styles.overlapContainer, { backgroundColor: friendArchetype.color }]}>
                          <Text style={styles.suggestionOverlap}>{overlapPercentage}% Overlap</Text>
                        </View>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.suggestionButton, { backgroundColor: '#10b981' }]}
                      onPress={() => {
                        navigation.navigate('Community', {
                          screen: 'CommunityChat',
                          params: {
                            chatType: 'private',
                            recipientId: friend.id,
                            recipientName: friend.name,
                            sourceTab: 'StepOutsideBubble'
                          }
                        });
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>💬</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
                })}
                <View style={styles.sectionSeparator} />
              </>
            )}
            
            {/* New Connections Section */}
            {unexpectedConnections.filter(conn => !friends.some(friend => friend.id === conn.id)).length > 0 ? (
              <>
                <Text style={[styles.subsectionTitle, { color: darkMode ? '#ffffff' : '#000000' }]}>New Connections</Text>
                {unexpectedConnections.filter(conn => !friends.some(friend => friend.id === conn.id)).slice(0, 2).map((user, index) => {
              const archetype = ARCHETYPES.find(arch => arch.name === user.archetype.name) || ARCHETYPES[0];
              const isFriend = friends.some(friend => friend.id === user.id);
              
              return (
                <View key={`conn-${user.id}`} style={[
                  styles.suggestionTile,
                  {
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    shadowColor: archetype.color,
                    marginBottom: 6
                  }
                ]}>
                  <View style={styles.suggestionContent}>
                    <View style={[styles.suggestionAvatar, { backgroundColor: archetype.color }]}>
                      <Text style={styles.suggestionAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    
                    <View style={styles.suggestionInfo}>
                      <Text style={[styles.suggestionName, { color: darkMode ? '#ffffff' : '#000000' }]}>{user.name}</Text>
                      <View style={styles.suggestionDetails}>
                        <View style={[styles.archetypeContainer, { backgroundColor: archetype.color + '20', borderColor: archetype.color }]}>
                          <Text style={[styles.suggestionArchetype, { color: archetype.color }]}>{user.archetype.name}</Text>
                        </View>
                        <View style={[styles.overlapContainer, { backgroundColor: archetype.color }]}>
                          <Text style={styles.suggestionOverlap}>{user.similarity}% Overlap</Text>
                        </View>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.suggestionButton, { backgroundColor: isFriend ? '#10b981' : archetype.color }]}
                      onPress={async () => {
                        if (isFriend) {
                          navigation.navigate('Community', {
                            screen: 'CommunityChat',
                            params: {
                              chatType: 'private',
                              recipientId: user.id,
                              recipientName: user.name,
                              sourceTab: 'StepOutsideBubble'
                            }
                          });
                        } else {
                          await addToFriends(user.id, user.name, user.archetype.name);
                        }
                      }}
                    >
                      {isFriend ? (
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>💬</Text>
                      ) : (
                        <UserPlusIcon size={14} color="white" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
                })}
                
                {unexpectedConnections.filter(conn => !friends.some(friend => friend.id === conn.id)).length > 2 && (
                  <TouchableOpacity 
                    style={styles.viewAllButton}
                    onPress={() => setShowAllConnections(!showAllConnections)}
                  >
                    <Text style={styles.viewAllText}>
                      +{unexpectedConnections.filter(conn => !friends.some(friend => friend.id === conn.id)).length - 2} More
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              friends.filter(friend => friend.archetype !== context?.result?.archetype?.name).length > 0 && (
                <>
                  <Text style={[styles.subsectionTitle, { color: darkMode ? '#ffffff' : '#000000' }]}>New Connections</Text>
                  <View style={styles.emptyNewConnections}>
                    <Text style={[styles.emptyNewConnectionsText, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>✨ Amazing! You've connected with everyone in your unexpected connections</Text>
                  </View>
                </>
              )
            )}
            
            {friends.filter(friend => friend.archetype !== context?.result?.archetype?.name).length === 0 && unexpectedConnections.length === 0 && (
              <View style={styles.noTwinContainer}>
                <Text style={[styles.noTwinText, { color: darkMode ? '#d1d5db' : '#6b7280' }]}>No unexpected connections found</Text>
                <Text style={[styles.noTwinSubtext, { color: darkMode ? '#9ca3af' : '#9ca3af' }]}>Try exploring more content to find overlaps!</Text>
              </View>
            )}
            

          </>
        )}
      </View>
    </View>
  );

  const renderSwapDeck = () => {
    if (swapDeckLoading) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SwatchIcon size={24} color={userArchetype.color} />
            <Text style={styles.sectionTitle}>Swap Deck</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={userArchetype.color} />
            <Text style={styles.loadingText}>Loading recommendations...</Text>
          </View>
        </View>
      );
    }

    if (swapDeckCards.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SwatchIcon size={24} color={userArchetype.color} />
            <Text style={styles.sectionTitle}>Swap Deck</Text>
          </View>
          <Text style={styles.sectionSubtitle}>No recommendations available</Text>
        </View>
      );
    }

    const currentCard = swapDeckCards[swipeIndex % swapDeckCards.length];
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <SwatchIcon size={24} color={userArchetype.color} />
          <Text style={styles.sectionTitle}>Swap Deck</Text>
        </View>
        <Text style={styles.sectionSubtitle}>Swipe cards to build your collection</Text>
        
        {showSwipeInstructions && (
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionRow}>
              <View style={styles.swipeLeft}>
                <Text style={styles.instructionText}>← Swipe Left</Text>
                <Text style={styles.instructionLabel}>Save to Collection</Text>
              </View>
              <View style={styles.swipeRight}>
                <Text style={styles.instructionText}>Swipe Right →</Text>
                <Text style={styles.instructionLabel}>Not Interested</Text>
              </View>
            </View>
          </View>
        )}
        
        <View style={styles.deckContainer}>
          {/* Card Collection Stack */}
          <View style={styles.collectionStack}>
            {savedCards.slice(-5).map((cardTitle, index) => (
              <View
                key={index}
                style={[
                  styles.collectionCard,
                  { 
                    zIndex: index,
                    transform: [{ rotate: `${(index - 2) * 3}deg` }],
                    left: index * 2,
                    top: index * -1
                  }
                ]}
              >
                <LinearGradient
                  colors={['#22c55e', '#16a34a']}
                  style={styles.collectionCardGradient}
                >
                  <Text style={styles.collectionCardText}>{cardTitle}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
          
          {/* Main Deck Stack */}
          <View style={styles.mainDeck}>
            {/* Background cards */}
            {[2, 1].map((offset) => (
              <View
                key={offset}
                style={[
                  styles.deckCard,
                  { 
                    zIndex: offset,
                    transform: [{ scale: 1 - (offset * 0.02) }],
                    top: offset * 2,
                    left: offset * 1
                  }
                ]}
              >
                <View style={styles.cardBack} />
              </View>
            ))}
            
            {/* Active card */}
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View style={[
                styles.activeCard,
                { 
                  zIndex: 10,
                  opacity: cardOpacity,
                  transform: [
                    { translateX },
                    { scale: cardScale },
                    { rotate: rotate.interpolate({
                      inputRange: [-30, 0, 30],
                      outputRange: ['-30deg', '0deg', '30deg']
                    }) }
                  ]
                }
              ]}>
                <TouchableOpacity 
                  style={{ flex: 1 }}
                  onPress={() => setShowCardBack(!showCardBack)}
                  activeOpacity={1}
                >
                  <LinearGradient
                    colors={showCardBack ? ['#1f2937', '#374151'] : [userArchetype.color, userArchetype.gradientColors[1]]}
                    style={styles.activeCardGradient}
                  >
                    {!showCardBack ? (
                      <>
                        <Text style={styles.activeCardCategory}>{currentCard.category.toUpperCase()}</Text>
                        <Text style={styles.activeCardPlot}>{currentCard.description}</Text>
                        <Text style={styles.tapToFlip}>Tap to reveal name</Text>
                      </>
                    ) : (
                      <View style={styles.cardBackContainer}>
                        <Text style={styles.cardBackTitle}>This is:</Text>
                        <Text style={styles.cardBackName}>{currentCard.title}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                {/* Swipe indicators */}
                <Animated.View style={[
                  styles.swipeIndicator,
                  styles.leftIndicator,
                  {
                    opacity: translateX.interpolate({
                      inputRange: [-100, 0],
                      outputRange: [1, 0],
                      extrapolate: 'clamp'
                    })
                  }
                ]}>
                  <Text style={styles.indicatorText}>SAVE</Text>
                </Animated.View>
                
                <Animated.View style={[
                  styles.swipeIndicator,
                  styles.rightIndicator,
                  {
                    opacity: translateX.interpolate({
                      inputRange: [0, 100],
                      outputRange: [0, 1],
                      extrapolate: 'clamp'
                    })
                  }
                ]}>
                  <Text style={styles.indicatorText}>PASS</Text>
                </Animated.View>
              </Animated.View>
            </PanGestureHandler>
          </View>
        </View>
        
        <View style={styles.collectionStats}>
          <Text style={styles.statsText}>Collection: {savedCards.length} cards</Text>
          <Text style={styles.statsText}>Daily: {Math.min(swipeIndex, 5)}/5</Text>
        </View>
        
        {swipeIndex >= 5 && (
          <View style={styles.dailyLimitContainer}>
            <Text style={styles.dailyLimitText}>🎯 Daily limit reached!</Text>
            <Text style={styles.dailyLimitSubtext}>Come back tomorrow for more discoveries</Text>
          </View>
        )}
      </View>
    );
  };



  const renderExpansionScore = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ChartBarIcon size={24} color={userArchetype.color} />
        <Text style={styles.sectionTitle}>Archetype Expansion</Text>
      </View>
      <Text style={styles.sectionSubtitle}>Track your journey across different taste archetypes</Text>
      
      <View style={styles.progressContainer}>
        <Text style={styles.progressText} key={`progress-${realExplorationProgress}`}>{realExplorationProgress}% Explored</Text>
        <View style={styles.progressBar}>
          <LinearGradient
            key={`bar-${realExplorationProgress}`}
            colors={[userArchetype.color, userArchetype.gradientColors[1]]}
            style={[styles.progressFill, { width: `${realExplorationProgress}%` }]}
          />
        </View>
        <Text style={styles.progressSubtext}>{realExplorationProgress < 25 ? 'Just getting started!' : realExplorationProgress < 50 ? 'Making good progress!' : realExplorationProgress < 75 ? 'You\'re exploring well!' : 'Almost a complete explorer!'}</Text>
      </View>
      
      <View style={styles.badges}>
        <LinearGradient
          colors={[userArchetype.color, userArchetype.gradientColors[1]]}
          style={styles.badge}
        >
          <SparklesIcon size={16} color="#fff" />
          <Text style={styles.badgeText}>Wanderer of Worlds</Text>
        </LinearGradient>
        {realExplorationProgress > 25 && (
          <LinearGradient
            colors={['#10b981', '#059669']}
            style={styles.badge}
          >
            <BoltIcon size={16} color="#fff" />
            <Text style={styles.badgeText}>Taste Explorer</Text>
          </LinearGradient>
        )}
        {realExplorationProgress > 50 && (
          <LinearGradient
            colors={['#f59e0b', '#f97316']}
            style={styles.badge}
          >
            <FireIcon size={16} color="#fff" />
            <Text style={styles.badgeText}>Cultural Blender</Text>
          </LinearGradient>
        )}
        {realExplorationProgress > 75 && (
          <LinearGradient
            colors={['#8b5cf6', '#7c3aed']}
            style={styles.badge}
          >
            <GlobeAltIcon size={16} color="#fff" />
            <Text style={styles.badgeText}>Archetype Master</Text>
          </LinearGradient>
        )}
      </View>
      
      <View style={styles.expansionStats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{Math.floor(realExplorationProgress * 0.24)}</Text>
          <Text style={styles.statLabel}>Archetypes Explored</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{24 - Math.floor(realExplorationProgress * 0.24)}</Text>
          <Text style={styles.statLabel}>Yet to Discover</Text>
        </View>
      </View>
    </View>
    );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {renderJourneyCards()}
      {renderRecommendationsModal()}
      {renderUnexpectedConnections()}
      {renderSwapDeck()}
      {renderExpansionScore()}
    </ScrollView>
  );
};

const createStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    margin: 16,
    backgroundColor: darkMode ? '#1f2937' : '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  journeySection: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  timeSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  timeSlot: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  timeSlotText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginTop: 4,
  },
  currentCardContainer: {
    marginTop: 8,
  },
  currentCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  currentCardHeader: {
    marginBottom: 12,
  },
  currentTime: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#111827',
    marginBottom: 6,
  },
  currentArchetype: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    backgroundColor: darkMode ? '#374151' : '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  currentContent: {
    fontSize: 15,
    fontFamily: 'Lato',
    color: darkMode ? '#d1d5db' : '#111827',
    marginBottom: 16,
    lineHeight: 22,
  },
  currentButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    gap: 12,
  },
  reactionButton: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  reactionText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Rubik',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    marginBottom: 20,
  },
  journeyCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  expandedCard: {
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#1f2937',
  },
  archetypeTag: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    backgroundColor: darkMode ? '#374151' : '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardContent: {
    fontSize: 16,
    fontFamily: 'Lato',
    color: darkMode ? '#d1d5db' : '#374151',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#1f2937',
    marginBottom: 16,
  },
  vibeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'stretch',
    marginTop: 12,
    minHeight: 44,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    justifyContent: 'center',
  },

  vibeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rubik',
    textAlign: 'center',
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#d1d5db' : '#374151',
    marginTop: 8,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  reverseMatchCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  matchCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  matchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  matchArchetype: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  matchDescription: {
    fontSize: 16,
    fontFamily: 'Lato',
    color: '#fff',
    textAlign: 'center',
  },
  reactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  reactionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 4,
  },
  reactionText: {
    fontSize: 12,
    fontFamily: 'Lato',
    fontWeight: 'bold',
    color: darkMode ? '#fff' : '#1f2937',
  },
  communityStats: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fusionHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: darkMode ? '#374151' : '#f0f9ff',
    borderRadius: 12,
  },
  fusionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  fusionCard: {
    width: '47%',
    position: 'relative',
  },
  fusionCardInner: {
    borderRadius: 16,
    overflow: 'hidden',
    transform: [{ translateY: -4 }],
    zIndex: 2,
  },
  fusionCardShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: darkMode ? '#1f2937' : '#cbd5e1',
    borderRadius: 16,
    zIndex: 1,
  },
  fusionCardGradient: {
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: darkMode ? '#4b5563' : '#e2e8f0',
  },
  fusionCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  fusionReactionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  fusionReactionBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 4,
  },
  fusionReactionCount: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Lato',
    color: darkMode ? '#d1d5db' : '#374151',
  },
  fusionTheme: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#1f2937',
    marginBottom: 8,
  },
  fusionArchetypes: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    marginBottom: 20,
  },
  fusionPollContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  pollHeader: {
    padding: 20,
    alignItems: 'center',
  },
  pollQuestion: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: '#fff',
    marginBottom: 8,
  },
  pollArchetypes: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },

  pollGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  poll3DCard: {
    width: '47%',
    position: 'relative',
    marginBottom: 8,
  },
  selectedPoll3DCard: {
    transform: [{ scale: 1.02 }, { translateY: -2 }],
  },
  card3DShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: darkMode ? '#374151' : '#d1d5db',
    borderRadius: 12,
    zIndex: 0,
  },
  poll3DCardGradient: {
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: darkMode ? '#4b5563' : '#e5e7eb',
    zIndex: 1,
  },
  poll3DCardText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#1f2937' : '#374151',
    marginBottom: 12,
  },
  poll3DReactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  reactionItem: {
    alignItems: 'center',
    gap: 4,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Lato',
    color: darkMode ? '#6b7280' : '#374151',
  },
  tasteTwinProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  tasteTwinAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasteTwinAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  tasteTwinInfo: {
    flex: 1,
  },
  tasteTwinName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#111827',
    marginBottom: 4,
  },
  tasteTwinArchetype: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    marginBottom: 4,
  },
  matchBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  matchBadgeText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Rubik',
  },
  tasteTwinTags: {
    flexDirection: 'row',
    gap: 6,
  },
  preferenceTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  preferenceTagText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Rubik',
  },
  connectButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  instructionsContainer: {
    backgroundColor: darkMode ? '#374151' : '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swipeLeft: {
    alignItems: 'center',
  },
  swipeRight: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#1f2937',
  },
  instructionLabel: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
  },
  deckContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  collectionStack: {
    width: 80,
    height: 120,
    position: 'relative',
  },
  collectionCard: {
    position: 'absolute',
    width: 60,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  collectionCardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  collectionCardText: {
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: '#fff',
    textAlign: 'center',
  },
  mainDeck: {
    width: 180,
    height: 240,
    position: 'relative',
    alignItems: 'center',
  },
  deckCard: {
    position: 'absolute',
    width: 160,
    height: 220,
    borderRadius: 16,
  },
  cardBack: {
    flex: 1,
    backgroundColor: darkMode ? '#4b5563' : '#d1d5db',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: darkMode ? '#6b7280' : '#9ca3af',
  },
  activeCardWrapper: {
    position: 'absolute',
    width: 160,
    height: 220,
  },
  activeCard: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  activeCardGradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  activeCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  activeCardCategory: {
    fontSize: 14,
    fontFamily: 'Rubik',
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 1,
    textAlign: 'center',
  },
  activeCardPlot: {
    fontSize: 15,
    fontFamily: 'Lato',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    flex: 1,
    marginVertical: 16,
  },
  tapToFlip: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: '#ffffff',
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  cardBackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  cardBackText: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardBackName: {
    fontSize: 28,
    fontFamily: 'Rubik',
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  dailyLimitContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
    borderRadius: 12,
  },
  dailyLimitText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#333',
    marginBottom: 4,
  },
  dailyLimitSubtext: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '50%',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  leftIndicator: {
    left: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    borderColor: '#22c55e',
  },
  rightIndicator: {
    right: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderColor: '#ef4444',
  },
  indicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  collectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statsText: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
  },
  recommendationCard: {
    backgroundColor: darkMode ? '#374151' : '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  recFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  recFrom: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Lato',
    color: darkMode ? '#60a5fa' : '#3b82f6',
  },
  recTo: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Lato',
    color: darkMode ? '#34d399' : '#059669',
  },
  recArchetype: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    fontStyle: 'italic',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: darkMode ? '#374151' : '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  badges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  progressSubtext: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  expansionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: darkMode ? '#374151' : '#e5e7eb',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    minHeight: 330,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  recommendationsScroll: {
    flexDirection: 'row',
  },
  recommendationItem: {
    marginRight: 16,
    alignItems: 'center',
    width: 120,
  },
  recommendationImage: {
    width: 100,
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationName: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
  modalLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Lato',
  },
  recommendationDetailContainer: {
    flexDirection: 'row',
    gap: 20,
    flex: 1,
    maxHeight: 500,
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    paddingLeft: 10,
    borderWidth: 1,
    borderColor: darkMode ? 'rgba(156, 163, 175, 0.2)' : 'rgba(229, 231, 235, 0.5)',
  },
  detailImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
  detailRow: {
    marginBottom: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(255, 255, 255, 0.7)',
    borderRadius: 6,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontFamily: 'Lato',
    lineHeight: 16,
  },
  noDetailsText: {
    fontSize: 14,
    fontFamily: 'Lato',
    fontStyle: 'italic',
  },
  platformsContainer: {
    marginTop: 4,
  },
  platformItem: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
  },
  platformIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  platformName: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Lato',
    textAlign: 'center',
  },
  // Mirror of You Style Container
  mirrorContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  mirrorHeaderGradient: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  mirrorHeader: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  mirrorTitle: {
    fontFamily: 'Rubik',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'left',
  },
  mirrorSubtitle: {
    fontFamily: 'Lato',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 12,
  },
  mirrorContent: {
    padding: 16,
    paddingBottom: 24,
  },
  // Individual Tile Styles
  individualTile: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  tileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  tileName: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 4,
    textAlign: 'center',
  },
  tileArchetype: {
    fontSize: 12,
    fontFamily: 'Lato',
    marginBottom: 6,
    textAlign: 'center',
  },
  tileBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  tileBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Rubik',
  },
  tileButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tasteTwinCard: {
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  tasteTwinContainer: {
    padding: 24,
  },
  tasteTwinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tasteTwinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#111827',
  },
  tasteTwinSubtitle: {
    fontSize: 14,
    fontFamily: 'Lato',
    marginBottom: 16,
    color: darkMode ? '#ffffff' : '#374151',
  },
  twinLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  twinLoadingText: {
    fontSize: 14,
    fontFamily: 'Lato',
  },
  noTwinContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  noTwinText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginBottom: 4,
  },
  noTwinSubtext: {
    fontSize: 12,
    fontFamily: 'Lato',
  },
  viewAllButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rubik',
    color: '#6366f1',
    textDecorationLine: 'underline',
  },

  horizontalTileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  horizontalTileAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  horizontalTileName: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 4,
    textAlign: 'center',
  },
  horizontalTileArchetype: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontFamily: 'Lato',
    marginBottom: 6,
    textAlign: 'center',
  },
  horizontalMatchBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  horizontalMatchBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Rubik',
  },
  horizontalConnectButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // New Suggestion Tile Styles
  suggestionTile: {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  suggestionAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  suggestionDetails: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  archetypeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionArchetype: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  overlapContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestionOverlap: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: 'white',
  },
  suggestionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  subsectionTitle: {
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },
  emptyNewConnections: {
    padding: 16,
    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyNewConnectionsText: {
    fontSize: 14,
    fontFamily: 'Lato',
    textAlign: 'center',
  },
});

export default StepOutsideBubble;