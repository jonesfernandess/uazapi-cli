import { Command } from "commander";
import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Tool = "cursor" | "copilot" | "windsurf" | "cline" | "claude" | "codex" | "gemini" | "opencode";

export const TOOLS: Record<Tool, string> = {
  cursor:   "Cursor",
  copilot:  "GitHub Copilot",
  windsurf: "Windsurf",
  cline:    "Cline",
  claude:   "Claude Code",
  codex:    "Codex CLI (OpenAI)",
  gemini:   "Gemini CLI (Google)",
  opencode: "OpenCode",
};

// ─── Skill loading ────────────────────────────────────────────────────────────

export function skillsDir(): string {
  const dir = dirname(fileURLToPath(import.meta.url));
  return resolve(dir, "../../skills");
}

export function readSkill(name: string): string {
  const path = resolve(skillsDir(), name, "SKILL.md");
  return readFileSync(path, "utf-8");
}

/** Strips YAML frontmatter (--- ... ---) from skill content. */
export function stripFrontmatter(content: string): string {
  if (!content.startsWith("---")) return content;
  const end = content.indexOf("\n---", 4);
  if (end === -1) return content;
  return content.slice(end + 4).trimStart();
}

// ─── File helpers ─────────────────────────────────────────────────────────────

const SENTINEL = "<!-- uazapi-skills -->";

function hasSentinel(path: string): boolean {
  if (!existsSync(path)) return false;
  return readFileSync(path, "utf-8").includes(SENTINEL);
}

/** Returns true if the skill is already installed for the given tool in cwd. */
export function isToolInstalled(tool: Tool): boolean {
  switch (tool) {
    case "cursor":   return existsSync(".cursor/rules/uazapi-api.mdc");
    case "windsurf": return existsSync(".windsurf/rules/uazapi-api.md");
    case "cline":    return existsSync(".clinerules/uazapi-api.md");
    case "copilot":  return hasSentinel(".github/copilot-instructions.md");
    case "claude":   return hasSentinel("CLAUDE.md");
    case "codex":    return hasSentinel("AGENTS.md");
    case "opencode": return hasSentinel("AGENTS.md");
    case "gemini":   return hasSentinel("GEMINI.md");
  }
}

