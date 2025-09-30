import { readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database as DatabaseSchema } from "./database-scheme";

const DATABASE_PATH = process.env.SQLITE_DATABASE_PATH;

let _db: Kysely<DatabaseSchema> | undefined;
let _sqlite: Database.Database | undefined;

export function database(): Kysely<DatabaseSchema> {
  if (DATABASE_PATH === undefined) {
    throw new Error("DATABASE_PATH is not defined");
  }

  if (_db === undefined) {
    _sqlite = new Database(DATABASE_PATH);

    // Enable foreign key constraints
    _sqlite.pragma('foreign_keys = ON');

    // Initialize database schema if tables don't exist
    createSchemeIfNeeded(_sqlite);

    // Create Kysely instance
    _db = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({
        database: _sqlite,
      }),
    });
  }

  return _db;
}

function createSchemeIfNeeded(sqlite: Database.Database) {
  // Check if tables exist
  const tableStmt = "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
  const tableCount = sqlite.prepare<[], { count: number }>(tableStmt).get();

  if (tableCount?.count === 0) {
    // Read and execute schema file
    try {
      const schemaPath = join(process.cwd(), "schema.sql");
      const schema = readFileSync(schemaPath, "utf-8");

      // Split by semicolon and execute each statement
      const statements = schema.split(';').filter(stmt => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          sqlite.exec(statement);
        }
      }

      console.log("Database schema initialized successfully");
    } catch (error) {
      console.error("Error initializing database schema:", error);
      throw error;
    }
  }
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
