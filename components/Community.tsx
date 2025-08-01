import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, where, getDocs, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig'; // Make sure this path is correct
import { AppContext } from '@/App';
import { generateCommunityRecommendations } from '@/services/communityService';
import LinearGradient from 'react-native-linear-gradient';
import { HeartIcon, TrophyIcon, UserGroupIcon, SparklesIcon, ChevronDownIcon, UserPlusIcon } from 'react-native-heroicons/solid';
import { SessionManager } from './SessionManager';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CommunityStackParamList } from '@/App';
import NotificationService from '../services/notificationService';



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

// Helper function to get archetype-specific descriptions
const getArchetypeDescription = (archetype: string) => {
  switch(archetype) {
    case 'IndieExplorer': 
      return 'Join a community of explorers who seek out hidden gems and forge their own paths. Share your discoveries and find your next favorite indie experience.';
    case 'GlobalNomad': 
      return 'Connect with fellow travelers and cultural enthusiasts from around the world. Exchange stories, recommendations, and perspectives that transcend borders.';
    case 'RetroReviver': 
      return 'Step into a space where nostalgia thrives. Celebrate the classics with others who appreciate the timeless appeal of vintage aesthetics and experiences.';
    case 'MindfulAesthete': 
      return 'Find your balance in a community that values wellness, intention, and beautiful design. Share mindful practices and aesthetic inspirations.';
    case 'UndergroundSeeker': 
      return 'Dive deep with fellow cultural rebels who appreciate the authentic and unconventional. Discover subcultures and movements that challenge the mainstream.';
    case 'PopCultureConnoisseur': 
      return 'Stay ahead of trends with enthusiasts who live for what\'s new and exciting in mainstream entertainment. Be the first to know what\'s next in pop culture.';
    case 'TechnoFuturist': 
      return 'Explore the cutting edge with forward-thinkers who are as excited about tomorrow\'s innovations as you are. Shape the future together.';
    case 'CulturalCurator': 
      return 'Join fellow collectors and curators who appreciate the art of selection. Share your carefully curated treasures and discover new cultural artifacts.';
    default: 
      return 'Connect with people who share your unique perspective and tastes. Discover new experiences tailored to your preferences.';
  }
};

