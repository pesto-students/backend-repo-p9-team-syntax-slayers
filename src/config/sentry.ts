// src/config/sentry.ts
import * as Sentry from '@sentry/node';
import { RewriteFrames } from '@sentry/integrations';
import app from '../index';

export const initializeSentry = (): void => {
  // Explicitly cast global object to any
  const globalAny: any = global;
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      new RewriteFrames({
        root: globalAny.__basedir, // Cast to any to avoid TypeScript error
      }),
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({
        app,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!,
  });
};
