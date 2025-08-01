import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';

export default function ArchetypeRevealSignup({ route }) {
  const navigation = useNavigation();
  const { archetype } = route.params || { 
    archetype: {
      name: 'PopCultureConnoisseur',
      color: '#FF6F61',
      gradientColors: ['#FF6F61', '#FF9671'],
      description: 'Stay ahead of trends with enthusiasts who live for what\'s new and exciting in mainstream entertainment.'
    }
  };

  return (
    <LinearGradient
      colors={archetype.gradientColors || ['#6C63FF', '#BDB2FF']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Explore Your Dashboard</Text>
        <Text style={styles.description}>
          Sign up to explore your personalized {archetype.name} dashboard and connect with others who share your taste.
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: archetype.color || '#6C63FF' }]}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: archetype.color || '#6C63FF' }]}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#4b5563',
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  loginText: {
    color: '#6b7280',
  },
  loginLink: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
});