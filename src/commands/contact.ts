import { Command } from "commander";
import { UazapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerContactCommands(program: Command): void {
  const cmd = program.command("contact").description("Manage contacts");

  cmd.command("list")
    .description("List contacts")
    .option("--limit <n>", "", parseInt)
    .option("--offset <n>", "", parseInt)
    .option("--name <name>", "Filter by name")
    .option("--chat-id <id>")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({ limit: opts.limit, offset: opts.offset, name: opts.name, wa_chatid: opts.chatId });
      if (Object.keys(body).length) {
        printResponse(await client.post("/contacts/list", body), "Contacts");
      } else {
        printResponse(await client.get("/contacts"), "Contacts");
      }
    });

  cmd.command("add")
    .description("Add contacts")
    .requiredOption("--numbers <json>", 'JSON array e.g. \'["5511999999999"]\'')
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/contact/add", { numbers: parseJsonArg(opts.numbers) }), "Add Contacts");
    });

  cmd.command("remove")
    .description("Remove contacts")
    .requiredOption("--numbers <json>", 'JSON array')
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/contact/remove", { numbers: parseJsonArg(opts.numbers) }), "Remove Contacts");
    });
}
