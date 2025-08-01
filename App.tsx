


import React, { useState, createContext, useMemo, useEffect, useContext } from 'react';
import { StatusBar, View, ActivityIndicator, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { SessionManager } from './components/SessionManager';
import { NavigationContainer, DefaultTheme, DarkTheme, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ArchetypeResult, UserPreferences } from '@/types';
import NotificationService from './services/notificationService';

import GetStarted from './components/GetStarted';
import TasteQuiz from './components/TasteQuiz';
import SignUp from './components/SignUp';
import Login from './components/Login';
import CommunityChat from './components/CommunityChat';
import ArchetypeReveal from './components/ArchetypeReveal';
import Dashboard from './components/Dashboard';
import Explore from './components/Explore';
import Community from './components/Community';
import StepOutsideBubble from './components/StepOutsideBubble';
import Blend from './components/Blend';
import Collections from './components/Collections';
import Friends from './components/Friends';

import ProfileDrawer from './components/ProfileDrawer';

import { ARCHETYPES, CATEGORY_ICONS } from '@/constants';
import { UserCircleIcon, SunIcon, MoonIcon } from 'react-native-heroicons/outline';
import { SparklesIcon } from 'react-native-heroicons/solid';

// Import archetype-specific logos
const ARCHETYPE_LOGOS = {
  'Alt Pulse': require('./assets/Alt-Pulse.jpeg'),
  'Berry Bloom': require('./assets/Berry-Bloom.jpeg'),
  'Cine Nomad': require('./assets/Cine-Nomad.jpeg'),
  'Cloudwalker': require('./assets/Cloudwalker.jpeg'),
  'Cottage Noir': require('./assets/Cottage-Noir.jpeg'),
  'Culture Hacker': require('./assets/Culture-hacker.jpeg'),
  'Cyber Chill': require('./assets/Cyber-Chill.jpeg'),
  'Earth Artisan': require('./assets/Earth-Artisan.jpeg'),
  'Hidden Flame': require('./assets/Hidden-Flame.jpeg'),
  'Hyper Connector': require('./assets/Hyper-Connector.jpeg'),
  'Joy Alchemist': require('./assets/Joy-Alchemist.jpeg'),
  'Kaleido Crafter': require('./assets/Kaleido-Crafter.jpeg'),
  'Lyrical Romantic': require('./assets/Lyrical-Romantic.jpeg'),
  'Minimal Spirit': require('./assets/Minimal-Spirit.jpeg'),
  'Mystic Pulse': require('./assets/Mystic-Pulse.jpeg'),
  'Neon Thinker': require('./assets/Neon-Thinker.jpeg'),
  'Pop Dreamer': require('./assets/Pop-Dreamer.jpeg'),
  'Retro Soul': require('./assets/Retro-Soul.jpeg'),
  'Sunkissed Soul': require('./assets/Sunkissed-Soul.jpeg'),
  'Sunset Rebel': require('./assets/Sunset-Rebel.jpeg'),
  'Tropic Vibist': require('./assets/Tropic-Vibist.jpeg'),
  'Vintage Flâneur': require('./assets/Vintage-Flaneur.jpeg'),
  'Wander Muse': require('./assets/Wander-Muse.jpeg'),
  'Zen Zest': require('./assets/Zen-Zest.jpeg'),
};



// NAVIGATION TYPES
export type MainTabParamList = {
  Dashboard: undefined;
  Explore: undefined;
  Blend: undefined;
  StepOutsideBubble: undefined;
  Community: undefined;
};

export type CommunityStackParamList = {
  Community: undefined;
  CommunityChat: undefined;
};

export type RootStackParamList = {
  GetStarted: undefined;
  TasteQuiz: { isRetake?: boolean };
  ArchetypeReveal: { isRetake?: boolean };
  SignUp: undefined;
  Login: undefined;
  MainTabs: { screen?: keyof MainTabParamList };
  Collections: undefined;
  Friends: undefined;
};

// const Stack = createStackNavigator<RootStackParamList>();
// const Tab = createBottomTabNavigator<MainTabParamList>();

const RootStack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const CommunityStack = createStackNavigator<CommunityStackParamList>();

const CommunityStackNavigator = () => (
  <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
    <CommunityStack.Screen
      name="Community"
      component={Community}
    />
    <CommunityStack.Screen
      name="CommunityChat"
      component={CommunityChat}
      options={{ 
        animationEnabled: true,
        presentation: 'modal',
        cardStyle: { backgroundColor: 'transparent' }
      }}
    />
  </CommunityStack.Navigator>
);

// APP CONTEXT
interface AppContextType {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  result: ArchetypeResult | null;
  setResult: React.Dispatch<React.SetStateAction<ArchetypeResult | null>>;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);

// MAIN TAB NAVIGATOR
const MainTabs = () => {
  const { darkMode } = useContext(AppContext)!;

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route);
        
        return {
          headerShown: routeName !== 'CommunityChat',
          headerTitleStyle: { fontFamily: 'Rubik', fontSize: 24, fontWeight: 'bold' },
          headerStyle: { 
            backgroundColor: darkMode ? '#0f172a' : '#ffffff',
            shadowColor: 'transparent',
          },
          headerTintColor: darkMode ? '#ffffff' : '#0f172a',
        headerRight: () => {
          if (route.name === 'Dashboard') {
            return <ProfileIcon />;
          }
          return null;
        },
        headerLeft: () => {
          if (route.name === 'Dashboard') {
            return <ArchetypeLogo />;
          }
          return null;
        },
        tabBarIcon: ({ color, size, focused }) => {
          const IconComponent = CATEGORY_ICONS[route.name.toLowerCase() as keyof typeof CATEGORY_ICONS] || SparklesIcon;
          return <IconComponent size={focused ? size + 2 : size} color={color} />;
        },
        tabBarActiveTintColor: darkMode ? '#d6bbfb' : '#6366f1',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          display: routeName === 'CommunityChat' ? 'none' : 'flex',
          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
          borderTopColor: darkMode ? '#1f2937' : '#e5e7eb',
          position: 'absolute',
        },
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ headerTitle: '' }} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Blend" component={Blend} />
      <Tab.Screen
        name="Community"
        component={CommunityStackNavigator} // Use a stack navigator for Community
        listeners={({ navigation, route }) => ({
          tabPress: e => {
            // Prevent default behavior
            e.preventDefault();
            // Reset the stack to show the Community screen
            navigation.navigate('Community', {
              screen: 'Community'
            });
          },
        })}
      />
      <Tab.Screen 
        name="StepOutsideBubble" 
        component={StepOutsideBubble}
        options={{ title: 'Discover' }}
      />

    </Tab.Navigator>
  );
};

