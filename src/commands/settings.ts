import { checkbox, select } from '@inquirer/prompts';
import { Command } from 'commander';
import { loadConfig, saveConfig, deleteConfig } from '../config/config.js';
import { Locale } from '../config/config.types.js';
import { colors } from '../ui/ui.const.js';
import { printSuccess, printInfo } from '../ui/ui.js';

export const settings = new Command().name('settings').description('Configure application settings');

settings
    .command('reset')
    .description('Reset all settings to default values')
    .action(() => {
        const success = deleteConfig();
        if (success) {
            printSuccess('Settings reset to default values');
        } else {
            printInfo('No configuration file found to reset');
        }
    });

settings
    .command('locale')
    .description('Set application language')
    .action(async () => {
        const config = loadConfig();

        const localeChoices = [
            { name: 'English', value: 'en' as Locale },
            { name: 'Chinese', value: 'zh' as Locale },
            { name: 'Spanish', value: 'es' as Locale },
            { name: 'Arabic', value: 'ar' as Locale },
            { name: 'Hindi', value: 'hi' as Locale },
            { name: 'French', value: 'fr' as Locale },
            { name: 'Russian', value: 'ru' as Locale },
            { name: 'Portuguese', value: 'pt' as Locale },
            { name: 'Indonesian', value: 'id' as Locale },
            { name: 'German', value: 'de' as Locale }
        ];

        const selectedLocale = await select<Locale>({
            message: 'Select application language:',
            choices: localeChoices,
            default: config.settings.locale
        });

        config.settings.locale = selectedLocale;
        saveConfig(config);
        printSuccess(`Language set to ${selectedLocale}`);

        // TODO: Add a function to update the language of the commit message
        printInfo(`This function is under development and will be available soon.`);
    });

settings.action(async () => {
    const config = loadConfig();
    const currentSettings = config.settings;

    const choices = [
        {
            name: 'Auto-stage changes before commit',
            value: 'autoStage',
            checked: currentSettings.autoStage
        },
        {
            name: 'Smart commit grouping',
            value: 'smartGroupping',
            checked: currentSettings.smartGroupping
        }
    ];

    const selectedSettings = await checkbox({
        message: 'Select settings to enable:',
        choices
    });

    config.settings = {
        ...currentSettings,
        autoStage: selectedSettings.includes('autoStage'),
        smartGroupping: selectedSettings.includes('smartGroupping')
    };

    saveConfig(config);
    printSuccess('Settings updated successfully');

    console.log('\nCurrent Settings:');
    console.log(
        `${colors.cyan}Auto-stage:${colors.reset} ${config.settings.autoStage ? colors.green + 'enabled' : colors.red + 'disabled'}${colors.reset}`
    );
    console.log(
        `${colors.cyan}Smart grouping:${colors.reset} ${config.settings.smartGroupping ? colors.green + 'enabled' : colors.red + 'disabled'}${colors.reset}`
    );
    console.log(`${colors.cyan}Language:${colors.reset} ${colors.green}${config.settings.locale}${colors.reset}`);
});
