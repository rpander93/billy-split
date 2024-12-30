import process from "node:process";
import * as Sentry from "@sentry/remix";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  autoInstrumentRemix: true
});
