# babygit - AI-powered Git workflow tools

[![npm version](https://img.shields.io/npm/v/babygit.svg)](https://www.npmjs.com/package/babygit)
[![npm downloads](https://img.shields.io/npm/dm/babygit.svg)](https://www.npmjs.com/package/babygit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

> Your intelligent assistant for Git release management and changelog generation

**babygit** is a powerful CLI tool that streamlines your Git release workflow by automating version management and changelog generation. It follows industry best practices like [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/), making your release process both efficient and standardized.

## ✨ Features

- 🎯 **Smart Version Bumping**: Automatically increments version numbers following semantic versioning (major.minor.patch)
- 📝 **Automated Changelog**: Generates well-formatted changelogs from your commit messages
- 🌳 **Branch Management**: Creates and manages release branches with a standardized naming convention
- 🏷️ **Git Tags**: Automatically creates and pushes annotated version tags
- 🤝 **Git Integration**: Seamlessly handles git operations (branching, committing, pushing)
- 🎨 **Beautiful Output**: Produces clean, readable, and standardized documentation
- 🔄 **Keep a Changelog**: Follows the Keep a Changelog format for consistent and readable history
- 🏷️ **Semantic Versioning**: Adheres to SemVer for predictable version numbering

## 🚀 Quick Start

### Installation

```bash
# Using npm
npm install -g babygit

# Using yarn
yarn global add babygit

# Using pnpm
pnpm add -g babygit
```

### Basic Usage

Create a new release with automatic version bump:

```bash
# Create a patch release (0.0.1 -> 0.0.2)
babygit release

# Create a minor release (0.1.0 -> 0.2.0)
babygit release minor

# Create a major release (1.0.0 -> 2.0.0)
babygit release major
```

### Advanced Usage

Create a release from a specific branch:

```bash
babygit release --from develop
```

## 🎯 What It Does

When you run `babygit release`, it:

1. 📈 Bumps the version in package.json
2. 🌿 Creates a new release branch (e.g., release/1.2.3)
3. 📝 Generates a changelog from your commits
4. 💾 Commits the changes
5. 🏷️ Creates an annotated git tag (e.g., v1.2.3)
6. 🚀 Pushes everything to your repository

## 📖 Generated Changelog Format

Your changelog will be automatically formatted like this:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.2.3] - 2024-03-21

- feat: Add new awesome feature
    - Implement cool functionality
    - Add tests
    
- fix: Resolve critical bug
    - Update error handling
    - Add validation

_Generated by [babygit](https://github.com/dibenkobit/babygit)_
```

## ⚙️ Requirements

- Node.js >= 18.0.0
- Git installed and configured

## 🛠️ Development

1. Clone the repository:
```bash
git clone https://github.com/dibenkobit/babygit.git
cd babygit
```

2. Install dependencies:
```bash
npm install
```

3. Start development mode:
```bash
npm run dev
```

4. Build the project:
```bash
npm run build
```

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for the release history.

---

Made with ❤️ by [Nikita Snetkov](https://github.com/dibenkobit)