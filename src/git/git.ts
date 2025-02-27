import { IGNORED_EXTENSIONS, IGNORED_FILES } from './git.const.js';
import { CommitGroup, StagedFile, GitStagedFile } from './git.types.js';

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

/**
 * Get information about staged files including deletion status and ignore flags
 */
async function getStagedFilesInfo(): Promise<GitStagedFile[]> {
    // Get list of staged files
    const filesResult = Bun.spawnSync({
        cmd: ['git', 'diff', '--staged', '--name-only'],
        stdout: 'pipe',
        stderr: 'pipe'
    });

    if (filesResult.exitCode !== 0) {
        throw new Error('Failed to get staged files: ' + filesResult.stderr.toString());
    }

    const files = filesResult.stdout.toString().trim().split('\n').filter(Boolean);

    if (files.length === 0) {
        return [];
    }

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
            const filePath = line.substring(line.indexOf(' ') + 1).trim();
            deletedFiles.add(filePath);
        }
    }

    // Process each file
    return files.map((file) => {
        const fileName = file.split('/').pop() || '';
        const fileExt = fileName.includes('.') ? `.${fileName.split('.').pop()}`.toLowerCase() : '';
        const isIgnored = IGNORED_FILES.includes(fileName) || IGNORED_EXTENSIONS.includes(fileExt);
        const isDeleted = deletedFiles.has(file);

        return {
            path: file,
            isIgnored,
            isDeleted
        };
    });
}

/**
 * Get diff for a specific file
 */
async function getFileDiff(filePath: string): Promise<string> {
    try {
        const diffResult = Bun.spawnSync({
            cmd: ['git', 'diff', '--staged', '--', filePath],
            stdout: 'pipe',
            stderr: 'pipe'
        });

        if (diffResult.exitCode !== 0) {
            throw new Error('Failed to get file diff: ' + diffResult.stderr.toString());
        }

        return diffResult.stdout.toString();
    } catch (error) {
        console.error(`Error getting diff for ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        return `// Error getting diff: ${error instanceof Error ? error.message : String(error)}`;
    }
}

export async function getStagedDiff(): Promise<string> {
    const stagedFiles = await getStagedFilesInfo();

    if (stagedFiles.length === 0) {
        return '';
    }

    // Collect diffs for each file
    const diffs: string[] = [];

    for (const file of stagedFiles) {
        if (file.isIgnored && !file.isDeleted) {
            diffs.push(`diff --git a/${file.path} b/${file.path}\n--- DIFF NOT PRESENTED ---\n`);
            continue;
        }

        if (file.isDeleted) {
            diffs.push(`diff --git a/${file.path} b/${file.path}\n--- FILE WAS DELETED ---\n`);
            continue;
        }

        diffs.push(await getFileDiff(file.path));
    }

    return diffs.join('\n');
}

export async function getStagedFiles(): Promise<StagedFile[]> {
    const stagedFiles = await getStagedFilesInfo();

    if (stagedFiles.length === 0) {
        return [];
    }

    // Process each file
    const result: StagedFile[] = [];

    for (const file of stagedFiles) {
        if (file.isIgnored && !file.isDeleted) {
            result.push({
                path: file.path,
                diff: 'DIFF NOT PRESENTED'
            });
            continue;
        }

        if (file.isDeleted) {
            result.push({
                path: file.path,
                diff: 'FILE WAS DELETED'
            });
            continue;
        }

        const diff = await getFileDiff(file.path);
        result.push({
            path: file.path,
            diff
        });
    }

    return result;
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
