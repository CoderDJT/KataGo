export const BOARD_SIZE = 19;
export const DEFAULT_KOMI = 6.5;
export const MAX_HANDICAP = 9;

export const API_BASE_URL = 'http://localhost:3001';
export const WS_URL = 'ws://localhost:3001/ws';

export const STONE_RADIUS_RATIO = 0.44;
export const STAR_POINTS_19: [number, number][] = [
    [3, 3], [3, 9], [3, 15],
    [9, 3], [9, 9], [9, 15],
    [15, 3], [15, 9], [15, 15],
];

export const STAR_POINTS_13: [number, number][] = [
    [3, 3], [3, 6], [3, 9],
    [6, 3], [6, 6], [6, 9],
    [9, 3], [9, 6], [9, 9],
];

export const STAR_POINTS_9: [number, number][] = [
    [2, 2], [2, 4], [2, 6],
    [4, 2], [4, 4], [4, 6],
    [6, 2], [6, 4], [6, 6],
];

export function getStarPoints(size: number): [number, number][] {
    if (size === 19) return STAR_POINTS_19;
    if (size === 13) return STAR_POINTS_13;
    if (size === 9) return STAR_POINTS_9;
    return [];
}