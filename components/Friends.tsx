import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { AppContext } from '@/App';
import { SessionManager } from './SessionManager';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig';
import { UserGroupIcon, SparklesIcon, XMarkIcon, ChevronLeftIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import { ARCHETYPES } from '@/constants';
import { useNavigation } from '@react-navigation/native';

const Friends: React.FC = () => {
  const context = useContext(AppContext);
  const { darkMode, result } = context || {};
  const navigation = useNavigation();
  const [tasteTwinFriends, setTasteTwinFriends] = useState([]);
  const [unexpectedFriends, setUnexpectedFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const currentSession = await SessionManager.getSession();
      if (!currentSession?.uid) return;
      
      const friendsQuery = query(
        collection(FIREBASE_DB, 'friends'),
        where('userId', '==', currentSession.uid)
      );
      
      const friendsSnapshot = await getDocs(friendsQuery);
      const allFriends = [];
      
      friendsSnapshot.forEach(doc => {
        const friendData = doc.data();
        allFriends.push({
          id: friendData.friendId,
          name: friendData.friendName,
          archetype: friendData.friendArchetype,
          addedAt: friendData.addedAt
        });
      });
      
      // Separate friends by archetype
      const currentArchetype = result?.archetype?.name;
      const tasteTwins = allFriends.filter(friend => friend.archetype === currentArchetype);
      const unexpected = allFriends.filter(friend => friend.archetype !== currentArchetype);
      
      setTasteTwinFriends(tasteTwins);
      setUnexpectedFriends(unexpected);
      
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId, friendName) => {
    try {
      const { SessionManager } = require('./SessionManager');
      const { collection, query, where, getDocs, deleteDoc } = require('firebase/firestore');
      const { FIREBASE_DB } = require('../firebaseConfig');
      
      const currentSession = await SessionManager.getSession();
      if (!currentSession?.uid) return;
      
      // Remove friendship from both directions
      const friendsQuery1 = query(
        collection(FIREBASE_DB, 'friends'),
        where('userId', '==', currentSession.uid),
        where('friendId', '==', friendId)
      );
      
      const friendsQuery2 = query(
        collection(FIREBASE_DB, 'friends'),
        where('userId', '==', friendId),
        where('friendId', '==', currentSession.uid)
      );
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(friendsQuery1),
        getDocs(friendsQuery2)
      ]);
      
      const deletePromises = [];
      snapshot1.forEach(doc => deletePromises.push(deleteDoc(doc.ref)));
      snapshot2.forEach(doc => deletePromises.push(deleteDoc(doc.ref)));
      
      await Promise.all(deletePromises);
      
      // Refresh friends list
      fetchFriends();
      
    } catch (error) {
      console.error('Error removing friend:', error);
    }
  };

  const openChat = (friend) => {
    navigation.navigate('MainTabs', {
      screen: 'Community',
      params: {
        screen: 'CommunityChat',
        params: {
          chatType: 'private',
          recipientId: friend.id,
          recipientName: friend.name,
          sourceTab: 'Friends'
        }
      }
    });
  };



  const styles = createStyles(darkMode, result);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Dashboard' })}
        >
          <ChevronLeftIcon size={24} color={result?.archetype?.color || '#6C63FF'} />
        </TouchableOpacity>
        <UserGroupIcon size={24} color={result?.archetype?.color || '#6C63FF'} />
        <Text style={styles.headerTitle}>My Friends</Text>
      </View>

        <ScrollView style={styles.friendsContainer} showsVerticalScrollIndicator={false}>
          
          {/* Taste Twin Friends */}
          {tasteTwinFriends.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <SparklesIcon size={24} color={result?.archetype?.color || '#6C63FF'} />
                <Text style={styles.sectionTitle}>Taste Twins</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Friends from your {result?.archetype?.name} community</Text>
              {tasteTwinFriends.map(friend => {
                const archetype = ARCHETYPES.find(arch => arch.name === friend.archetype) || ARCHETYPES[0];
                return (
                  <View key={friend.id} style={[
                    styles.suggestionTile,
                    {
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      shadowColor: archetype.color,
                      marginBottom: 12
                    }
                  ]}>
                    <View style={styles.suggestionContent}>
                      <View style={[styles.suggestionAvatar, { backgroundColor: archetype.color }]}>
                        <Text style={styles.suggestionAvatarText}>{friend.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      
                      <View style={styles.suggestionInfo}>
                        <Text style={[styles.suggestionName, { color: darkMode ? '#ffffff' : '#000000' }]}>{friend.name}</Text>
                        <View style={styles.suggestionDetails}>
                          <View style={[styles.archetypeContainer, { backgroundColor: archetype.color + '20', borderColor: archetype.color }]}>
                            <Text style={[styles.suggestionArchetype, { color: archetype.color }]}>{friend.archetype}</Text>
                          </View>
                          <View style={[styles.tasteTwinBadge, { backgroundColor: archetype.color + '30', borderColor: archetype.color }]}>
                            <Text style={[styles.tasteTwinText, { color: archetype.color }]}>Taste Twin</Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.friendActions}>
                        <TouchableOpacity 
                          style={[styles.removeButton, { backgroundColor: archetype.color }]}
                          onPress={() => removeFriend(friend.id, friend.name)}
                          activeOpacity={0.7}
                        >
                          <XMarkIcon size={14} color="white" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.chatButton}
                          onPress={() => {
                            console.log('Chat button pressed for:', friend.name);
                            openChat(friend);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.chatButtonText}>💬</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          
          {/* Unexpected Friends */}
          {unexpectedFriends.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <UserGroupIcon size={24} color={result?.archetype?.color || '#6C63FF'} />
                <Text style={styles.sectionTitle}>Unexpected Connections</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Friends from different archetype communities</Text>
              {unexpectedFriends.map(friend => {
                const archetype = ARCHETYPES.find(arch => arch.name === friend.archetype) || ARCHETYPES[0];
                return (
                  <View key={friend.id} style={[
                    styles.suggestionTile,
                    {
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      shadowColor: archetype.color,
                      marginBottom: 12
                    }
                  ]}>
                    <View style={styles.suggestionContent}>
                      <View style={[styles.suggestionAvatar, { backgroundColor: archetype.color }]}>
                        <Text style={styles.suggestionAvatarText}>{friend.name.charAt(0).toUpperCase()}</Text>
                      </View>
                      
                      <View style={styles.suggestionInfo}>
                        <Text style={[styles.suggestionName, { color: darkMode ? '#ffffff' : '#000000' }]}>{friend.name}</Text>
                        <View style={styles.suggestionDetails}>
                          <View style={[styles.archetypeContainer, { backgroundColor: archetype.color + '20', borderColor: archetype.color }]}>
                            <Text style={[styles.suggestionArchetype, { color: archetype.color }]}>{friend.archetype}</Text>
                          </View>
                          <View style={[styles.unexpectedBadgeNew, { backgroundColor: archetype.color + '30', borderColor: archetype.color }]}>
                            <Text style={[styles.unexpectedTextNew, { color: archetype.color }]}>Unexpected</Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.friendActions}>
                        <TouchableOpacity 
                          style={[styles.removeButton, { backgroundColor: archetype.color }]}
                          onPress={() => removeFriend(friend.id, friend.name)}
                          activeOpacity={0.7}
                        >
                          <XMarkIcon size={14} color="white" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.chatButton}
                          onPress={() => {
                            console.log('Chat button pressed for:', friend.name);
                            openChat(friend);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.chatButtonText}>💬</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
          
          {/* Empty State */}
          {tasteTwinFriends.length === 0 && unexpectedFriends.length === 0 && (
            <View style={styles.emptyContainer}>
              <UserGroupIcon size={48} color={darkMode ? '#6b7280' : '#9ca3af'} />
              <Text style={styles.emptyTitle}>No Friends Yet</Text>
              <Text style={styles.emptySubtitle}>
                Connect with taste twins and unexpected connections from the Community and Discover tabs!
              </Text>
            </View>
          )}
        </ScrollView>
    </View>
  );
};

const createStyles = (darkMode: boolean, result: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#1f2937',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
  },
  friendsContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
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
    color: darkMode ? '#fff' : '#1f2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    marginBottom: 16,
  },
  // New Suggestion Tile Styles
  suggestionTile: {
    borderRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
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
  tasteTwinBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  tasteTwinText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  unexpectedBadgeNew: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  unexpectedTextNew: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#d1d5db' : '#374151',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default Friends;