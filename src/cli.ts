import { Command } from 'commander';
import releaseCommand from './commands/release/release.js';

const program = new Command();

program.name('aidgit').description('aidgit: AI-powered Git workflow tools').version('0.1.0');

program.addCommand(releaseCommand);

program.parse(process.argv);
