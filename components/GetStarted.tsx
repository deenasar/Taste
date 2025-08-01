import React, { useState, useRef, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../App';
import { AppContext } from '../App';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const GetStarted: React.FC = () => {
  console.log('🎆 GetStarted component rendering');
  try {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const { darkMode } = useContext(AppContext)!;
    const styles = createStyles(darkMode);
    console.log('✅ GetStarted hooks initialized successfully');
  const [videoEnded, setVideoEnded] = useState(false);
  
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const loginAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    console.log('🎨 Starting GetStarted animations');
    try {
      // Start animations immediately
      Animated.sequence([
        Animated.timing(taglineAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(loginAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(footerAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
      console.log('✅ GetStarted animations started');
    } catch (error) {
      console.log('❌ GetStarted animation error:', error);
    }
  }, []);

  console.log('📄 GetStarted rendering JSX');
  return (
    <View style={styles.container}>
      {/* Top Half - Image */}
      <View style={styles.topHalf}>
        <Image 
          source={require('../assets/top.png')} 
          style={styles.topImage}
          resizeMode="cover"
        />
      </View>

      {/* Bottom Half - Content */}
      <View style={styles.bottomHalf}>
        {/* Tagline */}
        <Animated.View style={[
          styles.taglineContainer,
          {
            opacity: taglineAnim,
            transform: [{
              translateY: taglineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0]
              })
            }]
          }
        ]}>
          <Text style={styles.heading}><Text style={styles.tasteBold}>Taste</Text> - What You Love Says Who You Are</Text>
          <Text style={styles.subheading}>Discover your unique cultural identity based on what you love.</Text>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View style={[
          styles.buttonContainer,
          {
            opacity: buttonAnim,
            transform: [{
              scale: buttonAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1]
              })
            }]
          }
        ]}>
          <TouchableOpacity
            onPress={() => navigation.navigate('SignUp')}
            style={styles.getStartedButton}
          >
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Login Link */}
        <Animated.View style={[
          styles.loginContainer,
          {
            opacity: loginAnim,
            transform: [{
              translateY: loginAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0]
              })
            }]
          }
        ]}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[
          styles.footerContainer,
          {
            opacity: footerAnim,
            transform: [{
              translateY: footerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            }]
          }
        ]}>
          <Text style={styles.poweredBy}>Powered by Qloo</Text>
        </Animated.View>
      </View>
    </View>
  );
  } catch (error) {
    console.log('❌ CRITICAL: GetStarted component crashed:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <Text>GetStarted Error: {error.message}</Text>
      </View>
    );
  }
};

const createStyles = (darkMode: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHalf: {
    flex: 1,
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  bottomHalf: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  taglineContainer: {
    marginBottom: 48,
  },
  heading: {
    fontSize: 28,
    fontWeight: '400',
    color: '#1a1a1a',
    textAlign: 'center',
    fontFamily: 'Inter',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4a4a4a',
    textAlign: 'center',
    fontFamily: 'Inter',
    lineHeight: 24,
  },
  tasteBold: {
    fontWeight: '800',
    color: '#10b981',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  getStartedButton: {
    borderRadius: 25,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  loginContainer: {
    marginBottom: 60,
  },
  loginText: {
    color: 'rgba(26, 26, 26, 0.8)',
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  loginLink: {
    color: '#10b981',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  poweredBy: {
    color: 'rgba(26, 26, 26, 0.5)',
    fontSize: 12,
    fontFamily: 'Inter',
    textAlign: 'center',
  },
});

export default GetStarted;