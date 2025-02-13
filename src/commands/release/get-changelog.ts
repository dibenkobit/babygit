import { execSync } from 'child_process';

/**
 * Генерирует changelog на основе разницы между main и release веткой
 */
export function getChangelog(version: string): string {
    try {
        const releaseBranch = `release/${version}`;
        // Get full commit messages including body between main and release branch
        const commits = execSync(`git log main..${releaseBranch} --pretty=format:"%s%n%b" --no-merges`, {
            encoding: 'utf-8'
        }).trim();

        if (!commits) {
            return 'No changes found';
        }

        // Format the changelog following the standard format
        const header = `# ${version} (${new Date().toISOString().split('T')[0]})\n\n`;

        // Split commits and format them
        const formattedChanges = commits
            .split('\n\n')
            .filter(Boolean)
            .map((commit) => {
                const lines = commit.split('\n').filter(Boolean);
                if (lines.length === 0) return '';

                const [subject, ...body] = lines;
                if (body.length === 0) {
                    return `- ${subject}`;
                }

                const formattedBody = body
                    .map((line) => {
                        const trimmedLine = line.trim();
                        // Check if line is already a properly formatted list item
                        if (/^- .+/.test(trimmedLine)) {
                            return `    ${trimmedLine}`;
                        }
                        // Remove any existing dashes and add proper list item format
                        return `    - ${trimmedLine.replace(/^-+\s*/, '')}`;
                    })
                    .join('\n');

                return `- ${subject}\n${formattedBody}`;
            })
            .filter(Boolean)
            .join('\n\n');

        return header + formattedChanges;
    } catch (error) {
        console.error('Error getting changelog:', error);
        return 'Error generating changelog';
    }
}
