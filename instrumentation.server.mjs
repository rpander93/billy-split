import * as Sentry from "@sentry/remix";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  autoInstrumentRemix: true
});
