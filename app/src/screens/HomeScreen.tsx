import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, RadialGradient, Defs, Stop, Line } from 'react-native-svg';

type RootStackParamList = {
    Home: undefined;
    Game: { gameId: string };
};

interface HomeScreenProps {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const handleNewGame = () => {
        navigation.navigate('Game', { gameId: 'new' });
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>KataGo</Text>
                    <Text style={styles.subtitle}>AI-Powered Go Game</Text>
                </View>

                <View style={styles.iconContainer}>
                    <Svg width={80} height={80} viewBox="0 0 100 100">
                        <Line x1="10" y1="50" x2="90" y2="50" stroke="#555" strokeWidth="0.5" />
                        <Line x1="50" y1="10" x2="50" y2="90" stroke="#555" strokeWidth="0.5" />
                        <Circle cx="50" cy="50" r="18" fill="url(#homeBlack)" />
                        <Defs>
                            <RadialGradient id="homeBlack" cx="40%" cy="35%">
                                <Stop offset="0%" stopColor="#555" />
                                <Stop offset="100%" stopColor="#111" />
                            </RadialGradient>
                        </Defs>
                    </Svg>
                </View>

                <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame} activeOpacity={0.8}>
                    <Text style={styles.newGameButtonText}>New Game vs AI</Text>
                </TouchableOpacity>

                <Text style={styles.description}>
                    Play against KataGo AI on a 19×19 board.{'\n'}
                    You play as Black, KataGo plays as White.
                </Text>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>19×19</Text>
                        <Text style={styles.statLabel}>Board</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>6.5</Text>
                        <Text style={styles.statLabel}>Komi</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>AI</Text>
                        <Text style={styles.statLabel}>Opponent</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 48,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        color: '#9ca3af',
        marginTop: 8,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#1f2937',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    newGameButton: {
        backgroundColor: '#059669',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    newGameButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    description: {
        fontSize: 13,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        backgroundColor: '#1f2937',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        minWidth: 80,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#34d399',
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
});