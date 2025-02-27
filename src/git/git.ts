import { IGNORED_EXTENSIONS, IGNORED_FILES } from './git.const.js';
import { CommitGroup, StagedFile } from './git.types.js';

export async function stageAllChanges(): Promise<void> {
    const processResult = Bun.spawnSync({
        cmd: ['git', 'add', '-A'],
        stdout: 'pipe',
        stderr: 'pipe'
    });

    if (processResult.exitCode !== 0) {
        throw new Error('Failed to stage changes: ' + processResult.stderr.toString());
    }
}

export async function getStagedDiff(): Promise<string> {
    const processResult = Bun.spawnSync({
        cmd: ['git', 'diff', '--staged'],
        stdout: 'pipe',
        stderr: 'pipe'
    });

    if (processResult.exitCode !== 0) {
        throw new Error('Failed to get staged diff: ' + processResult.stderr.toString());
    }

    return processResult.stdout.toString();
}

export async function commitMessage(message: string): Promise<void> {
    // Split the message by newline and filter out any empty lines
    const messageParts = message.split('\n').filter((part) => part.trim() !== '');
    const args = ['git', 'commit'];

    // Add each part as a separate -m argument
    for (const part of messageParts) {
        args.push('-m', part);
    }

    const processResult = Bun.spawnSync({
        cmd: args,
        stdout: 'pipe',
        stderr: 'pipe'
    });

    // Git sometimes outputs information to stderr even on success
    // Only throw if the exit code indicates an error
    if (processResult.exitCode !== 0) {
        const stderr = processResult.stderr.toString();
        // If there's a real error, it will be in stderr
        if (stderr && !stderr.includes('[')) {
            // Git success messages usually contain branch info in []
            throw new Error('Commit failed: ' + stderr);
        }
    }
}

export async function getStagedFiles(): Promise<StagedFile[]> {
    // Get list of staged files
    const processResult = Bun.spawnSync({
        cmd: ['git', 'diff', '--staged', '--name-only'],
        stdout: 'pipe',
        stderr: 'pipe'
    });

    if (processResult.exitCode !== 0) {
        throw new Error('Failed to get staged files: ' + processResult.stderr.toString());
    }

    const files = processResult.stdout.toString().trim().split('\n');

    // Get status to detect deleted files
    const statusResult = Bun.spawnSync({
        cmd: ['git', 'status', '--porcelain'],
        stdout: 'pipe',
        stderr: 'pipe'
    });

    if (statusResult.exitCode !== 0) {
        throw new Error('Failed to get git status: ' + statusResult.stderr.toString());
    }

    // Parse status to find deleted files
    const statusLines = statusResult.stdout.toString().trim().split('\n');
    const deletedFiles = new Set<string>();

    for (const line of statusLines) {
        if (line.startsWith('D ') || line.startsWith('AD ')) {
            // Example: "D  filename.txt" or "AD filename.txt"
            const filePath = line.substring(line.indexOf(' ') + 1).trim();
            deletedFiles.add(filePath);
        }
    }

    // Prepare result array
    const stagedFiles: StagedFile[] = [];

    // Process each file
    for (const file of files) {
        if (!file) continue;

        const fileName = file.split('/').pop() || '';
        const fileExt = fileName.includes('.') ? `.${fileName.split('.').pop()}`.toLowerCase() : '';
        const isIgnored = IGNORED_FILES.includes(fileName) || IGNORED_EXTENSIONS.includes(fileExt);
        const isDeleted = deletedFiles.has(file);

        if (isIgnored && !isDeleted) {
            stagedFiles.push({
                path: file,
                diff: 'DIFF NOT PRESENTED'
            });
            continue;
        }

        if (isDeleted) {
            stagedFiles.push({
                path: file,
                diff: 'FILE WAS DELETED'
            });
            continue;
        }

        try {
            // Get file diff
            const diffResult = Bun.spawnSync({
                cmd: ['git', 'diff', '--staged', '--', file],
                stdout: 'pipe',
                stderr: 'pipe'
            });

            if (diffResult.exitCode !== 0) {
                throw new Error('Failed to get file diff: ' + diffResult.stderr.toString());
            }

            stagedFiles.push({
                path: file,
                diff: diffResult.stdout.toString()
            });
        } catch (error) {
            console.error(`Error getting diff for ${file}: ${error instanceof Error ? error.message : String(error)}`);
            stagedFiles.push({
                path: file,
                diff: '// Error getting diff: ' + (error instanceof Error ? error.message : String(error))
            });
        }
    }

    return stagedFiles;
}

export async function createCommits(commitGroups: CommitGroup[]): Promise<void> {
    for (const group of commitGroups) {
        // First unstage all files
        const unstageResult = Bun.spawnSync({
            cmd: ['git', 'reset', '--'],
            stdout: 'pipe',
            stderr: 'pipe'
        });

        if (unstageResult.exitCode !== 0) {
            throw new Error('Failed to unstage files: ' + unstageResult.stderr.toString());
        }

        // Stage only files for this commit
        for (const filePath of group.files) {
            const stageResult = Bun.spawnSync({
                cmd: ['git', 'add', filePath],
                stdout: 'pipe',
                stderr: 'pipe'
            });

            if (stageResult.exitCode !== 0) {
                throw new Error(`Failed to stage file ${filePath}: ${stageResult.stderr.toString()}`);
            }
        }

        // Create commit
        await commitMessage(group.message);
    }
}