export default function Community() {
  const context = useContext(AppContext);
  const darkMode = context?.darkMode || false;
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [tasteTwin, setTasteTwin] = useState(null);
  const [allTwins, setAllTwins] = useState([]);
  const [twinLoading, setTwinLoading] = useState(false);
  const archetypeName = context?.result?.archetype?.name || 'Taste Explorer';
  
  // State for like counts and user's like status
  const [likeCounts, setLikeCounts] = useState({
    item1: { count: 0, liked: false },
    item2: { count: 0, liked: false },
    item3: { count: 0, liked: false },
    item4: { count: 0, liked: false },
    item5: { count: 0, liked: false }
  });
  
  // State for featured item and countdown
  const [featuredItem, setFeaturedItem] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Dropdown state
  const [selectedCategory, setSelectedCategory] = useState('Movies');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownOptions = ['Movies', 'Music', 'Travel', 'Books', 'Podcast'];
  
  // View all twins state
  const [showAllTwins, setShowAllTwins] = useState(false);
  
  // Friends state
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  
  // Community recommendations state
  const [communityRecommendations, setCommunityRecommendations] = useState(null);
  const [communityLoading, setCommunityLoading] = useState(false);
  
  // Function to handle likes - toggle like/unlike with Firestore sync
  const handleLike = async (itemId) => {
    const weekId = getCurrentWeekId();
    const likesDocId = `${archetypeName}_${selectedCategory.toLowerCase()}_${weekId}_likes`;
    const likesDocRef = doc(FIREBASE_DB, 'community_likes', likesDocId);
    
    const isCurrentlyLiked = likeCounts[itemId].liked;
    const increment_value = isCurrentlyLiked ? -1 : 1;
    
    try {
      // Update Firestore
      await updateDoc(likesDocRef, {
        [itemId]: increment(increment_value)
      });
      
      // Update local state
      setLikeCounts(prev => ({
        ...prev,
        [itemId]: { 
          count: prev[itemId].count + increment_value,
          liked: !prev[itemId].liked 
        }
      }));
    } catch (error) {
      // If document doesn't exist, create it
      try {
        await setDoc(likesDocRef, {
          item1: itemId === 'item1' ? increment_value : 0,
          item2: itemId === 'item2' ? increment_value : 0,
          item3: itemId === 'item3' ? increment_value : 0,
          item4: itemId === 'item4' ? increment_value : 0,
          item5: itemId === 'item5' ? increment_value : 0,
          weekId: weekId,
          archetype: archetypeName,
          category: selectedCategory.toLowerCase()
        });
        
        setLikeCounts(prev => ({
          ...prev,
          [itemId]: { 
            count: prev[itemId].count + increment_value,
            liked: !prev[itemId].liked 
          }
        }));
      } catch (createError) {
        console.error('Error creating likes document:', createError);
      }
    }
  };
  
  // Get poll items from community recommendations or show loading
  const getPollItems = () => {
    if (communityLoading) {
      return [
        { id: 'item1', title: 'Loading...', image: 'https://picsum.photos/200/200?random=1' },
        { id: 'item2', title: 'Loading...', image: 'https://picsum.photos/200/200?random=2' },
        { id: 'item3', title: 'Loading...', image: 'https://picsum.photos/200/200?random=3' },
        { id: 'item4', title: 'Loading...', image: 'https://picsum.photos/200/200?random=4' },
        { id: 'item5', title: 'Loading...', image: 'https://picsum.photos/200/200?random=5' }
      ];
    }
    
    if (communityRecommendations?.recommendations && communityRecommendations.recommendations.length > 0) {
      return communityRecommendations.recommendations.slice(0, 5).map((item, index) => ({
        id: `item${index + 1}`,
        title: item.name || item.title || `Item ${index + 1}`,
        image: item.image || `https://picsum.photos/200/200?random=${index + 1}`
      }));
    }
    
    // Fallback when no recommendations available
    return [
      { id: 'item1', title: 'No data', image: 'https://picsum.photos/200/200?random=1' },
      { id: 'item2', title: 'No data', image: 'https://picsum.photos/200/200?random=2' },
      { id: 'item3', title: 'No data', image: 'https://picsum.photos/200/200?random=3' },
      { id: 'item4', title: 'No data', image: 'https://picsum.photos/200/200?random=4' },
      { id: 'item5', title: 'No data', image: 'https://picsum.photos/200/200?random=5' }
    ];
  };
  
  const pollItems = getPollItems();
  
  // Function to find the item with the highest likes
  const findFeaturedItem = () => {
    let highestCount = -1;
    let featured = null;
    
    Object.entries(likeCounts).forEach(([itemId, data]) => {
      if (data.count > highestCount) {
        highestCount = data.count;
        featured = pollItems.find(item => item.id === itemId);
      }
    });
    
    return featured;
  };
  
  // Calculate time remaining based on the weekly schedule
  // Featured movie is displayed from Friday 10PM to Monday 10AM
  // New voting period starts Monday 10AM until Friday 10PM
  const calculateTimeRemaining = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, 5 = Friday
    const hour = now.getHours();
    let targetDate = new Date();
    let isVotingPeriod = true;
    
    // If it's Friday after 10PM or weekend or Monday before 10AM, we're in featured display period
    if ((day === 5 && hour >= 22) || day === 0 || day === 6 || (day === 1 && hour < 10)) {
      isVotingPeriod = false;
      // Target is next Monday 10AM when voting starts again
      targetDate.setDate(now.getDate() + ((1 + 7 - day) % 7));
      targetDate.setHours(10, 0, 0, 0); // Monday 10AM
    } else {
      // We're in voting period, target is next Friday 10PM
      targetDate.setDate(now.getDate() + ((5 + 7 - day) % 7));
      targetDate.setHours(22, 0, 0, 0); // Friday 10PM
      
      // If today is Friday but before 10PM, set to today at 10PM
      if (day === 5 && hour < 22) {
        targetDate.setDate(now.getDate());
      }
    }
    
    // Calculate total seconds remaining
    const totalSeconds = Math.max(0, Math.floor((targetDate - now) / 1000));
    
    // Convert to days, hours, minutes, seconds
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { days, hours, minutes, seconds, isVotingPeriod };
  };
  
  // Update featured movie and countdown timer
  useEffect(() => {
    // Set initial featured item
    setFeaturedItem(findFeaturedItem());
    setTimeRemaining(calculateTimeRemaining());
    
    // Update countdown every second
    const countdownInterval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000); // Update every second
    
    // Update featured item every time likes change
    const featuredInterval = setInterval(() => {
      setFeaturedItem(findFeaturedItem());
    }, 5000); // Check every 5 seconds for demo purposes
    
    return () => {
      clearInterval(countdownInterval);
      clearInterval(featuredInterval);
    };
  }, [likeCounts]);
  
  // Fetch community recommendations on component mount and category change
  useEffect(() => {
    if (archetypeName) {
      fetchCommunityRecommendations(selectedCategory);
    }
  }, [selectedCategory, archetypeName]);

  // Load like counts from Firestore
  const loadLikeCounts = async (weekId) => {
    const likesDocId = `${archetypeName}_${selectedCategory.toLowerCase()}_${weekId}_likes`;
    const likesDocRef = doc(FIREBASE_DB, 'community_likes', likesDocId);
    
    try {
      const likesDoc = await getDoc(likesDocRef);
      if (likesDoc.exists()) {
        const likesData = likesDoc.data();
        setLikeCounts(prev => ({
          item1: { count: likesData.item1 || 0, liked: prev.item1.liked },
          item2: { count: likesData.item2 || 0, liked: prev.item2.liked },
          item3: { count: likesData.item3 || 0, liked: prev.item3.liked },
          item4: { count: likesData.item4 || 0, liked: prev.item4.liked },
          item5: { count: likesData.item5 || 0, liked: prev.item5.liked }
        }));
      }
    } catch (error) {
      console.error('Error loading like counts:', error);
    }
  };

  // Initial load for default category
  useEffect(() => {
    if (archetypeName && !communityRecommendations) {
      fetchCommunityRecommendations('Movies');
    }
  }, [archetypeName]);

  // Listen to like counts changes in real-time
  useEffect(() => {
    if (!archetypeName || !selectedCategory) return;
    
    const weekId = getCurrentWeekId();
    const likesDocId = `${archetypeName}_${selectedCategory.toLowerCase()}_${weekId}_likes`;
    const likesDocRef = doc(FIREBASE_DB, 'community_likes', likesDocId);
    
    const unsubscribe = onSnapshot(likesDocRef, (doc) => {
      if (doc.exists()) {
        const likesData = doc.data();
        setLikeCounts(prev => ({
          item1: { count: likesData.item1 || 0, liked: prev.item1.liked },
          item2: { count: likesData.item2 || 0, liked: prev.item2.liked },
          item3: { count: likesData.item3 || 0, liked: prev.item3.liked },
          item4: { count: likesData.item4 || 0, liked: prev.item4.liked },
          item5: { count: likesData.item5 || 0, liked: prev.item5.liked }
        }));
      }
    });
    
    return () => unsubscribe();
  }, [archetypeName, selectedCategory]);

  useEffect(() => {
    if (!joined) return;

    const q = query(collection(FIREBASE_DB, 'community'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [joined]);

  // Auto-fetch taste twin on component mount and request notification permission
  useEffect(() => {
    const initializeCommunity = async () => {
      // Request notification permission when user first visits community
      await NotificationService.requestPermission();
      findTasteTwin();
    fetchFriends();
    };
    
    initializeCommunity();
    
    // Schedule poll reminder notification
    const scheduleWeeklyReminder = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      

    };
    
    scheduleWeeklyReminder();
  }, []);

  // Calculate preference similarity between two users
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
  
  const fetchFriends = async () => {
    setFriendsLoading(true);
    try {
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
      
      // Also add reverse friendship
      await addDoc(collection(FIREBASE_DB, 'friends'), {
        userId: friendId,
        friendId: currentSession.uid,
        friendName: currentSession.name || 'User',
        friendArchetype: archetypeName,
        addedAt: new Date(),
        status: 'connected'
      });
      
      console.log('Successfully added friend:', friendName);
      
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  const findTasteTwin = async () => {
    setTwinLoading(true);
    try {
      const currentSession = await SessionManager.getSession();
      console.log('Current session:', currentSession);
      
      if (!currentSession || !currentSession.uid) {
        console.log('No current session or uid');
        return;
      }
      
      console.log('Searching for archetype:', archetypeName);
      
      // Query users with same archetype
      const usersQuery = query(
        collection(FIREBASE_DB, 'users'),
        where('archetype.name', '==', archetypeName)
      );
      
      const snapshot = await getDocs(usersQuery);
      console.log('Found', snapshot.size, 'users with archetype:', archetypeName);
      
      const users = [];
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        console.log('User data:', doc.id, userData);
        
        // Skip current user
        if (doc.id !== currentSession.uid && userData.preferences) {
          const similarity = calculateSimilarity(currentSession.preferences || {}, userData.preferences);
          users.push({
            id: doc.id,
            name: userData.name,
            email: userData.email,
            preferences: userData.preferences,
            similarity: Math.round(similarity)
          });
        }
      });
      
      console.log('Processed users:', users);
      
      // Sort by similarity and get top 5 matches
      users.sort((a, b) => b.similarity - a.similarity);
      const topMatches = users.slice(0, 5);
      console.log('Top matches:', topMatches);
      
      setAllTwins(topMatches);
      setTasteTwin(topMatches[0] || null);
      
      // Send notification for new taste twin
      if (topMatches[0]) {
        console.log('🎆 Found taste twin:', topMatches[0].name, topMatches[0].similarity + '%');
        NotificationService.showTasteTwinNotification(
          topMatches[0].name, 
          topMatches[0].similarity
        );
      }
      

      
    } catch (error) {
      console.error('Error finding taste twin:', error);
    } finally {
      setTwinLoading(false);
    }
  };
  
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await generateCommunityRecommendations(archetypeName);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get current week ID
  const getCurrentWeekId = () => {
    const now = new Date();
    const year = now.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  // Function to call Flask community-recommendations endpoint with weekly caching
  const fetchCommunityRecommendations = async (category: string) => {
    setCommunityLoading(true);
    try {
      const weekId = getCurrentWeekId();
      const docId = `${archetypeName}_${category.toLowerCase()}_${weekId}`;
      const cacheDocRef = doc(FIREBASE_DB, 'community_recommendations', docId);
      
      // Check if cached recommendation exists
      const cacheDoc = await getDoc(cacheDocRef);
      
      if (cacheDoc.exists()) {
        // Use cached data
        const cachedData = cacheDoc.data();
        setCommunityRecommendations({
          recommendations: cachedData.recommendations,
          category: cachedData.category,
          archetype: cachedData.archetype
        });
        
        // Load like counts for cached data
        loadLikeCounts(weekId);
        return;
      }
      
      // No cache exists, call Flask endpoint
      const response = await fetch('https://taste-backend-fxwh.onrender.com/community-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: category.toLowerCase(),
          archetype: archetypeName
        })
      });
      
      let recommendationsData;
      if (response.ok) {
        recommendationsData = await response.json();
      } else {
        // Fallback to mock data if server fails
        recommendationsData = {
          recommendations: [
            { name: `${category} Item 1`, image: 'https://picsum.photos/200/200?random=1' },
            { name: `${category} Item 2`, image: 'https://picsum.photos/200/200?random=2' },
            { name: `${category} Item 3`, image: 'https://picsum.photos/200/200?random=3' },
            { name: `${category} Item 4`, image: 'https://picsum.photos/200/200?random=4' },
            { name: `${category} Item 5`, image: 'https://picsum.photos/200/200?random=5' }
          ],
          category: category.toLowerCase(),
          archetype: archetypeName
        };
      }
      
      // Cache the recommendations in Firestore
      await setDoc(cacheDocRef, {
        recommendations: recommendationsData.recommendations,
        category: recommendationsData.category,
        archetype: recommendationsData.archetype,
        weekId: weekId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
      
      // Update UI with fresh data
      setCommunityRecommendations(recommendationsData);
      
      // Load like counts for this category
      loadLikeCounts(weekId);
      
    } catch (error) {
      console.error('Error fetching community recommendations:', error);
      // Fallback to mock data on any error
      setCommunityRecommendations({
        recommendations: [
          { name: `${category} Item 1`, image: 'https://picsum.photos/200/200?random=1' },
          { name: `${category} Item 2`, image: 'https://picsum.photos/200/200?random=2' },
          { name: `${category} Item 3`, image: 'https://picsum.photos/200/200?random=3' },
          { name: `${category} Item 4`, image: 'https://picsum.photos/200/200?random=4' },
          { name: `${category} Item 5`, image: 'https://picsum.photos/200/200?random=5' }
        ]
      });
    } finally {
      setCommunityLoading(false);
    }
  };

  const navigation = useNavigation<StackNavigationProp<CommunityStackParamList>>();
  

  
  const handleJoin = () => {
    navigation.navigate('CommunityChat');
  };

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    await addDoc(collection(FIREBASE_DB, 'community'), {
      text: inputText,
      sender: archetypeName,
      createdAt: new Date()
    });

    setInputText('');
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <ScrollView style={[styles.wrapper, { backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ width: '100%', alignItems: 'center' }}
      >
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        {!joined ? (
          <>
            <LinearGradient
              colors={context?.result?.archetype?.gradientColors || ['#6C63FF', '#BDB2FF']}
              style={styles.archetypeCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.archetypeCardInner, { paddingVertical: 12 }]}>
                <View style={styles.archetypeHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: context?.result?.archetype?.color || '#6C63FF' }]}>
                    {context?.result?.archetype?.icon ? (
                      <context.result.archetype.icon size={32} color="white"/>
                    ) : (
                      <HeartIcon size={32} color="white"/>
                    )}
                  </View>
                  <View>
                    <Text style={[styles.archetypeName, { color: darkMode ? '#FFF' : '#000', textShadowColor: darkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)' }]}>{context?.result?.archetype?.name || 'Taste Explorer'}</Text>
                  </View>
                </View>
                <Text style={[styles.archetypeSummary, { marginBottom: 16, color: darkMode ? '#FFF' : '#000', textShadowColor: darkMode ? 'transparent' : 'rgba(255,255,255,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }]}>
                  {getArchetypeDescription(archetypeName)}
                </Text>
                <TouchableOpacity 
                  style={[styles.joinButton, { backgroundColor: darkMode ? 'rgba(255,255,255,0.25)' : (context?.result?.archetype?.color || '#6C63FF') + '80' }]}
                  onPress={handleJoin}
                >
                  <Text style={[styles.joinButtonText, { color: darkMode ? '#fff' : '#000', textShadowColor: darkMode ? 'transparent' : 'rgba(255,255,255,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }]}>Join Now</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </>
        ) : (
          <>
            <Text style={[styles.header, { color: darkMode ? '#fff' : '#333' }]}>Community Chat</Text>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={[styles.messageBubble, { backgroundColor: darkMode ? '#374151' : '#EFEFFF' }]}>
                  <Text style={[styles.sender, { color: context?.result?.archetype?.color || '#6C63FF' }]}>{item.sender}:</Text>
                  <Text style={[styles.messageText, { color: darkMode ? '#fff' : '#333' }]}>{item.text}</Text>
                </View>
              )}
              style={{ maxHeight: 350 }}
              contentContainerStyle={{ paddingBottom: 10 }}
            />
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: darkMode ? '#374151' : '#F0F0F0',
                  color: darkMode ? '#fff' : '#333'
                }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                placeholderTextColor={darkMode ? '#aaa' : '#999'}
              />
              <TouchableOpacity 
                onPress={sendMessage} 
                style={[styles.sendButton, { backgroundColor: context?.result?.archetype?.color || '#6C63FF' }]}
              >
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
      
      <View style={[styles.pollCard, { backgroundColor: darkMode ? '#1f2937' : '#fff' }]}>
        <View style={styles.pollContainer}>
          <View style={styles.pollHeader}>
            <View style={styles.pollTitleRow}>
              <Text style={[styles.pollTitle, { color: darkMode ? '#fff' : '#111827' }]}>Weekly Cultural Poll</Text>
              <View style={styles.dropdownContainer}>
                <TouchableOpacity 
                  style={[styles.dropdown, { backgroundColor: darkMode ? '#374151' : '#f3f4f6' }]}
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Text style={[styles.dropdownText, { color: darkMode ? '#fff' : '#111827' }]}>{selectedCategory}</Text>
                  <ChevronDownIcon size={16} color={darkMode ? '#fff' : '#111827'} style={styles.dropdownArrow} />
                </TouchableOpacity>
                {dropdownOpen && (
                  <View style={[styles.dropdownMenu, { backgroundColor: darkMode ? '#374151' : '#fff' }]}>
                    {dropdownOptions.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.dropdownOption, { backgroundColor: option === selectedCategory ? (context?.result?.archetype?.gradientColors?.[1] || '#BDB2FF') : 'transparent' }]}
                        onPress={() => {
                          if (option !== selectedCategory) {
                            setSelectedCategory(option);
                            setCommunityRecommendations(null); // Clear current data to show loading
                          }
                          setDropdownOpen(false);
                        }}
                      >
                        <Text style={[styles.dropdownOptionText, { color: option === selectedCategory ? '#fff' : (darkMode ? '#fff' : '#111827') }]}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
            <Text style={[styles.pollSubtitle, { color: darkMode ? '#ddd' : '#374151' }]}>This week's picks for <Text style={{fontWeight: 'bold', color: context?.result?.archetype?.color || '#6C63FF'}}>{archetypeName}</Text></Text>
          </View>
        
        <View style={styles.gridContainer}>
          {/* Poll items grid */}
          <View style={[styles.gridRow, { justifyContent: 'center', gap: 10 }]}>
            {pollItems.slice(0, 3).map((item) => (
              <View key={item.id} style={[styles.gridItem, featuredItem?.id === item.id ? styles.featuredPick : {}]}>
                <View style={styles.imageContainer}>
                  {featuredItem?.id === item.id && !timeRemaining.isVotingPeriod && (
                    <View style={styles.featuredBadge}>
                      <TrophyIcon size={12} color="#000" />
                      <Text style={styles.featuredText}>Featured</Text>
                    </View>
                  )}
                  <Image 
                    source={{ uri: item.image }} 
                    style={[styles.gridItemImage, { borderColor: context?.result?.archetype?.color || '#6C63FF' }]} 
                  />
                  <TouchableOpacity 
                    style={styles.heartContainer}
                    onPress={() => handleLike(item.id)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.likeCount}>{likeCounts[item.id].count}</Text>
                    <HeartIcon size={24} color={likeCounts[item.id].liked ? '#ff4081' : '#888'} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.gridItemTitle, { color: darkMode ? '#fff' : '#111827' }]}>{item.title}</Text>
              </View>
            ))}
          </View>
          
          {/* Second Row */}
          <View style={[styles.gridRow, { justifyContent: 'center', gap: 10 }]}>
            {pollItems.slice(3, 5).map((item) => (
              <View key={item.id} style={[styles.gridItem, featuredItem?.id === item.id ? styles.featuredPick : {}]}>
                <View style={styles.imageContainer}>
                  {featuredItem?.id === item.id && !timeRemaining.isVotingPeriod && (
                    <View style={styles.featuredBadge}>
                      <TrophyIcon size={12} color="#000" />
                      <Text style={styles.featuredText}>Featured</Text>
                    </View>
                  )}
                  <Image 
                    source={{ uri: item.image }} 
                    style={[styles.gridItemImage, { borderColor: context?.result?.archetype?.color || '#6C63FF' }]} 
                  />
                  <TouchableOpacity 
                    style={styles.heartContainer}
                    onPress={() => handleLike(item.id)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.likeCount}>{likeCounts[item.id].count}</Text>
                    <HeartIcon size={24} color={likeCounts[item.id].liked ? '#ff4081' : '#888'} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.gridItemTitle, { color: darkMode ? '#fff' : '#111827' }]}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Countdown Badge */}
        <View style={[styles.countdownBadge, { backgroundColor: darkMode ? '#374151' : '#f3f4f6', alignSelf: 'center', marginBottom: 16 }]}>
          <TrophyIcon size={16} color="#FFD700" />
          <Text style={[styles.countdownText, { color: darkMode ? '#fff' : '#111827' }]}>
            {timeRemaining.isVotingPeriod ? 
              `Voting ends in ${timeRemaining.days > 0 ? `${timeRemaining.days}d ` : ''}${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s` : 
              `Voting starts in ${timeRemaining.days > 0 ? `${timeRemaining.days}d ` : ''}${timeRemaining.hours}h ${timeRemaining.minutes}m ${timeRemaining.seconds}s`
            }
          </Text>
        </View>
        

        
        {/* Featured Item Section */}
        {featuredItem && !timeRemaining.isVotingPeriod && (
          <View style={[styles.featuredSection, { backgroundColor: darkMode ? '#374151' : '#f8fafc' }]}>
            <View style={styles.featuredHeader}>
              <TrophyIcon size={20} color="#FFD700" />
              <Text style={[styles.featuredTitle, { color: darkMode ? '#fff' : '#111827' }]}>This Week's Featured Pick</Text>
            </View>
            <View style={styles.featuredMovieCard}>
              <Image 
                source={{ uri: featuredItem.image }} 
                style={[styles.featuredMovieImage, { borderColor: context?.result?.archetype?.color || '#6C63FF' }]} 
              />
              <View style={styles.featuredMovieInfo}>
                <Text style={[styles.featuredMovieTitle, { color: darkMode ? '#fff' : '#111827' }]}>{featuredItem.title}</Text>
                <Text style={[styles.featuredMovieSubtitle, { color: darkMode ? '#d1d5db' : '#6b7280' }]}>Community Choice Winner</Text>
                <View style={styles.featuredStats}>
                  <HeartIcon size={16} color="#ff4081" />
                  <Text style={[styles.featuredLikes, { color: darkMode ? '#d1d5db' : '#6b7280' }]}>{likeCounts[featuredItem.id]?.count || 0} votes</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        </View>
      </View>
      
      {/* Taste Twins & Friends Container */}
      <View style={[
        styles.mirrorContainer,
        { backgroundColor: darkMode ? '#111827' : '#f9fafb' }
      ]}>
        <LinearGradient
          colors={darkMode ? ['#374151', context?.result?.archetype?.color + '20'] : ['#ffffff', context?.result?.archetype?.color + '20']}
          style={styles.mirrorHeaderGradient}
        >
          <View style={[styles.mirrorHeader, { alignItems: 'flex-start' }]}>
            <View style={styles.sectionHeader}>
              <UserGroupIcon size={24} color={context?.result?.archetype?.color || '#6C63FF'} />
              <Text style={[styles.sectionTitle, { color: darkMode ? '#ffffff' : '#000000' }]}>
                Taste Twin and Friends
              </Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: darkMode ? '#ffffff' : '#000000' }]}>
              Connect with people who share your taste preferences
            </Text>
          </View>
        </LinearGradient>
        
        <View style={styles.mirrorContent}>
          
          {twinLoading || friendsLoading ? (
            <View style={styles.twinLoadingContainer}>
              <ActivityIndicator size="small" color={context?.result?.archetype?.color || '#6C63FF'} />
              <Text style={[styles.twinLoadingText, { color: darkMode ? '#d1d5db' : '#6b7280' }]}>Loading...</Text>
            </View>
          ) : (
            <>
              {/* Friends Section */}
              {allTwins.filter(twin => friends.some(friend => friend.id === twin.id)).length > 0 && (
                <>
                  <Text style={[styles.subsectionTitle, { color: darkMode ? '#ffffff' : '#000000' }]}>Friends</Text>
                  {allTwins.filter(twin => friends.some(friend => friend.id === twin.id)).slice(0, showAllTwins ? undefined : 2).map((twin, index) => {
                    const archetype = { color: context?.result?.archetype?.color || '#6C63FF' };
                    return (
                      <View key={`friend-${twin.id}`} style={[
                        styles.suggestionTile,
                        {
                          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                          shadowColor: archetype.color,
                          marginBottom: 6
                        }
                      ]}>
                        <View style={styles.suggestionContent}>
                          <View style={[styles.suggestionAvatar, { backgroundColor: archetype.color }]}>
                            <Text style={styles.suggestionAvatarText}>{twin.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          
                          <View style={styles.suggestionInfo}>
                            <Text style={[styles.suggestionName, { color: darkMode ? '#ffffff' : '#000000' }]}>{twin.name}</Text>
                            <View style={styles.suggestionDetails}>
                              <View style={[styles.archetypeContainer, { backgroundColor: archetype.color + '20', borderColor: archetype.color }]}>
                                <Text style={[styles.suggestionArchetype, { color: archetype.color }]}>{archetypeName}</Text>
                              </View>
                              <View style={[styles.matchContainer, { backgroundColor: archetype.color + '30', borderColor: archetype.color }]}>
                                <Text style={[styles.matchText, { color: archetype.color }]}>{twin.similarity}% Match</Text>
                              </View>
                            </View>
                          </View>
                          
                          <TouchableOpacity 
                            style={[styles.suggestionButton, { backgroundColor: '#10b981' }]}
                            onPress={() => {
                              navigation.navigate('CommunityChat', { 
                                chatType: 'private',
                                recipientId: twin.id,
                                recipientName: twin.name,
                                sourceTab: 'Community'
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
              {allTwins.filter(twin => !friends.some(friend => friend.id === twin.id)).length > 0 && (
                <>
                  <Text style={[styles.subsectionTitle, { color: darkMode ? '#ffffff' : '#000000' }]}>New Connections</Text>
                  {allTwins.filter(twin => !friends.some(friend => friend.id === twin.id)).slice(0, showAllTwins ? undefined : 2).map((twin, index) => {
                    const archetype = { color: context?.result?.archetype?.color || '#6C63FF' };
                    return (
                      <View key={`new-${twin.id}`} style={[
                        styles.suggestionTile,
                        {
                          backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                          shadowColor: archetype.color,
                          marginBottom: 6
                        }
                      ]}>
                        <View style={styles.suggestionContent}>
                          <View style={[styles.suggestionAvatar, { backgroundColor: archetype.color }]}>
                            <Text style={styles.suggestionAvatarText}>{twin.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          
                          <View style={styles.suggestionInfo}>
                            <Text style={[styles.suggestionName, { color: darkMode ? '#ffffff' : '#000000' }]}>{twin.name}</Text>
                            <View style={styles.suggestionDetails}>
                              <View style={[styles.archetypeContainer, { backgroundColor: archetype.color + '20', borderColor: archetype.color }]}>
                                <Text style={[styles.suggestionArchetype, { color: archetype.color }]}>{archetypeName}</Text>
                              </View>
                              <View style={[styles.matchContainer, { backgroundColor: archetype.color + '30', borderColor: archetype.color }]}>
                                <Text style={[styles.matchText, { color: archetype.color }]}>{twin.similarity}% Match</Text>
                              </View>
                            </View>
                          </View>
                          
                          <TouchableOpacity 
                            style={[styles.suggestionButton, { backgroundColor: archetype.color }]}
                            onPress={async () => {
                              await addToFriends(twin.id, twin.name, archetypeName);
                              await fetchFriends();
                            }}
                          >
                            <UserPlusIcon size={14} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </>
              )}
              
              {allTwins.length > 2 && (
                <TouchableOpacity 
                  style={styles.viewAllButton}
                  onPress={() => setShowAllTwins(!showAllTwins)}
                >
                  <Text style={styles.viewAllText}>
                    {showAllTwins ? 'Show Less' : `+${allTwins.length - 2} More`}
                  </Text>
                </TouchableOpacity>
              )}
              
              {allTwins.length === 0 && (
                <View style={styles.noTwinContainer}>
                  <Text style={[styles.noTwinText, { color: darkMode ? '#d1d5db' : '#6b7280' }]}>No taste twins found</Text>
                  <Text style={[styles.noTwinSubtext, { color: darkMode ? '#9ca3af' : '#9ca3af' }]}>Be the first to explore this taste community!</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      
      {joined && loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={context?.result?.archetype?.color || '#6C63FF'} />
          <Text style={[styles.loadingText, { color: darkMode ? '#fff' : '#333' }]}>Generating personalized recommendations...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
    paddingBottom: 200
  },
  container: {
    width: '100%',
    maxHeight: 500,
    borderRadius: 16,
    padding: 0,
    marginBottom: 20
  },
  joinTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Rubik'
  },
  archetypeText: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
    fontFamily: 'Rubik'
  },
  joinButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Rubik'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Rubik'
  },
  messageBubble: {
    padding: 10,
    borderRadius: 14,
    marginVertical: 6
  },
  sender: {
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 4
  },
  messageText: {
    fontFamily: 'Lato',
    fontSize: 15
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    fontFamily: 'Lato'
  },
  sendButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Lato'
  },
  recommendationsContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8
  },
  welcomeMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Rubik',
    textAlign: 'center'
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Rubik'
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  recommendationIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  recommendationContent: {
    flex: 1
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Rubik'
  },
  recommendationDescription: {
    fontSize: 13,
    fontFamily: 'Lato'
  },
  loadingContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Lato'
  },
  // Archetype Card Styles
  archetypeCardGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: '100%'
  },
  archetypeCardInner: {
    backgroundColor: 'transparent',
    padding: 24
  },
  archetypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5
  },
  archetypeName: {
    fontFamily: 'Rubik',
    fontWeight: 'bold',
    fontSize: 24,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  archetypeSubtitle: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8
  },
  archetypeSummary: {
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: 'Lato',
    fontSize: 15,
    color: '#FFF',
    opacity: 0.9
  },
  joinButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 4
  },
  messageText: {
    fontFamily: 'Lato',
    fontSize: 15
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    fontFamily: 'Lato'
  },
  sendButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Lato'
  },
  recommendationsContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8
  },
  welcomeMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Rubik',
    textAlign: 'center'
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Rubik'
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  recommendationIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  recommendationContent: {
    flex: 1
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Rubik'
  },
  recommendationDescription: {
    fontSize: 13,
    fontFamily: 'Lato'
  },
  loadingContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Lato'
  },
  // Archetype Card Styles
  archetypeCardGradient: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: '100%',
  },
  archetypeCardInner: {
    backgroundColor: 'transparent',
    padding: 24,
  },
  archetypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  archetypeName: {
    fontFamily: 'Rubik',
    fontWeight: 'bold',
    fontSize: 24,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  archetypeSubtitle: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
  },
  archetypeSummary: {
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: 'Lato',
    fontSize: 15,
    color: '#FFF',
    opacity: 0.9
  },
  joinButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  // Archetype Card Styles
  archetypeCardGradient: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    width: '100%',
  },
  archetypeCardInner: {
    backgroundColor: 'transparent',
    padding: 24,
  },
  archetypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  archetypeName: {
    fontFamily: 'Rubik',
    fontWeight: 'bold',
    fontSize: 24,
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  archetypeSubtitle: {
    fontFamily: 'Lato',
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8,
  },
  archetypeSummary: {
    marginBottom: 24,
    lineHeight: 22,
    fontFamily: 'Lato',
    fontSize: 15,
    color: '#FFF',
    opacity: 0.9
  },
  joinButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 4
  },
  messageText: {
    fontFamily: 'Lato',
    fontSize: 15
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    fontFamily: 'Lato'
  },
  sendButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Lato'
  },
  recommendationsContainer: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8
  },
  welcomeMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Rubik',
    textAlign: 'center'
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: 'Rubik'
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  recommendationIconText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  recommendationContent: {
    flex: 1
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Rubik'
  },
  recommendationDescription: {
    fontSize: 13,
    fontFamily: 'Lato'
  },
  loadingContainer: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Lato'
  },
  // Cultural Pick Poll Styles
  pollCard: {
    width: '100%',
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  pollContainer: {
    padding: 24,
  },
  pollHeader: {
    marginBottom: 20,
    alignItems: 'flex-start'
  },
  pollTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8
  },
  pollTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    fontFamily: 'Rubik'
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: 'space-between'
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rubik',
    marginRight: 8
  },
  dropdownArrow: {
    width: 16,
    height: 16
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    minWidth: 120,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginTop: 4
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 2
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Rubik'
  },
  pollSubtitle: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 12,
    fontFamily: 'Lato',
    opacity: 0.8
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rubik'
  },
  pollQuestion: {
    fontSize: 18,
    textAlign: 'left',
    marginBottom: 16,
    fontFamily: 'Rubik',
    fontStyle: 'italic'
  },
  archetypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 24,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.1)'
  },
  archetypeEmoji: {
    fontSize: 20,
    marginRight: 8
  },
  archetypeLabel: {
    fontSize: 14,
    fontFamily: 'Lato',
    fontWeight: '500'
  },
  gridContainer: {
    width: '100%',
    marginBottom: 20
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  gridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 8
  },
  imageContainer: {
    width: 80,
    height: 80,
    position: 'relative',
    marginBottom: 4
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    borderWidth: 3,
  },
  gridItemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'Rubik'
  },
  heartContainer: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 40,
    justifyContent: 'center'
  },
  likeCount: {
    marginRight: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    fontFamily: 'Rubik'
  },
  mediaLink: {
    alignItems: 'center'
  },
  mediaLinkText: {
    color: '#6C63FF',
    fontSize: 12,
    fontFamily: 'Lato'
  },
  featuredPick: {
    position: 'relative',
    transform: [{ scale: 1.05 }]
  },
  featuredBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5
  },
  featuredText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'Rubik'
  },
  engageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 8
  },
  engageButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'Rubik'
  },
  countdownContainer: {
    alignItems: 'flex-start'
  },
  countdownText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 4
  },
  countdownSubtext: {
    fontSize: 14,
    fontFamily: 'Lato',
    opacity: 0.8
  },
  // Curious and Offbeat Vibes Styles
  offbeatSection: {
    width: '100%'
  },
  offbeatCardsContainer: {
    flexDirection: 'column',
    gap: 16
  },
  offbeatCard: {
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  offbeatCardImage: {
    width: 120,
    height: '100%'
  },
  offbeatCardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between'
  },
  offbeatCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Rubik'
  },
  offbeatCardDescription: {
    fontSize: 12,
    fontFamily: 'Lato',
    opacity: 0.8,
    marginBottom: 8
  },
  offbeatButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start'
  },
  offbeatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Rubik'
  },
  // Featured Movie Section Styles
  featuredSection: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  featuredMovieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featuredMovieImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
  },
  featuredMovieInfo: {
    flex: 1,
  },
  featuredMovieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 4,
  },
  featuredMovieSubtitle: {
    fontSize: 14,
    fontFamily: 'Lato',
    marginBottom: 8,
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredLikes: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  // Taste Twin Section Styles
  tasteTwinCard: {
    width: '100%',
    borderRadius: 20,
    marginTop: 20,
    marginBottom: 80,
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
  },
  tasteTwinSubtitle: {
    fontSize: 14,
    fontFamily: 'Lato',
    marginBottom: 16,
  },

  tasteTwinProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tasteTwinAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6C63FF',
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
  sectionDivider: {
    marginTop: 20,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  sectionDivider: {
    marginTop: 20,
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  // Chat Modal Styles
  chatOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  chatContainer: {
    width: '90%',
    height: '70%',
    borderRadius: 20,
    padding: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatWelcome: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Lato',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    fontFamily: 'Lato',
  },
  chatSendButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  chatSendText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Rubik',
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
  friendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  friendBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  matchContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  matchText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'Rubik',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontFamily: 'Lato',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 18,
    marginBottom: 12,
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
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },

  // Mirror Container Styles
  mirrorContainer: {
    width: '100%',
    borderRadius: 24,
    marginTop: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },
  mirrorHeaderGradient: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  mirrorHeader: {
    alignItems: 'center',
  },
  mirrorContent: {
    padding: 16,
    paddingBottom: 24,
  },
});