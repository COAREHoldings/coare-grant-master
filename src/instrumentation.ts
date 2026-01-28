import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side Sentry initialization
    await import('../sentry.server.config');
    
    // Validate environment variables on server startup
    const { validateEnv } = await import('./lib/env');
    try {
      validateEnv();
      console.log('[ENV] Environment variables validated successfully');
    } catch (error) {
      console.error('[ENV] Environment validation failed:', error);
      // In production, you might want to prevent startup
      if (process.env.NODE_ENV === 'production') {
        Sentry.captureException(error);
      }
    }
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.client.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
