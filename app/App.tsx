import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { LanguageProvider } from './src/i18n/LanguageContext';

export type RootStackParamList = {
    Home: undefined;
    Game: { gameId: string; difficulty: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <LanguageProvider>
            <NavigationContainer>
                <StatusBar style="light" />
                <Stack.Navigator
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#111827' },
                        animation: 'slide_from_right',
                    }}
                >
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Game" component={GameScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </LanguageProvider>
    );
}