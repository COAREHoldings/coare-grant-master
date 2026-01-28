/**
 * Environment variable validation
 * Validates required environment variables on application startup
 */

interface EnvConfig {
  DATABASE_URL: string;
  JWT_SECRET: string;
  NEXT_PUBLIC_SENTRY_DSN?: string;
  NODE_ENV: string;
}

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'] as const;

const optionalEnvVars = ['NEXT_PUBLIC_SENTRY_DSN'] as const;

/**
 * Validate that all required environment variables are set
 * Throws an error with details if any are missing
 */
export function validateEnv(): EnvConfig {
  const missingVars: string[] = [];
  const env: Partial<EnvConfig> = {};

  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    } else {
      (env as Record<string, string>)[varName] = value;
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `
================================================================================
ENVIRONMENT CONFIGURATION ERROR
================================================================================
The following required environment variables are missing or empty:

${missingVars.map((v) => `  - ${v}`).join('\n')}

Please ensure these variables are set in your .env.local file or environment.

Example .env.local:
${missingVars.map((v) => `  ${v}=your_${v.toLowerCase()}_here`).join('\n')}
================================================================================
`;
    throw new Error(errorMessage);
  }

  // Add optional vars if present
  for (const varName of optionalEnvVars) {
    const value = process.env[varName];
    if (value) {
      (env as Record<string, string>)[varName] = value;
    }
  }

  env.NODE_ENV = process.env.NODE_ENV || 'development';

  return env as EnvConfig;
}

/**
 * Get a single environment variable with type safety
 */
export function getEnv(key: keyof EnvConfig): string | undefined {
  return process.env[key];
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Validate on module load in production
if (process.env.NODE_ENV === 'production') {
  try {
    validateEnv();
  } catch (error) {
    console.error(error);
    // Don't crash in production, but log the error
  }
}
