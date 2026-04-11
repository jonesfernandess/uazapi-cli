import { Command } from "commander";
import { UazapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerMessageCommands(program: Command): void {
  const cmd = program.command("message").description("Manage messages (find, delete, download, edit, react)");

  cmd.command("find")
    .description("Search messages in a chat")
    .option("--chat-id <id>", "Chat ID")
    .option("--id <id>", "Specific message ID")
    .option("--track-source <src>", "Filter by tracking source")
    .option("--track-id <id>", "Filter by tracking ID")
    .option("--limit <n>", "Max results", parseInt)
    .option("--offset <n>", "Pagination offset", parseInt)
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        chatid: opts.chatId,
        id: opts.id,
        track_source: opts.trackSource,
        track_id: opts.trackId,
        limit: opts.limit,
        offset: opts.offset,
      });
      printResponse(await client.post("/message/find", body), "Messages");
    });

  cmd.command("delete")
    .description("Delete a message for everyone")
    .requiredOption("--id <id>", "Message ID")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/message/delete", { id: opts.id }), "Delete Message");
    });

  cmd.command("download")
    .description("Download file from a message")
    .requiredOption("--id <id>", "Message ID")
    .option("--base64", "Return as base64")
    .option("--mp3", "Convert audio to MP3")
    .option("--link", "Return public URL")
    .option("--transcribe", "Transcribe audio")
    .option("--openai-key <key>", "OpenAI key for transcription")
    .option("--quoted", "Download from quoted message")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        id: opts.id,
        return_base64: opts.base64,
        generate_mp3: opts.mp3,
        return_link: opts.link,
        transcribe: opts.transcribe,
        openai_apikey: opts.openaiKey,
        download_quoted: opts.quoted,
      });
      printResponse(await client.post("/message/download", body), "Download");
    });

  cmd.command("edit")
    .description("Edit a sent message")
    .requiredOption("--id <id>", "Message ID")
    .requiredOption("--text <text>", "New text")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/message/edit", { id: opts.id, text: opts.text }), "Edit Message");
    });

  cmd.command("react")
    .description("React to a message with an emoji")
    .requiredOption("--number <number>", "Chat number")
    .requiredOption("--id <id>", "Message ID")
    .requiredOption("--emoji <emoji>", "Reaction emoji (empty to remove)")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(
        await client.post("/message/react", { number: opts.number, id: opts.id, text: opts.emoji }),
        "React",
      );
    });

  cmd.command("read")
    .description("Mark messages as read")
    .requiredOption("--ids <json>", 'JSON array of message IDs')
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/message/markread", { id: parseJsonArg(opts.ids) }), "Mark Read");
    });

  cmd.command("presence")
    .description("Send presence (typing, recording)")
    .requiredOption("--number <number>")
    .requiredOption("--type <type>", "composing, recording, paused")
    .option("--delay <ms>", "Duration in ms", parseInt)
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({ number: opts.number, presence: opts.type, delay: opts.delay });
      printResponse(await client.post("/message/presence", body), "Presence");
    });

  cmd.command("async-list").description("List async message queue").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.get("/message/async"), "Async Queue");
  });

  cmd.command("async-clear").description("Clear async queue").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.delete("/message/async"), "Clear Queue");
  });

  cmd.command("pin")
    .description("Pin or unpin a message in a chat")
    .requiredOption("--id <id>", "Message ID to pin/unpin")
    .requiredOption("--duration <days>", "Pin duration in days: 1, 7 or 30 (use 0 to unpin)", parseInt)
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/message/pin", { id: opts.id, duration: opts.duration }), "Pin Message");
    });
}
