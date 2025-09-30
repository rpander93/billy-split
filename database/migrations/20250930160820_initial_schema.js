import { sql } from "kysely";

export async function up(db) {
  // Enable foreign key constraints for SQLite
  await sql`PRAGMA foreign_keys = ON`.execute(db);

  await db.schema
    .createTable("scanned_bill")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text")
    .addColumn("date", "text")
    .addColumn("currency", "text")
    .addColumn("share_code", "text", (col) => col.unique().notNull())
    .addColumn("file_name", "text", (col) => col.notNull())
    .addColumn("created_on", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("scanned_bill_line_item")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("bill_id", "integer", (col) => col.notNull().references("scanned_bill.id").onDelete("cascade"))
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("amount", "real", (col) => col.notNull())
    .addColumn("total_price", "real", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("submitted_bill")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("date", "text", (col) => col.notNull())
    .addColumn("currency", "text", (col) => col.notNull())
    .addColumn("service_fee", "real")
    .addColumn("payment_method", "text", (col) => col.notNull())
    .addColumn("file_name", "text", (col) => col.notNull())
    .addColumn("share_code", "text", (col) => col.unique().notNull())
    .addColumn("created_on", "integer", (col) => col.notNull())
    .addColumn("number_of_payments", "integer", (col) => col.notNull().defaultTo(0))
    .execute();

  await db.schema
    .createTable("submitted_bill_line_item")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("bill_id", "integer", (col) => col.notNull().references("submitted_bill.id").onDelete("cascade"))
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("amount", "real", (col) => col.notNull())
    .addColumn("unit_price", "real", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("payment")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("bill_id", "integer", (col) => col.notNull().references("submitted_bill.id").onDelete("cascade"))
    .addColumn("share_code", "text", (col) => col.notNull())
    .addColumn("creator", "text", (col) => col.notNull())
    .addColumn("created_on", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("payment_line_item")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("payment_id", "integer", (col) => col.notNull().references("payment.id").onDelete("cascade"))
    .addColumn("line_item_id", "integer", (col) => col.notNull().references("submitted_bill_line_item.id").onDelete("cascade"))
    .addColumn("amount", "real", (col) => col.notNull())
    .execute();

  // Add indices
  await db.schema.createIndex("idx_scanned_bill_share_code").on("scanned_bill").column("share_code").execute();
  await db.schema.createIndex("idx_scanned_bill_created_on").on("scanned_bill").column("created_on").execute();
  await db.schema.createIndex("idx_scanned_bill_date").on("scanned_bill").column("date").execute();
  await db.schema.createIndex("idx_scanned_bill_line_item_bill_id").on("scanned_bill_line_item").column("bill_id").execute();
  await db.schema.createIndex("idx_submitted_bill_share_code").on("submitted_bill").column("share_code").execute();
  await db.schema.createIndex("idx_submitted_bill_created_on").on("submitted_bill").column("created_on").execute();
  await db.schema.createIndex("idx_submitted_bill_date").on("submitted_bill").column("date").execute();
  await db.schema.createIndex("idx_submitted_bill_payment_method").on("submitted_bill").column("payment_method").execute();
  await db.schema.createIndex("idx_submitted_bill_line_item_bill_id").on("submitted_bill_line_item").column("bill_id").execute();
  await db.schema.createIndex("idx_submitted_bill_line_item_index").on("submitted_bill_line_item").columns(["bill_id", "item_index"]).execute();
  await db.schema.createIndex("idx_payment_bill_id").on("payment").column("bill_id").execute();
  await db.schema.createIndex("idx_payment_created_on").on("payment").column("created_on").execute();
  await db.schema.createIndex("idx_payment_line_item_payment_id").on("payment_line_item").column("payment_id").execute();
}

export async function down(db) {
  // Drop tables in reverse order (due to foreign key constraints)
  await db.schema.dropTable("payment_line_item").execute();
  await db.schema.dropTable("payment").execute();
  await db.schema.dropTable("submitted_bill_line_item").execute();
  await db.schema.dropTable("submitted_bill").execute();
  await db.schema.dropTable("scanned_bill_line_item").execute();
  await db.schema.dropTable("scanned_bill").execute();
}
