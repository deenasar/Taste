import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AppContext } from '@/App';
import { BadgeSystem } from './BadgeSystem';
import { TrophyIcon } from 'react-native-heroicons/solid';
import LinearGradient from 'react-native-linear-gradient';

interface BadgeDashboardProps {
  onBadgeUnlocked?: (badge: any) => void;
}

const BadgeDashboard: React.FC<BadgeDashboardProps> = ({ onBadgeUnlocked }) => {
  const { darkMode, result } = useContext(AppContext)!;
  const badgeSystem = BadgeSystem({ onBadgeUnlocked });
  
  const unlockedCount = badgeSystem.badges.filter(b => b.unlocked).length;
  const totalBadges = badgeSystem.badges.length;

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#1f2937' : '#fff' }]}>
      <View style={styles.compactHeader}>
        <View style={styles.titleRow}>
          <TrophyIcon size={16} color={result?.archetype?.color || '#6C63FF'} />
          <Text style={[styles.compactTitle, { color: darkMode ? '#fff' : '#333' }]}>Badges</Text>
          <Text style={[styles.count, { color: darkMode ? '#9ca3af' : '#6b7280' }]}>({unlockedCount}/{totalBadges})</Text>
        </View>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
        {badgeSystem.badges.map(badge => (
          <View key={badge.id} style={styles.compactBadge}>
            {badgeSystem.renderBadge(badge)}
          </View>
        ))}
      </ScrollView>
      
      {badgeSystem.renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  compactHeader: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
  },
  count: {
    fontSize: 14,
    fontFamily: 'Lato',
  },
  badgeScroll: {
    flexDirection: 'row',
  },
  compactBadge: {
    marginRight: 8,
  },
});

export default BadgeDashboard;