import { execSync } from 'child_process';

/**
 * Генерирует changelog на основе разницы между main и release веткой
 */
export function getChangelog(version: string): string {
    try {
        const releaseBranch = `release/${version}`;
        // Получаем список коммитов между main и release веткой
        const commits = execSync(`git log main..${releaseBranch} --pretty=format:"%s"`, { encoding: 'utf-8' }).trim();

        if (!commits) {
            return 'No changes found';
        }

        // Преобразуем вывод в массив и форматируем
        const changes = commits
            .split('\n')
            .map((commit) => `- ${commit}`)
            .join('\n');

        return changes;
    } catch (error) {
        console.error('Error getting changelog:', error);
        return 'Error generating changelog';
    }
}
