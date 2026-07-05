import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { GoGame } from './katago/game.js';
import { KataGoEngine } from './katago/engine.js';
import {
    GameState,
    GameStatus,
    StoneColor,
    Position,
    GameMessage,
} from '../../shared/types/game.js';
import { BOARD_SIZE, DEFAULT_KOMI } from '../../shared/constants/index.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

const games = new Map<string, { game: GoGame; engine: KataGoEngine | null; mode: string }>();
const connections = new Map<string, Set<WebSocket>>();
const playerColors = new Map<WebSocket, StoneColor>();

let globalEngine: KataGoEngine | null = null;
let engineReady = false;

function findKataGoFiles(): { path: string; cfg: string; model: string } | null {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const root = path.resolve(__dirname, '..');

    const cfg = fs.existsSync(path.join(root, 'default_gtp.cfg')) ? path.join(root, 'default_gtp.cfg') : null;
    if (!cfg) return null;

    const binFiles = fs.readdirSync(root).filter((f: string) => f.endsWith('.bin.gz'));
    if (binFiles.length === 0) return null;

    const model = path.join(root, binFiles[0]);

    const exeNames = process.platform === 'win32' ? ['katago.exe'] : ['katago', 'katago.exe'];
    let exe: string | null = null;
    for (const name of exeNames) {
        const candidate = path.join(root, name);
        if (fs.existsSync(candidate)) {
            exe = candidate;
            break;
        }
    }

    if (!exe) {
        try {
            exe = execSync('which katago', { encoding: 'utf-8' }).trim();
            if (!exe) return null;
        } catch {
            return null;
        }
    }

    return { path: exe, cfg, model };
}

const foundFiles = findKataGoFiles();
const KATAGO_PATH = process.env.KATAGO_PATH || foundFiles?.path || '';
const KATAGO_CONFIG = process.env.KATAGO_CONFIG || foundFiles?.cfg || '';
const KATAGO_MODEL = process.env.KATAGO_MODEL || foundFiles?.model || '';

const ANALYSIS_TIMEOUT = 10 * 60 * 1000;

function parseOwnership(ownershipStr: string, size: number): number[][] {
    const result: number[][] = [];
    for (let y = 0; y < size; y++) {
        result[y] = [];
        for (let x = 0; x < size; x++) {
            const ch = ownershipStr[y * size + x] || '.';
            result[y][x] = ch === 'B' || ch === 'b' ? 1 : ch === 'W' || ch === 'w' ? -1 : 0;
        }
    }
    return result;
}

function broadcast(gameId: string, game: GoGame, mode: string): void {
    const conns = connections.get(gameId);
    if (!conns) return;
    for (const ws of conns) {
        if (ws.readyState !== WebSocket.OPEN) continue;
        const state = gameStateToResponse(gameId, game, mode);
        const color = playerColors.get(ws);
        ws.send(JSON.stringify({
            type: 'state',
            payload: color ? { ...state, playerColor: color } : { ...state, playerColor: StoneColor.Black },
        }));
    }
}

function gameStateToResponse(gameId: string, goGame: GoGame, mode: string = 'ai'): GameState {
    const board = goGame.getBoardState();
    const isHumanMode = mode === 'human' || mode === 'online';
    return {
        id: gameId,
        board,
        status: goGame.status,
        players: {
            black: { name: 'Black', isAI: false },
            white: { name: isHumanMode ? 'White' : (engineReady ? 'KataGo' : 'Simple AI'), isAI: !isHumanMode },
        },
        currentTurn: board.currentTurn,
        lastMove: board.moveHistory.length > 0
            ? board.moveHistory[board.moveHistory.length - 1].position
            : null,
        score: null,
    };
}

function randomAI(game: GoGame): Position | null {
    const candidates: Position[] = [];
    const size = game.board.size;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (game.isValidMove({ x, y })) {
                candidates.push({ x, y });
            }
        }
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

