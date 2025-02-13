#!/usr/bin/env node

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import releaseCommand from './commands/release/release.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program.name('aidgit').description('aidgit: AI-powered Git workflow tools').version(packageJson.version);

program.addCommand(releaseCommand);

program.parse();
