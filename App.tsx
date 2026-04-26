//App.tsx
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme as NavDarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
// IMPORT du nouveau context de paramètres
import { SettingsProvider } from './src/context/SettingsContext';

// Screens
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

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Game: undefined;
  GameOver: { 
    score: number; 
    details: { word: string; accuracy: number; label: string }[];
    corrections?: { word1: string; word2: string; expectedAnswer: string; userAnswer: string }[];
  };
  Leaderboard: undefined;
  Profile: undefined;
  Settings: undefined;
  Shop: undefined;
  Missions: undefined;
  Friends: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const { themeColors } = useTheme();
  const [isSplashDone, setIsSplashDone] = useState(false);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background }, 
      }}
    >
      {loading || !isSplashDone ? (
        <Stack.Screen name="Splash">
          {(props) => <SplashScreen {...props} onFinish={() => setIsSplashDone(true)} />}
        </Stack.Screen>
      ) : user ? (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="GameOver" component={GameOverScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Shop" component={ShopScreen} />
          <Stack.Screen name="Missions" component={MissionsScreen} />
          <Stack.Screen name="Friends" component={FriendsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: themeColors.background },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: { backgroundColor: themeColors.background },
              headerShadowVisible: false,
              headerTintColor: themeColors.text,
              headerBackTitle: '',
            }}
          />
        </>
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

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: themeColors.background }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <StatusBar 
          style={isDark ? "light" : "dark"} 
          backgroundColor="transparent" 
          translucent={true} 
        />
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      {/* On ajoute SettingsProvider pour que le ThemeProvider puisse lire les paramètres locaux */}
      <SettingsProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}