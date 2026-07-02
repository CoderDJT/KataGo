import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Board } from '../components/Board';
import { useGame } from '../hooks/useGame';
import { GameStatus, StoneColor } from '../types/game';

type RootStackParamList = {
    Home: undefined;
    Game: { gameId: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export const GameScreen: React.FC<Props> = ({ route, navigation }) => {
    const { gameId } = route.params;
    const {
        gameState,
        connected,
        sendMove,
        sendPass,
        sendUndo,
        sendResign,
        newGame,
    } = useGame(gameId === 'new' ? undefined : gameId);

    const handleCellClick = (position: { x: number; y: number }) => {
        if (!gameState) return;
        if (gameState.status !== GameStatus.Playing) return;
        sendMove(position);
    };

    if (!gameState) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#34d399" />
                <Text style={styles.loadingText}>Connecting to server...</Text>
            </View>
        );
    }

    const isPlaying = gameState.status === GameStatus.Playing;
    const isPlayerTurn = gameState.currentTurn === StoneColor.Black;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>KataGo</Text>
                <View style={styles.connectionDot}>
                    <View style={[styles.dot, connected ? styles.dotConnected : styles.dotDisconnected]} />
                    <Text style={styles.connectionText}>{connected ? 'Connected' : 'Disconnected'}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.boardContainer}>
                    <Board
                        board={gameState.board}
                        onCellClick={handleCellClick}
                        interactive={isPlaying}
                        lastMove={gameState.lastMove}
                    />
                </View>

                <View style={styles.infoPanel}>
                    <View style={styles.playerRow}>
                        <View style={styles.playerInfo}>
                            <View style={[styles.stone, styles.blackStone]} />
                            <Text style={styles.playerName}>{gameState.players.black.name}</Text>
                        </View>
                        <Text style={styles.captures}>Captures: {gameState.board.capturedWhite}</Text>
                    </View>

                    <View style={styles.playerRow}>
                        <View style={styles.playerInfo}>
                            <View style={[styles.stone, styles.whiteStone]} />
                            <Text style={styles.playerName}>{gameState.players.white.name}</Text>
                        </View>
                        <Text style={styles.captures}>Captures: {gameState.board.capturedBlack}</Text>
                    </View>

                    <View style={styles.turnInfo}>
                        <Text style={styles.turnLabel}>
                            Turn: {gameState.currentTurn === StoneColor.Black ? '● Black' : '○ White'}
                        </Text>
                        <Text style={styles.moveCount}>Move {gameState.board.moveHistory.length}</Text>
                    </View>

                    {gameState.status === GameStatus.Finished && (
                        <View style={styles.gameOver}>
                            <Text style={styles.gameOverText}>Game Over</Text>
                        </View>
                    )}

                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionButton, (!isPlaying || !isPlayerTurn) && styles.actionButtonDisabled]}
                            onPress={sendPass}
                            disabled={!isPlaying || !isPlayerTurn}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.actionText}>Pass</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, (!isPlaying || gameState.board.moveHistory.length < 2) && styles.actionButtonDisabled]}
                            onPress={sendUndo}
                            disabled={!isPlaying || gameState.board.moveHistory.length < 2}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.actionText}>Undo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.resignButton]}
                            onPress={sendResign}
                            disabled={!isPlaying}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.actionText, styles.resignText]}>Resign</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.newGameButton} onPress={newGame} activeOpacity={0.8}>
                        <Text style={styles.newGameText}>New Game</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

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
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#1f2937',
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    backButton: {
        paddingVertical: 4,
        paddingRight: 8,
    },
    backText: {
        color: '#34d399',
        fontSize: 16,
        fontWeight: '500',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
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
    infoPanel: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#1f2937',
        borderRadius: 16,
        padding: 20,
    },
    playerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stone: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    blackStone: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#555',
    },
    whiteStone: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    playerName: {
        color: '#f3f4f6',
        fontSize: 14,
        fontWeight: '500',
    },
    captures: {
        color: '#9ca3af',
        fontSize: 12,
    },
    turnInfo: {
        borderTopWidth: 1,
        borderTopColor: '#374151',
        paddingTop: 12,
        marginBottom: 12,
    },
    turnLabel: {
        color: '#f3f4f6',
        fontSize: 14,
        fontWeight: '600',
    },
    moveCount: {
        color: '#6b7280',
        fontSize: 12,
        marginTop: 4,
    },
    gameOver: {
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        borderWidth: 1,
        borderColor: '#f59e0b',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    gameOverText: {
        color: '#fbbf24',
        fontWeight: '700',
        fontSize: 14,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#374151',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    actionButtonDisabled: {
        opacity: 0.4,
    },
    actionText: {
        color: '#f3f4f6',
        fontSize: 13,
        fontWeight: '500',
    },
    resignButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    resignText: {
        color: '#fca5a5',
    },
    newGameButton: {
        backgroundColor: '#059669',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    newGameText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
});