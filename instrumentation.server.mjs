import * as Sentry from "@sentry/remix";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  autoInstrumentRemix: true
});
