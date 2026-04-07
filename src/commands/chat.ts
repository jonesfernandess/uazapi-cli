import { Command } from "commander";
import { UazapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerChatCommands(program: Command): void {
  const cmd = program.command("chat").description("Manage chats (find, archive, block, delete, mute, pin)");

  cmd.command("find")
    .description("Search chats with filters")
    .option("--limit <n>", "", parseInt)
    .option("--offset <n>", "", parseInt)
    .option("--sort <field>", "e.g. -wa_lastMsgTimestamp")
    .option("--chat-id <id>", "Filter by chat ID")
    .option("--name <name>", "Filter by name")
    .option("--is-group", "Filter groups only")
    .option("--archived", "Filter archived")
    .option("--pinned", "Filter pinned")
    .option("--blocked", "Filter blocked")
    .option("--label <id>", "Filter by label")
    .option("--lead-status <status>")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        limit: opts.limit,
        offset: opts.offset,
        sort: opts.sort,
        wa_chatid: opts.chatId,
        name: opts.name,
        wa_isGroup: opts.isGroup,
        wa_archived: opts.archived,
        wa_isPinned: opts.pinned,
        wa_isBlocked: opts.blocked,
        wa_label: opts.label,
        lead_status: opts.leadStatus,
      });
      printResponse(await client.post("/chat/find", body), "Chats");
    });

  cmd.command("details")
    .description("Get chat details")
    .requiredOption("--number <number>")
    .option("--preview", "Include message preview")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/chat/details", buildBody({ number: opts.number, preview: opts.preview })), "Chat Details");
    });

  cmd.command("archive")
    .description("Archive/unarchive a chat")
    .requiredOption("--number <number>")
    .requiredOption("--value <bool>", "true to archive, false to unarchive")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/chat/archive", { number: opts.number, archive: opts.value === "true" }), "Archive");
    });

  cmd.command("block")
    .description("Block/unblock a contact")
    .requiredOption("--number <number>")
    .requiredOption("--value <bool>", "true to block, false to unblock")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/chat/block", { number: opts.number, block: opts.value === "true" }), "Block");
    });

  cmd.command("blocklist").description("List blocked contacts").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.get("/chat/blocklist"), "Blocked");
  });

  cmd.command("delete")
    .description("Delete a chat")
    .requiredOption("--number <number>")
    .option("--delete-db", "Delete from database")
    .option("--delete-messages-db", "Delete messages from DB")
    .option("--delete-wa", "Delete from WhatsApp")
    .option("--clear-wa", "Clear chat on WhatsApp")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        number: opts.number,
        deleteChatDB: opts.deleteDb,
        deleteMessagesDB: opts.deleteMessagesDb,
        deleteChatWhatsApp: opts.deleteWa,
        clearChatWhatsApp: opts.clearWa,
      });
      printResponse(await client.post("/chat/delete", body), "Delete Chat");
    });

  cmd.command("mute")
    .description("Mute/unmute a chat")
    .requiredOption("--number <number>")
    .requiredOption("--until <timestamp>", "Unix timestamp (0=unmute, -1=forever)", parseInt)
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/chat/mute", { number: opts.number, muteEndTime: opts.until }), "Mute");
    });

  cmd.command("pin")
    .description("Pin/unpin a chat")
    .requiredOption("--number <number>")
    .requiredOption("--value <bool>", "true to pin, false to unpin")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/chat/pin", { number: opts.number, pin: opts.value === "true" }), "Pin");
    });

  cmd.command("read")
    .description("Mark chat as read/unread")
    .requiredOption("--number <number>")
    .requiredOption("--value <bool>", "true=read, false=unread")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/chat/read", { number: opts.number, read: opts.value === "true" }), "Read");
    });

  cmd.command("labels")
    .description("Manage chat labels")
    .requiredOption("--number <number>")
    .option("--label-ids <json>", "Set all labels (JSON array)")
    .option("--add-label <id>", "Add label")
    .option("--remove-label <id>", "Remove label")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body: Record<string, unknown> = { number: opts.number };
      if (opts.labelIds) body["labelids"] = parseJsonArg(opts.labelIds);
      if (opts.addLabel) body["add_labelid"] = opts.addLabel;
      if (opts.removeLabel) body["remove_labelid"] = opts.removeLabel;
      printResponse(await client.post("/chat/labels", body), "Labels");
    });

  cmd.command("check")
    .description("Check if numbers are on WhatsApp")
    .requiredOption("--numbers <json>", 'JSON array e.g. \'["5511999999999"]\'')
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/chat/check", { numbers: parseJsonArg(opts.numbers) }), "Check Numbers");
    });

  cmd.command("edit-lead")
    .description("Edit lead info for a chat")
    .requiredOption("--id <id>", "Lead/chat ID")
    .option("--name <name>")
    .option("--email <email>")
    .option("--status <status>")
    .option("--notes <notes>")
    .option("--tags <json>", "Tags JSON array")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body: Record<string, unknown> = { id: opts.id };
      if (opts.name) body["lead_name"] = opts.name;
      if (opts.email) body["lead_email"] = opts.email;
      if (opts.status) body["lead_status"] = opts.status;
      if (opts.notes) body["lead_notes"] = opts.notes;
      if (opts.tags) body["lead_tags"] = parseJsonArg(opts.tags);
      printResponse(await client.post("/chat/editLead", body), "Edit Lead");
    });
}
