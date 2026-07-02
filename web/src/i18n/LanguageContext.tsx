import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Language, Translations, translations as allTranslations } from './translations';

interface LanguageContextType {
    language: Language;
    t: Translations;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getInitialLanguage(): Language {
    try {
        const stored = localStorage.getItem('katago-language');
        if (stored === 'en' || stored === 'zh') return stored;
    } catch {
        // ignore
    }
    const navLang = navigator.language.toLowerCase();
    return navLang.startsWith('zh') ? 'zh' : 'en';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        try {
            localStorage.setItem('katago-language', lang);
        } catch {
            // ignore
        }
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguage(language === 'en' ? 'zh' : 'en');
    }, [language, setLanguage]);

    const value: LanguageContextType = {
        language,
        t: allTranslations[language],
        setLanguage,
        toggleLanguage,
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export function useLanguage(): LanguageContextType {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return ctx;
}