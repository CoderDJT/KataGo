import React from 'react';
import { GameState, GameStatus, StoneColor } from '../types/game';
import { useLanguage } from '../i18n/LanguageContext';

interface GameInfoProps {
    gameState: GameState;
    onPass: () => void;
    onUndo: () => void;
    onResign: () => void;
    onNewGame: () => void;
    connected: boolean;
}

export const GameInfo: React.FC<GameInfoProps> = ({
    gameState,
    onPass,
    onUndo,
    onResign,
    onNewGame,
    connected,
}) => {
    const { t } = useLanguage();
    const { board, status, players, currentTurn } = gameState;
    const isPlaying = status === GameStatus.Playing;
    const isPlayerTurn = currentTurn === StoneColor.Black;

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
                        <span className="text-sm font-medium">{players.black.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                        {t.captures}: {board.capturedWhite}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-white border border-gray-400" />
                        {players.white.name === 'KataGo' ? (
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
                    disabled={!isPlaying || board.moveHistory.length < 2}
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