const ArchetypeLogo = () => {
    const { result } = useContext(AppContext)!;
    const archetypeName = result?.archetype?.name;
    const logoSource = archetypeName && ARCHETYPE_LOGOS[archetypeName as keyof typeof ARCHETYPE_LOGOS];
    
    return (
        <View style={{ marginLeft: 16 }}>
            <Image 
                source={logoSource || ARCHETYPE_LOGOS['Alt Pulse']} 
                style={{ width: 100, height: 32 }}
                resizeMode="contain"
            />
        </View>
    );
};

const DarkModeToggle = () => {
    const { darkMode, toggleDarkMode } = useContext(AppContext)!;
    return (
        <TouchableOpacity onPress={toggleDarkMode} style={{ marginRight: 16, padding: 4 }}>
            {darkMode ? <SunIcon size={24} color="white" /> : <MoonIcon size={24} color="black" />}
        </TouchableOpacity>
    );
};

const ProfileIcon = () => {
    const { darkMode, result } = useContext(AppContext)!;
    const [showProfileDrawer, setShowProfileDrawer] = React.useState(false);
    const [userName, setUserName] = React.useState('User');
    const [profileImage, setProfileImage] = React.useState<string | null>(null);
    
    const getUserData = React.useCallback(async () => {
        const session = await SessionManager.getSession();
        if (session) {
            if (session.name) {
                setUserName(session.name);
            } else if (session.email) {
                const nameFromEmail = session.email.split('@')[0];
                setUserName(nameFromEmail);
            }
            if (session.profileImage) {
                setProfileImage(session.profileImage);
            }
        }
    }, []);
    
    React.useEffect(() => {
        getUserData();
    }, [getUserData]);
    
    React.useEffect(() => {
        if (showProfileDrawer === false) {
            getUserData();
        }
    }, [showProfileDrawer, getUserData]);

    const getPlaceholderStyle = () => {
        if (!result?.archetype?.gradientColors) return { backgroundColor: '#6b7280' };
        return { backgroundColor: result.archetype.gradientColors[0] };
    };

    if (!result) {
        return <View style={{ marginRight: 16, padding: 4, width: 32, height: 32 }} />;
    }

    return (
        <>
            <TouchableOpacity 
                onPress={() => setShowProfileDrawer(true)} 
                style={{ marginRight: 16, padding: 4 }}
                activeOpacity={0.8}
            >
                <View>
                    {profileImage ? (
                        <Image 
                            source={{ uri: profileImage }} 
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                borderWidth: 2,
                                borderColor: result?.archetype?.gradientColors?.[0] || '#6b7280'
                            }}
                        />
                    ) : (
                        <View style={[
                            {
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 2,
                                borderColor: darkMode ? '#374151' : '#e5e7eb'
                            },
                            getPlaceholderStyle()
                        ]}>
                            <Text style={{
                                color: '#fff',
                                fontSize: 14,
                                fontWeight: 'bold',
                                fontFamily: 'Rubik'
                            }}>
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            <ProfileDrawer 
                visible={showProfileDrawer} 
                onClose={() => setShowProfileDrawer(false)} 
            />
        </>
    );
};


