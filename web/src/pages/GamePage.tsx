import React from 'react';
import { useParams, useSearch, useNavigate } from '@tanstack/react-router';
import { Board } from '../components/Board';
import { GameInfo } from '../components/GameInfo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useGame } from '../hooks/useGame';
import { useLanguage } from '../i18n/LanguageContext';
import { GameStatus } from '../types/game';

export const GamePage: React.FC = () => {
    const { gameId } = useParams({ from: '/game/$gameId' }) as { gameId: string };
    const search = useSearch({ from: '/game/$gameId' });
    const useKataGo = search.difficulty !== 'easy';
    const navigate = useNavigate();
    const { t } = useLanguage();
    const {
        gameState,
        connected,
        sendMove,
        sendPass,
        sendUndo,
        sendResign,
        newGame,
    } = useGame(gameId === 'new' ? undefined : gameId, useKataGo);

    const handleCellClick = (position: { x: number; y: number }) => {
        if (!gameState) return;
        if (gameState.status !== GameStatus.Playing) return;
        sendMove(position);
    };

    if (!gameState) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
                    <p className="text-gray-400">{t.connecting}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center p-4">
            <header className="w-full max-w-[900px] flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate({ to: '/' })}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-900/30"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        {t.backToHome}
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                        {t.game} #{gameState.id.slice(0, 8)}
                    </span>
                    <LanguageSwitcher />
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-6 items-start justify-center w-full max-w-[900px]">
                <div className="w-full lg:flex-1 flex justify-center">
                    <Board
                        board={gameState.board}
                        onCellClick={handleCellClick}
                        interactive={gameState.status === GameStatus.Playing}
                        lastMove={gameState.lastMove}
                    />
                </div>

                <div className="w-full lg:w-auto flex justify-center">
                    <GameInfo
                        gameState={gameState}
                        onPass={sendPass}
                        onUndo={sendUndo}
                        onResign={sendResign}
                        onNewGame={newGame}
                        connected={connected}
                    />
                </div>
            </div>

            <div className="w-full max-w-[900px] mt-4 text-center">
                <p className="text-xs text-gray-600">
                    {t.gameHint}
                </p>
            </div>
        </div>
    );
};