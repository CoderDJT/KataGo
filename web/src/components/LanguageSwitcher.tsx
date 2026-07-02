import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm text-gray-300 transition-colors"
            title={language === 'en' ? '切换中文' : 'Switch to English'}
        >
            <span className="text-base">{language === 'en' ? '🇨🇳' : '🇺🇸'}</span>
            <span>{language === 'en' ? '中文' : 'EN'}</span>
        </button>
    );
};