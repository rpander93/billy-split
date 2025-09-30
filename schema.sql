-- Billy Split SQLite Database Schema
-- This file defines the database structure for the bill splitting application
-- Run this file to create the necessary tables and indexes

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Table for scanned bills (initial scan data)
CREATE TABLE scanned_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    date TEXT,
    currency TEXT,
    share_code TEXT UNIQUE NOT NULL,
    file_name TEXT NOT NULL,
    created_on INTEGER NOT NULL
);

-- Table for line items in scanned bills
CREATE TABLE scanned_bill_line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES scanned_bills(id) ON DELETE CASCADE
);

-- Table for submitted bills (finalized bills)
CREATE TABLE submitted_bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    currency TEXT NOT NULL,
    service_fee INTEGER,
    payment_method TEXT NOT NULL,
    file_name TEXT NOT NULL,
    share_code TEXT UNIQUE NOT NULL,
    created_on INTEGER NOT NULL,
    number_of_payments INTEGER NOT NULL DEFAULT 0
);

-- Table for line items in submitted bills
CREATE TABLE submitted_bill_line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    item_index INTEGER NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES submitted_bills(id) ON DELETE CASCADE,
    UNIQUE(bill_id, item_index)
);

-- Table for payment items
CREATE TABLE payment_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    payment_index TEXT NOT NULL,
    creator TEXT NOT NULL,
    created_on INTEGER NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES submitted_bills(id) ON DELETE CASCADE
);

-- Table for line items within each payment
CREATE TABLE payment_item_line_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_item_id TEXT NOT NULL,
    line_item_index INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    FOREIGN KEY (payment_item_id) REFERENCES payment_items(id) ON DELETE CASCADE
);

-- Indexes for better performance

-- Scanned bills indexes
CREATE INDEX idx_scanned_bills_share_code ON scanned_bills(share_code);
CREATE INDEX idx_scanned_bills_created_on ON scanned_bills(created_on DESC);
CREATE INDEX idx_scanned_bills_date ON scanned_bills(date DESC);

-- Scanned bill line items indexes
CREATE INDEX idx_scanned_line_items_bill_id ON scanned_bill_line_items(bill_id);

-- Submitted bills indexes
CREATE INDEX idx_submitted_bills_share_code ON submitted_bills(share_code);
CREATE INDEX idx_submitted_bills_created_on ON submitted_bills(created_on DESC);
CREATE INDEX idx_submitted_bills_date ON submitted_bills(date DESC);
CREATE INDEX idx_submitted_bills_payment_method ON submitted_bills(payment_method);

-- Submitted bill line items indexes
CREATE INDEX idx_submitted_line_items_bill_id ON submitted_bill_line_items(bill_id);
CREATE INDEX idx_submitted_line_items_index ON submitted_bill_line_items(bill_id, item_index);

-- Payment items indexes
CREATE INDEX idx_payment_items_bill_id ON payment_items(bill_id);
CREATE INDEX idx_payment_items_created_on ON payment_items(created_on DESC);

-- Payment item line items indexes
CREATE INDEX idx_payment_line_items_payment_id ON payment_item_line_items(payment_item_id);
