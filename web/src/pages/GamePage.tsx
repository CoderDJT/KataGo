import React, { useState, useCallback, useEffect } from 'react';
import QRCode from 'qrcode';
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
    const isHumanVsHuman = search.mode === 'human';
    const isOnline = search.mode === 'online';
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [linkCopied, setLinkCopied] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
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
    } = useGame(gameId === 'new' ? undefined : gameId, useKataGo, search.mode);

    const handleCellClick = (position: { x: number; y: number }) => {
        if (!gameState) return;
        if (gameState.status !== GameStatus.Playing) return;
        sendMove(position);
    };

    const copyGameLink = useCallback(() => {
        const url = `${window.location.origin}/game/${gameState?.id}?mode=online`;
        navigator.clipboard.writeText(url).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        });
    }, [gameState?.id]);

    useEffect(() => {
        if (isOnline && gameState?.id) {
            const gameUrl = `${window.location.origin}/game/${gameState.id}?mode=online`;
            QRCode.toDataURL(gameUrl, { width: 180, margin: 1 })
                .then(setQrCodeUrl)
                .catch(() => setQrCodeUrl(''));
        }
    }, [isOnline, gameState?.id]);

    const analysisError = error === 'analysis_timeout' ? t.analysisTimeout : error;

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

            {isOnline && gameState.status === GameStatus.Waiting && (
                <div className="w-full max-w-[900px] mb-4">
                    <div className="bg-purple-900/40 border border-purple-700 rounded-xl p-5 text-center space-y-3">
                        <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full" />
                            <span className="text-purple-300 font-medium">{t.waitingOpponent}</span>
                        </div>
                        <p className="text-sm text-gray-400">{t.shareLink}</p>
                        {qrCodeUrl && (
                            <div className="flex justify-center">
                                <img
                                    src={qrCodeUrl}
                                    alt="QR Code"
                                    className="w-44 h-44 rounded-lg bg-white p-2"
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-2">
                            <input
                                type="text"
                                readOnly
                                value={`${window.location.origin}/game/${gameState.id}?mode=online`}
                                className="flex-1 bg-transparent text-sm text-gray-300 outline-none px-2"
                            />
                            <button
                                onClick={copyGameLink}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                            >
                                {linkCopied ? t.linkCopied : t.copyLink}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        onAnalyze={sendAnalyze}
                        analysisResult={analysisResult}
                        analyzing={analyzing}
                        analysisError={analysisError}
                        connected={connected}
                        isHumanVsHuman={isHumanVsHuman}
                    />
                </div>
            </div>

            <div className="w-full max-w-[900px] mt-4 text-center">
                <p className="text-xs text-gray-600">
                    {isOnline ? t.gameHintOnline : isHumanVsHuman ? t.gameHintVsHuman : t.gameHint}
                </p>
            </div>
        </div>
    );
};