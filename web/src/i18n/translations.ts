export type Language = 'en' | 'zh';

export interface Translations {
    // Common
    appName: string;
    appSubtitle: string;
    // Home
    newGameVsAI: string;
    homeDescription: string;
    board: string;
    komi: string;
    opponent: string;
    difficulty: string;
    easy: string;
    professional: string;
    // Game
    connecting: string;
    game: string;
    turn: string;
    move: string;
    back: string;
    backToHome: string;
    black: string;
    white: string;
    captures: string;
    gameOver: string;
    pass: string;
    undo: string;
    resign: string;
    newGame: string;
    gameHint: string;
    connected: string;
    disconnected: string;
    // Language
    language: string;
}

export const translations: Record<Language, Translations> = {
    en: {
        appName: 'KataGo',
        appSubtitle: 'AI-Powered Go Game',
        newGameVsAI: 'New Game vs AI',
        homeDescription: 'Play against KataGo AI on a 19×19 board.\nYou play as Black, KataGo plays as White.',
        board: 'Board',
        komi: 'Komi',
        opponent: 'Opponent',
        difficulty: 'Difficulty',
        easy: 'Easy',
        professional: 'Professional',
        connecting: 'Connecting to server...',
        game: 'Game',
        turn: 'Turn',
        move: 'Move',
        back: 'Back',
        backToHome: 'Home',
        black: 'Black',
        white: 'White',
        captures: 'Captures',
        gameOver: 'Game Over',
        pass: 'Pass',
        undo: 'Undo',
        resign: 'Resign',
        newGame: 'New Game',
        gameHint: 'Click on an intersection to place a stone. You play Black. KataGo plays White.',
        connected: 'Connected',
        disconnected: 'Disconnected',
        language: 'Language',
    },
    zh: {
        appName: 'KataGo',
        appSubtitle: 'AI 围棋对弈',
        newGameVsAI: '新游戏 vs AI',
        homeDescription: '在 19×19 棋盘上与 KataGo AI 对弈。\n你执黑先行，KataGo 执白。',
        board: '棋盘',
        komi: '贴目',
        opponent: '对手',
        difficulty: '难度选择',
        easy: '简单',
        professional: '专业',
        connecting: '正在连接服务器...',
        game: '对局',
        turn: '执子',
        move: '手数',
        back: '返回',
        backToHome: '回到主页面',
        black: '黑棋',
        white: '白棋',
        captures: '提子',
        gameOver: '对局结束',
        pass: '停着',
        undo: '悔棋',
        resign: '认输',
        newGame: '新游戏',
        gameHint: '点击棋盘交叉点落子。你执黑先行，KataGo 执白。',
        connected: '已连接',
        disconnected: '已断开',
        language: '语言',
    },
};