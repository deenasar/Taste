
import React, { useEffect, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SparklesIcon } from 'react-native-heroicons/solid';
import { ArrowRightIcon } from 'react-native-heroicons/outline';
import type { RootStackParamList } from '@/App';
import { AppContext } from '@/App';
import LinearGradient from 'react-native-linear-gradient';

const TpaLogo: React.FC<{ animStyle: any, darkMode: boolean }> = ({ animStyle, darkMode }) => {
  const styles = createStyles(darkMode);
  return (
    <Animated.View style={[styles.logoContainer, animStyle]}>
      <View style={styles.iconWrapper}>
        <SparklesIcon size={40} color="white" />
      </View>
      <Text style={styles.logoText}>TPA</Text>
    </Animated.View>
  );
};

const Welcome: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { darkMode } = useContext(AppContext)!;
  const styles = createStyles(darkMode);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 800,
      delay: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const fadeInUp = (delay: number) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0]
      })
    }]
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <TpaLogo animStyle={fadeInUp(0)} darkMode={darkMode} />
        
        <Animated.View style={[styles.textContainer, fadeInUp(1)]}>
            <Text style={styles.title}>
                Taste Personality Archetypes
            </Text>
            <Text style={styles.subtitle}>
                Discover your unique cultural identity based on what you love.
            </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, fadeInUp(2)]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SignUp')}
              style={styles.button}
            >
              <LinearGradient
                colors={darkMode ? ['#60a5fa', '#3b82f6'] : ['#38bdf8', '#6366f1']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                  <Text style={styles.buttonText}>Get Started</Text>
                  <ArrowRightIcon size={20} color="white" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>Already have an account? Login</Text>
            </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const createStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkMode ? '#0f172a' : '#f0f9ff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  logoText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: darkMode ? 'white' : '#1e293b',
    fontFamily: 'Rubik',
  },
  textContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: darkMode ? '#e2e8f0' : '#334155',
    fontFamily: 'Rubik',
  },
  subtitle: {
    fontSize: 18,
    color: darkMode ? '#94a3b8' : '#475569',
    fontFamily: 'Lato',
    textAlign: 'center',
    maxWidth: 300,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 16,
  },
  button: {
    borderRadius: 30,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  loginLink: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  loginText: {
    color: darkMode ? '#94a3b8' : '#475569',
    fontSize: 16,
    fontFamily: 'Lato',
    textDecorationLine: 'underline',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Lato',
  },
});

export default Welcome;
