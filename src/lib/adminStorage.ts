import fs from 'fs/promises';
import path from 'path';

const VAULT_FILE = path.join(process.cwd(), 'src', 'data', 'admin-vault.json');

// Interface for vault structure
interface AdminConfig {
    passwordHash: string | null;
    isEnabled: boolean;
    lastUpdated: number;
}

// Initial state
const DEFAULT_CONFIG: AdminConfig = {
    passwordHash: null,
    isEnabled: true,
    lastUpdated: Date.now(),
};

export async function getAdminConfig(): Promise<AdminConfig> {
    try {
        const data = await fs.readFile(VAULT_FILE, 'utf-8');
        return JSON.parse(data) as AdminConfig;
    } catch (error) {
        // If file doesn't exist, return default (Not Setup)
        return DEFAULT_CONFIG;
    }
}

export async function saveAdminConfig(hash: string) {
    const config: AdminConfig = {
        passwordHash: hash,
        isEnabled: true,
        lastUpdated: Date.now(),
    };

    // Ensure directory exists
    try {
        await fs.mkdir(path.dirname(VAULT_FILE), { recursive: true });
    } catch (e) {
        // ignore
    }

    await fs.writeFile(VAULT_FILE, JSON.stringify(config, null, 2), 'utf-8');
}