function ensureDir(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function write(path: string, content: string): void {
  writeFileSync(path, content, "utf-8");
  console.log(`  ${chalk.green("✓")} ${chalk.dim(path)}`);
}

/**
 * Appends content to a file, but only if the UAZAPI sentinel is not already
 * present — prevents duplicates when multiple tools share the same file (e.g.
 * AGENTS.md is used by both Codex and OpenCode).
 */
function appendOnce(path: string, content: string): void {
  const exists = existsSync(path);
  if (exists && readFileSync(path, "utf-8").includes(SENTINEL)) {
    console.log(`  ${chalk.dim("–")} ${chalk.dim(path)} ${chalk.dim("(already installed, skipped)")}`);
    return;
  }
  appendFileSync(path, (exists ? "\n\n" : "") + SENTINEL + "\n\n" + content, "utf-8");
  console.log(`  ${chalk.green("✓")} ${chalk.dim(path)} ${exists ? chalk.dim("(updated)") : chalk.dim("(created)")}`);
}

function warn(msg: string): void {
  console.log(`  ${chalk.yellow("⚠")} ${chalk.yellow(msg)}`);
}

// ─── Installers ───────────────────────────────────────────────────────────────

function installCursor(api: string, cli: string): void {
  ensureDir(".cursor/rules");

  const header = (desc: string) => `---\ndescription: "${desc}"\nalwaysApply: false\n---\n\n`;

  write(
    ".cursor/rules/uazapi-api.mdc",
    header("UAZAPI REST API reference — endpoint contracts, request/response shapes, ID formats") + api
  );
  write(
    ".cursor/rules/uazapi-cli.mdc",
    header("uazapi-cli commands — send messages, manage instances, groups, webhooks from terminal") + cli
  );

  console.log(chalk.dim("\n  Tip: attach rules manually in Cursor, or set alwaysApply: true to load on every chat."));
}

function installCopilot(api: string, cli: string): void {
  ensureDir(".github");
  const content =
    `# UAZAPI CLI Reference\n\n` + cli +
    `\n\n---\n\n` +
    `# UAZAPI REST API Reference\n\n` + api;

  appendOnce(".github/copilot-instructions.md", content);
  warn("Copilot Code Review has a ~4KB limit. The full reference works in Copilot Chat.");
}

function installWindsurf(api: string, cli: string): void {
  ensureDir(".windsurf/rules");

  write(".windsurf/rules/uazapi-cli.md", cli);
  write(".windsurf/rules/uazapi-api.md", api);

  const apiKb = Math.round(Buffer.byteLength(api, "utf-8") / 1024);
  const cliKb = Math.round(Buffer.byteLength(cli, "utf-8") / 1024);
  const totalKb = apiKb + cliKb;

  if (apiKb > 6 || cliKb > 6)
    warn(`Windsurf has a 6KB per-file limit (uazapi-api: ~${apiKb}KB, uazapi-cli: ~${cliKb}KB). Content may be truncated.`);
  if (totalKb > 12)
    warn(`Windsurf has a 12KB total rules limit (~${totalKb}KB). Consider keeping only uazapi-api.md.`);
}

function installCline(api: string, cli: string): void {
  ensureDir(".clinerules");
  write(".clinerules/uazapi-api.md", api);
  write(".clinerules/uazapi-cli.md", cli);
}

function installClaude(api: string, cli: string): void {
  // CLAUDE.md should stay concise (<100 lines recommended).
  // Write a lean section pointing to search-docs + key ID format rules.
  // Reference the full skill files for on-demand loading via @filename.
  void api; void cli; // full content available in skills/ directory
  const content =
`## UAZAPI WhatsApp API

This project integrates with the UAZAPI WhatsApp API.

### Endpoint lookup
Use \`uazapi search-docs\` to find any endpoint details without loading the full reference:

\`\`\`bash
uazapi search-docs "keyword"           # search endpoints + guide sections
uazapi search-docs --list              # all available tags and topics
uazapi search-docs --section "name"    # get a full guide section
uazapi search-docs "query" --pretty    # JSON output with full descriptions
\`\`\`

### Critical ID format rules
- \`number\` fields: digits only, no \`+\` — e.g. \`555193667706\`
- \`chatid\` (individual): \`555193667706@s.whatsapp.net\`
- \`groupJid\`: \`120363425061733477@g.us\`
- Message \`id\` (for reply/react/delete): \`owner:messageid\` format

### Full references (load on demand)
- REST API contracts: \`skills/uazapi-api/SKILL.md\`
- CLI commands: \`skills/uazapi-cli/SKILL.md\`
`;

  appendOnce("CLAUDE.md", content);
  console.log(chalk.dim("\n  Full skill files: skills/uazapi-api/SKILL.md and skills/uazapi-cli/SKILL.md"));
  console.log(chalk.dim("  Reference them in chat with @skills/uazapi-api/SKILL.md"));
}

function installAgentsMd(api: string, cli: string, tool: string): void {
  // Codex CLI and OpenCode both use AGENTS.md.
  // Running both installers is safe — appendOnce prevents duplicates.
  const content =
    `# UAZAPI REST API Reference\n\n` + api +
    `\n\n---\n\n` +
    `# UAZAPI CLI Reference\n\n` + cli;

  appendOnce("AGENTS.md", content);

  if (tool === "codex") {
    const totalKb = Math.round(Buffer.byteLength(content, "utf-8") / 1024);
    if (totalKb > 32)
      warn(`Codex CLI has a 32KB limit for AGENTS.md (~${totalKb}KB). Content may be partially ignored.`);
  }
}

function installGemini(api: string, cli: string): void {
  const content =
    `# UAZAPI REST API Reference\n\n` + api +
    `\n\n---\n\n` +
    `# UAZAPI CLI Reference\n\n` + cli;

  appendOnce("GEMINI.md", content);
  console.log(chalk.dim("\n  Run /memory refresh in Gemini CLI to reload the context."));
}

// ─── Public installer ─────────────────────────────────────────────────────────

/** Installs skills for a single tool. Prints progress to stdout. */
export function installForTool(target: Tool): void {
  const api = stripFrontmatter(readSkill("uazapi-api"));
  const cli = stripFrontmatter(readSkill("uazapi-cli"));
  switch (target) {
    case "cursor":   installCursor(api, cli); break;
    case "copilot":  installCopilot(api, cli); break;
    case "windsurf": installWindsurf(api, cli); break;
    case "cline":    installCline(api, cli); break;
    case "claude":   installClaude(api, cli); break;
    case "codex":    installAgentsMd(api, cli, "codex"); break;
    case "opencode": installAgentsMd(api, cli, "opencode"); break;
    case "gemini":   installGemini(api, cli); break;
  }
}

// ─── Command registration ─────────────────────────────────────────────────────

export function registerInstallSkillsCommand(program: Command): void {
  program
    .command("install-skills")
    .description(
      "Install UAZAPI skills in your AI coding tool " +
      "(Cursor, Copilot, Windsurf, Cline, Claude Code, Codex CLI, Gemini CLI, OpenCode)"
    )
    .argument("[tool]", `Tool to install for: ${Object.keys(TOOLS).join(" | ")} | all`)
    .action((tool: string | undefined) => {
      const validTools = [...Object.keys(TOOLS), "all"];

      if (!tool || !validTools.includes(tool)) {
        console.log(chalk.bold("\nUsage: uazapi install-skills <tool>\n"));
        console.log("Available tools:\n");
        for (const [key, name] of Object.entries(TOOLS)) {
          console.log(`  ${chalk.cyan(key.padEnd(10))} ${name}`);
        }
        console.log(`  ${"all".padEnd(10)} Install for all tools`);
        console.log();
        process.exit(tool ? 1 : 0);
      }

      const targets: Tool[] = tool === "all" ? (Object.keys(TOOLS) as Tool[]) : [tool as Tool];

      const api = stripFrontmatter(readSkill("uazapi-api"));
      const cli = stripFrontmatter(readSkill("uazapi-cli"));

      for (const target of targets) {
        console.log(chalk.bold(`\nInstalling for ${TOOLS[target]}...\n`));
        try {
          installForTool(target);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(chalk.red(`  ✗ Failed: ${msg}`));
        }
      }

      console.log(chalk.green("\nDone.\n"));
    });
}
