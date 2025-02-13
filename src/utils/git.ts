import { execSync } from 'child_process';

/**
 * Commits and pushes all changes to the specified branch
 */
export async function commitAndPush(message: string, branch: string): Promise<boolean> {
    try {
        // Add all changes
        execSync('git add -A', { stdio: 'inherit' });

        // Create commit
        execSync(`git commit -m "${message}"`, { stdio: 'inherit' });

        // Push to remote
        execSync(`git push origin ${branch}`, { stdio: 'inherit' });

        console.log(`Changes pushed to origin/${branch}`);
        return true;
    } catch (error) {
        console.error('Error in git operations:', error);
        return false;
    }
}
