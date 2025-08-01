import { Alert, Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';

class NotificationService {
  constructor() {
    this.fcmToken = null;
    this.initialize();
  }

  async initialize() {
    console.log('🔔 Starting notification service initialization...');
    try {
      // Skip permission requests to avoid first launch issues
      console.log('⏭️ Skipping notification permissions for now');
      
      console.log('🔧 Setting up notification handlers...');
      this.setupNotificationHandlers();
      console.log('✅ Handlers set up');
      
      console.log('✅ Firebase notification service ready (without permissions)');
    } catch (error) {
      console.log('❌ Firebase notification setup failed:', error);
    }
  }

  async requestPermission() {
    console.log('📱 Platform:', Platform.OS);
    // Request Android notification permission for Android 13+
    if (Platform.OS === 'android') {
      try {
        console.log('🤖 Requesting Android notification permission...');
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs access to notifications to keep you updated.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        console.log('📱 Android notification permission result:', granted);
      } catch (error) {
        console.log('❌ Android permission error:', error);
      }
    }
    
    console.log('🔥 Requesting Firebase messaging permission...');
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Firebase authorization status:', authStatus);
    } else {
      console.log('❌ Notification permission denied, status:', authStatus);
    }
    
    return enabled;
  }

  setupNotificationHandlers() {
    // Handle notifications when app is in foreground
    messaging().onMessage(async remoteMessage => {
      console.log('🔔 Foreground message received:', remoteMessage);
      
      // Show alert for foreground notifications
      Alert.alert(
        remoteMessage.notification?.title || 'New Message',
        remoteMessage.notification?.body || 'You have a new message',
        [{ text: 'OK', onPress: () => console.log('Notification acknowledged') }]
      );
    });

    // Handle notification when app is opened from background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🔔 Notification caused app to open from background:', remoteMessage);
      // Handle navigation or specific actions here
    });

    // Handle notification when app is opened from quit state
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('🔔 Notification caused app to open from quit state:', remoteMessage);
        // Handle navigation or specific actions here
      }
    });
    
    // Listen for token refresh
    messaging().onTokenRefresh(token => {
      console.log('🔄 FCM token refreshed:', token);
      this.fcmToken = token;
    });
  }

  async sendFirebaseNotification(title, body, type = 'general') {
    try {
      const token = this.fcmToken || await messaging().getToken();
      console.log('📱 SENDING NOTIFICATION:', { title, body, token: token.substring(0, 20) + '...' });
      
      // For development/testing, show alert as immediate feedback
      Alert.alert(title, body);
      
      // In production, you would send this to your server
      // await fetch('YOUR_SERVER/send-notification', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token, title, body, type })
      // });
      
    } catch (error) {
      console.log('❌ FCM failed:', error);
      Alert.alert(title, body);
    }
  }
  
  getFCMToken() {
    return this.fcmToken;
  }

  async showTasteTwinNotification(twinName, similarity) {
    const title = '🎯 New Taste Twin!';
    const body = `${similarity}% match with ${twinName}. Connect now!`;
    
    await this.sendFirebaseNotification(title, body, 'taste_twin');
    console.log(`🎯 NOTIFICATION SENT: ${body}`);
  }

  async showPrivateMessageNotification(senderName, message) {
    const title = `💬 ${senderName}`;
    const body = message.length > 100 ? message.substring(0, 100) + '...' : message;
    
    await this.sendFirebaseNotification(title, body, 'private_message');
    console.log(`💬 NOTIFICATION SENT: ${senderName}: ${message}`);
  }

  async showCommunityMessageNotification(senderName, archetype, message) {
    const title = `🌟 ${archetype} Community`;
    const body = `${senderName}: ${message.length > 80 ? message.substring(0, 80) + '...' : message}`;
    
    await this.sendFirebaseNotification(title, body, 'community_message');
    console.log(`🌟 NOTIFICATION SENT: ${archetype} - ${senderName}: ${message}`);
  }

  async showPollReminderNotification(archetype) {
    const title = '🗳️ Weekly Poll Reminder';
    const body = `Time to vote for this week's ${archetype} picks!`;
    
    await this.sendFirebaseNotification(title, body, 'poll_reminder');
    console.log(`🗳️ NOTIFICATION SENT: ${body}`);
  }
}

export default new NotificationService();