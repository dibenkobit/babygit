import { execSync } from 'child_process';

/**
 * Commits and pushes changes to the specified branch
 */
export async function commitAndPush(files: string[], message: string, branch: string): Promise<boolean> {
    try {
        // Add specified files
        execSync(`git add ${files.join(' ')}`, { stdio: 'inherit' });

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
