import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import pkg from '../../package.json' assert { type: 'json' };
import { Config } from './config.types.js';

const CONFIG_DIR = join(homedir(), `.${pkg.name}`);
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export const DEFAULT_CONFIG: Config = {
    auth: {
        token: null
    },
    settings: {
        autoStage: false,
        smartGroupping: true,
        locale: 'en'
    }
};

if (!existsSync(CONFIG_DIR) || !existsSync(CONFIG_FILE)) {
    mkdirSync(CONFIG_DIR, { recursive: true });

    saveConfig(DEFAULT_CONFIG);
}

export function loadConfig(): Config {
    try {
        const loadedConfig = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));

        // Ensure settings exist by merging with defaults
        return {
            ...DEFAULT_CONFIG,
            ...loadedConfig,
            settings: {
                ...DEFAULT_CONFIG.settings,
                ...loadedConfig.settings
            }
        };
    } catch (error) {
        console.error('Error reading config file:', error);
        return DEFAULT_CONFIG;
    }
}

export function saveConfig(config: Config): void {
    try {
        writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error saving config file:', error);
    }
}

export function clearAuthToken(): boolean {
    try {
        const config = loadConfig();
        config.auth.token = null;
        saveConfig(config);
        return true;
    } catch (error) {
        console.error('Error clearing authentication token:', error);
        return false;
    }
}

export function deleteConfig(): boolean {
    try {
        if (existsSync(CONFIG_FILE)) {
            unlinkSync(CONFIG_FILE);

            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting config file:', error);
        return false;
    }
}

export { CONFIG_FILE };
