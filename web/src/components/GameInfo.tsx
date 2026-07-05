import React from 'react';
import { GameState, GameStatus, StoneColor, AnalysisData } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';

interface GameInfoProps {
    gameState: GameState;
    onPass: () => void;
    onUndo: () => void;
    onResign: () => void;
    onNewGame: () => void;
    onAnalyze: () => void;
    analysisResult: AnalysisData | null;
    analyzing: boolean;
    analysisError: string | null;
    connected: boolean;
    isHumanVsHuman?: boolean;
}

export const GameInfo: React.FC<GameInfoProps> = ({
    gameState,
    onPass,
    onUndo,
    onResign,
    onNewGame,
    onAnalyze,
    analysisResult,
    analyzing,
    analysisError,
    connected,
    isHumanVsHuman,
}) => {
    const { t } = useLanguage();
    const { board, status, players, currentTurn, playerColor } = gameState;
    const isPlaying = status === GameStatus.Playing;
    const isOnline = !!playerColor && players.white.isAI === false && players.black.isAI === false;
    const isPlayerTurn = isOnline
        ? (playerColor === currentTurn)
        : isHumanVsHuman
            ? true
            : currentTurn === StoneColor.Black;

    const blackName = players.black.name === 'Black' ? t.black : players.black.name;
    const whiteName = players.white.name === 'White' ? t.white : players.white.name;

    return (
        <div className="bg-gray-800 rounded-xl p-5 space-y-4 w-full max-w-[280px]">
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-400">
                    {connected ? t.connected : t.disconnected}
                </span>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-900 border border-gray-600" />
                        <span className="text-sm font-medium">{blackName}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                        {t.captures}: {board.capturedWhite}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-white border border-gray-400" />
                        {isHumanVsHuman || isOnline ? (
                            <span className="text-sm font-medium">{whiteName}</span>
                        ) : players.white.name === 'KataGo' ? (
                            <span className="text-sm font-semibold text-emerald-400">{players.white.name}</span>
                        ) : (
                            <span className="text-sm font-medium text-orange-400">{players.white.name}</span>
                        )}
                    </div>
                    <span className="text-xs text-gray-400">
                        {t.captures}: {board.capturedBlack}
                    </span>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-3">
                {isOnline && (
                    <div className="text-sm text-gray-400 mb-1">
                        {t.youAre}: {' '}
                        <span className="font-bold text-white">
                            {playerColor === StoneColor.Black ? `● ${t.black}` : `○ ${t.white}`}
                        </span>
                    </div>
                )}
                <div className="text-sm text-gray-400">
                    {t.turn}: {' '}
                    <span className="font-bold text-white">
                        {currentTurn === StoneColor.Black ? `● ${t.black}` : `○ ${t.white}`}
                    </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {t.move} {board.moveHistory.length}
                </div>
            </div>

            {status === GameStatus.Finished && (
                <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-3 text-center">
                    <span className="text-yellow-400 font-bold">{t.gameOver}</span>
                </div>
            )}

            <div className="space-y-2 pt-2">
                <button
                    onClick={onPass}
                    disabled={!isPlaying || !isPlayerTurn}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                    {t.pass}
                </button>

                <button
                    onClick={onUndo}
                    disabled={!isPlaying || board.moveHistory.length < (isOnline || isHumanVsHuman ? 1 : 2) || (isOnline && !isPlayerTurn)}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                >
                    {t.undo}
                </button>

                <button
                    onClick={onResign}
                    disabled={!isPlaying}
                    className="w-full px-4 py-2 bg-red-900/50 hover:bg-red-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-red-300 transition-colors"
                >
                    {t.resign}
                </button>

                {isOnline && status === GameStatus.Finished && (
                    <div className="border-t border-gray-700 pt-2 space-y-2">
                        <button
                            onClick={onAnalyze}
                            disabled={analyzing || !!analysisResult}
                            className="w-full px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
                        >
                            {analyzing ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin w-3 h-3 border-2 border-purple-300 border-t-transparent rounded-full" />
                                    {t.analyzing}
                                </span>
                            ) : analysisResult ? (
                                t.analysisDone
                            ) : (
                                t.analyzeGame
                            )}
                        </button>

                        {analysisError && (
                            <div className="bg-red-900/30 border border-red-700 rounded-lg p-2 text-sm text-red-300 text-center">
                                {analysisError}
                            </div>
                        )}

                        {analysisResult && (
                            <div className="bg-gray-900 rounded-lg p-3 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">{t.finalScore}:</span>
                                    <span className="text-white font-bold">{analysisResult.finalScore}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">{t.winRate}:</span>
                                    <span className="text-white font-bold">
                                        {(analysisResult.winRate * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">{t.scoreLead}:</span>
                                    <span className="text-white font-bold">{analysisResult.scoreLead.toFixed(1)}</span>
                                </div>
                                {analysisResult.principalVariation && (
                                    <div>
                                        <span className="text-gray-400">{t.principalVariation}:</span>
                                        <p className="text-white mt-1">{analysisResult.principalVariation}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="border-t border-gray-700 pt-2">
                    <button
                        onClick={onNewGame}
                        className="w-full px-4 py-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-sm font-medium transition-colors"
                    >
                        {t.newGame}
                    </button>
                </div>
            </div>
        </div>
    );
};