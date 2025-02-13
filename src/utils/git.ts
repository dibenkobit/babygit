import { execSync } from 'child_process';

/**
 * Creates a git tag with version and pushes it to remote
 */
export async function createAndPushTag(version: string): Promise<boolean> {
    try {
        // Create annotated tag
        execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });

        // Push tag to remote
        execSync('git push --tags', { stdio: 'inherit' });

        console.log(`Tag v${version} created and pushed to remote`);
        return true;
    } catch (error) {
        console.error('Error creating tag:', error);
        return false;
    }
}

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
