import { promises as fs } from 'fs';

/**
 * Записывает сгенерированный changelog в файл changelog.md.
 * Новые изменения добавляются в начало файла.
 */
export async function writeChangelog(newChanges: string): Promise<void> {
    try {
        // Read existing changelog
        let existingContent = '';
        try {
            existingContent = await fs.readFile('./changelog.md', 'utf-8');
        } catch (error) {
            // File doesn't exist yet, that's ok
        }

        // Combine new changes with existing content
        const updatedContent = existingContent ? `${newChanges}\n\n${existingContent}` : newChanges;

        // Write updated changelog
        await fs.writeFile('./changelog.md', updatedContent, 'utf-8');
        console.log('Changelog written to changelog.md');
    } catch (error) {
        console.error('Error writing changelog:', error);
        throw error;
    }
}
