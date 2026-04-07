import { Command } from "commander";
import { UazapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerWebhookCommands(program: Command): void {
  const cmd = program.command("webhook").description("Manage webhooks");

  cmd.command("get").description("Get webhook config").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.get("/webhook"), "Webhook");
  });

  cmd.command("set")
    .description("Set webhook")
    .requiredOption("--url <url>")
    .requiredOption("--events <json>", 'JSON array e.g. \'["messages","connection"]\'')
    .option("--enabled", "Enable", true)
    .option("--add-url-events", "Append event name to URL")
    .option("--add-url-types", "Append message type to URL")
    .option("--exclude <json>", "Exclude filters JSON array")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        url: opts.url,
        events: parseJsonArg(opts.events),
        enabled: opts.enabled,
        addUrlEvents: opts.addUrlEvents,
        addUrlTypesMessages: opts.addUrlTypes,
      });
      if (opts.exclude) (body as Record<string, unknown>)["excludeMessages"] = parseJsonArg(opts.exclude);
      printResponse(await client.post("/webhook", body), "Set Webhook");
    });

  cmd.command("errors").description("List webhook errors").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.get("/webhook/errors"), "Webhook Errors");
  });

  cmd.command("global-get").description("Get global webhook (admin)").action(async () => {
    const client = new UazapiClient(true);
    printResponse(await client.get("/globalwebhook"), "Global Webhook");
  });

  cmd.command("global-set")
    .description("Set global webhook (admin)")
    .requiredOption("--url <url>")
    .requiredOption("--events <json>")
    .option("--enabled", "", true)
    .action(async (opts) => {
      const client = new UazapiClient(true);
      printResponse(
        await client.post("/globalwebhook", { url: opts.url, events: parseJsonArg(opts.events), enabled: opts.enabled }),
        "Set Global Webhook",
      );
    });

  cmd.command("global-errors").description("Global webhook errors (admin)").action(async () => {
    const client = new UazapiClient(true);
    printResponse(await client.get("/globalwebhook/errors"), "Global Webhook Errors");
  });
}
