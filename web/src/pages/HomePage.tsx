import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useLanguage } from '../i18n/LanguageContext';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [difficulty, setDifficulty] = useState<'easy' | 'pro'>('pro');

    const handleNewGame = () => {
        navigate({
            to: '/game/$gameId',
            params: { gameId: 'new' },
            search: { difficulty, mode: 'ai' },
        });
    };

    const handleHumanVsHuman = () => {
        navigate({
            to: '/game/$gameId',
            params: { gameId: 'new' },
            search: { difficulty: 'easy', mode: 'human' },
        });
    };

    const handleOnlineMatch = () => {
        navigate({
            to: '/game/$gameId',
            params: { gameId: 'new' },
            search: { difficulty: 'easy', mode: 'online' },
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8">
            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>

            <div className="text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-5xl font-bold text-white tracking-tight">
                        {t.appName}
                    </h1>
                    <p className="text-xl text-gray-400">
                        {t.appSubtitle}
                    </p>
                </div>

                <div className="w-24 h-24 mx-auto relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="w-16 h-16">
                            <line x1="10" y1="50" x2="90" y2="50" stroke="#555" strokeWidth="0.5" />
                            <line x1="50" y1="10" x2="50" y2="90" stroke="#555" strokeWidth="0.5" />
                            <circle cx="50" cy="50" r="18" fill="url(#homeBlack)" />
                            <defs>
                                <radialGradient id="homeBlack" cx="40%" cy="35%">
                                    <stop offset="0%" stopColor="#555" />
                                    <stop offset="100%" stopColor="#111" />
                                </radialGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <div className="text-sm text-gray-400 text-center">{t.difficulty}</div>
                        <div className="flex bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setDifficulty('easy')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${difficulty === 'easy'
                                    ? 'bg-orange-500 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {t.easy}
                                <div className="text-xs opacity-70">Simple AI</div>
                            </button>
                            <button
                                onClick={() => setDifficulty('pro')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${difficulty === 'pro'
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                {t.professional}
                                <div className="text-xs opacity-70">KataGo</div>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleNewGame}
                            className="px-6 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/30"
                        >
                            {t.newGameVsAI}
                        </button>

                        <button
                            onClick={handleHumanVsHuman}
                            className="px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/30"
                        >
                            {t.newGameVsHuman}
                        </button>
                    </div>

                    <button
                        onClick={handleOnlineMatch}
                        className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/30"
                    >
                        {t.newGameOnline}
                    </button>

                    <p className="text-sm text-gray-500 max-w-md whitespace-pre-line">
                        {t.homeDescription}
                    </p>

                    <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto pt-4">
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-emerald-400">19×19</div>
                            <div className="text-xs text-gray-500 mt-1">{t.board}</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-emerald-400">6.5</div>
                            <div className="text-xs text-gray-500 mt-1">{t.komi}</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-emerald-400">AI</div>
                            <div className="text-xs text-gray-500 mt-1">{t.opponent}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};