#!/usr/bin/env node

import { Command } from "commander";
import { execSync } from "child_process";
import chalk from "chalk";

import { registerInstanceCommands } from "./commands/instance.js";
import { registerSendCommands } from "./commands/send.js";
import { registerMessageCommands } from "./commands/message.js";
import { registerChatCommands } from "./commands/chat.js";
import { registerGroupCommands } from "./commands/group.js";
import { registerContactCommands } from "./commands/contact.js";
import { registerWebhookCommands } from "./commands/webhook.js";
import {
  registerNewsletterCommands,
  registerBusinessCommands,
  registerSenderCommands,
  registerAdminCommands,
  registerLabelCommands,
  registerProfileCommands,
} from "./commands/extras.js";
import { startInteractive, runSetupWizard, loadConfig } from "./interactive.js";

const accent = chalk.hex("#0a4db1");
const dim = chalk.dim;

function getRepoDir(): string {
  const dir = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
  if (dir.endsWith("/dist")) return dir.replace(/\/dist$/, "");
  return dir;
}

function updateFromMain(): void {
  const repoDir = getRepoDir();
  console.log("");
  console.log(`  ${accent("●")} Updating uazapi-cli from ${chalk.blue("main")}...`);
  console.log(dim(`  ${repoDir}`));
  console.log("");

  try {
    execSync("git fetch origin main", { cwd: repoDir, stdio: "inherit" });

    const status = execSync("git status --porcelain", { cwd: repoDir, encoding: "utf-8" }).trim();
    if (status) {
      console.log(chalk.yellow("\n  ⚠ Local changes detected. Stashing...\n"));
      execSync("git stash", { cwd: repoDir, stdio: "inherit" });
    }

    execSync("git pull origin main", { cwd: repoDir, stdio: "inherit" });

    console.log("");
    console.log(`  ${accent("●")} Installing dependencies...`);
    console.log("");
    execSync("npm install", { cwd: repoDir, stdio: "inherit" });

    console.log("");
    console.log(`  ${accent("●")} Building...`);
    console.log("");
    execSync("npm run build", { cwd: repoDir, stdio: "inherit" });

    console.log("");
    console.log(chalk.green("  ✓ uazapi-cli updated successfully!"));
    console.log("");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`\n  ✗ Update failed: ${message}\n`));
    process.exit(1);
  }
}

function bootCommander(): void {
  const program = new Command();

  program
    .name("uazapi")
    .description("CLI tool for UAZAPI WhatsApp API")
    .version("1.0.0")
    .addHelpText("beforeAll", chalk.bold.blue("\n  UAZAPI CLI") + chalk.gray(" — WhatsApp API from the terminal\n"));

  // Setup command (so it shows in help)
  program.command("setup").description("Run interactive setup wizard").action(async () => {
    const config = loadConfig();
    await runSetupWizard(config);
  });

  program.command("menu").description("Open interactive menu").action(async () => {
    await startInteractive();
  });

  program.command("update").alias("upgrade").description("Update uazapi-cli to latest version").action(() => {
    updateFromMain();
  });

  // Register all command groups
  registerInstanceCommands(program);
  registerSendCommands(program);
  registerMessageCommands(program);
  registerChatCommands(program);
  registerGroupCommands(program);
  registerContactCommands(program);
  registerWebhookCommands(program);
  registerNewsletterCommands(program);
  registerBusinessCommands(program);
  registerSenderCommands(program);
  registerAdminCommands(program);
  registerLabelCommands(program);
  registerProfileCommands(program);

  program.parse();
}

const args = process.argv.slice(2);

// No args or "menu" → interactive mode
if (args.length === 0 || args[0] === "menu") {
  startInteractive().catch(console.error);
} else if (args[0] === "setup" || args[0] === "onboard") {
  const config = loadConfig();
  runSetupWizard(config).catch(console.error);
} else if (args[0] === "update" || args[0] === "upgrade") {
  updateFromMain();
} else {
  bootCommander();
}
