import { ChildProcess, spawn } from 'child_process';
import { createInterface } from 'readline';

export class KataGoEngine {
    private process: ChildProcess | null = null;
    private commandQueue: string[] = [];
    private responseResolvers: Map<string, (response: string) => void> = new Map();
    private commandId = 0;
    private ready = false;
    private pendingResponse: { id: string; lines: string[] } | null = null;

    constructor(private katagoPath: string, private configPath: string, private modelPath: string) { }

    async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            let started = false;

            const args = [
                'gtp',
                '-config', this.configPath,
                '-model', this.modelPath,
            ];

            this.process = spawn(this.katagoPath, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
            });

            if (!this.process.stdout || !this.process.stdin) {
                reject(new Error('Failed to spawn KataGo process'));
                return;
            }

            const rl = createInterface({ input: this.process.stdout });

            rl.on('line', (line: string) => {
                line = line.trim();

                if (line === '') {
                    if (this.pendingResponse) {
                        const { id, lines } = this.pendingResponse;
                        this.pendingResponse = null;
                        const resolver = this.responseResolvers.get(id);
                        if (resolver) {
                            this.responseResolvers.delete(id);
                            resolver(lines.join('\n'));
                        }
                        if (this.commandQueue.length > 0) {
                            const next = this.commandQueue.shift()!;
                            this.process?.stdin?.write(next + '\n');
                        }
                    }
                    return;
                }

                if (line.startsWith('=') || line.startsWith('?')) {
                    const parts = line.split(/(?<=\d)\s/);
                    const id = parts[0].slice(1);
                    const result = line.slice(id.length + 2);

                    if (result) {
                        const resolver = this.responseResolvers.get(id);
                        if (resolver) {
                            this.responseResolvers.delete(id);
                            resolver(result);
                        }
                        if (this.commandQueue.length > 0) {
                            const next = this.commandQueue.shift()!;
                            this.process?.stdin?.write(next + '\n');
                        }
                    } else {
                        this.pendingResponse = { id, lines: [] };
                    }
                } else if (this.pendingResponse) {
                    this.pendingResponse.lines.push(line);
                }
            });

            this.process.stderr?.on('data', (data: Buffer) => {
                console.error('[KataGo stderr]:', data.toString());
            });

            this.process.on('close', (code: number | null) => {
                const msg = `KataGo process exited with code ${code}`;
                console.log(msg);
                this.ready = false;
                if (!started) {
                    reject(new Error(msg));
                }
            });

            this.process.on('error', (err: Error) => {
                reject(err);
            });

            this.sendCommand('list_commands')
                .then(() => {
                    started = true;
                    this.ready = true;
                    resolve();
                })
                .catch(reject);
        });
    }

    async sendCommand(command: string): Promise<string> {
        const id = String(++this.commandId);
        const fullCommand = `${id} ${command}`;

        return new Promise((resolve, reject) => {
            this.responseResolvers.set(id, (response: string) => {
                if (response.startsWith('?')) {
                    reject(new Error(response.slice(1).trim()));
                } else {
                    resolve(response);
                }
            });

            if (this.commandQueue.length === 0 && this.process?.stdin?.writable) {
                this.process.stdin.write(fullCommand + '\n');
            } else {
                this.commandQueue.push(fullCommand);
            }
        });
    }

    async playMove(color: 'b' | 'w', vertex: string): Promise<void> {
        const cmd = color === 'b' ? `play b ${vertex}` : `play w ${vertex}`;
        await this.sendCommand(cmd);
    }

    async genMove(color: 'b' | 'w'): Promise<string> {
        const result = await this.sendCommand(`genmove ${color}`);
        return result.split(' ')[0]?.trim() || '';
    }

    async getAnalysis(turns: number = 0): Promise<{
        winrate: number;
        scoreLead: number;
        ownership: string;
        pv: string;
    }> {
        const result = await this.sendCommand(`kata-analyze ${turns}`);

        const info: Record<string, string> = {};
        let pv = '';

        if (result) {
            const flatResult = result.replace(/\n/g, ' ');

            const parts = flatResult.split(' pv ');
            const infoPart = parts[0].replace(/^info\s*/, '');
            const pvRaw = (parts[1] || '').trim();

            const moveMatches = [...pvRaw.matchAll(/info move (\w+)/g)];
            const moves = moveMatches.map(m => m[1]);
            pv = moves.join(' ');

            for (const token of infoPart.split(' ')) {
                const eqIdx = token.indexOf('=');
                if (eqIdx > 0) {
                    info[token.slice(0, eqIdx)] = token.slice(eqIdx + 1);
                }
            }
        }

        return {
            winrate: parseFloat(info['winrate'] || '0.5'),
            scoreLead: parseFloat(info['scoreLead'] || '0'),
            ownership: info['ownership'] || '',
            pv,
        };
    }

    async clearBoard(): Promise<void> {
        await this.sendCommand('clear_board');
    }

    async setBoardSize(size: number): Promise<void> {
        await this.sendCommand(`boardsize ${size}`);
    }

    async setKomi(komi: number): Promise<void> {
        await this.sendCommand(`komi ${komi}`);
    }

    async getFinalScore(): Promise<string> {
        return await this.sendCommand('final_score');
    }

    async undo(): Promise<void> {
        await this.sendCommand('undo');
    }

    async quit(): Promise<void> {
        try {
            await this.sendCommand('quit');
        } catch {
            // ignore
        }
        this.process?.kill();
        this.ready = false;
    }

    isReady(): boolean {
        return this.ready;
    }

    async estimateScore(): Promise<{
        type: string;
        score: string;
        ownership: string;
    }> {
        const result = await this.sendCommand('kata-estimate-score');
        const parts = result.split(' ');
        return {
            type: parts[0] || '',
            score: parts[1] || '',
            ownership: parts.slice(2).join(' ') || '',
        };
    }
}