import { StoneColor, BoardState, Position, Move, GameStatus } from '../../../shared/types/game.js';
import { BOARD_SIZE, DEFAULT_KOMI } from '../../../shared/constants/index.js';

export class GoGame {
    board: BoardState;
    status: GameStatus = GameStatus.Playing;
    komi: number;

    constructor(size: number = BOARD_SIZE, komi: number = DEFAULT_KOMI) {
        this.komi = komi;
        this.board = this.createEmptyBoard(size);
    }

    private createEmptyBoard(size: number): BoardState {
        const grid: StoneColor[][] = [];
        for (let y = 0; y < size; y++) {
            grid[y] = [];
            for (let x = 0; x < size; x++) {
                grid[y][x] = StoneColor.Empty;
            }
        }
        return {
            size,
            grid,
            currentTurn: StoneColor.Black,
            capturedBlack: 0,
            capturedWhite: 0,
            moveHistory: [],
            koPoint: null,
        };
    }

    isValidMove(pos: Position): boolean {
        const { x, y } = pos;
        const { size, grid, koPoint } = this.board;

        if (x < 0 || x >= size || y < 0 || y >= size) return false;
        if (grid[y][x] !== StoneColor.Empty) return false;

        if (koPoint && koPoint.x === x && koPoint.y === y) return false;

        const testGrid = grid.map(row => [...row]);
        testGrid[y][x] = this.board.currentTurn;

        if (this.hasLiberties(testGrid, x, y)) return true;

        const opponent = this.board.currentTurn === StoneColor.Black ? StoneColor.White : StoneColor.Black;
        const captured = this.findCapturedStones(testGrid, opponent);

        if (captured.length > 0) {
            if (captured.length === 1 && this.wouldRepeatBoard(testGrid, captured, pos)) {
                return false;
            }
            return true;
        }

        return false;
    }

    private wouldRepeatBoard(newGrid: StoneColor[][], captured: Position[], pos: Position): boolean {
        if (this.board.moveHistory.length === 0) return false;

        const lastMove = this.board.moveHistory[this.board.moveHistory.length - 1];
        if (!lastMove.position) return false;

        const testGrid = newGrid.map(row => [...row]);
        for (const c of captured) {
            testGrid[c.y][c.x] = StoneColor.Empty;
        }

        const prevGrid = this.board.moveHistory.length >= 2
            ? this.reconstructBoard(this.board.moveHistory.length - 1)
            : this.createEmptyBoard(this.board.size).grid;

        for (let y = 0; y < this.board.size; y++) {
            for (let x = 0; x < this.board.size; x++) {
                if (testGrid[y][x] !== prevGrid[y][x]) return false;
            }
        }
        return true;
    }

    private reconstructBoard(moveCount: number): StoneColor[][] {
        const grid = this.createEmptyBoard(this.board.size).grid;
        for (let i = 0; i < moveCount; i++) {
            const move = this.board.moveHistory[i];
            if (move.position) {
                grid[move.position.y][move.position.x] = move.color;
                for (const c of move.capturedStones) {
                    grid[c.y][c.x] = StoneColor.Empty;
                }
            }
        }
        return grid;
    }

    makeMove(pos: Position | null): Move | null {
        if (pos === null) {
            const move: Move = {
                color: this.board.currentTurn,
                position: null,
                capturedStones: [],
                moveNumber: this.board.moveHistory.length + 1,
            };
            this.board.moveHistory.push(move);
            this.board.currentTurn = this.board.currentTurn === StoneColor.Black
                ? StoneColor.White : StoneColor.Black;
            return move;
        }

        if (!this.isValidMove(pos)) return null;

        const { x, y } = pos;
        const color = this.board.currentTurn;
        const opponent = color === StoneColor.Black ? StoneColor.White : StoneColor.Black;

        this.board.grid[y][x] = color;

        const captured = this.findCapturedStones(this.board.grid, opponent);
        for (const c of captured) {
            this.board.grid[c.y][c.x] = StoneColor.Empty;
        }

        if (color === StoneColor.Black) {
            this.board.capturedWhite += captured.length;
        } else {
            this.board.capturedBlack += captured.length;
        }

        this.board.koPoint = null;
        if (captured.length === 1) {
            const capturedStone = captured[0];
            this.board.grid[capturedStone.y][capturedStone.x] = color;
            const neighbors = this.getNeighbors(capturedStone.x, capturedStone.y);
            if (neighbors.length === 1 && this.hasLiberties(this.board.grid, x, y)) {
                const neighbor = neighbors[0];
                if (this.board.grid[neighbor.y][neighbor.x] === opponent) {
                    this.board.grid[capturedStone.y][capturedStone.x] = StoneColor.Empty;
                    const group = this.getGroup(this.board.grid, capturedStone.x, capturedStone.y);
                    if (group.length === 1) {
                        const libs = this.countGroupLiberties(this.board.grid, group);
                        if (libs === 1) {
                            this.board.koPoint = { x: neighbor.x, y: neighbor.y };
                        }
                    }
                    this.board.grid[capturedStone.y][capturedStone.x] = color;
                }
            }
        }

        const move: Move = {
            color,
            position: pos,
            capturedStones: captured,
            moveNumber: this.board.moveHistory.length + 1,
        };

        this.board.moveHistory.push(move);
        this.board.currentTurn = opponent;

        return move;
    }

