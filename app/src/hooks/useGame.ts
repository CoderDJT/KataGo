import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameMessage, Position } from '../types/game';

const WS_URL = 'ws://localhost:3001/ws';

export function useGame(gameId?: string) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            setError(null);
            ws.send(JSON.stringify({
                type: 'join',
                payload: { gameId: gameId || undefined },
            }));
        };

        ws.onmessage = (event) => {
            try {
                const msg: GameMessage = JSON.parse(event.data);
                if (msg.type === 'state') {
                    setGameState(msg.payload as GameState);
                } else if (msg.type === 'error') {
                    setError(msg.payload as string);
                }
            } catch {
                // ignore parse errors
            }
        };

        ws.onclose = () => {
            setConnected(false);
            reconnectTimer.current = setTimeout(() => connect(), 2000);
        };

        ws.onerror = () => {
            ws.close();
        };
    }, [gameId]);

    useEffect(() => {
        connect();
        return () => {
            clearTimeout(reconnectTimer.current);
            wsRef.current?.close();
        };
    }, [connect]);

    const sendMove = useCallback((position: Position) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'move', payload: { position } }));
        }
    }, []);

    const sendPass = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'pass', payload: {} }));
        }
    }, []);

    const sendUndo = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'undo', payload: {} }));
        }
    }, []);

    const sendResign = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'resign', payload: {} }));
        }
    }, []);

    const newGame = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'new_game', payload: {} }));
        }
    }, []);

    return {
        gameState,
        connected,
        error,
        sendMove,
        sendPass,
        sendUndo,
        sendResign,
        newGame,
    };
}