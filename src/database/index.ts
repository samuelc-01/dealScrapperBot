import Database from "better-sqlite3";
import { PostedDeal, FilterSettings } from "../types/index.js";

const db = new Database("./data/deals.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS posted_deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    link TEXT NOT NULL,
    posted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS daily_counts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE NOT NULL,
    count INTEGER DEFAULT 0,
    last_reset DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);

export function isDealPosted(dealId: string): boolean {
  const stmt = db.prepare("SELECT 1 FROM posted_deals WHERE deal_id = ?");
  return stmt.get(dealId) !== undefined;
}

export function markDealAsPosted(
  dealId: string,
  title: string,
  link: string,
): void {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO posted_deeals (deal_id, title, link) VALUES (?, ?, ?)
    `);
  stmt.run(dealId, title, link);
}
