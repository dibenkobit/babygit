export interface StagedFile {
    path: string;
    diff: string;
}

export interface GitStagedFile {
    path: string;
    isIgnored: boolean;
    isDeleted: boolean;
}

export interface CommitGroup {
    files: string[]; // Array of file paths
    message: string;
}
