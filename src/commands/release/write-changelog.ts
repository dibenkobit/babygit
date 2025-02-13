import { promises as fs } from 'fs';

const CHANGELOG_HEADER = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

/**
 * Записывает сгенерированный changelog в файл changelog.md.
 * Новые изменения добавляются в начало файла после стандартного заголовка.
 */
export async function writeChangelog(newChanges: string): Promise<void> {
    try {
        // Read existing changelog
        let existingContent = '';
        try {
            const content = await fs.readFile('./CHANGELOG.md', 'utf-8');
            // Remove header from existing content if it exists
            existingContent = content.replace(CHANGELOG_HEADER, '');
        } catch (error) {
            // File doesn't exist yet, that's ok
        }

        // Combine header, new changes, and existing content
        const updatedContent = existingContent
            ? `${CHANGELOG_HEADER}${newChanges}\n\n${existingContent}`
            : `${CHANGELOG_HEADER}${newChanges}`;

        // Write updated changelog
        await fs.writeFile('./CHANGELOG.md', updatedContent, 'utf-8');
        console.log('Changelog written to CHANGELOG.md');
    } catch (error) {
        console.error('Error writing changelog:', error);
        throw error;
    }
}
