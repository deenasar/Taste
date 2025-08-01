import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
  Image,
} from 'react-native';
import { HeartIcon, ShareIcon, BookmarkIcon } from 'react-native-heroicons/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from 'react-native-heroicons/solid';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig';
import { SessionManager } from './SessionManager';
import { qlooService, QlooSuggestion } from '../services/qlooService';

interface Friend {
  id: string;
  name: string;
  relationshipType: string;
  interests: string[];
  userId: string;
}

interface BlendSession {
  id: string;
  friends: string[];
  activities: string[];
  userId: string;
  createdAt: Date;
  recommendations?: any[];
  activity?: string;
}

type Suggestion = QlooSuggestion;

interface BlendSuggestionsProps {
  blendSession: BlendSession;
  friends: Friend[];
  darkMode: boolean;
}

const BlendSuggestions: React.FC<BlendSuggestionsProps> = ({
  blendSession,
  friends,
  darkMode,
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuggestions, setSavedSuggestions] = useState<string[]>([]);
  const [likedSuggestions, setLikedSuggestions] = useState<string[]>([]);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchSuggestions();
      loadUserPreferences();
    }
  }, [blendSession, userId]);

  const initializeUser = async () => {
    try {
      const session = await SessionManager.getSession();
      if (session?.email) {
        setUserId(session.email);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    }
  };

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      // Use recommendations from blend session if available
      console.log('Blend session recommendations:', blendSession.recommendations);
      if (blendSession.recommendations && blendSession.recommendations.length > 0) {
        const formattedSuggestions = blendSession.recommendations.map((rec: any, index: number) => {
          console.log('Processing recommendation:', rec);
          return {
            id: `blend-${index}`,
            title: rec.name || 'Unknown',
            description: rec.summary || `Recommended ${blendSession.activity || 'content'} based on your blend preferences`,
            category: blendSession.activity || 'Entertainment',
            rating: rec.rating || '4.5',
            price: rec.cost || 'Free',
            location: null,
            image: rec.image || ''
          };
        });
        console.log('Formatted suggestions:', formattedSuggestions);
        setSuggestions(formattedSuggestions);
      } else {
        console.log('No recommendations found');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error processing suggestions:', error);
      Alert.alert('Error', 'Failed to load suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  const loadUserPreferences = async () => {
    try {
      // Load saved suggestions
      const savedQuery = query(
        collection(FIREBASE_DB, 'savedSuggestions'),
        where('userId', '==', userId)
      );
      const savedSnapshot = await getDocs(savedQuery);
      const savedIds = savedSnapshot.docs.map(doc => doc.data().suggestionId);
      setSavedSuggestions(savedIds);

      // Load liked suggestions
      const likedQuery = query(
        collection(FIREBASE_DB, 'likedSuggestions'),
        where('userId', '==', userId)
      );
      const likedSnapshot = await getDocs(likedQuery);
      const likedIds = likedSnapshot.docs.map(doc => doc.data().suggestionId);
      setLikedSuggestions(likedIds);
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const toggleSave = async (suggestionId: string) => {
    try {
      if (savedSuggestions.includes(suggestionId)) {
        // Remove from saved
        const savedQuery = query(
          collection(FIREBASE_DB, 'savedSuggestions'),
          where('userId', '==', userId),
          where('suggestionId', '==', suggestionId)
        );
        const snapshot = await getDocs(savedQuery);
        snapshot.docs.forEach(async (docSnapshot) => {
          await deleteDoc(doc(FIREBASE_DB, 'savedSuggestions', docSnapshot.id));
        });
        setSavedSuggestions(prev => prev.filter(id => id !== suggestionId));
      } else {
        // Add to saved
        await addDoc(collection(FIREBASE_DB, 'savedSuggestions'), {
          userId,
          suggestionId,
          blendSessionId: blendSession.id,
          createdAt: new Date(),
        });
        setSavedSuggestions(prev => [...prev, suggestionId]);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to save suggestion. Please try again.');
    }
  };

  const toggleLike = async (suggestionId: string) => {
    try {
      if (likedSuggestions.includes(suggestionId)) {
        // Remove from liked
        const likedQuery = query(
          collection(FIREBASE_DB, 'likedSuggestions'),
          where('userId', '==', userId),
          where('suggestionId', '==', suggestionId)
        );
        const snapshot = await getDocs(likedQuery);
        snapshot.docs.forEach(async (docSnapshot) => {
          await deleteDoc(doc(FIREBASE_DB, 'likedSuggestions', docSnapshot.id));
        });
        setLikedSuggestions(prev => prev.filter(id => id !== suggestionId));
      } else {
        // Add to liked
        await addDoc(collection(FIREBASE_DB, 'likedSuggestions'), {
          userId,
          suggestionId,
          blendSessionId: blendSession.id,
          createdAt: new Date(),
        });
        setLikedSuggestions(prev => [...prev, suggestionId]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to like suggestion. Please try again.');
    }
  };

  const handleShare = async (suggestion: Suggestion) => {
    try {
      const selectedFriendNames = friends
        .filter(friend => blendSession.friends.includes(friend.id))
        .map(friend => friend.name)
        .join(', ');

      const message = `Check out this suggestion for our blend: ${suggestion.title}\n\n${suggestion.description}\n\nRating: ${suggestion.rating}/5 | Price: ${suggestion.price}\n\nSuggested for: ${selectedFriendNames.join(', ')}`;

      await Share.share({
        message,
        title: `Blend Suggestion: ${suggestion.title}`,
      });
    } catch (error) {
      console.error('Error sharing suggestion:', error);
    }
  };

  const getPriceColor = (price: string) => {
    switch (price) {
      case '$': return '#22c55e';
      case '$$': return '#f59e0b';
      case '$$$': return '#ef4444';
      case 'Free': return '#10b981';
      default: return darkMode ? '#9ca3af' : '#6b7280';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Entertainment': '#8b5cf6',
      'Dining': '#ef4444',
      'Cultural': '#f59e0b',
      'Music': '#06b6d4',
      'Learning': '#3b82f6',
      'Outdoor': '#22c55e',
      'Nightlife': '#6366f1',
    };
    return colors[category] || '#9ca3af';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={[styles.loadingText, { color: darkMode ? '#ffffff' : '#0f172a' }]}>
          Generating personalized suggestions...
        </Text>
      </View>
    );
  }

  const selectedFriendNames = friends
    .filter(friend => blendSession.friends.includes(friend.id))
    .map(friend => friend.name);
  
  const friendNamesText = selectedFriendNames.length === 1 
    ? selectedFriendNames[0]
    : selectedFriendNames.length === 2
    ? `${selectedFriendNames[0]} and ${selectedFriendNames[1]}`
    : `${selectedFriendNames.slice(0, -1).join(', ')}, and ${selectedFriendNames[selectedFriendNames.length - 1]}`;

  return (
    <View style={styles.container}>


      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
        style={styles.suggestionsScroll}
      >
        {suggestions.map((suggestion, index) => {
          const isLiked = likedSuggestions.includes(suggestion.id);
          const isSaved = savedSuggestions.includes(suggestion.id);
          
          return (
            <View
              key={suggestion.id}
              style={[
                styles.suggestionCard,
                {
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  borderColor: darkMode ? '#374151' : '#e5e7eb',
                  marginLeft: index === 0 ? 20 : 16,
                  marginRight: index === suggestions.length - 1 ? 20 : 0,
                }
              ]}
            >
              {/* Image with overlay */}
              {suggestion.image && (
                <View style={styles.imageContainer}>
                  <Image 
                    source={{ uri: suggestion.image }} 
                    style={styles.suggestionImage}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.overlayTitle}>{suggestion.title}</Text>
                  </View>
                </View>
              )}

              {/* Content */}
              <View style={styles.cardContent}>

                
                <Text
                  style={[
                    styles.suggestionDescription,
                    { color: darkMode ? '#d1d5db' : '#4b5563' }
                  ]}
                >
                  {suggestion.description}
                </Text>

                {suggestion.location && (
                  <Text
                    style={[
                      styles.location,
                      { color: darkMode ? '#9ca3af' : '#6b7280' }
                    ]}
                    numberOfLines={1}
                  >
                    📍 {suggestion.location}
                  </Text>
                )}

                {/* Rating and Price */}
                <View style={styles.metaInfo}>
                  <View style={styles.rating}>
                    <Text style={styles.ratingText}>⭐ {suggestion.rating}</Text>
                  </View>
                  <Text
                    style={[
                      styles.price,
                      { color: getPriceColor(suggestion.price) }
                    ]}
                  >
                    {suggestion.price}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleLike(suggestion.id)}
                  activeOpacity={0.8}
                >
                  {isLiked ? (
                    <HeartSolidIcon size={20} color="#ef4444" />
                  ) : (
                    <HeartIcon size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => toggleSave(suggestion.id)}
                  activeOpacity={0.8}
                >
                  {isSaved ? (
                    <BookmarkSolidIcon size={20} color="#10b981" />
                  ) : (
                    <BookmarkIcon size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShare(suggestion)}
                  activeOpacity={0.8}
                >
                  <ShareIcon size={20} color={darkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Rubik',
  },

  suggestionsScroll: {
    marginBottom: 16,
  },
  suggestionsContainer: {
    paddingVertical: 8,
  },
  suggestionCard: {
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  suggestionImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    alignItems: 'center',
  },
  overlayTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    margin: 16,
    borderRadius: 12,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  suggestionDescription: {
    fontSize: 12,
    fontFamily: 'Rubik',
    fontStyle: 'italic',
    lineHeight: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  location: {
    fontSize: 12,
    fontFamily: 'Rubik',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Rubik',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    padding: 8,
  },
});

export default BlendSuggestions;