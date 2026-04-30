//App.tsx
import React, { useState, useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { DataProvider } from './src/context/DataContext';
import { AudioProvider } from './src/context/AudioContext';
import { SocketProvider } from './src/context/SocketContext';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ShopScreen from './src/screens/ShopScreen';
import MissionsScreen from './src/screens/MissionsScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import ContactScreen from './src/screens/ContactScreen';
import ChatScreen from './src/screens/ChatScreen';
import RulesScreen from './src/screens/RulesScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import MainTabNavigator from './src/components/navigation/MainTabNavigator';
import { registerForPushNotificationsAsync } from './src/services/notificationService';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined; // Maintenant le nom du MainTabNavigator
  Game: undefined;
  GameOver: { 
    score: number; 
    details: { word: string; accuracy: number; label: string }[];
    corrections?: { word1: string; word2: string; expectedAnswer: string; userAnswer: string }[];
    hasScore: boolean;
  };
  Leaderboard: undefined;
  Profile: undefined;
  Settings: undefined;
  Shop: undefined;
  Missions: undefined;
  Friends: undefined;
  Chat: { friendId: string, friendName: string, friendAvatar?: string };
  Contact: undefined;
  Rules: undefined;
  Privacy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { themeColors } = useTheme();
  const [isSplashDone, setIsSplashDone] = useState(false);
  const pushRegistered = React.useRef(false);

  useEffect(() => {
    if (user && !pushRegistered.current) {
      pushRegistered.current = true;
      registerForPushNotificationsAsync();
    }
    if (!user) {
      pushRegistered.current = false;
    }
  }, [user]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        // Fond opaque sur TOUTES les screens
        contentStyle: { backgroundColor: themeColors.background },
        // Animation douce
        animation: 'fade',
        animationDuration: 150,
        freezeOnBlur: true,
      }}
    >
      {loading || !isSplashDone ? (
        <Stack.Screen name="Splash">
          {(props) => <SplashScreen {...props} onFinish={() => setIsSplashDone(true)} />}
        </Stack.Screen>
      ) : user ? (
        <Stack.Group>
          <Stack.Screen name="Home" component={MainTabNavigator} />
          <Stack.Screen name="Game" component={GameScreen} options={{ freezeOnBlur: false }} />
          <Stack.Screen name="GameOver" component={GameOverScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Friends" component={FriendsScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
          <Stack.Screen name="Rules" component={RulesScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{
              headerShown: false,
            }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const AppContent = () => {
  const { isDark, themeColors } = useTheme();

  const navigationTheme = {
    ...(isDark ? NavDarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? NavDarkTheme.colors : DefaultTheme.colors),
      background: themeColors.background,
      card: themeColors.card,
      text: themeColors.text,
      border: themeColors.border,
    },
  };

  const linking = {
    prefixes: ['twomots://', 'https://twomots.app'],
    config: {
      screens: {
        Chat: 'chat/:friendId',
        Home: {
          screens: {
            Messages: 'messages',
          },
        },
      },
    },
  };

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: themeColors.background }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <StatusBar 
          style={isDark ? "light" : "dark"} 
          backgroundColor="transparent"
          translucent={true}
        />
        <NavigationContainer theme={navigationTheme} linking={linking as any}>
          <AppNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <AudioProvider>
          <ThemeProvider>
            <SocketProvider>
              <DataProvider>
                <AppContent />
              </DataProvider>
            </SocketProvider>
          </ThemeProvider>
        </AudioProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}