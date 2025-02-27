import { select, password, input } from '@inquirer/prompts';
import { colors } from './ui.const.js';

export function printStep(step: string): void {
    console.log(`${colors.blue}${colors.bright}${step}${colors.reset}`);
}

export function printSuccess(message: string): void {
    console.log(`${colors.green}${colors.bright}✓ ${message}${colors.reset}`);
}

export function printError(message: string): void {
    console.error(`${colors.red}${colors.bright}✗ Error: ${message}${colors.reset}`);
}

export function printInfo(message: string): void {
    console.log(`${colors.cyan}${message}${colors.reset}`);
}

export function printCommitMessage(message: string): void {
    const lines = message.split('\n');
    const [firstLine, ...rest] = lines;

    console.log('\n' + '='.repeat(50));
    console.log(`${colors.magenta}${colors.bright}Generated Commit Message:${colors.reset}\n`);

    // Print first line in bright green
    console.log(`${colors.green}${colors.bright}${firstLine}${colors.reset}`);

    if (rest.length > 0) {
        // Print bullet points in normal green
        rest.forEach((line) => {
            if (line.trim()) {
                console.log(`${colors.green}${line}${colors.reset}`);
            }
        });
    }
    console.log('='.repeat(50) + '\n');
}

export async function promptUser(query: string, isSecret = false): Promise<string> {
    if (isSecret) {
        return password({ message: query, mask: '*' });
    }

    return input({ message: query });
}

export async function selectFromList<T extends { name: string; value: unknown }>(
    message: string,
    choices: T[]
): Promise<T['value']> {
    return select({
        message,
        choices
    });
}

export class ProgressIndicator {
    private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    private currentFrame = 0;
    private interval: ReturnType<typeof setInterval> | null = null;
    private startTime: number = 0;

    start(message: string): void {
        this.startTime = Date.now();
        this.interval = setInterval(() => {
            const elapsedSeconds = ((Date.now() - this.startTime) / 1000).toFixed(1);
            process.stdout.write(
                '\r' +
                    colors.cyan +
                    this.frames[this.currentFrame] +
                    colors.reset +
                    ' ' +
                    message +
                    colors.dim +
                    ` [${elapsedSeconds}s]` +
                    colors.reset
            );
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
        }, 80);
    }

    stop(message?: string): void {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            const elapsedSeconds = ((Date.now() - this.startTime) / 1000).toFixed(1);
            if (message) {
                process.stdout.write('\r' + message + colors.dim + ` [${elapsedSeconds}s]` + colors.reset + '\n');
            } else {
                process.stdout.write('\n');
            }
        }
    }
}
