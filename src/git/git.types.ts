export interface StagedFile {
    path: string;
    diff: string;
}

export interface CommitGroup {
    files: string[]; // Array of file paths
    message: string;
}
