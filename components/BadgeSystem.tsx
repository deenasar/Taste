import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { AppContext } from '../App';
import { SessionManager } from './SessionManager';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig';
import LinearGradient from 'react-native-linear-gradient';
import { 
  EyeIcon, 
  MusicalNoteIcon, 
  ChatBubbleLeftRightIcon, 
  ShareIcon, 
  HeartIcon, 
  FireIcon, 
  TrophyIcon 
} from 'react-native-heroicons/solid';

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  trigger: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

const BADGES: Badge[] = [
  {
    id: 'explorer',
    name: 'Explorer',
    emoji: '🗺️',
    description: 'Viewed all 4 categories in one day',
    trigger: 'View music, movies, books, and podcasts',
    unlocked: false
  },
  {
    id: 'daily_listener',
    name: 'Daily Listener',
    emoji: '🎵',
    description: 'Played at least 1 media today',
    trigger: 'Play any song or podcast',
    unlocked: false
  },
  {
    id: 'cultural_critic',
    name: 'Cultural Critic',
    emoji: '🎭',
    description: 'Voted in mood poll today',
    trigger: 'Select your daily mood',
    unlocked: false
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    emoji: '🦋',
    description: 'Shared a recommendation',
    trigger: 'Share any recommendation',
    unlocked: false
  },
  {
    id: 'curator',
    name: 'Curator',
    emoji: '❤️',
    description: 'Liked 10+ recommendations',
    trigger: 'Like recommendations',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'streak_seeker',
    name: 'Streak Seeker',
    emoji: '🔥',
    description: 'Active for 3 days in a row',
    trigger: 'Daily engagement streak',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'badge_hunter',
    name: 'Badge Hunter',
    emoji: '🏆',
    description: 'Unlocked 5 total badges',
    trigger: 'Collect other badges',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  }
];

interface BadgeSystemProps {
  onBadgeUnlocked?: (badge: Badge) => void;
}

