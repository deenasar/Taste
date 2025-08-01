import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
} from 'react-native';
import { CheckIcon } from 'react-native-heroicons/solid';
import {
  MusicalNoteIcon as MusicNoteIcon,
  FilmIcon,
  BookOpenIcon,
  MicrophoneIcon,
  PuzzlePieceIcon,
  TvIcon,
  MapIcon as CompassIcon,
  UserIcon,
  CakeIcon as FoodIcon,
} from 'react-native-heroicons/outline';

const { width } = Dimensions.get('window');

interface InterestSelectionQuizProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  darkMode: boolean;
  onCategoryChange?: (index: number) => void;
}

const INTEREST_CATEGORIES = [
  {
    id: 'music',
    title: 'Music',
    icon: MusicNoteIcon,
    color: '#8b5cf6',
    options: [
      { name: 'Indie Rock', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop' },
      { name: 'Lofi Beats', image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=200&h=200&fit=crop' },
      { name: '80s Synth-pop', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=200&fit=crop' },
      { name: 'Classical', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=200&h=200&fit=crop' },
      { name: 'Hip-Hop', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop' },
      { name: 'Folk', image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&h=200&fit=crop' },
      { name: 'Electronic', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop' },
      { name: 'Jazz', image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'movies',
    title: 'Movies',
    icon: FilmIcon,
    color: '#ef4444',
    options: [
      { name: 'Sci-Fi Thrillers', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop' },
      { name: 'Historical Dramas', image: 'https://images.unsplash.com/photo-1489599735734-79b4625ba7d6?w=200&h=200&fit=crop' },
      { name: 'A24 Films', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200&h=200&fit=crop' },
      { name: 'Animated Features', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop' },
      { name: 'Blockbuster Action', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=200&fit=crop' },
      { name: 'Documentaries', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=200&fit=crop' },
      { name: 'Romantic Comedies', image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&h=200&fit=crop' },
      { name: 'Foreign Language', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'books',
    title: 'Books',
    icon: BookOpenIcon,
    color: '#f59e0b',
    options: [
      { name: 'Fantasy Epics', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop' },
      { name: 'Poetry Collections', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop' },
      { name: 'Biographies', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop' },
      { name: 'Classic Literature', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=200&fit=crop' },
      { name: 'Non-fiction', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop' },
      { name: 'Graphic Novels', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop' },
      { name: 'Mystery & Thriller', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=200&fit=crop' },
      { name: 'Contemporary Fiction', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'podcasts',
    title: 'Podcasts',
    icon: MicrophoneIcon,
    color: '#10b981',
    options: [
      { name: 'True Crime', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=200&fit=crop' },
      { name: 'Comedy', image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=200&h=200&fit=crop' },
      { name: 'News & Politics', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop' },
      { name: 'Science & Tech', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop' },
      { name: 'Self-Improvement', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop' },
      { name: 'History', image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=200&h=200&fit=crop' },
      { name: 'Fiction', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&h=200&fit=crop' },
      { name: 'Interview Shows', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'games',
    title: 'Video Games',
    icon: PuzzlePieceIcon,
    color: '#3b82f6',
    options: [
      { name: 'RPGs', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200&h=200&fit=crop' },
      { name: 'FPS Games', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop' },
      { name: 'Strategy', image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=200&h=200&fit=crop' },
      { name: 'Indie Games', image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=200&h=200&fit=crop' },
      { name: 'Simulation', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop' },
      { name: 'Adventure', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop' },
      { name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop' },
      { name: 'Puzzle Games', image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'tv',
    title: 'TV Shows',
    icon: TvIcon,
    color: '#f43f5e',
    options: [
      { name: 'Drama Series', image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&h=200&fit=crop' },
      { name: 'Sitcoms', image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=200&h=200&fit=crop' },
      { name: 'Reality TV', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=200&fit=crop' },
      { name: 'Anime', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop' },
      { name: 'Crime Shows', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=200&fit=crop' },
      { name: 'Fantasy/Sci-Fi', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop' },
      { name: 'Documentaries', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=200&fit=crop' },
      { name: 'Limited Series', image: 'https://images.unsplash.com/photo-1489599735734-79b4625ba7d6?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'travel',
    title: 'Travel',
    icon: CompassIcon,
    color: '#06b6d4',
    options: [
      { name: 'Backpacking SE Asia', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=200&fit=crop' },
      { name: 'Quiet Beach Towns', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop' },
      { name: 'European Capitals', image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=200&h=200&fit=crop' },
      { name: 'National Park Hikes', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop' },
      { name: 'Cultural Immersion', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop' },
      { name: 'Luxury Resorts', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop' },
      { name: 'Road Trips', image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop' },
      { name: 'Mountain Retreats', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'art',
    title: 'Art & Culture',
    icon: UserIcon,
    color: '#8b5cf6',
    options: [
      { name: 'Contemporary Art', image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop' },
      { name: 'Classical Paintings', image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=200&h=200&fit=crop' },
      { name: 'Street Art', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop' },
      { name: 'Photography', image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=200&h=200&fit=crop' },
      { name: 'Digital Art', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop' },
      { name: 'Sculpture', image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=200&h=200&fit=crop' },
      { name: 'Impressionism', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop' },
      { name: 'Minimalism', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200&h=200&fit=crop' },
    ],
  },
  {
    id: 'food',
    title: 'Food',
    icon: FoodIcon,
    color: '#f97316',
    options: [
      { name: 'Italian Cuisine', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=200&fit=crop' },
      { name: 'Asian Fusion', image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=200&h=200&fit=crop' },
      { name: 'Street Food', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop' },
      { name: 'Fine Dining', image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop' },
      { name: 'Vegan/Vegetarian', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
      { name: 'BBQ & Grills', image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=200&h=200&fit=crop' },
      { name: 'Desserts & Sweets', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop' },
      { name: 'Coffee & Cafes', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop' },
    ],
  },
];

const InterestSelectionQuiz: React.FC<InterestSelectionQuizProps> = ({
  selectedInterests,
  onInterestsChange,
  darkMode,
  onCategoryChange,
}) => {
  const [currentCategoryIndex, setCategoryIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get emoji for interest (same mapping as TasteQuiz)
  const getInterestEmoji = (interest: string) => {
    const iconMap = {
      // Movies
      'Sci-Fi Thrillers': '🚀',
      'Historical Dramas': '🏛️',
      'A24 Films': '🎭',
      'Animated Features': '🎨',
      'Blockbuster Action': '💥',
      'Documentaries': '📹',
      'Romantic Comedies': '💕',
      'Foreign Language': '🌍',
      
      // Music
      'Indie Rock': '🎸',
      'Lofi Beats': '🎧',
      '80s Synth-pop': '🎹',
      'Classical': '🎼',
      'Hip-Hop': '🎤',
      'Folk': '🪕',
      'Electronic': '🎛️',
      'Jazz': '🎺',
      
      // Books
      'Fantasy Epics': '🐉',
      'Poetry Collections': '📝',
      'Biographies': '👤',
      'Classic Literature': '📚',
      'Non-fiction': '📖',
      'Graphic Novels': '💭',
      'Mystery & Thriller': '🔍',
      'Contemporary Fiction': '📘',
      
      // Travel
      'Backpacking SE Asia': '🎒',
      'Quiet Beach Towns': '🏖️',
      'European Capitals': '🏰',
      'National Park Hikes': '🥾',
      'Cultural Immersion': '🏛️',
      'Luxury Resorts': '🏨',
      'Road Trips': '🚗',
      'Mountain Retreats': '⛰️',
      
      // Food
      'Italian Cuisine': '🍝',
      'Asian Fusion': '🥢',
      'Street Food': '🌮',
      'Fine Dining': '🍽️',
      'Vegan/Vegetarian': '🥗',
      'BBQ & Grills': '🔥',
      'Desserts & Sweets': '🍰',
      'Coffee & Cafes': '☕',
      
      // Hobbies
      'Photography': '📷',
      'Cooking': '👨‍🍳',
      'Gardening': '🌱',
      'Fitness': '💪',
      'Gaming': '🎮',
      'Art & Crafts': '🎨',
      'Writing': '✍️',
      'Dancing': '💃',
      
      // Podcasts
      'True Crime': '🔍',
      'Comedy': '😂',
      'News & Politics': '📰',
      'Science & Tech': '🔬',
      'Self-Improvement': '📈',
      'History': '🏛️',
      'Fiction': '📚',
      'Interview Shows': '🎙️',
      
      // Video Games
      'RPGs': '⚔️',
      'FPS Games': '🔫',
      'Strategy': '♟️',
      'Indie Games': '🎮',
      'Simulation': '🏠',
      'Adventure': '🗺️',
      'Sports': '⚽',
      'Puzzle Games': '🧩',
      
      // TV Shows
      'Drama Series': '🎭',
      'Sitcoms': '😂',
      'Reality TV': '📺',
      'Anime': '🌸',
      'Crime Shows': '🕵️',
      'Fantasy/Sci-Fi': '🚀',
      'Documentaries': '📹',
      'Limited Series': '🎥',
      
      // Artists
      'Contemporary Art': '🎨',
      'Classical Paintings': '🖼️',
      'Street Art': '🎨',
      'Photography': '📷',
      'Digital Art': '💻',
      'Sculpture': '🗿',
      'Impressionism': '🌻',
      'Minimalism': '▫️',
    };
    return iconMap[interest] || '⭐';
  };

  const currentCategory = INTEREST_CATEGORIES[currentCategoryIndex];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onInterestsChange(selectedInterests.filter(i => i !== interest));
    } else {
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  const nextCategory = () => {
    if (currentCategoryIndex < INTEREST_CATEGORIES.length - 1) {
      const newIndex = currentCategoryIndex + 1;
      setCategoryIndex(newIndex);
      onCategoryChange?.(newIndex);
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  };

  const prevCategory = () => {
    if (currentCategoryIndex > 0) {
      const newIndex = currentCategoryIndex - 1;
      setCategoryIndex(newIndex);
      onCategoryChange?.(newIndex);
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  };

  const IconComponent = currentCategory.icon;

  return (
    <View style={styles.container}>
      {/* Category Header */}
      <View style={styles.categoryHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${currentCategory.color}20` }]}>
          <IconComponent size={32} color={currentCategory.color} />
        </View>
        <Text style={[styles.categoryTitle, { color: darkMode ? '#ffffff' : '#0f172a' }]}>
          {currentCategory.title}
        </Text>
        <Text style={[styles.categorySubtitle, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
          Select all that apply
        </Text>
      </View>

      {/* Interest Options */}
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carouselContainer}
        style={styles.carousel}
      >
        {currentCategory.options.map((option, index) => {
          const isSelected = selectedInterests.includes(option.name);
          return (
            <TouchableOpacity
              key={option.name}
              style={[
                styles.interestCard,
                {
                  backgroundColor: isSelected 
                    ? currentCategory.color 
                    : darkMode ? '#1f2937' : '#ffffff',
                  borderColor: isSelected 
                    ? currentCategory.color 
                    : darkMode ? '#374151' : '#e5e7eb',
                  marginLeft: index === 0 ? 20 : 12,
                  marginRight: index === currentCategory.options.length - 1 ? 20 : 0,
                }
              ]}
              onPress={() => toggleInterest(option.name)}
              activeOpacity={0.8}
            >
              {isSelected && (
                <View style={styles.checkIcon}>
                  <CheckIcon size={16} color="#ffffff" />
                </View>
              )}
              <View style={styles.optionIconContainer}>
                <Text style={styles.optionIcon}>
                  {getInterestEmoji(option.name)}
                </Text>
              </View>
              <Text
                style={[
                  styles.interestText,
                  {
                    color: isSelected ? '#ffffff' : darkMode ? '#ffffff' : '#0f172a',
                  }
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: currentCategoryIndex > 0 
                ? darkMode ? '#374151' : '#f3f4f6'
                : 'transparent',
            }
          ]}
          onPress={prevCategory}
          disabled={currentCategoryIndex === 0}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.navButtonText,
              {
                color: currentCategoryIndex > 0 
                  ? darkMode ? '#ffffff' : '#0f172a'
                  : 'transparent',
              }
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.pagination}>
          {INTEREST_CATEGORIES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === currentCategoryIndex 
                    ? currentCategory.color 
                    : darkMode ? '#374151' : '#d1d5db',
                }
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.navButton,
            {
              backgroundColor: currentCategoryIndex < INTEREST_CATEGORIES.length - 1 
                ? (selectedInterests.filter(interest => 
                    currentCategory.options.some(opt => opt.name === interest)
                  ).length > 0 ? currentCategory.color : 'transparent')
                : 'transparent',
            }
          ]}
          onPress={nextCategory}
          disabled={currentCategoryIndex === INTEREST_CATEGORIES.length - 1}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.navButtonText,
              {
                color: currentCategoryIndex < INTEREST_CATEGORIES.length - 1 
                  ? (selectedInterests.filter(interest => 
                      currentCategory.options.some(opt => opt.name === interest)
                    ).length > 0 ? '#ffffff' : (darkMode ? '#ffffff' : '#000000'))
                  : 'transparent',
              }
            ]}
          >
            {selectedInterests.filter(interest => 
              currentCategory.options.some(opt => opt.name === interest)
            ).length > 0 ? 'Next' : 'Skip'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Count */}
      <View style={styles.selectedCount}>
        <Text style={[styles.selectedCountText, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>
          {selectedInterests.length} interests selected
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  categorySubtitle: {
    fontSize: 16,
    fontFamily: 'Rubik',
  },
  carousel: {
    marginBottom: 32,
  },
  carouselContainer: {
    paddingVertical: 8,
  },
  interestCard: {
    width: width * 0.32,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionIcon: {
    fontSize: 24,
  },
  interestText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Rubik',
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Rubik',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  selectedCount: {
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 14,
    fontFamily: 'Rubik',
  },
});

export default InterestSelectionQuiz;