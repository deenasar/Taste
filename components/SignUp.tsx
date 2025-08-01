import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { EyeIcon, EyeSlashIcon } from 'react-native-heroicons/outline';
import { doc, setDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig.js';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SessionManager } from './SessionManager';
import { AppContext } from '@/App';

const { width, height } = Dimensions.get('window');

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const navigation = useNavigation();
  const { darkMode } = useContext(AppContext)!;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password || password !== confirmPassword) {
      Alert.alert('Error', 'Please fill all fields correctly');
      return;
    }

    setLoading(true);
    try {
      // Get archetype from session
      const session = await SessionManager.getSession();
      
      // Create unique user ID from email
      const userId = email.replace(/[.@]/g, '_');
      
      // Save to Firestore without auth (exclude icon function)
      const archetypeData = session?.archetype ? {
        name: session.archetype.name,
        color: session.archetype.color,
        gradientColors: session.archetype.gradientColors,
        description: session.archetype.description
      } : null;
      
      await setDoc(doc(FIREBASE_DB, 'users', userId), {
        name,
        email,
        password, // In production, hash this!
        archetype: archetypeData,
        summary: session?.summary || null,
        preferences: session?.preferences || {},
        createdAt: new Date(),
        quizCompleted: session?.quizCompleted || false
      });

      // Save session for new user
      await SessionManager.saveSession({
        uid: userId,
        name,
        email,
        loginTime: new Date().toISOString()
      });
      
      // Mark onboarding as complete
      await SessionManager.markOnboardingComplete();
      
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('TasteQuiz');
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Error', 'Failed to create account. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Character Image */}
      <View style={[styles.imageContainer, keyboardVisible && styles.imageHidden]}>
        <Image 
          source={require('../assets/signup.png')} 
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, keyboardVisible && styles.bottomSheetKeyboard]}>
        <Text style={styles.title}>Sign Up</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 
              <EyeSlashIcon size={20} color="#666" /> : 
              <EyeIcon size={20} color="#666" />}
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? 
              <EyeSlashIcon size={20} color="#666" /> : 
              <EyeIcon size={20} color="#666" />}
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            style={styles.buttonInner}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Login</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    height: height * 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  imageHidden: {
    height: 0,
    overflow: 'hidden',
  },
  characterImage: {
    width: width * 0.78,
    height: height * 0.455,
    opacity: 1,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  bottomSheetKeyboard: {
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#10b981',
    textAlign: 'left',
    marginBottom: 24,
    fontFamily: 'Inter',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  eyeIcon: {
    padding: 12,
  },
  button: {
    borderRadius: 25,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonInner: {
    padding: 18,
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
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  loginLink: {
    color: '#10b981',
    fontWeight: '600',
  },
});