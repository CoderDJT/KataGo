export type Language = 'en' | 'zh';

export interface Translations {
    appName: string;
    appSubtitle: string;
    newGameVsAI: string;
    newGameHuman: string;
    newGameOnline: string;
    homeDescription: string;
    board: string;
    komi: string;
    opponent: string;
    difficulty: string;
    easy: string;
    professional: string;
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
    gameHintHuman: string;
    gameHintOnline: string;
    connected: string;
    disconnected: string;
    language: string;
    waitingOpponent: string;
    shareLink: string;
    copyLink: string;
    linkCopied: string;
    youAre: string;
    analyzeGame: string;
    analyzing: string;
    analysisDone: string;
    analysisTimeout: string;
    finalScore: string;
    winRate: string;
    scoreLead: string;
    principalVariation: string;
}

export const translations: Record<Language, Translations> = {
    en: {
        appName: 'KataGo',
        appSubtitle: 'AI-Powered Go Game',
        newGameVsAI: 'New Game vs AI',
        newGameHuman: 'Local 2-Player',
        newGameOnline: 'Online Battle',
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
        gameHintHuman: 'Two players take turns. Black goes first.',
        gameHintOnline: 'You play Black. Wait for your opponent to join.',
        connected: 'Connected',
        disconnected: 'Disconnected',
        language: 'Language',
        waitingOpponent: 'Waiting for opponent to join...',
        shareLink: 'Share this link with your opponent',
        copyLink: 'Copy Link',
        linkCopied: 'Copied!',
        youAre: 'You are',
        analyzeGame: 'AI Analyze',
        analyzing: 'Analyzing...',
        analysisDone: 'Analysis Complete',
        analysisTimeout: 'Analysis timed out. Please try again.',
        finalScore: 'Final Score',
        winRate: 'Win Rate',
        scoreLead: 'Score Lead',
        principalVariation: 'Best Variation',
    },
    zh: {
        appName: 'KataGo',
        appSubtitle: 'AI 围棋对弈',
        newGameVsAI: '新游戏 vs AI',
        newGameHuman: '本地双人对弈',
        newGameOnline: '在线对战',
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
        gameHintHuman: '双人轮流落子，黑棋先行。',
        gameHintOnline: '你执黑棋，等待对手加入。',
        connected: '已连接',
        disconnected: '已断开',
        language: '语言',
        waitingOpponent: '等待对手加入...',
        shareLink: '将链接分享给对手',
        copyLink: '复制链接',
        linkCopied: '已复制！',
        youAre: '你是',
        analyzeGame: 'AI 分析棋局',
        analyzing: '分析中...',
        analysisDone: '分析完成',
        analysisTimeout: '分析超时，请重新分析',
        finalScore: '终局比分',
        winRate: '胜率',
        scoreLead: '目差',
        principalVariation: '最佳变化',
    },
};