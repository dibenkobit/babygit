# 0.0.12 (2025-02-13)

- refactor: Improve commit message parsing
    - Use %B in git log format
    - Add commit separator
    - Update splitting logic

# 0.0.11 (2025-02-13)

- refactor: Improve changelog subject formatting
    - Trim subject lines

- Prefix with dash if missing

- Update return statements with formatted subject

- refactor: Simplify list item formatting in changelog generator
    - Replace regex /^- .+/ with line[0] === '-'

- Adjust list item formatting logic

- fix: Ensure proper formatting of changelog list items
    - Update regex to detect properly formatted list items

- Remove existing dashes and reformat list items

- fix: Correct changelog formatting
    - Preserve existing list items

- Add dashes to non-list lines

# 0.0.10 (2025-02-13)

- refactor: Improve changelog formatting and generation
    - Correct indentation in changelog.md

- - Refactor get-changelog.ts for commit formatting

# 0.0.9 (2025-02-13)

- fix: Update indentation in getChangelog
    Change line indentation from two spaces to four spaces

- docs: Update changelog for version 0.0.8

- feat: Prepend new changes to changelog.md
    Read existing changelog content
    Combine new changes with existing content
    Rename function parameter to newChanges

# 0.0.8 (2025-02-13)

- feat: Prepend new changes to changelog.md
    Read existing changelog content
    Combine new changes with existing content
    Rename function parameter to newChanges

# 0.0.7 (2025-02-13)

- chore: Remove unused execSync import
    Delete execSync import from child_process