    pass(): Move {
        return this.makeMove(null)!;
    }

    undo(): Move | null {
        if (this.board.moveHistory.length === 0) return null;

        const lastMove = this.board.moveHistory.pop()!;
        if (lastMove.position) {
            this.board.grid[lastMove.position.y][lastMove.position.x] = StoneColor.Empty;
            const opponent = lastMove.color === StoneColor.Black ? StoneColor.White : StoneColor.Black;
            for (const c of lastMove.capturedStones) {
                this.board.grid[c.y][c.x] = opponent;
            }
            if (lastMove.color === StoneColor.Black) {
                this.board.capturedWhite -= lastMove.capturedStones.length;
            } else {
                this.board.capturedBlack -= lastMove.capturedStones.length;
            }

            if (this.board.moveHistory.length > 0) {
                const prev = this.board.moveHistory[this.board.moveHistory.length - 1];
                if (prev.capturedStones.length === 1) {
                    const captured = prev.capturedStones[0];
                    const opponentOfPrev = prev.color === StoneColor.Black ? StoneColor.White : StoneColor.Black;
                    const neighbors = this.getNeighbors(captured.x, captured.y);
                    const neighbor = neighbors[0];
                    if (neighbors.length === 1 && this.board.grid[neighbor.y]?.[neighbor.x] === opponentOfPrev) {
                        this.board.koPoint = { x: neighbor.x, y: neighbor.y };
                    } else {
                        this.board.koPoint = null;
                    }
                } else {
                    this.board.koPoint = null;
                }
            } else {
                this.board.koPoint = null;
            }
        }

        this.board.currentTurn = lastMove.color;
        return lastMove;
    }

    private hasLiberties(grid: StoneColor[][], x: number, y: number): boolean {
        const group = this.getGroup(grid, x, y);
        return this.countGroupLiberties(grid, group) > 0;
    }

    private getGroup(grid: StoneColor[][], x: number, y: number): Position[] {
        const color = grid[y][x];
        if (color === StoneColor.Empty) return [];

        const visited = new Set<string>();
        const group: Position[] = [];
        const stack: Position[] = [{ x, y }];

        while (stack.length > 0) {
            const pos = stack.pop()!;
            const key = `${pos.x},${pos.y}`;
            if (visited.has(key)) continue;
            visited.add(key);
            group.push(pos);

            const neighbors = this.getNeighbors(pos.x, pos.y);
            for (const n of neighbors) {
                if (grid[n.y]?.[n.x] === color && !visited.has(`${n.x},${n.y}`)) {
                    stack.push(n);
                }
            }
        }

        return group;
    }

    private countGroupLiberties(grid: StoneColor[][], group: Position[]): number {
        const liberties = new Set<string>();
        for (const pos of group) {
            const neighbors = this.getNeighbors(pos.x, pos.y);
            for (const n of neighbors) {
                if (grid[n.y]?.[n.x] === StoneColor.Empty) {
                    liberties.add(`${n.x},${n.y}`);
                }
            }
        }
        return liberties.size;
    }

    private getNeighbors(x: number, y: number): Position[] {
        return [
            { x: x - 1, y },
            { x: x + 1, y },
            { x, y: y - 1 },
            { x, y: y + 1 },
        ].filter(p => p.x >= 0 && p.x < this.board.size && p.y >= 0 && p.y < this.board.size);
    }

    private findCapturedStones(grid: StoneColor[][], color: StoneColor): Position[] {
        const captured: Position[] = [];
        const visited = new Set<string>();

        for (let y = 0; y < this.board.size; y++) {
            for (let x = 0; x < this.board.size; x++) {
                if (grid[y][x] === color && !visited.has(`${x},${y}`)) {
                    const group = this.getGroup(grid, x, y);
                    for (const p of group) visited.add(`${p.x},${p.y}`);
                    if (this.countGroupLiberties(grid, group) === 0) {
                        captured.push(...group);
                    }
                }
            }
        }

        return captured;
    }

    getBoardState(): BoardState {
        return this.board;
    }

    reset(): void {
        this.board = this.createEmptyBoard(this.board.size);
        this.status = GameStatus.Playing;
    }

    toGTPVertex(pos: Position): string {
        const x = String.fromCharCode(65 + pos.x + (pos.x >= 8 ? 1 : 0));
        const y = this.board.size - pos.y;
        return `${x}${y}`;
    }

    fromGTPVertex(vertex: string): Position | null {
        if (vertex === 'pass' || vertex === 'PASS') return null;
        const x = vertex.charCodeAt(0) - 65;
        const adjustedX = x >= 9 ? x - 1 : x;
        const y = this.board.size - parseInt(vertex.slice(1), 10);
        if (adjustedX < 0 || adjustedX >= this.board.size || y < 0 || y >= this.board.size) {
            return null;
        }
        return { x: adjustedX, y };
    }
}