export const BadgeSystem: React.FC<BadgeSystemProps> = ({ onBadgeUnlocked }) => {
  const { darkMode } = useContext(AppContext)!;
  const [badges, setBadges] = useState<Badge[]>(BADGES);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    loadBadgeProgress();
  }, []);

  const loadBadgeProgress = async () => {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeDoc = await getDoc(doc(FIREBASE_DB, 'badges', session.uid));
      if (badgeDoc.exists()) {
        const data = badgeDoc.data();
        const updatedBadges = BADGES.map(badge => ({
          ...badge,
          unlocked: data[badge.id]?.unlocked || false,
          progress: data[badge.id]?.progress || 0
        }));
        setBadges(updatedBadges);
      }
    } catch (error) {
      console.error('Error loading badge progress:', error);
    }
  };

  const updateBadgeProgress = async (badgeId: string, progress: number, unlocked: boolean = false) => {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      await updateDoc(badgeRef, {
        [`${badgeId}.progress`]: progress,
        [`${badgeId}.unlocked`]: unlocked,
        [`${badgeId}.lastUpdated`]: new Date()
      });

      setBadges(prev => prev.map(badge => 
        badge.id === badgeId 
          ? { ...badge, progress, unlocked }
          : badge
      ));

      if (unlocked) {
        const badge = badges.find(b => b.id === badgeId);
        if (badge && !badge.unlocked) {
          setNewlyUnlockedBadge({ ...badge, unlocked: true });
          setShowModal(true);
          animateBadgeUnlock();
          onBadgeUnlocked?.(badge);
        }
      }
    } catch (error) {
      console.error('Error updating badge progress:', error);
    }
  };

  const animateBadgeUnlock = () => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const checkBadgeHunter = async () => {
    const unlockedCount = badges.filter(b => b.unlocked).length;
    if (unlockedCount >= 5) {
      await updateBadgeProgress('badge_hunter', 5, true);
    } else {
      await updateBadgeProgress('badge_hunter', unlockedCount, false);
    }
  };

  // Public methods for triggering badge progress
  const triggerExplorer = async (categories: string[]) => {
    const requiredCategories = ['music', 'movies', 'books', 'podcasts'];
    const hasAllCategories = requiredCategories.every(cat => categories.includes(cat));
    if (hasAllCategories) {
      await updateBadgeProgress('explorer', 4, true);
      checkBadgeHunter();
    }
  };

  const triggerDailyListener = async () => {
    await updateBadgeProgress('daily_listener', 1, true);
    checkBadgeHunter();
  };

  const triggerCulturalCritic = async () => {
    await updateBadgeProgress('cultural_critic', 1, true);
    checkBadgeHunter();
  };

  const triggerSocialButterfly = async () => {
    await updateBadgeProgress('social_butterfly', 1, true);
    checkBadgeHunter();
  };

  const triggerCurator = async (likesCount: number) => {
    const unlocked = likesCount >= 10;
    await updateBadgeProgress('curator', likesCount, unlocked);
    if (unlocked) checkBadgeHunter();
  };

  const triggerStreakSeeker = async (streakCount: number) => {
    const unlocked = streakCount >= 3;
    await updateBadgeProgress('streak_seeker', streakCount, unlocked);
    if (unlocked) checkBadgeHunter();
  };

  const renderBadge = (badge: Badge) => {
    const isUnlocked = badge.unlocked;
    
    return (
      <TouchableOpacity
        key={badge.id}
        style={[
          styles.badgeCard,
          !isUnlocked && styles.lockedBadge
        ]}
        onPress={() => {
          setSelectedBadge(badge);
          setShowModal(true);
        }}
      >
        <LinearGradient
          colors={isUnlocked 
            ? ['#fbbf24', '#f59e0b'] 
            : ['#6b7280', '#4b5563']
          }
          style={styles.badgeGradient}
        >
          <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.1]
                })
              }]
            }
          ]}
        >
          {newlyUnlockedBadge ? (
            <LinearGradient
              colors={['#fbbf24', '#f59e0b']}
              style={styles.unlockModalGradient}
            >
              <Text style={styles.unlockTitle}>🎉 Badge Unlocked! 🎉</Text>
              <Text style={styles.unlockEmoji}>{newlyUnlockedBadge.emoji}</Text>
              <Text style={styles.unlockName}>{newlyUnlockedBadge.name}</Text>
              <Text style={styles.unlockDescription}>{newlyUnlockedBadge.description}</Text>
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={() => {
                  setShowModal(false);
                  setNewlyUnlockedBadge(null);
                }}
              >
                <Text style={styles.unlockButtonText}>Awesome!</Text>
              </TouchableOpacity>
            </LinearGradient>
          ) : selectedBadge ? (
            <View style={[styles.detailModal, { backgroundColor: darkMode ? '#1f2937' : '#fff' }]}>
              <Text style={styles.detailEmoji}>{selectedBadge.emoji}</Text>
              <Text style={[styles.detailName, { color: darkMode ? '#fff' : '#000' }]}>
                {selectedBadge.name}
              </Text>
              <Text style={[styles.detailDescription, { color: darkMode ? '#d1d5db' : '#6b7280' }]}>
                {selectedBadge.description}
              </Text>
              <Text style={[styles.detailTrigger, { color: darkMode ? '#9ca3af' : '#9ca3af' }]}>
                {selectedBadge.unlocked ? '✅ Unlocked!' : `🎯 ${selectedBadge.trigger}`}
              </Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: darkMode ? '#374151' : '#f3f4f6' }]}
                onPress={() => {
                  setShowModal(false);
                  setSelectedBadge(null);
                }}
              >
                <Text style={[styles.closeButtonText, { color: darkMode ? '#fff' : '#000' }]}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );

  return { badges, renderBadge, renderModal, triggerExplorer, triggerDailyListener, triggerCulturalCritic, triggerSocialButterfly, triggerCurator, triggerStreakSeeker };
};

const styles = StyleSheet.create({
  badgeCard: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  lockedBadge: {
    opacity: 0.5,
  },
  badgeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 18,
  },
  badgeName: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Rubik',
  },
  lockedText: {
    color: '#d1d5db',
  },
  progressContainer: {
    width: '100%',
    marginTop: 2,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  progressText: {
    fontSize: 6,
    color: '#fff',
    textAlign: 'center',
    marginTop: 1,
    fontFamily: 'Lato',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  unlockModalGradient: {
    padding: 24,
    alignItems: 'center',
  },
  unlockTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    fontFamily: 'Rubik',
  },
  unlockEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  unlockName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Rubik',
  },
  unlockDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Lato',
  },
  unlockButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  unlockButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Rubik',
  },
  detailModal: {
    padding: 24,
    alignItems: 'center',
  },
  detailEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  detailName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Rubik',
  },
  detailDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Lato',
  },
  detailTrigger: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
    fontFamily: 'Lato',
  },
  closeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  closeButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Rubik',
  },
});