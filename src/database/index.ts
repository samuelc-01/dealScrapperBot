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

export function getPostedDeals(limit: number = 10): PostedDeal[] {
  const stmt = db.prepare(`
    SELECT id, deal_id as dealId, title, link, posted_at as posted_at
    FROM posted_deals ORDER BY posted_at DESC LIMIT ?`);
  return stmt.all(limit) as PostedDeal[];
}

export function getTodayCount(): number {
  const stmt = db.prepare("SELECT count FROM daily_counts WHERE date = ?");
  const result = stmt.get(new Date().toISOString().split("T")[0]);
  return result ? (result as { count: number }).count : 0;
}
export function incrementTodayCount(): void {
  const today = new Date().toISOString().split("T")[0];
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO daily_counts (date, count) VALUES (?, (SELECT count FROM daily_counts WHERE date = ?) + 1)
  `);
  stmt.run(today, today);
}

export function resetDailyCount(): void {
  const today = new Date().toISOString().split("T")[0];
  const stmt = db.prepare(`
    UPDATE daily_counts SET count = 0, last_reset = CURRENT_TIMESTAMP WHERE date = ?
  `);
  stmt.run(today);
}

export function isPaused(): boolean {
  const stmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  const result = stmt.get("paused") as { value: string } | undefined;
  return result?.value === "true";
}

export function setPause(paused: boolean): void {
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
  );
  stmt.run("paused", paused ? "true" : "false");
}

export function getFilterSettings(): FilterSettings {
  const defaults: FilterSettings = {
    minDiscountPercent: 20,
    requireFreeShipping: true,
    maxPostsPerDay: 10,
  };
  const stmt = db.prepare("SELECT value FROM settings WHERE key = ?");
  const result = stmt.get("filters") as { value: string } | undefined;

  if (result) {
    try {
      return { ...defaults, ...JSON.parse(result.value) };
    } catch {
      return defaults;
    }
  }

  return defaults;
}

export function setFilterSettings(settings: FilterSettings): void {
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
  );
  stmt.run("filters", JSON.stringify(settings));
}

export function getLastPostedTime(): Date | null {
  const stmt = db.prepare(
    "SELECT posted_at FROM posted_deals ORDER BY posted_at DESC LIMIT 1",
  );
  const result = stmt.get() as { posted_at: Date } | undefined;
  return result?.posted_at ?? null;
}

export default db;
