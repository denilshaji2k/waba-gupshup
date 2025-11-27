/**
 * Setup Wizard Handler
 * Handles .env file creation from the setup wizard
 * 
 * Usage: Include this in your Express server:
 * 
 * const { setupWizardRouter, writeEnvFiles } = require('./wizardHandler');
 * app.use('/api', setupWizardRouter);
 * 
 * API Endpoint: POST /api/setup/save
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate backend .env content
 */
function generateBackendEnv(config) {
    let mongoUri = config.database.mongodb_uri;
    
    if (!mongoUri && config.database.type === 'local') {
        mongoUri = `mongodb://${config.database.mongodb_host}:${config.database.mongodb_port}/${config.database.mongodb_database}`;
    }

    let envContent = `# Auto-generated at ${new Date().toLocaleString()}
# Environment: ${config.environment}

# Server Configuration
PORT=${config.server.port}
NODE_ENV=${config.environment}

# Database
MONGODB_URI=${mongoUri}

# JWT
JWT_SECRET=${config.secrets.jwt_secret}
JWT_EXPIRY=7d
REFRESH_TOKEN_SECRET=${config.secrets.refresh_token_secret}

# Gupshup
GUPSHUP_API_KEY=${config.gupshup.api_key}
GUPSHUP_APP_ID=${config.gupshup.app_id}
GUPSHUP_API_BASE_URL=https://api.gupshup.io/wa

# Webhook
WEBHOOK_TOKEN=${config.secrets.webhook_token}
WEBHOOK_URL=${config.gupshup.webhook_url}

# CORS
CORS_ORIGIN=${config.server.frontend_url}

# Session
SESSION_SECRET=${config.secrets.session_secret}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=${config.advanced.rate_limit_window}
RATE_LIMIT_MAX_REQUESTS=${config.advanced.rate_limit_max}

# File Upload
MAX_FILE_SIZE=${config.advanced.max_file_size}
UPLOAD_DIR=./uploads

# Analytics
ANALYTICS_RETENTION_DAYS=${config.advanced.analytics_retention}
ENABLE_ANALYTICS=${config.advanced.enable_analytics}
`;

    // Add email configuration if enabled
    if (config.email.enabled) {
        envContent += `
# Email Configuration
SMTP_HOST=${config.email.smtp_host}
SMTP_PORT=${config.email.smtp_port}
SMTP_USER=${config.email.smtp_user}
SMTP_PASS=${config.email.smtp_pass}
SENDER_EMAIL=${config.email.sender_email}
`;
    }

    return envContent;
}

/**
 * Generate frontend .env content
 */
function generateFrontendEnv(config) {
    const logLevel = config.environment === 'production' ? 'info' : 'debug';

    return `# Auto-generated at ${new Date().toLocaleString()}
# Environment: ${config.environment}

REACT_APP_ENV=${config.environment}
REACT_APP_API_URL=${config.server.api_url}
REACT_APP_MAX_FILE_SIZE=${config.advanced.max_file_size}
REACT_APP_LOG_LEVEL=${logLevel}
`;
}

/**
 * Write .env files to disk
 */
function writeEnvFiles(config, projectRoot = process.cwd()) {
    const backendEnv = generateBackendEnv(config);
    const frontendEnv = generateFrontendEnv(config);

    const backendEnvPath = path.join(projectRoot, 'server', '.env');
    const frontendEnvPath = path.join(projectRoot, 'client', '.env');

    try {
        // Backup existing files if they exist
        if (fs.existsSync(backendEnvPath)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(projectRoot, 'server', `.env.backup.${timestamp}`);
            fs.copyFileSync(backendEnvPath, backupPath);
            console.log(`✓ Backed up existing backend .env to ${backupPath}`);
        }

        if (fs.existsSync(frontendEnvPath)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(projectRoot, 'client', `.env.backup.${timestamp}`);
            fs.copyFileSync(frontendEnvPath, backupPath);
            console.log(`✓ Backed up existing frontend .env to ${backupPath}`);
        }

        // Write new files
        fs.writeFileSync(backendEnvPath, backendEnv, 'utf8');
        fs.writeFileSync(frontendEnvPath, frontendEnv, 'utf8');

        console.log('✓ Successfully created server/.env');
        console.log('✓ Successfully created client/.env');

        return {
            success: true,
            message: 'Environment files created successfully',
            files: {
                backend: backendEnvPath,
                frontend: frontendEnvPath
            }
        };
    } catch (error) {
        console.error('✗ Error writing .env files:', error.message);
        return {
            success: false,
            message: error.message,
            error: error.stack
        };
    }
}

