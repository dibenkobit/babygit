import { createServer, Server, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import confirm from '@inquirer/confirm';
import { Command } from 'commander';
import { nanoid } from 'nanoid';
import openBrowser from 'open';
import { loadConfig, saveConfig } from '../config/config.js';
import { AUTH_REDIRECT_URL, WEB_AUTH_URL } from '../constants.js';
import { printSuccess, printError, printInfo, printStep, ProgressIndicator } from '../ui/ui.js';

interface AuthResult {
    token: string;
}

const PORT = 9918;
const AUTH_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Creates a success HTML page for the browser callback
 */
const createSuccessHtml = (): string => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Successful</title>
    <link rel="icon" href="https://www.babygit.dev/favicon.ico" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
      :root {
        --primary: #F8FAFC;
        --accent: #10B981;
        --accent-lighter: #34d399;
        --text: #A1A1AA;
        --text-bright: #F1F5F9;
        --background: #0A0A0A;
        --card: #141414;
        --shadow: rgba(0, 0, 0, 0.7);
        --border: rgba(255, 255, 255, 0.08);
      }
      
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      body { 
        font-family: 'Fira Code', monospace;
        background-color: var(--background);
        color: var(--text);
        line-height: 1.6;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 2rem;
      }
      
      .container {
        max-width: 440px;
        width: 100%;
      }
      
      .card {
        background-color: var(--card);
        border-radius: 16px;
        box-shadow: 
          0 4px 12px var(--shadow),
          0 20px 40px var(--shadow);
        padding: 3rem;
        text-align: center;
        position: relative;
        overflow: hidden;
        animation: cardEntrance 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        border: 1px solid var(--border);
      }
      
      .card::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, var(--accent), var(--accent-lighter));
      }
      
      .success-icon {
        width: 72px;
        height: 72px;
        background-color: rgba(16, 185, 129, 0.15);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        position: relative;
        animation: iconPulse 1.5s ease-out;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      
      .success-icon svg {
        width: 32px;
        height: 32px;
        stroke: var(--accent);
        stroke-width: 2;
      }
      
      h1 { 
        color: var(--text-bright);
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 1rem;
        letter-spacing: -0.02em;
      }
      
      p {
        font-size: 1rem;
        color: var(--text);
        margin-bottom: 0.75rem;
        font-weight: 400;
      }
      
      .brand {
        margin-top: 2.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
      }
      
      .brand span {
        font-weight: 500;
        font-size: 0.9rem;
        margin-left: 8px;
        letter-spacing: -0.01em;
        color: var(--text-bright);
      }
      
      @keyframes cardEntrance {
        from {
          opacity: 0;
          transform: translateY(25px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes iconPulse {
        0% {
          transform: scale(0.8);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5);
        }
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 12px rgba(16, 185, 129, 0);
        }
        100% {
          transform: scale(1);
        }
      }
      
      @media (max-width: 480px) {
        .card {
          padding: 2rem;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1>Authentication Successful</h1>
        <p>You can now close this window and return to the terminal.</p>
        <div class="brand">
            <img src="https://www.babygit.dev/assets/logo.svg" alt="Babygit Logo" width="16" height="16">
            <span>Babygit</span>
        </div>
      </div>
    </div>
  </body>
  </html>
`;

/**
 * Checks if the user is already authenticated and asks if they want to re-authenticate
 * @returns true if authentication should proceed, false if cancelled
 */
const checkExistingAuth = async (): Promise<boolean> => {
    const config = loadConfig();

    if (!config.auth.token) {
        return true;
    }

    printInfo('You are already authenticated.');
    const shouldReauth = await confirm({
        message: 'Do you want to re-authenticate?',
        default: false
    });

    if (!shouldReauth) {
        printInfo('Authentication cancelled.');
        return false;
    }

    return true;
};

/**
 * Handles incoming requests to the auth server
 */
const handleServerRequest = (
    req: IncomingMessage,
    res: ServerResponse,
    server: Server,
    state: string,
    timeoutId: ReturnType<typeof setTimeout>,
    resolve: (token: string) => void,
    reject: (error: Error) => void
): void => {
    try {
        if (!req.url?.startsWith('/auth/callback')) {
            return;
        }

        const urlObj = new URL(`http://localhost:${PORT}${req.url}`);
        const token = urlObj.searchParams.get('token');
        const returnedState = urlObj.searchParams.get('state');

        // Send response to browser
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(createSuccessHtml());

        if (!token) {
            reject(new Error('No token received'));
            return;
        }

        if (returnedState !== state) {
            reject(new Error('State mismatch, possible CSRF attack'));
            return;
        }

        clearTimeout(timeoutId);
        resolve(token);
        server.close();
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Authentication failed. Please return to the CLI.');
        reject(error instanceof Error ? error : new Error('Unknown error during authentication'));
    }
};

/**
 * Creates and starts a local server to handle the auth callback
 */
const createAuthServer = (state: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const server = createServer();

        // Define cleanup function first
        const cleanup = (): void => {
            clearTimeout(timeoutId);
            server.close();
        };

        // Then use it in the timeout definition
        const timeoutId = setTimeout(() => {
            cleanup();
            reject(new Error('Authentication timed out after 5 minutes'));
        }, AUTH_TIMEOUT_MS);

        server.on('request', (req: IncomingMessage, res: ServerResponse) => {
            handleServerRequest(req, res, server, state, timeoutId, resolve, reject);
        });

        // Start the server
        server.listen(PORT, () => {
            printInfo(`Local authentication server started on port ${PORT}\n`);
        });

        // Handle server errors
        server.on('error', (err) => {
            cleanup();
            reject(new Error(`Server error: ${err.message}`));
        });
    });
};

/**
 * Saves the authentication token to the config
 */
const saveAuthToken = (token: string): void => {
    const config = loadConfig();
    config.auth.token = token;
    saveConfig(config);
};

/**
 * Initiates the authentication flow
 */
const performAuthentication = async (): Promise<AuthResult> => {
    // Generate a unique state for this auth session
    const state = nanoid();

    // Create and start a local HTTP server to receive the auth callback
    const authPromiseWithServer = createAuthServer(state);

    // Generate sign-in URL and open browser
    const signInURL = `${WEB_AUTH_URL}?redirectTo=${encodeURIComponent(AUTH_REDIRECT_URL)}&state=${state}`;

    printStep('Authentication Process');
    console.log('');
    printInfo('Opening browser for authentication...');
    console.log('');
    printInfo('Please complete the authentication process on the website.');
    printInfo(`If the browser doesn't open automatically, use this URL:`);
    console.log(`\n  ${signInURL}\n`);

    await openBrowser(signInURL);

    // Wait for authentication to complete
    const token = await authPromiseWithServer;
    return { token };
};

export const auth = new Command()
    .name('auth')
    .description('Authenticate with Supabase')
    .action(async () => {
        try {
            const shouldProceed = await checkExistingAuth();
            if (!shouldProceed) {
                return;
            }

            console.log('');
            // Show a spinner while waiting for auth
            const spinner = new ProgressIndicator();
            spinner.start('Waiting for authentication in browser...');

            try {
                const { token } = await performAuthentication();
                spinner.stop();
                console.log('');
                printSuccess('Authentication successful!');
                saveAuthToken(token);
                printSuccess('You are now logged in to Babygit.');
                console.log('');
            } catch (error) {
                spinner.stop();
                console.log('');
                printError(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                process.exit(1);
            }
        } catch (error) {
            printError(`Authentication error: ${error instanceof Error ? error.message : String(error)}`);
            process.exit(1);
        }
    });
