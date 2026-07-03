import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, RadialGradient, Defs, Stop, Line } from 'react-native-svg';
import { useLanguage } from '../i18n/LanguageContext';

type RootStackParamList = {
    Home: undefined;
    Game: { gameId: string; difficulty: string };
};

interface HomeScreenProps {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
}

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { t, language, toggleLanguage } = useLanguage();
    const [difficulty, setDifficulty] = useState<'easy' | 'pro'>('pro');

    const handleNewGame = () => {
        navigation.navigate('Game', { gameId: 'new', difficulty });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.langButton} onPress={toggleLanguage} activeOpacity={0.7}>
                <Text style={styles.langButtonText}>{language === 'en' ? '中' : 'EN'}</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{t.appName}</Text>
                    <Text style={styles.subtitle}>{t.appSubtitle}</Text>
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

                <View style={styles.difficultySection}>
                    <Text style={styles.difficultyLabel}>{t.difficulty}</Text>
                    <View style={styles.difficultyRow}>
                        <TouchableOpacity
                            style={[styles.difficultyButton, difficulty === 'easy' && styles.difficultyButtonEasy]}
                            onPress={() => setDifficulty('easy')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.difficultyText, difficulty === 'easy' && styles.difficultyTextActive]}>
                                {t.easy}
                            </Text>
                            <Text style={styles.difficultySub}>Simple AI</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.difficultyButton, difficulty === 'pro' && styles.difficultyButtonPro]}
                            onPress={() => setDifficulty('pro')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.difficultyText, difficulty === 'pro' && styles.difficultyTextActive]}>
                                {t.professional}
                            </Text>
                            <Text style={styles.difficultySub}>KataGo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame} activeOpacity={0.8}>
                    <Text style={styles.newGameButtonText}>{t.newGameVsAI}</Text>
                </TouchableOpacity>

                <Text style={styles.description}>{t.homeDescription}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>19×19</Text>
                        <Text style={styles.statLabel}>{t.board}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>6.5</Text>
                        <Text style={styles.statLabel}>{t.komi}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>AI</Text>
                        <Text style={styles.statLabel}>{t.opponent}</Text>
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
    langButton: {
        position: 'absolute',
        top: 56,
        right: 20,
        backgroundColor: '#1f2937',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        zIndex: 10,
    },
    langButtonText: {
        color: '#34d399',
        fontSize: 14,
        fontWeight: '600',
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
        marginBottom: 32,
    },
    difficultySection: {
        width: '100%',
        marginBottom: 24,
        alignItems: 'center',
    },
    difficultyLabel: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 10,
    },
    difficultyRow: {
        flexDirection: 'row',
        backgroundColor: '#1f2937',
        borderRadius: 10,
        padding: 4,
        gap: 4,
    },
    difficultyButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    difficultyButtonEasy: {
        backgroundColor: '#f97316',
    },
    difficultyButtonPro: {
        backgroundColor: '#10b981',
    },
    difficultyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9ca3af',
    },
    difficultyTextActive: {
        color: '#fff',
    },
    difficultySub: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    newGameButton: {
        backgroundColor: '#059669',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 14,
        marginBottom: 24,
        shadowColor: '#059669',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    newGameButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 320,
        marginBottom: 32,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        backgroundColor: '#1f2937',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        flex: 1,
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