import { spawnSync } from 'child_process';

/**
 * Создаёт новую git-ветку release/<newVersion> из указанной базовой ветки.
 */
export function createReleaseBranch(newVersion: string, fromBranch: string): boolean {
    const branchName = `release/${newVersion}`;
    const result = spawnSync('git', ['checkout', '-b', branchName, fromBranch], { stdio: 'inherit' });
    if (result.error) {
        console.error('Error creating branch:', result.error);
        return false;
    }
    if (result.status !== 0) {
        console.error(`Git command failed with exit code ${result.status}`);
        return false;
    }
    console.log(`Created branch ${branchName} from ${fromBranch}`);
    return true;
}