async function handleAIResponse(
    gameId: string,
    gameData: { game: GoGame; engine: KataGoEngine | null; mode: string },
): Promise<void> {
    const { game, engine, mode } = gameData;

    if (mode === 'human' || mode === 'online') return;
    if (game.board.currentTurn !== StoneColor.White) return;
    if (game.status !== GameStatus.Playing) return;

    if (engine && engine.isReady()) {
        try {
            const gtpVertex = await engine.genMove('w');
            console.log(`[KataGo] AI move: ${gtpVertex}`);
            if (gtpVertex === 'pass' || gtpVertex === 'PASS' || gtpVertex === 'resign' || !gtpVertex) {
                game.pass();
            } else {
                const pos = game.fromGTPVertex(gtpVertex);
                if (pos && game.isValidMove(pos)) {
                    game.makeMove(pos);
                } else {
                    game.pass();
                }
            }
        } catch (err) {
            console.error('[KataGo] genmove error:', err);
            fallbackRandomMove(gameId, game);
        }
    } else {
        console.log('[Simple AI] Using random move');
        fallbackRandomMove(gameId, game);
    }

    broadcast(gameId, game, mode);
}

function fallbackRandomMove(gameId: string, game: GoGame): void {
    const aiMove = randomAI(game);
    if (aiMove) {
        game.makeMove(aiMove);
    } else {
        game.pass();
    }
}

async function syncEngineState(engine: KataGoEngine, game: GoGame): Promise<void> {
    if (!engine.isReady()) return;

    await engine.setBoardSize(game.board.size);
    await engine.setKomi(game.komi);
    await engine.clearBoard();

    for (const move of game.board.moveHistory) {
        if (!move.position) continue;
        const color: 'b' | 'w' = move.color === StoneColor.Black ? 'b' : 'w';
        const vertex = game.toGTPVertex(move.position);
        await engine.playMove(color, vertex);
    }
}

async function initEngine(): Promise<void> {
    if (!KATAGO_PATH) {
        console.log('KATAGO_PATH not set, using simple random AI.');
        return;
    }

    console.log(`Loading KataGo engine from: ${KATAGO_PATH}`);
    globalEngine = new KataGoEngine(KATAGO_PATH, KATAGO_CONFIG, KATAGO_MODEL);

    try {
        await globalEngine.start();
        engineReady = true;
        console.log('KataGo engine loaded successfully!');
    } catch (err) {
        console.error('Failed to start KataGo engine:', err);
        console.log('Falling back to simple random AI.');
        globalEngine = null;
        engineReady = false;
    }
}

