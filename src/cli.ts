#!/usr/bin/env node

import { Command } from "commander";
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
} else {
  bootCommander();
}
