import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { DB } from "../../database/generated";

const DATABASE_PATH = process.env.SQLITE_DATABASE_PATH;

let _db: Kysely<DB> | undefined;
let _sqlite: Database.Database | undefined;

export function database(): Kysely<DB> {
  if (DATABASE_PATH === undefined) {
    throw new Error("DATABASE_PATH is not defined");
  }

  if (_db === undefined) {
    _sqlite = new Database(DATABASE_PATH);

    // Enable foreign key constraints
    _sqlite.pragma('foreign_keys = ON');

    // Create Kysely instance
    _db = new Kysely<DB>({
      dialect: new SqliteDialect({
        database: _sqlite,
      }),
    });
  }

  return _db;
}

function closeDatabase() {
  if (_db) {
    _db.destroy();
    _db = undefined;
  }

  if (_sqlite) {
    _sqlite.close();
    _sqlite = undefined;
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});
