import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import Swiper from 'react-native-deck-swiper';

interface Card {
  id: string;
  name: string;
  category: string;
  image: string;
  originalItem: any;
  categoryKey: string;
}

interface TinderSwipeDeckProps {
  recommendations: Record<string, any[]>;
  darkMode: boolean;
  onItemPress: (item: any, category: string) => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const TinderSwipeDeck: React.FC<TinderSwipeDeckProps> = ({ recommendations, darkMode, onItemPress }) => {
  const swiperRef = useRef<Swiper<Card>>(null);
  const styles = createStyles(darkMode);

  const baseCards: Card[] = Object.entries(recommendations).map(([category, items], index) => {
    const firstItem = Array.isArray(items) ? items.flat()[0] : items;
    return {
      id: `${category}-${index}`,
      name: firstItem?.name || 'No recommendation',
      category: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
      image: firstItem?.image || `https://picsum.photos/400/600?random=${index}`,
      originalItem: firstItem,
      categoryKey: category
    };
  }).filter(card => card.name !== 'No recommendation');

  const cards = Array(50).fill(baseCards).flat().map((card, index) => ({
    ...card,
    id: `${card.id}-${index}`
  }));

  const renderCard = (card: Card) => (
    <View style={styles.card}>
      <Image source={{ uri: card.image }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardOverlay}>
        <Text style={styles.categoryText}>{card.category}</Text>
        <Text style={styles.nameText}>{card.name}</Text>
      </View>
    </View>
  );

  const renderNoMoreCards = () => (
    <View style={styles.noMoreCards}>
      <Text style={styles.noMoreText}>No more recommendations</Text>
    </View>
  );

  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recommendations available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Recommendations</Text>
      <Text style={styles.subtitle}>Swipe to explore</Text>
      
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={cards}
          renderCard={renderCard}
          renderNoMoreCards={() => null}
          onTapCard={(cardIndex) => {
            const card = cards[cardIndex];
            onItemPress(card.originalItem, card.categoryKey);
          }}
          onSwiped={(cardIndex) => {
            if (cardIndex >= cards.length - baseCards.length) {
              setTimeout(() => {
                swiperRef.current?.jumpToCardIndex(0);
              }, 100);
            }
          }}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={2}
          stackScale={10}
          stackSeparation={15}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
          disableBottomSwipe
          disableTopSwipe
          verticalSwipe={false}
          horizontalSwipe={true}
          infinite={false}
          showSecondCard={true}
          cardVerticalMargin={20}
          cardHorizontalMargin={40}
        />
      </View>
    </View>
  );
};

const createStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: darkMode ? '#FFF' : '#111827',
    fontFamily: 'Rubik',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: darkMode ? '#9ca3af' : '#6b7280',
    fontFamily: 'Lato',
    marginBottom: 20,
  },
  swiperContainer: {
    flex: 1,
    width: screenWidth,
    height: screenHeight * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    height: screenHeight * 0.4,
    width: screenWidth - 80,
    borderRadius: 16,
    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '75%',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
    height: '25%',
    justifyContent: 'center',
  },
  categoryText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Lato',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  nameText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMoreText: {
    fontSize: 18,
    color: darkMode ? '#9ca3af' : '#6b7280',
    fontFamily: 'Lato',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: darkMode ? '#9ca3af' : '#6b7280',
    fontFamily: 'Lato',
    fontSize: 16,
  },
});

export default TinderSwipeDeck;