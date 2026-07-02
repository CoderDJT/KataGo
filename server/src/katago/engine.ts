import { ChildProcess, spawn } from 'child_process';
import { createInterface } from 'readline';

export class KataGoEngine {
    private process: ChildProcess | null = null;
    private commandQueue: string[] = [];
    private responseResolvers: Map<string, (response: string) => void> = new Map();
    private commandId = 0;
    private ready = false;

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
                if (!line) return;

                if (line.startsWith('=') || line.startsWith('?')) {
                    const parts = line.split(/(?<=\d)\s/);
                    const id = parts[0].slice(1);
                    const result = line.slice(id.length + 2);

                    const resolver = this.responseResolvers.get(id);
                    if (resolver) {
                        this.responseResolvers.delete(id);
                        resolver(result);
                    }

                    if (this.commandQueue.length > 0) {
                        const next = this.commandQueue.shift()!;
                        this.process?.stdin?.write(next + '\n');
                    }
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
        if (result) {
            const parts = result.split(' ');
            for (const part of parts) {
                const [key, ...rest] = part.split('=');
                if (key && rest.length > 0) {
                    info[key] = rest.join('=');
                }
            }
        }

        return {
            winrate: parseFloat(info['info']?.match(/winrate=([\d.]+)/)?.[1] || '0.5'),
            scoreLead: parseFloat(info['info']?.match(/scoreLead=([\d.]+)/)?.[1] || '0'),
            ownership: info['ownership'] || '',
            pv: info['pv'] || '',
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