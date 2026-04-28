//src/components/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FloatingTabBar from './FloatingTabBar';

import HomeScreen from '../../screens/HomeScreen';
import ShopScreen from '../../screens/ShopScreen';
import MissionsScreen from '../../screens/MissionsScreen';
import MessagesScreen from '../../screens/MessagesScreen';
import FriendsScreen from '../../screens/FriendsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
    return (
        <Tab.Navigator
            tabBar={(props) => <FloatingTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="HomeTab" component={HomeScreen} />
            <Tab.Screen name="Shop" component={ShopScreen} />
            <Tab.Screen name="Missions" component={MissionsScreen} />
            <Tab.Screen name="Messages" component={MessagesScreen} />
        </Tab.Navigator>
    );
}
