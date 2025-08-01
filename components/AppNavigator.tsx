import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from './AuthContext';

// Import screens
import Login from './Login';
import SignUp from './SignUp';
import ArchetypeReveal from './ArchetypeReveal';
import Community from './Community';
import CommunityChat from './CommunityChat';

// Use Community as the main dashboard
const Dashboard = () => <Community />;

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // You could add a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
          cardOverlayEnabled: true,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 0.5, 0.9, 1],
                outputRange: [0, 0.25, 0.7, 1],
              }),
            },
            overlayStyle: {
              opacity: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
                extrapolate: 'clamp',
              }),
            },
          }),
        }}
      >
        {user ? (
          // User is signed in
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="Community" component={Community} />
            <Stack.Screen name="CommunityChat" component={CommunityChat} />
          </>
        ) : (
          // User is not signed in
          <>
            <Stack.Screen name="ArchetypeReveal" component={ArchetypeReveal} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="Login" component={Login} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}