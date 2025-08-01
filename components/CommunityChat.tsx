import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ImageSourcePropType,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { PaperAirplaneIcon, ChevronLeftIcon } from 'react-native-heroicons/solid';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { FIREBASE_DB } from '../firebaseConfig';
import { AppContext } from '../App';
import { SessionManager } from './SessionManager';

import { AppState } from 'react-native';
import NotificationService from '../services/notificationService';

export default function CommunityChat() {
  const context = useContext(AppContext);
  const navigation = useNavigation();
  const route = useRoute();
  const darkMode = context?.darkMode || false;
  
  // Get route parameters for private chat
  const { chatType, recipientId, recipientName, sourceTab } = route.params || {};
  const isPrivateChat = chatType === 'private';
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef();
  const [userName, setUserName] = useState('User');
  const [currentUserId, setCurrentUserId] = useState(null);
  const archetypeName = context?.result?.archetype?.name || 'Taste Explorer';
  const [appState, setAppState] = useState(AppState.currentState);
  
  // Get user name from session and request notification permission
  useEffect(() => {
    const getUserData = async () => {
      const session = await SessionManager.getSession();
      if (session?.name) {
        setUserName(session.name);
      } else if (session?.email) {
        setUserName(session.email.split('@')[0]);
      }
      setCurrentUserId(session?.uid);
    };
    getUserData();
    
    // Track app state for notifications
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);
  
  // Get colors based on archetype
  let bubbleColor;
  let backgroundColor;
  let bubbleTextColor = darkMode ? '#fff' : '#333';
  
  // Use different colors based on archetype with more vibrant colors
  switch(archetypeName) {
    case 'IndieExplorer':
      backgroundColor = darkMode ? '#4B0082' : '#E6E6FA';
      bubbleColor = darkMode ? '#2D0050' : '#D8D8FF'; // Deep purple / Light lavender
      break;
    case 'GlobalNomad':
      backgroundColor = darkMode ? '#00796B' : '#E0F2F1';
      bubbleColor = darkMode ? '#004D40' : '#B2DFDB'; // Teal / Light teal
      break;
    case 'RetroReviver':
      backgroundColor = darkMode ? '#BF360C' : '#FBE9E7';
      bubbleColor = darkMode ? '#7F2200' : '#FFCCBC'; // Deep orange / Light orange
      break;
    case 'MindfulAesthete':
      backgroundColor = darkMode ? '#1B5E20' : '#E8F5E9';
      bubbleColor = darkMode ? '#0A3D0A' : '#C8E6C9'; // Green / Light green
      break;
    case 'UndergroundSeeker':
      backgroundColor = darkMode ? '#263238' : '#ECEFF1';
      bubbleColor = darkMode ? '#0D1214' : '#CFD8DC'; // Blue grey / Light blue grey
      break;
    case 'PopCultureConnoisseur':
      backgroundColor = darkMode ? '#C2185B' : '#FCE4EC';
      bubbleColor = darkMode ? '#880E4F' : '#F8BBD0'; // Pink / Light pink
      break;
    case 'TechnoFuturist':
      backgroundColor = darkMode ? '#0D47A1' : '#E3F2FD';
      bubbleColor = darkMode ? '#072A60' : '#BBDEFB'; // Blue / Light blue
      break;
    case 'CulturalCurator':
      backgroundColor = darkMode ? '#4E342E' : '#EFEBE9';
      bubbleColor = darkMode ? '#3E2723' : '#D7CCC8'; // Brown / Light brown
      break;
    default:
      backgroundColor = darkMode ? '#374151' : '#EFEFFF';
      bubbleColor = darkMode ? '#1F2937' : '#DEDEFF'; // Default colors
  }

  useEffect(() => {
    const getCollectionName = async () => {
      if (isPrivateChat && recipientId) {
        // Create unique chat room ID for private chat
        const session = await SessionManager.getSession();
        const currentUserId = session?.uid;
        const chatRoomId = [currentUserId, recipientId].sort().join('_');
        return `private_chat_${chatRoomId}`;
      } else {
        // Use archetype-specific collection for community chat
        return `community_${archetypeName.replace(/\s+/g, '')}`;
      }
    };
    
    const setupChat = async () => {
      const collectionName = await getCollectionName();
      const q = query(collection(FIREBASE_DB, collectionName), orderBy('createdAt', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Check for new messages and send notifications
        if (messages.length > 0 && newMessages.length > messages.length) {
          const latestMessage = newMessages[newMessages.length - 1];
          
          // Only notify if message is from someone else
          if (latestMessage.sender !== userName) {
            console.log('📨 New message from:', latestMessage.sender);
            
            if (isPrivateChat) {
              NotificationService.showPrivateMessageNotification(
                latestMessage.sender,
                latestMessage.text
              );
            } else {
              NotificationService.showCommunityMessageNotification(
                latestMessage.sender,
                archetypeName,
                latestMessage.text
              );
            }
          }
        }
        
        setMessages(newMessages);
      });
      
      return unsubscribe;
    };
    
    let unsubscribe;
    setupChat().then(unsub => { unsubscribe = unsub; });
    
    return () => unsubscribe && unsubscribe();
  }, [archetypeName, isPrivateChat, recipientId]);

  const handleBackPress = () => {
    if (sourceTab === 'StepOutsideBubble') {
      // Navigate back to Discover tab
      navigation.getParent()?.getParent()?.navigate('MainTabs', { screen: 'StepOutsideBubble' });
      return true;
    }
    if (sourceTab === 'Friends') {
      // Navigate back to Friends page
      navigation.getParent()?.getParent()?.navigate('Friends');
      return true;
    }
    if (sourceTab === 'Community') {
      // Navigate back to Community tab
      navigation.goBack();
      return true;
    }
    // Default: go back
    navigation.goBack();
    return true;
  };

  // Handle hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return handleBackPress();
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [sourceTab])
  );

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const getCollectionName = async () => {
      if (isPrivateChat && recipientId) {
        const session = await SessionManager.getSession();
        const currentUserId = session?.uid;
        const chatRoomId = [currentUserId, recipientId].sort().join('_');
        return `private_chat_${chatRoomId}`;
      } else {
        return `community_${archetypeName.replace(/\s+/g, '')}`;
      }
    };
    
    const collectionName = await getCollectionName();
    await addDoc(collection(FIREBASE_DB, collectionName), {
      text: inputText,
      sender: userName,
      createdAt: new Date()
    });

    setInputText('');
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  // Hide status bar and navigation for full-screen experience
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setHidden(true);
      return () => {
        StatusBar.setHidden(false);
      };
    }, [])
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.fullScreenContainer, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Background image for entire screen */}
      <View style={styles.backgroundContainer}>
        <Image 
          source={require('../assets/chat-doodle-bg.jpeg')} 
          style={styles.backgroundImage} 
          resizeMode="cover" 
        />
      </View>
      
      {/* Chat Header */}
      <View style={[styles.chatHeader, { backgroundColor: context?.result?.archetype?.color || '#6C63FF' }]}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={handleBackPress}
        >
          <ChevronLeftIcon size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.chatTitle}>
          {isPrivateChat ? recipientName : `${archetypeName} Chat`}
        </Text>
      </View>
      
      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isCurrentUser = item.sender === userName;
          return (
            <View style={[
              styles.messageContainer,
              isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer
            ]}>
              <View style={[
                styles.messageBubble,
                isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
                { backgroundColor: isCurrentUser ? (context?.result?.archetype?.color || '#6C63FF') : bubbleColor }
              ]}>
                {!isCurrentUser && (
                  <Text style={[styles.sender, { color: context?.result?.archetype?.color || '#6C63FF' }]}>{item.sender}</Text>
                )}
                <Text style={[
                  styles.messageText, 
                  { color: isCurrentUser ? '#FFFFFF' : bubbleTextColor }
                ]}>{item.text}</Text>
              </View>
            </View>
          );
        }}
        style={styles.messageList}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}
      />
      
      {/* Input Container */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { 
              backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              color: darkMode ? '#fff' : '#333',
              borderWidth: 1,
              borderColor: context?.result?.archetype?.color || '#6C63FF'
            }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={darkMode ? '#aaa' : '#999'}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
            blurOnSubmit={false}
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            style={[styles.sendButton, { backgroundColor: context?.result?.archetype?.color || '#6C63FF' }]}
          >
            <PaperAirplaneIcon size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Account for status bar
    zIndex: 1,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  messageList: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 8,
    flexDirection: 'row',
  },
  currentUserContainer: {
    justifyContent: 'flex-end',
  },
  otherUserContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '75%',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserBubble: {
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    borderBottomLeftRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  sender: {
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    marginBottom: 4
  },
  messageText: {
    fontFamily: 'Lato',
    fontSize: 15
  },
  inputContainer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  input: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontFamily: 'Lato',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  }
});