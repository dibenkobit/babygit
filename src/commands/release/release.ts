import { execSync } from 'child_process';
import { Command } from 'commander';
import { bumpVersion } from './bump-version.js';
import { createReleaseBranch } from './create-release-branch.js';
import { getChangelog } from './get-changelog.js';
import { writeChangelog } from './write-changelog.js';

const releaseCommand = new Command('release');

// FIXME:
console.log(456);

releaseCommand
    .argument('[bump]', 'version bump type (major, minor, patch)', 'patch')
    .option('--from <branch>', 'Base branch to create release branch from', 'develop')
    .description('Release new version, bumping the version (default: patch)')
    .action(async (bump: string, options: { from: string }) => {
        const bumpType = bump.toLowerCase();
        if (!['major', 'minor', 'patch'].includes(bumpType)) {
            console.error('Invalid bump type. Use major, minor, or patch.');
            process.exit(1);
        }
        const newVersion = await bumpVersion(bumpType as 'major' | 'minor' | 'patch');
        if (!newVersion) {
            console.error('Aborting release due to version bump error.');
            process.exit(1);
        }
        const branchCreated = createReleaseBranch(newVersion, options.from);
        if (!branchCreated) {
            console.error('Aborting release due to branch creation error.');
            process.exit(1);
        }
        try {
            const changelog = await getChangelog(newVersion);
            await writeChangelog(changelog);

            // Push changes to origin
            const releaseBranch = `release/${newVersion}`;
            execSync(
                `git add changelog.md && git commit -m "docs: Update changelog for version ${newVersion}" && git push origin ${releaseBranch}`,
                {
                    stdio: 'inherit'
                }
            );
            console.log(`Changes pushed to origin/${releaseBranch}`);
        } catch (error) {
            console.error('Error in release process:', error);
            process.exit(1);
        }
    });

export default releaseCommand;