/**
 * Validate configuration
 */
function validateConfig(config) {
    const errors = [];

    // Environment
    if (!['development', 'staging', 'production'].includes(config.environment)) {
        errors.push('Invalid environment');
    }

    // Database
    if (!['local', 'atlas'].includes(config.database.type)) {
        errors.push('Invalid database type');
    }

    if (config.database.type === 'local') {
        if (!config.database.mongodb_host) errors.push('MongoDB host is required');
        if (!config.database.mongodb_port) errors.push('MongoDB port is required');
        if (!config.database.mongodb_database) errors.push('Database name is required');
    } else {
        if (!config.database.mongodb_uri) errors.push('MongoDB URI is required');
    }

    // Server
    if (!config.server.port) errors.push('Server port is required');
    if (!config.server.frontend_url) errors.push('Frontend URL is required');

    // Secrets
    if (!config.secrets.jwt_secret) errors.push('JWT secret is required');
    if (!config.secrets.refresh_token_secret) errors.push('Refresh token secret is required');
    if (!config.secrets.session_secret) errors.push('Session secret is required');
    if (!config.secrets.webhook_token) errors.push('Webhook token is required');

    // Gupshup
    if (!config.gupshup.api_key) errors.push('Gupshup API key is required');
    if (!config.gupshup.app_id) errors.push('Gupshup app ID is required');
    if (!config.gupshup.webhook_url) errors.push('Webhook URL is required');

    // Email (if enabled)
    if (config.email.enabled) {
        if (!config.email.smtp_host) errors.push('SMTP host is required');
        if (!config.email.smtp_port) errors.push('SMTP port is required');
        if (!config.email.smtp_user) errors.push('SMTP user is required');
        if (!config.email.smtp_pass) errors.push('SMTP password is required');
        if (!config.email.sender_email) errors.push('Sender email is required');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Express Router for setup endpoints
 */
function createSetupRouter() {
    const express = require('express');
    const router = express.Router();

    /**
     * POST /api/setup/validate
     * Validate configuration without writing files
     */
    router.post('/setup/validate', (req, res) => {
        const config = req.body;
        const validation = validateConfig(config);

        res.json(validation);
    });

    /**
     * POST /api/setup/save
     * Save configuration and write .env files
     */
    router.post('/setup/save', (req, res) => {
        const config = req.body;
        const projectRoot = req.query.projectRoot || process.cwd();

        // Validate first
        const validation = validateConfig(config);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Configuration validation failed',
                errors: validation.errors
            });
        }

        // Write files
        const result = writeEnvFiles(config, projectRoot);
        const statusCode = result.success ? 200 : 500;

        res.status(statusCode).json(result);
    });

    /**
     * POST /api/setup/preview
     * Preview .env files without writing
     */
    router.post('/setup/preview', (req, res) => {
        const config = req.body;

        // Validate first
        const validation = validateConfig(config);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Configuration validation failed',
                errors: validation.errors
            });
        }

        const backendEnv = generateBackendEnv(config);
        const frontendEnv = generateFrontendEnv(config);

        res.json({
            success: true,
            preview: {
                backend: backendEnv,
                frontend: frontendEnv
            }
        });
    });

    return router;
}

module.exports = {
    generateBackendEnv,
    generateFrontendEnv,
    writeEnvFiles,
    validateConfig,
    createSetupRouter
};
