import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { AppContext } from '../App';
import { SessionManager } from './SessionManager';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig';
import { BookmarkIcon, HeartIcon, XMarkIcon, ChevronLeftIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const Collections: React.FC = () => {
  const context = useContext(AppContext);
  const { darkMode, result } = context || {};
  const navigation = useNavigation();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'movie', 'music', 'book', 'podcast'];

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const currentSession = await SessionManager.getSession();
      if (!currentSession?.uid) {
        console.log('No user session found');
        setLoading(false);
        return;
      }
      
      console.log('Fetching collections for user:', currentSession.uid);
      
      const collectionsQuery = query(
        collection(FIREBASE_DB, 'user_collections'),
        where('userId', '==', currentSession.uid),
        where('action', '==', 'saved')
      );
      
      const snapshot = await getDocs(collectionsQuery);
      const userCollections = [];
      
      console.log('Found', snapshot.size, 'collection items');
      
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log('Collection item:', data);
        userCollections.push({
          id: doc.id,
          ...data
        });
      });
      
      // Sort by timestamp in JavaScript instead of Firebase
      userCollections.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(0);
        const bTime = b.timestamp?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      setCollections(userCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCollections = selectedCategory === 'all' 
    ? collections 
    : collections.filter(item => item.category === selectedCategory);

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
        <BookmarkIcon size={24} color={result?.archetype?.color || '#6C63FF'} />
        <Text style={styles.headerTitle}>My Collections</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterChip,
              selectedCategory === category && { backgroundColor: result?.archetype?.color || '#6C63FF' }
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.filterText,
              selectedCategory === category && { color: '#fff' }
            ]}>
              {category === 'all' ? 'All' : category === 'movie' ? 'Movies' : category === 'book' ? 'Books' : category === 'podcast' ? 'Podcasts' : category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>



      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={result?.archetype?.color || '#6C63FF'} />
          <Text style={styles.loadingText}>Loading your collections...</Text>
        </View>
      ) : filteredCollections.length > 0 ? (
        <ScrollView style={styles.collectionsContainer} showsVerticalScrollIndicator={false}>
          {filteredCollections.map((item, index) => (
            <View key={item.id} style={styles.collectionItem}>
              <View style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: result?.archetype?.color || '#6C63FF' }]}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                </View>
                
                {item.plot && (
                  <Text style={styles.itemPlot} numberOfLines={2}>
                    {item.plot}
                  </Text>
                )}
                
                <View style={styles.itemFooter}>
                  <Text style={styles.archetypeText}>{item.archetype}</Text>
                  <Text style={styles.dateText}>
                    {item.timestamp?.toDate?.()?.toLocaleDateString() || 'Recently'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <BookmarkIcon size={48} color={darkMode ? '#6b7280' : '#9ca3af'} />
          <Text style={styles.emptyTitle}>No Collections Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start exploring and save items from the Swap Deck to build your collection!
          </Text>
        </View>
      )}
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
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: darkMode ? '#374151' : '#f3f4f6',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Rubik',
    color: darkMode ? '#d1d5db' : '#374151',
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
  collectionsContainer: {
    flex: 1,
  },
  collectionItem: {
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: darkMode ? '#fff' : '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Rubik',
    color: '#fff',
  },
  itemPlot: {
    fontSize: 14,
    fontFamily: 'Lato',
    color: darkMode ? '#d1d5db' : '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: darkMode ? '#374151' : '#e5e7eb',
  },
  archetypeText: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: darkMode ? '#9ca3af' : '#6b7280',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Lato',
    color: darkMode ? '#6b7280' : '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
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

export default Collections;