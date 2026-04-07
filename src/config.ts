import { config } from "dotenv";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import chalk from "chalk";

const CONFIG_DIR = join(homedir(), ".uazapi-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

// Load .env from: CWD → project root → ~/.uazapi-cli/
const envPaths = [
  join(process.cwd(), ".env"),
  join(import.meta.dirname, "..", ".env"),
  join(CONFIG_DIR, ".env"),
];

for (const p of envPaths) {
  if (existsSync(p)) {
    config({ path: p });
    break;
  }
}

// Also load from config.json if env vars are not set
function loadFromConfigJson(): void {
  if (!existsSync(CONFIG_FILE)) return;
  try {
    const data = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    if (data.baseUrl && !process.env["UAZAPI_BASE_URL"]) {
      process.env["UAZAPI_BASE_URL"] = data.baseUrl;
    }
    if (data.token && !process.env["UAZAPI_TOKEN"]) {
      process.env["UAZAPI_TOKEN"] = data.token;
    }
    if (data.adminToken && !process.env["UAZAPI_ADMIN_TOKEN"]) {
      process.env["UAZAPI_ADMIN_TOKEN"] = data.adminToken;
    }
  } catch {
    // ignore
  }
}

loadFromConfigJson();

function missingConfigHint(): string {
  return chalk.dim(`\nRun ${chalk.bold("uazapi setup")} to configure interactively.`);
}

export function getBaseUrl(): string {
  const url = process.env["UAZAPI_BASE_URL"];
  if (!url) {
    console.error(chalk.red("Error: UAZAPI_BASE_URL not set.") + missingConfigHint());
    process.exit(1);
  }
  return url.replace(/\/$/, "");
}

export function getToken(): string {
  const token = process.env["UAZAPI_TOKEN"];
  if (!token) {
    console.error(chalk.red("Error: UAZAPI_TOKEN not set.") + missingConfigHint());
    process.exit(1);
  }
  return token;
}

export function getAdminToken(): string {
  const token = process.env["UAZAPI_ADMIN_TOKEN"];
  if (!token) {
    console.error(chalk.red("Error: UAZAPI_ADMIN_TOKEN not set. Required for admin endpoints.") + missingConfigHint());
    process.exit(1);
  }
  return token;
}