// APP ROOT
function App() {
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [result, setResult] = useState<ArchetypeResult | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);

  const [darkMode, setDarkMode] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in when app starts
    const checkLoginStatus = async () => {
      try {
        const firstTime = await SessionManager.isFirstTime();
        setIsFirstTime(firstTime);
       
        const userSession = await SessionManager.getSession();
        if (userSession && userSession.loginTime) {
          setIsLoggedIn(true);
          console.log('Restoring session:', userSession); // Debug log
          // Restore archetype and preferences from session
          if (userSession.archetype) {
            // Ensure archetype has an icon
            let archetype = userSession.archetype;
            if (!archetype.icon) {
              const { ARCHETYPES } = require('@/constants');
              const matchingArchetype = Object.values(ARCHETYPES).find(
                arch => arch.name === archetype.name
              );
              if (matchingArchetype) {
                archetype = matchingArchetype;
              } else {
                const { HeartIcon } = require('react-native-heroicons/solid');
                archetype = { ...archetype, icon: HeartIcon };
              }
            }
            setResult({
              archetype,
              summary: userSession.summary || archetype.description
            });
          }
          if (userSession.preferences) {
            setPreferences(userSession.preferences);
          }
        }
        
        // Initialize Firebase messaging
        try {
          console.log('🔥 Initializing Firebase messaging...');
          // NotificationService is already initialized in its constructor
        } catch (error) {
          console.log('❌ Firebase messaging initialization failed:', error);
        }
        
      } catch (error) {
        console.log('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };
   
    checkLoginStatus();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };
  
  const contextValue = useMemo(() => ({
    preferences,
    setPreferences,
    result,
    setResult,
    darkMode,
    toggleDarkMode,
  }), [preferences, result, darkMode]);

  const navTheme = useMemo(() => {
    const theme = darkMode ? DarkTheme : DefaultTheme;
    return {
      ...theme,
      colors: {
        ...theme.colors,
        background: darkMode ? '#0f172a' : '#f8fafc',
      },
    };
  }, [darkMode]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <NavigationContainer theme={navTheme}>
        <RootStack.Navigator
          initialRouteName={isLoggedIn ? "MainTabs" : (isFirstTime ? "GetStarted" : "Login")}
          screenOptions={{
            headerShown: false,
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        >
          <RootStack.Screen name="GetStarted" component={GetStarted} />
          <RootStack.Screen name="TasteQuiz" component={TasteQuiz} />
          <RootStack.Screen name="ArchetypeReveal" component={ArchetypeReveal} />
          <RootStack.Screen name="SignUp" component={SignUp} />
          <RootStack.Screen name="Login" component={Login} />
          <RootStack.Screen name="MainTabs" component={MainTabs} />
          <RootStack.Screen name="Collections" component={Collections} />
          <RootStack.Screen name="Friends" component={Friends} />
        </RootStack.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}
 
export default App;