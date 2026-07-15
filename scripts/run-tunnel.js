#!/usr/bin/env node

/**
 * Script to run cloudflared tunnel with token from environment variable
 * 
 * Usage:
 *   CLOUDFLARE_TUNNEL_TOKEN=your-token node scripts/run-tunnel.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Load token from environment variable or .env file
 */
function loadToken() {
    // Try to load from environment variable first
    let token = process.env.CLOUDFLARE_TUNNEL_TOKEN || null;

    // If not in env, try to load from .env file
    if (!token) {
        try {
            const envFile = join(projectRoot, '.env');
            const envContent = readFileSync(envFile, 'utf-8');
            const envLines = envContent.split('\n');

            for (const line of envLines) {
                const trimmed = line.trim();
                // Skip comments and empty lines
                if (!trimmed || trimmed.startsWith('#')) continue;
                if (trimmed.startsWith('CLOUDFLARE_TUNNEL_TOKEN=')) {
                    const index = trimmed.indexOf('=');
                    const value = index === -1 ? '' : trimmed.substring(index + 1);
                    token = value.trim().replace(/^["']|["']$/g, '') || null;
                    break;
                }
            }
        } catch {
            // .env file doesn't exist or can't be read, that's okay
        }
    }

    return token;
}

// Load token
const token = loadToken();

if (!token) {
    console.error('❌ Error: CLOUDFLARE_TUNNEL_TOKEN is required');
    console.error('   Please set it in your .env file or as an environment variable:');
    console.error('   CLOUDFLARE_TUNNEL_TOKEN=your-token-here');
    console.error('');
    console.error('   To get your tunnel token:');
    console.error('   1. Go to: https://one.dash.cloudflare.com/');
    console.error('   2. Or run: cloudflared tunnel token <tunnel-name>');
    process.exit(1);
}

// Spawn cloudflared process
const cloudflared = spawn('cloudflared', ['tunnel', 'run', '--token', token], {
    stdio: 'inherit',
    shell: false
});

cloudflared.on('error', (error) => {
    console.error('❌ Failed to start cloudflared:', error.message);
    console.error('   Make sure cloudflared is installed: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
    process.exit(1);
});

cloudflared.on('exit', (code) => {
    process.exit(code || 0);
});

// Handle process termination
process.on('SIGINT', () => {
    cloudflared.kill('SIGINT');
});

process.on('SIGTERM', () => {
    cloudflared.kill('SIGTERM');
});
