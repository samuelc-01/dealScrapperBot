import { appendFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const LOG_DIR = "./logs";
const LOG_FILE = path.join(LOG_DIR, "bot.log");

function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
  }
}

function format(level: string, message: string): string {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}\n`;
}

export function info(message: string): void {
  ensureLogDir();
  const line = format("INFO", message);
  console.log(line.trim());
  appendFileSync(LOG_FILE, line);
}

export function warn(message: string): void {
  ensureLogDir();
  const line = format("WARN", message);
  console.warn(line.trim());
  appendFileSync(LOG_FILE, line);
}

export function error(message: string, err?: unknown): void {
  ensureLogDir();
  const errorDetail = err instanceof Error ? ` — ${err.message}` : "";
  const line = format("ERROR", message + errorDetail);
  console.error(line.trim());
  appendFileSync(LOG_FILE, line);
}
