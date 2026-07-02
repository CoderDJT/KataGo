import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import Svg, { Line, Circle, Rect, RadialGradient, Defs, Stop, G } from 'react-native-svg';
import { StoneColor, Position, BoardState } from '../types/game';

interface BoardProps {
    board: BoardState;
    onCellClick: (position: Position) => void;
    interactive: boolean;
    lastMove: Position | null;
}

const STAR_POINTS: Record<number, [number, number][]> = {
    19: [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]],
    13: [[3, 3], [3, 6], [3, 9], [6, 3], [6, 6], [6, 9], [9, 3], [9, 6], [9, 9]],
    9: [[2, 2], [2, 4], [2, 6], [4, 2], [4, 4], [4, 6], [6, 2], [6, 4], [6, 6]],
};

const { width: screenWidth } = Dimensions.get('window');
const BOARD_SIZE = Math.min(screenWidth - 32, 400);
const PADDING = 16;

export const Board: React.FC<BoardProps> = React.memo(({ board, onCellClick, interactive, lastMove }) => {
    const { size, grid, koPoint } = board;
    const cellSize = (BOARD_SIZE - PADDING * 2) / (size - 1);
    const stoneRadius = cellSize * 0.44;
    const starPoints = useMemo(() => STAR_POINTS[size] || [], [size]);

    const handlePress = useCallback((evt: any) => {
        if (!interactive) return;
        const { locationX, locationY } = evt.nativeEvent;
        const x = Math.round((locationX - PADDING) / cellSize);
        const y = Math.round((locationY - PADDING) / cellSize);
        if (x >= 0 && x < size && y >= 0 && y < size) {
            onCellClick({ x, y });
        }
    }, [interactive, cellSize, size, onCellClick]);

    return (
        <View style={styles.container}>
            <Pressable onPress={handlePress}>
                <Svg width={BOARD_SIZE} height={BOARD_SIZE} viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`}>
                    <Defs>
                        <RadialGradient id="blackGrad" cx="40%" cy="35%">
                            <Stop offset="0%" stopColor="#555" />
                            <Stop offset="100%" stopColor="#111" />
                        </RadialGradient>
                        <RadialGradient id="whiteGrad" cx="40%" cy="35%">
                            <Stop offset="0%" stopColor="#fff" />
                            <Stop offset="100%" stopColor="#ccc" />
                        </RadialGradient>
                    </Defs>

                    <Rect x={0} y={0} width={BOARD_SIZE} height={BOARD_SIZE} fill="#DEB887" rx={8} />

                    {Array.from({ length: size }, (_, i) => (
                        <Line
                            key={`h-${i}`}
                            x1={PADDING}
                            y1={PADDING + i * cellSize}
                            x2={PADDING + (size - 1) * cellSize}
                            y2={PADDING + i * cellSize}
                            stroke="#1a1a1a"
                            strokeWidth={0.8}
                        />
                    ))}
                    {Array.from({ length: size }, (_, i) => (
                        <Line
                            key={`v-${i}`}
                            x1={PADDING + i * cellSize}
                            y1={PADDING}
                            x2={PADDING + i * cellSize}
                            y2={PADDING + (size - 1) * cellSize}
                            stroke="#1a1a1a"
                            strokeWidth={0.8}
                        />
                    ))}

                    {starPoints.map(([sx, sy]) => (
                        <Circle
                            key={`star-${sx}-${sy}`}
                            cx={PADDING + sx * cellSize}
                            cy={PADDING + sy * cellSize}
                            r={2.5}
                            fill="#1a1a1a"
                        />
                    ))}

                    {grid.map((row, y) =>
                        row.map((stone, x) => {
                            if (stone === StoneColor.Empty) return null;
                            const isLast = lastMove?.x === x && lastMove?.y === y;
                            return (
                                <G key={`stone-${x}-${y}`}>
                                    <Circle
                                        cx={PADDING + x * cellSize}
                                        cy={PADDING + y * cellSize}
                                        r={stoneRadius}
                                        fill={stone === StoneColor.Black ? 'url(#blackGrad)' : 'url(#whiteGrad)'}
                                    />
                                    {isLast && (
                                        <Circle
                                            cx={PADDING + x * cellSize}
                                            cy={PADDING + y * cellSize}
                                            r={stoneRadius * 0.25}
                                            fill={stone === StoneColor.Black ? '#fff' : '#000'}
                                            opacity={0.6}
                                        />
                                    )}
                                </G>
                            );
                        })
                    )}

                    {koPoint && (
                        <Rect
                            x={PADDING + koPoint.x * cellSize - stoneRadius * 0.5}
                            y={PADDING + koPoint.y * cellSize - stoneRadius * 0.5}
                            width={stoneRadius}
                            height={stoneRadius}
                            fill="none"
                            stroke="red"
                            strokeWidth={1.2}
                            strokeDasharray="3,2"
                            opacity={0.5}
                        />
                    )}
                </Svg>
            </Pressable>
        </View>
    );
});

Board.displayName = 'Board';

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});