import { promises as fs } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { Kysely } from "kysely";
import { SqliteDialect } from "kysely";
import { FileMigrationProvider, Migrator } from "kysely";

const DATABASE_PATH = process.env.SQLITE_DATABASE_PATH ?? "billy-split.db";
const migrationFolder = path.join(import.meta.dirname, "migrations");

const migrator = new Migrator({
  db: new Kysely({
    dialect: new SqliteDialect({
      database: new Database(DATABASE_PATH),
    }),
  }),
  provider: new FileMigrationProvider({ fs, path, migrationFolder }),
});

migrator.migrateToLatest().then(() => {
  console.log("Migration completed");
});
