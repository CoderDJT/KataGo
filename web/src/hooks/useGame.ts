import { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameMessage, Position, AnalysisData } from '../types/game';

function getWsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
}

export function useGame(gameId?: string, useKataGo?: boolean, mode?: string) {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const useKataGoRef = useRef(useKataGo);
    useKataGoRef.current = useKataGo;
    const modeRef = useRef(mode);
    modeRef.current = mode;

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(getWsUrl());
        wsRef.current = ws;

        ws.onopen = () => {
            setConnected(true);
            setError(null);
            ws.send(JSON.stringify({
                type: 'join',
                payload: { gameId: gameId || undefined, useKataGo: useKataGoRef.current, mode: modeRef.current },
            }));
        };

        ws.onmessage = (event) => {
            try {
                const msg: GameMessage = JSON.parse(event.data);
                if (msg.type === 'state') {
                    setGameState(msg.payload as GameState);
                } else if (msg.type === 'analysis') {
                    setAnalysisResult(msg.payload as AnalysisData);
                    setAnalyzing(false);
                } else if (msg.type === 'error') {
                    setError(msg.payload as string);
                    setAnalyzing(false);
                }
            } catch {
                // ignore parse errors
            }
        };

        ws.onclose = () => {
            setConnected(false);
            if (reconnectTimer.current !== null) {
                clearTimeout(reconnectTimer.current);
            }
            reconnectTimer.current = setTimeout(() => connect(), 2000);
        };

        ws.onerror = () => {
            ws.close();
        };
    }, [gameId]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimer.current !== null) {
                clearTimeout(reconnectTimer.current);
            }
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
            wsRef.current.send(JSON.stringify({ type: 'new_game', payload: { useKataGo: useKataGoRef.current, mode: modeRef.current } }));
        }
    }, []);

    const sendAnalyze = useCallback(() => {
        setAnalysisResult(null);
        setAnalyzing(true);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'analyze', payload: {} }));
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
        sendAnalyze,
        analysisResult,
        analyzing,
    };
}