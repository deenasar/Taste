import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { AppContext } from '../App';
import { HeartIcon } from 'react-native-heroicons/solid';
import { SessionManager } from './SessionManager';
import { FIREBASE_DB } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function ArchetypeReveal() {
  const context = useContext(AppContext);
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute();
  const [revealComplete, setRevealComplete] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  
  const isRetake = route.params?.isRetake || false;

  // Get archetype from context
  const archetype = context?.result?.archetype || {
    name: 'PopCultureConnoisseur',
    color: '#FF6F61',
    gradientColors: ['#FF6F61', '#FF9671'],
    description: 'Stay ahead of trends with enthusiasts who live for what\'s new and exciting in mainstream entertainment. Be the first to know what\'s next in pop culture.',
    icon: HeartIcon
  };

  React.useEffect(() => {
    // Animation sequence for the reveal
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start(() => {
      setRevealComplete(true);
    });
  }, []);

  const handleExplore = async () => {
    // Save updated archetype to session and Firebase
    const session = await SessionManager.getSession();
    if (session && context?.result) {
      const updatedSession = {
        ...session,
        archetype: context.result.archetype,
        summary: context.result.summary,
        preferences: context.preferences || {}
      };
      
      // Save to local session
      await SessionManager.saveSession(updatedSession);
      
      // Save to Firebase if user has uid
      if (session.uid) {
        try {
          const userRef = doc(FIREBASE_DB, 'users', session.uid);
          await updateDoc(userRef, {
            archetype: context.result.archetype,
            summary: context.result.summary,
            preferences: context.preferences || {},
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error updating archetype in Firebase:', error);
        }
      }
    }
    
    // Navigate to Dashboard
    navigation.navigate('MainTabs');
  };

  return (
    <LinearGradient
      colors={archetype.gradientColors}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View 
        style={[
          styles.revealContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: archetype.color }]}>
          <archetype.icon size={64} color="white" />
        </View>
        
        <Text style={styles.title}>You are a</Text>
        <Text style={styles.archetypeName}>{archetype.name}</Text>
        
        <Text style={styles.description}>{archetype.description}</Text>
        
        {revealComplete && (
          <TouchableOpacity 
            style={[styles.exploreButton, { backgroundColor: archetype.color }]}
            onPress={handleExplore}
          >
            <Text style={styles.exploreButtonText}>
              {isRetake ? 'Back to Dashboard' : 'Explore Dashboard'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  revealContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 32,
    width: Dimensions.get('window').width * 0.85,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    color: '#4b5563',
    marginBottom: 8,
    fontFamily: 'Lato',
  },
  archetypeName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Rubik',
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Lato',
  },
  exploreButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 8,
  },
  exploreButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});