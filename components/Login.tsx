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
import { doc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig.js';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { SessionManager } from './SessionManager';
import { ARCHETYPES } from '@/constants';
import { AppContext } from '@/App';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const navigation = useNavigation();
  const context = useContext(AppContext);
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

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      // Create user ID from email
      const userId = email.replace(/[.@]/g, '_');
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Simple password check
        if (userData.password === password) {
          // Reconstruct archetype with icon
          let fullArchetype = null;
          if (userData.archetype) {
            const matchingArchetype = Object.values(ARCHETYPES).find(
              arch => arch.name === userData.archetype.name
            );
            if (matchingArchetype) {
              fullArchetype = matchingArchetype;
            } else {
              // Fallback: use stored data with a default icon
              const { HeartIcon } = require('react-native-heroicons/solid');
              fullArchetype = {
                ...userData.archetype,
                icon: HeartIcon
              };
            }
          }
          
          // Save to session
          await SessionManager.saveSession({
            uid: userId,
            name: userData.name,
            email: userData.email,
            archetype: fullArchetype,
            preferences: userData.preferences,
            loginTime: new Date().toISOString()
          });
          
          // Update AppContext with archetype and preferences
          if (context && fullArchetype) {
            context.setResult({ 
              archetype: fullArchetype,
              summary: userData.summary || fullArchetype.description
            });
            if (userData.preferences) {
              context.setPreferences(userData.preferences);
            }
          }
          
          navigation.navigate('MainTabs');
        } else {
          Alert.alert('Error', 'Invalid password');
        }
      } else {
        Alert.alert('Error', 'User not found');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', 'Failed to log in. Please try again later.');
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
          source={require('../assets/login.png')} 
          style={styles.characterImage}
          resizeMode="contain"
        />
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

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

        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={styles.buttonInner}
          >
            <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Sign Up</Text></Text>
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
    height: height * 0.455,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageHidden: {
    height: 0,
    overflow: 'hidden',
  },
  characterImage: {
    width: width * 2.4,
    height: height * 1.4,
    opacity: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
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
  signupContainer: {
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  signupLink: {
    color: '#10b981',
    fontWeight: '600',
  },
});