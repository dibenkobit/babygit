import { execSync } from 'child_process';
import { Command } from 'commander';
import { commitAndPush, createAndPushTag } from '../../utils/git.js';
import { bumpVersion } from './bump-version.js';
import { createReleaseBranch } from './create-release-branch.js';
import { getChangelog } from './get-changelog.js';
import { writeChangelog } from './write-changelog.js';

const releaseCommand = new Command('release');

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

        // Check for changes before doing anything else
        try {
            // Get changes between main and current branch
            const changes = execSync(`git log main..${options.from} --oneline`, { encoding: 'utf-8' }).trim();

            if (!changes) {
                console.error('No changes found since last release. Aborting release process.');
                process.exit(1);
            }
        } catch (error) {
            console.error('Error checking for changes:', error);
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

            const releaseBranch = `release/${newVersion}`;
            const pushed = await commitAndPush(`docs: Update changelog for version ${newVersion}`, releaseBranch);

            if (!pushed) {
                console.error('Aborting release due to push error.');
                process.exit(1);
            }

            // Create and push tag
            const tagged = await createAndPushTag(newVersion);
            if (!tagged) {
                console.error('Aborting release due to tag creation error.');
                process.exit(1);
            }
        } catch (error) {
            console.error('Error in release process:', error);
            process.exit(1);
        }
    });

export default releaseCommand;
