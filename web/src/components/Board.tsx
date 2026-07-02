import React, { useMemo } from 'react';
import { StoneColor, Position, BoardState } from '../types/game';

interface BoardProps {
    board: BoardState;
    onCellClick: (position: Position) => void;
    interactive: boolean;
    lastMove: Position | null;
}

const STAR_POINTS_19: [number, number][] = [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15],
];

const STAR_POINTS_13: [number, number][] = [
    [3, 3], [3, 6], [3, 9],
    [6, 3], [6, 6], [6, 9],
    [9, 3], [9, 6], [9, 9],
];

const STAR_POINTS_9: [number, number][] = [
    [2, 2], [2, 4], [2, 6],
    [4, 2], [4, 4], [4, 6],
    [6, 2], [6, 4], [6, 6],
];

function getStarPoints(size: number): [number, number][] {
    if (size === 19) return STAR_POINTS_19;
    if (size === 13) return STAR_POINTS_13;
    if (size === 9) return STAR_POINTS_9;
    return [];
}

export const Board: React.FC<BoardProps> = React.memo(({ board, onCellClick, interactive, lastMove }) => {
    const { size, grid, koPoint } = board;
    const starPoints = useMemo(() => getStarPoints(size), [size]);
    const starSet = useMemo(() => new Set(starPoints.map(([x, y]) => `${x},${y}`)), [starPoints]);

    const padding = 20;
    const boardSize = 560;
    const cellSize = (boardSize - padding * 2) / (size - 1);
    const stoneRadius = cellSize * 0.44;

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!interactive) return;
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const scaleX = (boardSize) / rect.width;
        const scaleY = (boardSize) / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        const x = Math.round((mouseX - padding) / cellSize);
        const y = Math.round((mouseY - padding) / cellSize);

        if (x >= 0 && x < size && y >= 0 && y < size) {
            onCellClick({ x, y });
        }
    };

    return (
        <svg
            viewBox={`0 0 ${boardSize} ${boardSize}`}
            className="w-full max-w-[560px] h-auto cursor-pointer rounded-lg shadow-2xl"
            style={{ background: '#DEB887' }}
            onClick={handleClick}
        >
            <defs>
                <radialGradient id="blackStone" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#555" />
                    <stop offset="100%" stopColor="#111" />
                </radialGradient>
                <radialGradient id="whiteStone" cx="40%" cy="35%">
                    <stop offset="0%" stopColor="#fff" />
                    <stop offset="100%" stopColor="#ccc" />
                </radialGradient>
                <filter id="stoneShadow">
                    <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3" />
                </filter>
            </defs>

            {Array.from({ length: size }, (_, i) => (
                <line
                    key={`h-${i}`}
                    x1={padding}
                    y1={padding + i * cellSize}
                    x2={padding + (size - 1) * cellSize}
                    y2={padding + i * cellSize}
                    stroke="#1a1a1a"
                    strokeWidth={0.8}
                />
            ))}

            {Array.from({ length: size }, (_, i) => (
                <line
                    key={`v-${i}`}
                    x1={padding + i * cellSize}
                    y1={padding}
                    x2={padding + i * cellSize}
                    y2={padding + (size - 1) * cellSize}
                    stroke="#1a1a1a"
                    strokeWidth={0.8}
                />
            ))}

            {starPoints.map(([sx, sy]) => (
                <circle
                    key={`star-${sx}-${sy}`}
                    cx={padding + sx * cellSize}
                    cy={padding + sy * cellSize}
                    r={3}
                    fill="#1a1a1a"
                />
            ))}

            {grid.map((row, y) =>
                row.map((stone, x) => {
                    if (stone === StoneColor.Empty) return null;
                    const isLast = lastMove?.x === x && lastMove?.y === y;
                    return (
                        <g key={`stone-${x}-${y}`}>
                            <circle
                                cx={padding + x * cellSize}
                                cy={padding + y * cellSize}
                                r={stoneRadius}
                                fill={stone === StoneColor.Black ? 'url(#blackStone)' : 'url(#whiteStone)'}
                                filter="url(#stoneShadow)"
                            />
                            {isLast && (
                                <circle
                                    cx={padding + x * cellSize}
                                    cy={padding + y * cellSize}
                                    r={stoneRadius * 0.25}
                                    fill={stone === StoneColor.Black ? '#fff' : '#000'}
                                    opacity={0.7}
                                />
                            )}
                        </g>
                    );
                })
            )}

            {koPoint && (
                <rect
                    x={padding + koPoint.x * cellSize - stoneRadius * 0.5}
                    y={padding + koPoint.y * cellSize - stoneRadius * 0.5}
                    width={stoneRadius}
                    height={stoneRadius}
                    fill="none"
                    stroke="red"
                    strokeWidth={1.5}
                    strokeDasharray="3,2"
                    opacity={0.6}
                />
            )}
        </svg>
    );
});

Board.displayName = 'Board';