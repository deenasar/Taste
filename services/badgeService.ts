import { SessionManager } from '../components/SessionManager';
import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig';

export interface BadgeProgress {
  viewedCategoriesToday: string[];
  mediaPlayedToday: boolean;
  votedInMoodPollToday: boolean;
  sharedContentToday: boolean;
  likesCount: number;
  loginStreakCount: number;
  unlockedBadges: string[];
  lastActiveDates: string[];
}

class BadgeService {
  private static instance: BadgeService;
  
  static getInstance(): BadgeService {
    if (!BadgeService.instance) {
      BadgeService.instance = new BadgeService();
    }
    return BadgeService.instance;
  }

  async initializeBadgeProgress(): Promise<void> {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      const badgeDoc = await getDoc(badgeRef);

      if (!badgeDoc.exists()) {
        const initialProgress: BadgeProgress = {
          viewedCategoriesToday: [],
          mediaPlayedToday: false,
          votedInMoodPollToday: false,
          sharedContentToday: false,
          likesCount: 0,
          loginStreakCount: 0,
          unlockedBadges: [],
          lastActiveDates: []
        };

        await setDoc(badgeRef, {
          ...initialProgress,
          explorer: { unlocked: false, progress: 0 },
          daily_listener: { unlocked: false, progress: 0 },
          cultural_critic: { unlocked: false, progress: 0 },
          social_butterfly: { unlocked: false, progress: 0 },
          curator: { unlocked: false, progress: 0 },
          streak_seeker: { unlocked: false, progress: 0 },
          badge_hunter: { unlocked: false, progress: 0 }
        });
      }
    } catch (error) {
      console.error('Error initializing badge progress:', error);
    }
  }

  async trackCategoryView(category: string): Promise<void> {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      const badgeDoc = await getDoc(badgeRef);
      
      if (badgeDoc.exists()) {
        const data = badgeDoc.data();
        const viewedToday = data.viewedCategoriesToday || [];
        
        if (!viewedToday.includes(category)) {
          const updatedViewed = [...viewedToday, category];
          await updateDoc(badgeRef, {
            viewedCategoriesToday: updatedViewed
          });

          // Check if all 4 categories viewed
          const requiredCategories = ['music', 'movies', 'books', 'podcasts'];
          if (requiredCategories.every(cat => updatedViewed.includes(cat))) {
            await this.unlockBadge('explorer');
          }
        }
      }
    } catch (error) {
      console.error('Error tracking category view:', error);
    }
  }

  async trackMediaPlay(): Promise<void> {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      await updateDoc(badgeRef, {
        mediaPlayedToday: true
      });

      await this.unlockBadge('daily_listener');
    } catch (error) {
      console.error('Error tracking media play:', error);
    }
  }

  async trackMoodVote(): Promise<void> {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      await updateDoc(badgeRef, {
        votedInMoodPollToday: true
      });

      await this.unlockBadge('cultural_critic');
    } catch (error) {
      console.error('Error tracking mood vote:', error);
    }
  }

  async trackShare(): Promise<void> {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      await updateDoc(badgeRef, {
        sharedContentToday: true
      });

      await this.unlockBadge('social_butterfly');
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  }

  async trackLike(): Promise<void> {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      const badgeDoc = await getDoc(badgeRef);
      
      if (badgeDoc.exists()) {
        const data = badgeDoc.data();
        const newLikesCount = (data.likesCount || 0) + 1;
        
        await updateDoc(badgeRef, {
          likesCount: newLikesCount,
          [`curator.progress`]: newLikesCount
        });

        if (newLikesCount >= 10) {
          await this.unlockBadge('curator');
        }
      }
    } catch (error) {
      console.error('Error tracking like:', error);
    }
  }

  async trackDailyLogin(): Promise<void> {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const today = new Date().toDateString();
      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      const badgeDoc = await getDoc(badgeRef);
      
      if (badgeDoc.exists()) {
        const data = badgeDoc.data();
        const lastActiveDates = data.lastActiveDates || [];
        
        if (!lastActiveDates.includes(today)) {
          const updatedDates = [...lastActiveDates, today].slice(-7); // Keep last 7 days
          
          // Calculate streak
          let streak = 1;
          const sortedDates = updatedDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          
          for (let i = 1; i < sortedDates.length; i++) {
            const currentDate = new Date(sortedDates[i]);
            const previousDate = new Date(sortedDates[i - 1]);
            const dayDiff = (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (dayDiff === 1) {
              streak++;
            } else {
              break;
            }
          }

          await updateDoc(badgeRef, {
            lastActiveDates: updatedDates,
            loginStreakCount: streak,
            [`streak_seeker.progress`]: streak
          });

          if (streak >= 3) {
            await this.unlockBadge('streak_seeker');
          }
        }
      }
    } catch (error) {
      console.error('Error tracking daily login:', error);
    }
  }

  private async unlockBadge(badgeId: string): Promise<void> {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      const badgeDoc = await getDoc(badgeRef);
      
      if (badgeDoc.exists()) {
        const data = badgeDoc.data();
        
        if (!data[badgeId]?.unlocked) {
          await updateDoc(badgeRef, {
            [`${badgeId}.unlocked`]: true,
            [`${badgeId}.unlockedAt`]: new Date()
          });

          // Check badge hunter
          const unlockedBadges = Object.keys(data).filter(key => 
            key !== 'viewedCategoriesToday' && 
            key !== 'mediaPlayedToday' && 
            key !== 'votedInMoodPollToday' && 
            key !== 'sharedContentToday' && 
            key !== 'likesCount' && 
            key !== 'loginStreakCount' && 
            key !== 'unlockedBadges' && 
            key !== 'lastActiveDates' &&
            data[key]?.unlocked
          );

          if (unlockedBadges.length >= 5 && !data.badge_hunter?.unlocked) {
            await updateDoc(badgeRef, {
              'badge_hunter.unlocked': true,
              'badge_hunter.unlockedAt': new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Error unlocking badge:', error);
    }
  }

  async resetDailyProgress(): Promise<void> {
    try {
      const session = await SessionManager.getSession();
      if (!session?.uid) return;

      const badgeRef = doc(FIREBASE_DB, 'badges', session.uid);
      await updateDoc(badgeRef, {
        viewedCategoriesToday: [],
        mediaPlayedToday: false,
        votedInMoodPollToday: false,
        sharedContentToday: false
      });
    } catch (error) {
      console.error('Error resetting daily progress:', error);
    }
  }
}

export default BadgeService.getInstance();