wss.on('connection', (ws: WebSocket) => {
    let currentGameId: string | null = null;

    ws.on('message', async (data: Buffer) => {
        try {
            const msg: GameMessage = JSON.parse(data.toString());

            switch (msg.type) {
                case 'join': {
                    const { gameId, useKataGo, mode } = msg.payload as {
                        gameId?: string;
                        useKataGo?: boolean;
                        mode?: string;
                    };
                    const id = gameId || uuidv4();
                    const gameMode = mode || 'ai';

                    if (gameMode === 'online') {
                        if (!games.has(id)) {
                            const goGame = new GoGame(BOARD_SIZE, DEFAULT_KOMI);
                            goGame.status = GameStatus.Waiting;
                            games.set(id, { game: goGame, engine: null, mode: gameMode });

                            if (!connections.has(id)) {
                                connections.set(id, new Set());
                            }
                            connections.get(id)!.add(ws);
                            playerColors.set(ws, StoneColor.Black);
                            currentGameId = id;

                            console.log(`[Game ${id}] Online: Black joined, waiting for White`);
                            broadcast(id, goGame, gameMode);
                        } else {
                            const conns = connections.get(id);
                            if (!conns || conns.size >= 2) {
                                ws.send(JSON.stringify({ type: 'error', payload: 'Game is full' }));
                                break;
                            }

                            connections.get(id)!.add(ws);
                            playerColors.set(ws, StoneColor.White);
                            currentGameId = id;

                            const gameData = games.get(id)!;
                            gameData.game.status = GameStatus.Playing;
                            console.log(`[Game ${id}] Online: White joined, game starting`);
                            broadcast(id, gameData.game, gameMode);
                        }
                        break;
                    }

                    if (!games.has(id)) {
                        const goGame = new GoGame(BOARD_SIZE, DEFAULT_KOMI);
                        const engine = (gameMode !== 'human' && useKataGo !== false && globalEngine && engineReady) ? globalEngine : null;
                        if (engine) {
                            console.log(`[Game ${id}] Using KataGo engine`);
                        } else if (gameMode === 'human') {
                            console.log(`[Game ${id}] Human vs Human mode`);
                        } else {
                            console.log(`[Game ${id}] Using simple random AI`);
                        }
                        games.set(id, { game: goGame, engine, mode: gameMode });

                        if (engine) {
                            await syncEngineState(engine, goGame);
                        }
                    }

                    if (!connections.has(id)) {
                        connections.set(id, new Set());
                    }
                    connections.get(id)!.add(ws);
                    playerColors.set(ws, StoneColor.Black);
                    currentGameId = id;

                    const gameData = games.get(id)!;
                    broadcast(id, gameData.game, gameData.mode);
                    break;
                }

                case 'move': {
                    if (!currentGameId) break;
                    const gameData = games.get(currentGameId);
                    if (!gameData) break;

                    const { game, engine, mode } = gameData;
                    const { position } = msg.payload as { position: Position };

                    if (game.status !== GameStatus.Playing) break;

                    if (mode === 'online') {
                        const myColor = playerColors.get(ws);
                        if (game.board.currentTurn !== myColor) {
                            ws.send(JSON.stringify({ type: 'error', payload: 'Not your turn' }));
                            break;
                        }
                    } else if (mode !== 'human' && game.board.currentTurn !== StoneColor.Black) {
                        break;
                    }

                    const move = game.makeMove(position);
                    if (!move) {
                        ws.send(JSON.stringify({ type: 'error', payload: 'Invalid move' }));
                        break;
                    }

                    if (engine && engine.isReady()) {
                        const vertex = game.toGTPVertex(position);
                        engine.playMove(move.color === StoneColor.Black ? 'b' : 'w', vertex).catch(err => {
                            console.error('KataGo play move error:', err);
                        });
                    }

                    broadcast(currentGameId, game, mode);

                    if (game.status === GameStatus.Playing) {
                        await handleAIResponse(currentGameId, gameData);
                    }
                    break;
                }

                case 'pass': {
                    if (!currentGameId) break;
                    const gameData = games.get(currentGameId);
                    if (!gameData) break;

                    const { game, engine, mode } = gameData;

                    if (game.status !== GameStatus.Playing) break;

                    if (mode === 'online') {
                        const myColor = playerColors.get(ws);
                        if (game.board.currentTurn !== myColor) {
                            ws.send(JSON.stringify({ type: 'error', payload: 'Not your turn' }));
                            break;
                        }
                    }

                    const passColor = game.board.currentTurn;
                    game.pass();

                    if (engine && engine.isReady()) {
                        engine.playMove(passColor === StoneColor.Black ? 'b' : 'w', 'pass').catch(() => { });
                    }

                    broadcast(currentGameId, game, mode);

                    if (game.status === GameStatus.Playing) {
                        await handleAIResponse(currentGameId, gameData);
                    }
                    break;
                }

                case 'undo': {
                    if (!currentGameId) break;
                    const gameData = games.get(currentGameId);
                    if (!gameData) break;

                    const { game, engine, mode } = gameData;

                    if (mode === 'human' || mode === 'online') {
                        game.undo();
                    } else {
                        game.undo();
                        game.undo();

                        if (engine && engine.isReady()) {
                            engine.undo().catch(() => { });
                            engine.undo().catch(() => { });
                        }
                    }

                    broadcast(currentGameId, game, mode);
                    break;
                }

                case 'resign': {
                    if (!currentGameId) break;
                    const gameData = games.get(currentGameId);
                    if (!gameData) break;

                    gameData.game.status = GameStatus.Finished;
                    broadcast(currentGameId, gameData.game, gameData.mode);
                    break;
                }

                case 'analyze': {
                    if (!currentGameId) break;
                    const gameData = games.get(currentGameId);
                    if (!gameData) break;

                    const { game, mode } = gameData;
                    if (!globalEngine || !engineReady) {
                        ws.send(JSON.stringify({ type: 'error', payload: 'KataGo engine not available' }));
                        break;
                    }

                    try {
                        await syncEngineState(globalEngine, game);
                        const score = await globalEngine.estimateScore();

                        const analysisPromise = (async () => {
                            const analysis = await globalEngine.getAnalysis();
                            const ownership = parseOwnership(score.ownership, game.board.size);
                            return { analysis, ownership };
                        })();

                        const timeoutPromise = new Promise<never>((_, reject) =>
                            setTimeout(() => reject(new Error('ANALYSIS_TIMEOUT')), ANALYSIS_TIMEOUT)
                        );

                        const { analysis, ownership } = await Promise.race([analysisPromise, timeoutPromise]);

                        ws.send(JSON.stringify({
                            type: 'analysis',
                            payload: {
                                finalScore: score.score,
                                winRate: analysis.winrate,
                                scoreLead: analysis.scoreLead,
                                ownership,
                                principalVariation: analysis.pv,
                            },
                        }));
                    } catch (err: any) {
                        console.error('Analysis error:', err);
                        if (err.message === 'ANALYSIS_TIMEOUT') {
                            ws.send(JSON.stringify({ type: 'error', payload: 'analysis_timeout' }));
                        } else {
                            ws.send(JSON.stringify({ type: 'error', payload: 'Analysis failed' }));
                        }
                    }
                    break;
                }

                case 'new_game': {
                    if (currentGameId) {
                        const oldConns = connections.get(currentGameId);
                        if (oldConns) oldConns.delete(ws);
                    }

                    const { useKataGo, mode } = msg.payload as { useKataGo?: boolean; mode?: string };
                    const newId = uuidv4();
                    const gameMode = mode || 'ai';
                    const goGame = new GoGame(BOARD_SIZE, DEFAULT_KOMI);
                    const engine = (gameMode !== 'human' && gameMode !== 'online' && useKataGo !== false && globalEngine && engineReady) ? globalEngine : null;
                    games.set(newId, { game: goGame, engine, mode: gameMode });

                    if (engine) {
                        await syncEngineState(engine, goGame);
                    }

                    if (!connections.has(newId)) {
                        connections.set(newId, new Set());
                    }
                    connections.get(newId)!.add(ws);
                    playerColors.set(ws, StoneColor.Black);
                    currentGameId = newId;

                    broadcast(newId, goGame, gameMode);
                    break;
                }
            }
        } catch (err) {
            console.error('WebSocket message error:', err);
            ws.send(JSON.stringify({ type: 'error', payload: 'Invalid message' }));
        }
    });

    ws.on('close', () => {
        if (currentGameId) {
            const conns = connections.get(currentGameId);
            if (conns) {
                conns.delete(ws);
                if (conns.size === 0) {
                    connections.delete(currentGameId);
                }
            }
        }
        playerColors.delete(ws);
    });
});

const PORT = process.env.PORT || 3001;

async function startServer(): Promise<void> {
    await initEngine();

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
        if (engineReady) {
            console.log('AI engine: KataGo (real)');
        } else {
            console.log('AI engine: Simple random AI');
            console.log('Set KATAGO_PATH env var to use real KataGo engine.');
        }
    });
}

startServer();