import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AppContext } from '../App';
import { FIREBASE_DB } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { SessionManager } from './SessionManager';
import AddFriendModal from './AddFriendModal';
import StartBlendModal from './StartBlendModal';
import FriendCard from './FriendCard';
import BlendSuggestions from './BlendSuggestions';
import { PlusIcon, SparklesIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';

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

const Blend = () => {
  const { darkMode, result } = useContext(AppContext)!;
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showStartBlendModal, setShowStartBlendModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentBlendSession, setCurrentBlendSession] = useState<BlendSession | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const session = await SessionManager.getSession();
      if (session?.email) {
        setUserId(session.email);
        await loadFriends(session.email);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async (userEmail: string) => {
    try {
      const friendsQuery = query(
        collection(FIREBASE_DB, 'friends'),
        where('userId', '==', userEmail)
      );
      const snapshot = await getDocs(friendsQuery);
      const friendsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Friend[];
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  const handleAddFriend = async (friendData: Omit<Friend, 'id' | 'userId'>) => {
    try {
      const docRef = await addDoc(collection(FIREBASE_DB, 'friends'), {
        ...friendData,
        userId,
      });
      
      const newFriend: Friend = {
        id: docRef.id,
        ...friendData,
        userId,
      };
      
      setFriends(prev => [...prev, newFriend]);
      setShowAddFriendModal(false);
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Failed to add friend. Please try again.');
    }
  };

  const handleEditFriend = async (friendId: string, updatedData: Partial<Friend>) => {
    try {
      await updateDoc(doc(FIREBASE_DB, 'friends', friendId), updatedData);
      setFriends(prev => prev.map(friend => 
        friend.id === friendId ? { ...friend, ...updatedData } : friend
      ));
    } catch (error) {
      console.error('Error updating friend:', error);
      Alert.alert('Error', 'Failed to update friend. Please try again.');
    }
  };

  const handleDeleteFriend = async (friendId: string, friendName: string) => {
    Alert.alert(
      'Delete Friend',
      `Are you sure you want to remove ${friendName} from your friends list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(FIREBASE_DB, 'friends', friendId));
              setFriends(prev => prev.filter(friend => friend.id !== friendId));
            } catch (error) {
              console.error('Error deleting friend:', error);
            }
          }
        }
      ]
    );
  };

  const handleStartBlend = async (selectedFriends: string[], selectedActivities: string[]) => {
    try {
      // Get user preferences from Firebase - try multiple collection names
      let userPreferences = {};
      
      // Try 'userPreferences' collection first
      const userPreferencesQuery1 = query(
        collection(FIREBASE_DB, 'userPreferences'),
        where('userId', '==', userId)
      );
      const userPreferencesSnapshot1 = await getDocs(userPreferencesQuery1);
      
      if (userPreferencesSnapshot1.docs.length > 0) {
        userPreferences = userPreferencesSnapshot1.docs[0].data();
      } else {
        // Try 'preferences' collection
        const userPreferencesQuery2 = query(
          collection(FIREBASE_DB, 'preferences'),
          where('userId', '==', userId)
        );
        const userPreferencesSnapshot2 = await getDocs(userPreferencesQuery2);
        
        if (userPreferencesSnapshot2.docs.length > 0) {
          userPreferences = userPreferencesSnapshot2.docs[0].data();
        } else {
          // Try 'users' collection with userId as document ID
          try {
            const userDocRef = doc(FIREBASE_DB, 'users', userId);
            const userDocSnapshot = await getDocs(query(collection(FIREBASE_DB, 'users'), where('email', '==', userId)));
            if (userDocSnapshot.docs.length > 0) {
              const userData = userDocSnapshot.docs[0].data();
              userPreferences = userData.preferences || userData;
            }
          } catch (error) {
            console.log('No user preferences found in users collection');
          }
        }
      }
      
      console.log('User preferences found:', userPreferences);

      // Get friend preferences as array of objects
      const selectedFriendsData = friends.filter(friend => selectedFriends.includes(friend.id));
      const friendPreferences = selectedFriendsData.map(friend => {
        // Categorize interests
        const categorizedInterests = {
          music: [],
          movies: [],
          books: [],
          tv_show: [],
          videogame: [],
          travel: [],
          art: [],
          food: []
        };
        
        (friend.interests || []).forEach(interest => {
          const lowerInterest = interest.toLowerCase();
          if (lowerInterest.includes('rock') || lowerInterest.includes('music') || lowerInterest.includes('indie')) {
            categorizedInterests.music.push(interest);
          } else if (lowerInterest.includes('drama') || lowerInterest.includes('movie') || lowerInterest.includes('film')) {
            categorizedInterests.movies.push(interest);
          } else if (lowerInterest.includes('book') || lowerInterest.includes('poetry') || lowerInterest.includes('novel')) {
            categorizedInterests.books.push(interest);
          } else if (lowerInterest.includes('tv') || lowerInterest.includes('sitcom') || lowerInterest.includes('series')) {
            categorizedInterests.tv_show.push(interest);
          } else if (lowerInterest.includes('game') || lowerInterest.includes('fps') || lowerInterest.includes('gaming')) {
            categorizedInterests.videogame.push(interest);
          } else if (lowerInterest.includes('travel') || lowerInterest.includes('backpack') || lowerInterest.includes('asia')) {
            categorizedInterests.travel.push(interest);
          } else if (lowerInterest.includes('art') || lowerInterest.includes('painting') || lowerInterest.includes('classical')) {
            categorizedInterests.art.push(interest);
          } else if (lowerInterest.includes('cuisine') || lowerInterest.includes('food') || lowerInterest.includes('italian')) {
            categorizedInterests.food.push(interest);
          }
        });
        
        return {
          id: friend.id,
          name: friend.name,
          interests: categorizedInterests,
          relationshipType: friend.relationshipType
        };
      });

      // Call Flask blend-recommendations endpoint
      const response = await fetch('https://taste-backend-fxwh.onrender.com/blend-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPreferences: userPreferences,
          friendPreferences: friendPreferences,
          selectedActivities: selectedActivities,
          userId: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get blend recommendations');
      }

      const blendData = await response.json();
      console.log('Blend recommendations:', blendData);

      // Save blend session to Firebase
      const blendSession = {
        friends: selectedFriends,
        activities: selectedActivities,
        userId,
        createdAt: new Date(),
        recommendations: blendData.recommendations || [],
        activity: blendData.activity || selectedActivities[0]
      };

      const docRef = await addDoc(collection(FIREBASE_DB, 'blendSessions'), blendSession);
      
      setCurrentBlendSession({
        id: docRef.id,
        ...blendSession,
      });
      
      setShowStartBlendModal(false);
    } catch (error) {
      console.error('Error starting blend:', error);
      Alert.alert('Error', 'Failed to start blend. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={[styles.loadingText, { color: darkMode ? '#ffffff' : '#111827' }]}>
            Loading your blend space...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.subtitle, { color: darkMode ? '#9ca3af' : '#374151' }]}>
            Create shared experiences with friends
          </Text>
        </View>

        {/* Add Friend Section - Only show if no friends */}
        {friends.length === 0 && (
          <View style={styles.emptyBlendContainer}>
            <LinearGradient
              colors={result?.archetype?.gradientColors || ['#6366f1', '#8b5cf6']}
              style={styles.gradientHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.gradientTitle}>Start Your Blend Journey</Text>
              <Text style={styles.gradientSubtitle}>Connect with friends who share your taste and discover amazing experiences together</Text>
            </LinearGradient>
            
            <View style={styles.centerButtonContainer}>
              <TouchableOpacity
                style={[styles.centeredAddButton, { 
                  borderColor: result?.archetype?.color || '#6366f1',
                  shadowColor: result?.archetype?.color || '#6366f1'
                }]}
                onPress={() => setShowAddFriendModal(true)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, { backgroundColor: result?.archetype?.color || '#6366f1' }]}>
                  <PlusIcon size={20} color="#ffffff" />
                </View>
                <Text style={[styles.centeredAddButtonText, { color: result?.archetype?.color || '#6366f1' }]}>Add Your First Friend</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Friends List */}
        {friends.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: darkMode ? '#ffffff' : '#111827' }]}>
              Your Friends
            </Text>
            <View style={styles.friendsGrid}>
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onEdit={handleEditFriend}
                  onDelete={handleDeleteFriend}
                  darkMode={darkMode}
                />
              ))}
            </View>
            
            <TouchableOpacity
              style={[styles.addMoreButton, { 
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                borderColor: darkMode ? '#374151' : '#e5e7eb'
              }]}
              onPress={() => setShowAddFriendModal(true)}
              activeOpacity={0.8}
            >
              <PlusIcon size={16} color={darkMode ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.addMoreText, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
                Add More Friends
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Start Blend Section */}
        {friends.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.startBlendButton, { backgroundColor: '#10b981' }]}
              onPress={() => setShowStartBlendModal(true)}
              activeOpacity={0.8}
            >
              <SparklesIcon size={20} color="#ffffff" />
              <Text style={styles.startBlendButtonText}>Start Blend</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Blend Suggestions */}
        {currentBlendSession && friends.length > 0 && (
          <BlendSuggestions
            blendSession={currentBlendSession}
            friends={friends}
            darkMode={darkMode}
          />
        )}

        {/* Empty State */}
        {friends.length === 0 && (
          <View style={styles.emptyState}>
            <SparklesIcon size={48} color={darkMode ? '#374151' : '#d1d5db'} />
            <Text style={[styles.emptyTitle, { color: darkMode ? '#9ca3af' : '#374151' }]}>
              No friends added yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: darkMode ? '#6b7280' : '#6b7280' }]}>
              Add friends to start creating shared experiences
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <AddFriendModal
        visible={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        onAddFriend={handleAddFriend}
        darkMode={darkMode}
      />

      <StartBlendModal
        visible={showStartBlendModal}
        onClose={() => setShowStartBlendModal(false)}
        friends={friends}
        onStartBlend={handleStartBlend}
        darkMode={darkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Rubik',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Rubik',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginLeft: 8,
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
  },
  addMoreText: {
    fontSize: 14,
    fontFamily: 'Rubik',
    marginLeft: 6,
  },
  startBlendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startBlendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginLeft: 8,
  },
  emptyBlendContainer: {
    flex: 1,
    minHeight: 400,
  },
  gradientHeader: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    alignItems: 'center',
  },
  gradientTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Rubik',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  gradientSubtitle: {
    fontSize: 16,
    color: '#000000',
    fontFamily: 'Rubik',
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  centerButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  centeredAddButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
});

export default Blend;