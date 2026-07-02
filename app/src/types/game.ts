export enum StoneColor {
    Black = 'black',
    White = 'white',
    Empty = 'empty',
}

export interface Position {
    x: number;
    y: number;
}

export interface BoardState {
    size: number;
    grid: StoneColor[][];
    currentTurn: StoneColor;
    capturedBlack: number;
    capturedWhite: number;
    moveHistory: Move[];
    koPoint: Position | null;
}

export interface Move {
    color: StoneColor;
    position: Position | null;
    capturedStones: Position[];
    moveNumber: number;
}

export enum GameStatus {
    Waiting = 'waiting',
    Playing = 'playing',
    Passed = 'passed',
    Finished = 'finished',
}

export interface GameState {
    id: string;
    board: BoardState;
    status: GameStatus;
    players: {
        black: PlayerInfo;
        white: PlayerInfo;
    };
    currentTurn: StoneColor;
    lastMove: Position | null;
    score: Score | null;
}

export interface PlayerInfo {
    name: string;
    isAI: boolean;
    level?: number;
}

export interface Score {
    black: number;
    white: number;
    territory: number[][];
}

export interface GameMessage {
    type: 'move' | 'pass' | 'resign' | 'undo' | 'analysis' | 'state' | 'error' | 'join' | 'new_game';
    payload: unknown;
}