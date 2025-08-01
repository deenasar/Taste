import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DAILY_TEASER_LINES } from '@/constants';

interface DailyTeaserCardProps {
  themeColors: [string, string];
  onPress: () => void;
  darkMode?: boolean;
}

const DailyTeaserCard: React.FC<DailyTeaserCardProps> = ({
  themeColors,
  onPress,
  darkMode = false,
}) => {
  const randomTeaserLine = DAILY_TEASER_LINES[Math.floor(Math.random() * DAILY_TEASER_LINES.length)];

  return (
    <View style={styles.container}>
      <View style={[styles.cardBackground, { backgroundColor: darkMode ? 'transparent' : '#ffffff' }]}>
        <View style={styles.leftAlignedContent}>
          <View style={styles.textSection}>
            <Text style={[styles.mainText, { color: darkMode ? '#FFFFFF' : '#111827' }]} numberOfLines={1} ellipsizeMode="clip">
              When your vibe meets perfect picks.
            </Text>
            <Text style={[styles.subText, { color: darkMode ? '#E5E7EB' : '#374151' }]}>
              Ready to discover what clicks? Dive into personalized recommendations crafted just for your unique taste profile. 🔥
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={onPress}
            style={styles.rightCenterButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={themeColors}
              style={styles.modernButton}
            >
              <Text style={styles.modernButtonText}>Discover ↓</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  cardBackground: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
  },
  leftAlignedContent: {
    alignItems: 'flex-start',
  },
  smartAlignedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftAlignedContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    paddingRight: 16,
  },
  mainText: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 8,
    fontFamily: 'Rubik',
  },
  subText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
    fontFamily: 'Lato',
  },
  rightCenterButton: {
    alignSelf: 'center',
  },
  hookText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Rubik',
  },
  leftAlignedText: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
    textAlign: 'left',
    marginBottom: 12,
    fontFamily: 'Rubik',
  },
  buttonContainer: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  leftAlignedButton: {
    alignSelf: 'flex-start',
  },
  rightAlignedButton: {
    alignSelf: 'flex-end',
  },
  modernButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Rubik',
    color: '#000000',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  exploreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Lato',
  },
});

export default DailyTeaserCard;