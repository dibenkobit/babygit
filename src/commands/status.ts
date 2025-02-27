import { Command } from 'commander';
import { loadConfig } from '../config/config.js';
import { colors } from '../ui/ui.const.js';

export const status = new Command()
    .name('status')
    .description('Show current configuration status')
    .action(() => {
        const config = loadConfig();

        if (config.auth.token) {
            console.log(colors.green + 'Authenticated' + colors.reset);
        } else {
            console.log(colors.red + 'Not Authenticated' + colors.reset);
        }

        console.log('\nSettings:');
        console.log(`${colors.cyan}Language:${colors.reset} ${colors.green}${config.settings.locale}${colors.reset}`);
        console.log(
            `${colors.cyan}Auto-stage:${colors.reset} ${config.settings.autoStage ? colors.green + 'enabled' : colors.red + 'disabled'}${colors.reset}`
        );
        console.log(
            `${colors.cyan}Smart grouping:${colors.reset} ${config.settings.smartGroupping ? colors.green + 'enabled' : colors.red + 'disabled'}${colors.reset}`
        );
    });
