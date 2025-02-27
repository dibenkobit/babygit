#!/usr/bin/env bun

import { Command } from 'commander';
import pkg from '../package.json' assert { type: 'json' };
import { auth } from './commands/auth.js';
import { commit } from './commands/commit.js';
import { settings } from './commands/settings.js';
import { status } from './commands/status.js';

const program = new Command();

program.name(pkg.name).description(pkg.description).version(pkg.version);
program.addCommand(auth);
program.addCommand(settings);
program.addCommand(commit);
program.addCommand(status);

program.parse();
