//App.tsx
import React, { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { darkTheme, colors } from './src/theme/theme';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';
import GameOverScreen from './src/screens/GameOverScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Game: undefined;
  GameOver: { score: number; details: { word: string; accuracy: number; label: string }[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, loading } = useAuth();
  const [isSplashDone, setIsSplashDone] = useState(false);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: colors.nightBlue }, 
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
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: {
                backgroundColor: colors.nightBlue,
              },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{
              headerShown: true,
              headerTitle: '',
              headerStyle: {
                backgroundColor: colors.nightBlue,
              },
              headerShadowVisible: false,
              headerTintColor: colors.sand,
              headerBackTitle: '',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.nightBlue }}>
        <StatusBar 
          style="light" 
          backgroundColor={colors.nightBlue} 
          translucent={false} 
        />
        <AuthProvider>
          <NavigationContainer theme={darkTheme}>
            <AppNavigator />
          </NavigationContainer>
        </AuthProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}