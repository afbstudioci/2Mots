//App.tsx
import React, { useEffect, useRef } from 'react';
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
import { colors } from './src/theme/theme';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MenuScreen from './src/screens/MenuScreen';
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
import DuelLobbyScreen from './src/screens/DuelLobbyScreen';
import DuelGameScreen from './src/screens/DuelGameScreen';
import MainTabNavigator from './src/components/navigation/MainTabNavigator';
import UpdateModal from './src/components/common/UpdateModal';
import { registerForPushNotificationsAsync } from './src/services/notificationService';
import { useAppStartup } from './src/hooks/useAppStartup';
import { useAppUpdates } from './src/hooks/useAppUpdates';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Menu: undefined;
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
  Chat: { friendId: string; friendName: string; friendAvatar?: string };
  DuelLobby: undefined;
  DuelGame: { duelId: string };
  Contact: undefined;
  Rules: undefined;
  Privacy: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user } = useAuth();
  const { themeColors } = useTheme();
  const pushRegistered = useRef(false);

  useEffect(() => {
    if (user && !pushRegistered.current) {
      pushRegistered.current = true;
      registerForPushNotificationsAsync().catch(() => {});
    }
    if (!user) {
      pushRegistered.current = false;
    }
  }, [user]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 180,
        contentStyle: { backgroundColor: themeColors.background },
        orientation: 'portrait',
      }}
    >
      {!user ? (
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Home" component={MainTabNavigator} />
          <Stack.Screen name="Menu" component={MenuScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="GameOver" component={GameOverScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Friends" component={FriendsScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="DuelLobby" component={DuelLobbyScreen} />
          <Stack.Screen name="DuelGame" component={DuelGameScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
          <Stack.Screen name="Rules" component={RulesScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const AppContent = () => {
  const { isDark, themeColors } = useTheme();
  const [showSplash, setShowSplash] = React.useState(true);
  useAppStartup();
  const { updateState, handleApplyUpdate, handleDismiss } = useAppUpdates();

  const navigationTheme = {
    ...(isDark ? NavDarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? NavDarkTheme.colors : DefaultTheme.colors),
      background: showSplash ? colors.coral : themeColors.background,
      card: showSplash ? colors.coral : themeColors.background,
      text: themeColors.text,
      border: 'transparent',
      primary: themeColors.primary,
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

  const rootBgColor = showSplash ? colors.coral : themeColors.background;

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: rootBgColor }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: rootBgColor }}>
        <StatusBar 
          style={showSplash ? 'light' : (isDark ? 'light' : 'dark')} 
          backgroundColor="transparent"
          translucent={true}
        />
        <NavigationContainer theme={navigationTheme} linking={linking as any}>
          <AppNavigator />
        </NavigationContainer>

        {showSplash && (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        )}

        <UpdateModal
          visible={updateState.visible}
          type={updateState.type}
          title={updateState.title}
          message={updateState.message}
          isForced={updateState.isForced}
          onUpdate={handleApplyUpdate}
          onDismiss={handleDismiss}
        />
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