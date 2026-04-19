//App.tsx
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { lightTheme, darkTheme } from './src/theme/theme';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Game: undefined;
  GameOver: { score: number; details: { word: string; accuracy: number; label: string }[] };
  Leaderboard: undefined;
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
        animation: 'fade',
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
          <Stack.Screen 
            name="Leaderboard" 
            component={LeaderboardScreen} 
            options={{ 
              animation: 'fade', 
              presentation: 'transparentModal' 
            }}
          />
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

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: themeColors.background }}>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: themeColors.background }}>
        <StatusBar 
          style={isDark ? "light" : "dark"} 
          backgroundColor="transparent" 
          translucent={true} 
        />
        <NavigationContainer theme={isDark ? darkTheme : lightTheme}>
          <AppNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}