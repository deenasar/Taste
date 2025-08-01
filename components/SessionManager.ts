import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'userSession';
const SESSION_EXPIRY_KEY = 'sessionExpiry';
const ONBOARDING_KEY = 'hasCompletedOnboarding';
const SESSION_DURATION_DAYS = 7;

export const SessionManager = {
  // Save session with 7-day expiration
  saveSession: async (userData: any) => {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + SESSION_DURATION_DAYS);
      
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      await AsyncStorage.setItem(SESSION_EXPIRY_KEY, expiryDate.toISOString());
      
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  },
  
  // Get session if valid
  getSession: async () => {
    try {
      console.log('📋 Retrieving session from AsyncStorage...');
      const sessionData = await AsyncStorage.getItem(SESSION_KEY);
      const expiryDateStr = await AsyncStorage.getItem(SESSION_EXPIRY_KEY);
      
      console.log('📋 Session data exists:', !!sessionData);
      console.log('📋 Expiry data exists:', !!expiryDateStr);
      
      if (!sessionData || !expiryDateStr) {
        console.log('🚫 No session data found');
        return null;
      }
      
      const expiryDate = new Date(expiryDateStr);
      const now = new Date();
      
      console.log('⏰ Session expires:', expiryDate.toISOString());
      console.log('⏰ Current time:', now.toISOString());
      
      // Check if session is expired
      if (now > expiryDate) {
        console.log('⏰ Session expired, clearing...');
        // Clear expired session
        await SessionManager.clearSession();
        return null;
      }
      
      console.log('✅ Valid session found, parsing...');
      return JSON.parse(sessionData);
    } catch (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
  },
  
  // Clear session
  clearSession: async () => {
    try {
      await AsyncStorage.multiRemove([SESSION_KEY, SESSION_EXPIRY_KEY]);
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  },
  
  // Clear all data and reset
  clearAllData: async () => {
    try {
      await AsyncStorage.multiRemove([SESSION_KEY, SESSION_EXPIRY_KEY, ONBOARDING_KEY]);
      console.log('All session data cleared');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },
  
  // Check if app has been opened before
  isFirstTime: async () => {
    try {
      console.log('📱 Checking if first time launch...');
      const hasCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
      console.log('📋 Onboarding status:', hasCompleted ? 'Completed' : 'Not completed');
      return !hasCompleted;
    } catch (error) {
      console.log('❌ AsyncStorage error in isFirstTime:', error);
      return true; // Default to first time if error
    }
  },
  
  // Mark onboarding as completed
  markOnboardingComplete: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  }
};