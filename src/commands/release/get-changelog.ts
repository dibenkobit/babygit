import { execSync } from 'child_process';

/**
 * Генерирует changelog на основе разницы между main и release веткой
 */
export function getChangelog(version: string): string {
    try {
        const releaseBranch = `release/${version}`;
        // Get full commit messages including body between main and release branch
        const commits = execSync(`git log main..${releaseBranch} --pretty=format:"%s%n%n%b" --no-merges`, {
            encoding: 'utf-8'
        }).trim();

        if (!commits) {
            return 'No changes found';
        }

        // Format the changelog following the standard format
        const header = `# ${version} (${new Date().toISOString().split('T')[0]})\n\n`;

        // Split commits by double newlines to separate different commits
        const formattedChanges = commits
            .split('\n\n')
            .filter(Boolean)
            .map((commit) => {
                // First line is the subject
                const [subject, ...body] = commit.split('\n');
                const formattedBody = body
                    .filter(Boolean)
                    .map((line) => `    ${line}`) // Using 4 spaces for indentation
                    .join('\n');

                return `- ${subject}${formattedBody ? '\n' + formattedBody : ''}`;
            })
            .join('\n\n');

        return header + formattedChanges;
    } catch (error) {
        console.error('Error getting changelog:', error);
        return 'Error generating changelog';
    }
}
