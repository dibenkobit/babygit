import { promises as fs } from 'fs';

/**
 * Записывает сгенерированный changelog в файл changelog.md.
 */
export async function writeChangelog(changelog: string): Promise<void> {
    try {
        await fs.writeFile('./changelog.md', changelog, 'utf-8');
        console.log('Changelog written to changelog.md');
    } catch (error) {
        console.error('Error writing changelog:', error);
    }
}
