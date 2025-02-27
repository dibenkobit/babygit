import axios from 'axios';
import { Command } from 'commander';
import pkg from '../../package.json' assert { type: 'json' };
import { loadConfig } from '../config/config.js';
import { API_URL } from '../constants.js';
import { commitMessage, createCommits, getStagedDiff, getStagedFiles, stageAllChanges } from '../git/git.js';
import { CommitGroup } from '../git/git.types.js';
import { colors } from '../ui/ui.const.js';
import {
    printStep,
    printError,
    printSuccess,
    printInfo,
    promptUser,
    ProgressIndicator,
    printCommitMessage
} from '../ui/ui.js';

export const commit = new Command()
    .command('commit', { isDefault: true })
    .description('Generate and create a commit')
    .option('-A, --all', 'Stage all changes (git add -A) before commit')
    .option('-N, --no-groupping', 'Generate a single commit message without analyzing file groups')
    .action(async (options) => {
        const config = loadConfig();
        const token = config.auth.token;

        if (!token) {
            printError(`No authentication token found. Please run "${pkg.name} auth" to authenticate`);
            process.exit(1);
        }

        const autoStage = options.all === undefined ? config.settings.autoStage : options.all;
        const smartGroupping = options.groupping === undefined ? config.settings.smartGroupping : options.groupping;

        try {
            if (autoStage) {
                printStep('Staging Changes');

                await stageAllChanges();

                printSuccess('Changes staged successfully\n');
            }

            const diff = await getStagedDiff();

            if (!diff.trim()) {
                printError(`No staged changes found. Stage your changes before running ${pkg.name} or use -A flag.`);

                process.exit(1);
            }

            const stagedFiles = await getStagedFiles();
            const progress = new ProgressIndicator();
            progress.start(
                'Analyzing changes' +
                    (smartGroupping ? ' and generating commit groups' : ' and generating commit message')
            );

            const request = {
                content: smartGroupping ? stagedFiles : diff,
                smartGroupping: smartGroupping
            };

            console.log(request);

            const { data: result } = await axios.post(`${API_URL}/commit`, request, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (smartGroupping) {
                console.log('\n' + '='.repeat(50));
                console.log(`${colors.magenta}${colors.bright}Proposed Commits:${colors.reset}\n`);

                result.forEach((group: CommitGroup, index: number) => {
                    console.log(`${colors.cyan}Commit ${index + 1}:${colors.reset}`);
                    console.log(`${colors.yellow}Files:${colors.reset}`);
                    group.files.forEach((file) => console.log(`- ${file}`));
                    printCommitMessage(group.message);
                    console.log();
                });
            } else {
                printCommitMessage(result);
            }

            progress.stop();

            const answer = await promptUser(
                smartGroupping
                    ? 'Do you want to create these commits? (Y/N): '
                    : 'Do you want to create this commit? (Y/N): '
            );

            if (answer.trim().toLowerCase() === 'y') {
                printStep('\nCreating Commits');

                if (smartGroupping) {
                    await createCommits(result);
                } else {
                    await commitMessage(result);
                }

                printSuccess('All commits created successfully!');
            } else {
                printInfo('\nCommit operation aborted.');
            }
        } catch (error) {
            console.log();
            printError(error instanceof Error ? error.message : 'An unknown error occurred');
            process.exit(1);
        }
    });
