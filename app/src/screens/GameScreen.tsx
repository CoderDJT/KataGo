import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image, Clipboard } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'qrcode';
import { Board } from '../components/Board';
import { useGame } from '../hooks/useGame';
import { GameStatus, StoneColor, AnalysisData } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';

type RootStackParamList = {
    Home: undefined;
    Game: { gameId: string; difficulty: string; mode?: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export const GameScreen: React.FC<Props> = ({ route, navigation }) => {
    const { gameId, difficulty, mode } = route.params;
    const { t } = useLanguage();
    const useKataGo = difficulty === 'pro';
    const isOnline = mode === 'online';
    const isHumanVsHuman = mode === 'human';
    const {
        gameState,
        connected,
        sendMove,
        sendPass,
        sendUndo,
        sendResign,
        newGame,
        sendAnalyze,
        analysisResult,
        analyzing,
        error,
    } = useGame(gameId === 'new' ? undefined : gameId, useKataGo, mode);

    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);

    useEffect(() => {
        if (isOnline && gameState?.id) {
            const gameUrl = `http://localhost:5173/game/${gameState.id}?mode=online`;
            QRCode.toDataURL(gameUrl, { width: 180, margin: 1 })
                .then(setQrCodeUrl)
                .catch(() => setQrCodeUrl(''));
        }
    }, [isOnline, gameState?.id]);

    const copyGameLink = () => {
        if (!gameState) return;
        const url = `http://localhost:5173/game/${gameState.id}?mode=online`;
        Clipboard.setString(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleCellClick = (position: { x: number; y: number }) => {
        if (!gameState) return;
        if (gameState.status !== GameStatus.Playing) return;
        sendMove(position);
    };

    if (!gameState) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#34d399" />
                <Text style={styles.loadingText}>{t.connecting}</Text>
            </View>
        );
    }

    const isPlaying = gameState.status === GameStatus.Playing;
    const playerColor = gameState.playerColor;
    const isPlayerTurn = isOnline
        ? playerColor === gameState.currentTurn
        : isHumanVsHuman
            ? true
            : gameState.currentTurn === StoneColor.Black;
    const isKataGo = gameState.players.white.name === 'KataGo';
    const isGameOver = gameState.status === GameStatus.Finished;
    const analysisError = error === 'analysis_timeout' ? t.analysisTimeout : error;

    const translateName = (name: string): string => {
        const nameMap: Record<string, string> = {
            'Black': t.black,
            'White': t.white,
            'You': t.black,
            'Simple AI': t.easy,
        };
        return nameMap[name] || name;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={styles.homeButton}
                    activeOpacity={0.8}
                >
                    <Text style={styles.homeButtonText}>🏠 {t.backToHome}</Text>
                </TouchableOpacity>
                <View style={styles.headerRight}>
                    <Text style={styles.gameIdText}>
                        {t.game} #{gameState.id.slice(0, 8)}
                    </Text>
                    <View style={styles.connectionDot}>
                        <View style={[styles.dot, connected ? styles.dotConnected : styles.dotDisconnected]} />
                        <Text style={styles.connectionText}>
                            {connected ? t.connected : t.disconnected}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {isOnline && gameState.status === GameStatus.Waiting && (
                    <View style={styles.waitingPanel}>
                        <View style={styles.waitingRow}>
                            <ActivityIndicator size="small" color="#a78bfa" />
                            <Text style={styles.waitingText}>{t.waitingOpponent}</Text>
                        </View>
                        <Text style={styles.shareLinkText}>{t.shareLink}</Text>
                        {qrCodeUrl ? (
                            <Image source={{ uri: qrCodeUrl }} style={styles.qrCode} />
                        ) : null}
                        <TouchableOpacity style={styles.copyLinkButton} onPress={copyGameLink} activeOpacity={0.7}>
                            <Text style={styles.copyLinkButtonText}>
                                {linkCopied ? t.linkCopied : t.copyLink}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.boardContainer}>
                    <Board
                        board={gameState.board}
                        onCellClick={handleCellClick}
                        interactive={isPlaying && isPlayerTurn}
                        lastMove={gameState.lastMove}
                    />
                </View>

                <View style={styles.infoPanel}>
                    <View style={styles.playerRow}>
                        <View style={styles.playerInfo}>
                            <View style={[styles.stone, styles.blackStone]} />
                            <Text style={styles.playerName}>{translateName(gameState.players.black.name)}</Text>
                        </View>
                        <Text style={styles.captures}>
                            {t.captures}: {gameState.board.capturedWhite}
                        </Text>
                    </View>

                    <View style={styles.playerRow}>
                        <View style={styles.playerInfo}>
                            <View style={[styles.stone, styles.whiteStone]} />
                            <Text style={[styles.playerName, isKataGo ? styles.kataGoName : styles.simpleAIName]}>
                                {translateName(gameState.players.white.name)}
                            </Text>
                        </View>
                        <Text style={styles.captures}>
                            {t.captures}: {gameState.board.capturedBlack}
                        </Text>
                    </View>

                    <View style={styles.turnInfo}>
                        <View>
                            {isOnline && playerColor && (
                                <Text style={styles.youAreText}>
                                    {t.youAre}: {playerColor === StoneColor.Black ? `● ${t.black}` : `○ ${t.white}`}
                                </Text>
                            )}
                            <Text style={styles.turnLabel}>
                                {t.turn}: {gameState.currentTurn === StoneColor.Black ? `● ${t.black}` : `○ ${t.white}`}
                            </Text>
                        </View>
                        <Text style={styles.moveCount}>
                            {t.move} {gameState.board.moveHistory.length}
                        </Text>
                    </View>

                    {isGameOver && (
                        <View style={styles.gameOver}>
                            <Text style={styles.gameOverText}>{t.gameOver}</Text>
                        </View>
                    )}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, (!isPlaying || !isPlayerTurn) && styles.actionButtonDisabled]}
                            onPress={sendPass}
                            disabled={!isPlaying || !isPlayerTurn}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.actionText}>{t.pass}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, (!isPlaying || gameState.board.moveHistory.length < 2) && styles.actionButtonDisabled]}
                            onPress={sendUndo}
                            disabled={!isPlaying || gameState.board.moveHistory.length < 2}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.actionText}>{t.undo}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.resignButton]}
                            onPress={sendResign}
                            disabled={!isPlaying}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.actionText, styles.resignText]}>{t.resign}</Text>
                        </TouchableOpacity>
                    </View>

                    {isOnline && isGameOver && (
                        <View style={styles.analysisSection}>
                            <TouchableOpacity
                                style={[styles.analyzeButton, (analyzing || !!analysisResult) && styles.analyzeButtonDisabled]}
                                onPress={sendAnalyze}
                                disabled={analyzing || !!analysisResult}
                                activeOpacity={0.7}
                            >
                                {analyzing ? (
                                    <View style={styles.analyzingRow}>
                                        <ActivityIndicator size="small" color="#a78bfa" />
                                        <Text style={styles.analyzeButtonText}>{t.analyzing}</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.analyzeButtonText}>
                                        {analysisResult ? t.analysisDone : t.analyzeGame}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {analysisError && !analysisResult && (
                                <View style={styles.analysisError}>
                                    <Text style={styles.analysisErrorText}>{analysisError}</Text>
                                </View>
                            )}

                            {analysisResult && (
                                <View style={styles.analysisResult}>
                                    <AnalysisItem label={t.finalScore} value={analysisResult.finalScore} />
                                    <AnalysisItem label={t.winRate} value={`${(analysisResult.winRate * 100).toFixed(1)}%`} />
                                    <AnalysisItem label={t.scoreLead} value={analysisResult.scoreLead > 0 ? `+${analysisResult.scoreLead.toFixed(1)}` : analysisResult.scoreLead.toFixed(1)} />
                                    {analysisResult.principalVariation ? (
                                        <AnalysisItem label={t.principalVariation} value={analysisResult.principalVariation} />
                                    ) : null}
                                </View>
                            )}
                        </View>
                    )}

                    <TouchableOpacity style={styles.newGameButton} onPress={newGame} activeOpacity={0.8}>
                        <Text style={styles.newGameText}>{t.newGame}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const AnalysisItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <View style={styles.analysisItem}>
        <Text style={styles.analysisLabel}>{label}</Text>
        <Text style={styles.analysisValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111827',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#111827',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#9ca3af',
        marginTop: 16,
        fontSize: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#1f2937',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    homeButton: {
        backgroundColor: '#d97706',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        shadowColor: '#d97706',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    homeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    gameIdText: {
        color: '#6b7280',
        fontSize: 12,
    },
    connectionDot: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dotConnected: {
        backgroundColor: '#22c55e',
    },
    dotDisconnected: {
        backgroundColor: '#ef4444',
    },
    connectionText: {
        color: '#9ca3af',
        fontSize: 12,
    },
    scrollContent: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    boardContainer: {
        marginBottom: 16,
    },
    waitingPanel: {
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        borderWidth: 1,
        borderColor: '#7c3aed',
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
    },
    waitingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    waitingText: {
        color: '#a78bfa',
        fontSize: 15,
        fontWeight: '500',
    },
    shareLinkText: {
        color: '#9ca3af',
        fontSize: 12,
        marginBottom: 12,
    },
    qrCode: {
        width: 180,
        height: 180,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginBottom: 12,
    },
    copyLinkButton: {
        backgroundColor: '#7c3aed',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    copyLinkButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
    },
    infoPanel: {
        backgroundColor: '#1f2937',
        borderRadius: 14,
        padding: 16,
        width: '100%',
        maxWidth: 400,
    },
    playerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    stone: {
        width: 20,
        height: 20,
        borderRadius: 10,
    },
    blackStone: {
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#4b5563',
    },
    whiteStone: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#9ca3af',
    },
    playerName: {
        color: '#e5e7eb',
        fontSize: 14,
        fontWeight: '500',
    },
    kataGoName: {
        color: '#34d399',
        fontWeight: '700',
    },
    simpleAIName: {
        color: '#f97316',
        fontWeight: '700',
    },
    captures: {
        color: '#6b7280',
        fontSize: 12,
    },
    turnInfo: {
        borderTopWidth: 1,
        borderTopColor: '#374151',
        paddingTop: 12,
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    turnLabel: {
        color: '#9ca3af',
        fontSize: 14,
    },
    youAreText: {
        color: '#a78bfa',
        fontSize: 12,
        marginBottom: 2,
    },
    moveCount: {
        color: '#6b7280',
        fontSize: 12,
    },
    gameOver: {
        backgroundColor: 'rgba(250, 204, 21, 0.15)',
        borderWidth: 1,
        borderColor: '#ca8a04',
        borderRadius: 10,
        padding: 12,
        marginTop: 12,
        alignItems: 'center',
    },
    gameOverText: {
        color: '#facc15',
        fontSize: 16,
        fontWeight: '700',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#374151',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    actionButtonDisabled: {
        opacity: 0.4,
    },
    actionText: {
        color: '#e5e7eb',
        fontSize: 14,
        fontWeight: '500',
    },
    resignButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.25)',
    },
    resignText: {
        color: '#fca5a5',
    },
    analysisSection: {
        marginTop: 16,
    },
    analyzeButton: {
        backgroundColor: '#7c3aed',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    analyzeButtonDisabled: {
        opacity: 0.4,
    },
    analyzeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    analyzingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    analysisError: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 8,
        padding: 10,
        marginTop: 8,
    },
    analysisErrorText: {
        color: '#fca5a5',
        fontSize: 13,
        textAlign: 'center',
    },
    analysisResult: {
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderWidth: 1,
        borderColor: '#7c3aed',
        borderRadius: 10,
        padding: 12,
        marginTop: 8,
    },
    analysisItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    analysisLabel: {
        color: '#9ca3af',
        fontSize: 13,
    },
    analysisValue: {
        color: '#e5e7eb',
        fontSize: 13,
        fontWeight: '600',
    },
    newGameButton: {
        backgroundColor: '#059669',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    newGameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});