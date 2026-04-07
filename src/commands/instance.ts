import { Command } from "commander";
import { UazapiClient, buildBody } from "../client.js";
import { printResponse } from "../output.js";

export function registerInstanceCommands(program: Command): void {
  const cmd = program.command("instance").description("Manage WhatsApp instance");

  cmd.command("status").description("Check connection status").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.get("/instance/status"), "Instance Status");
  });

  cmd.command("connect")
    .description("Connect to WhatsApp")
    .option("--phone <number>", "Phone for pairing code (omit for QR)")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/instance/connect", buildBody({ phone: opts.phone })), "Connect");
    });

  cmd.command("disconnect").description("Disconnect from WhatsApp").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.post("/instance/disconnect"), "Disconnect");
  });

  cmd.command("create")
    .description("Create new instance (admin)")
    .requiredOption("--name <name>", "Instance name")
    .option("--system-name <name>", "System name")
    .option("--admin-field01 <value>")
    .option("--admin-field02 <value>")
    .action(async (opts) => {
      const client = new UazapiClient(true);
      printResponse(
        await client.post("/instance/create", buildBody({
          name: opts.name,
          systemName: opts.systemName,
          adminField01: opts.adminField01,
          adminField02: opts.adminField02,
        })),
        "Create Instance",
      );
    });

  cmd.command("delete").description("Delete instance").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.delete("/instance"), "Delete Instance");
  });

  cmd.command("reset").description("Reset instance").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.post("/instance/reset"), "Reset");
  });

  cmd.command("presence")
    .description("Set presence (available/unavailable)")
    .argument("<status>", "available or unavailable")
    .action(async (status) => {
      const client = new UazapiClient();
      printResponse(await client.post("/instance/presence", { presence: status }), "Presence");
    });

  cmd.command("privacy").description("Get privacy settings").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.get("/instance/privacy"), "Privacy");
  });

  cmd.command("privacy-set")
    .description("Update privacy settings")
    .option("--groupadd <val>", "all, contacts, contact_blacklist, none")
    .option("--last <val>", "all, contacts, contact_blacklist, none")
    .option("--status <val>", "all, contacts, contact_blacklist, none")
    .option("--profile <val>", "all, contacts, contact_blacklist, none")
    .option("--readreceipts <val>", "all, none")
    .option("--online <val>", "all, match_last_seen")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/instance/privacy", buildBody(opts)), "Update Privacy");
    });

  cmd.command("all").description("List all instances (admin)").action(async () => {
    const client = new UazapiClient(true);
    printResponse(await client.get("/instance/all"), "All Instances");
  });

  cmd.command("update-name")
    .description("Update instance name")
    .requiredOption("--name <name>")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/instance/updateInstanceName", { name: opts.name }), "Update Name");
    });

  cmd.command("update-delay")
    .description("Update delay settings")
    .requiredOption("--min <ms>", "Min delay in ms", parseInt)
    .requiredOption("--max <ms>", "Max delay in ms", parseInt)
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(
        await client.post("/instance/updateDelaySettings", { msg_delay_min: opts.min, msg_delay_max: opts.max }),
        "Update Delay",
      );
    });

  cmd.command("proxy").description("Get proxy config").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.get("/instance/proxy"), "Proxy");
  });

  cmd.command("proxy-set")
    .description("Set proxy")
    .requiredOption("--enable <bool>")
    .option("--url <url>", "Proxy URL")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(
        await client.post("/instance/proxy", buildBody({ enable: opts.enable === "true", proxy_url: opts.url })),
        "Set Proxy",
      );
    });

  cmd.command("proxy-remove").description("Remove proxy").action(async () => {
    const client = new UazapiClient();
    printResponse(await client.delete("/instance/proxy"), "Remove Proxy");
  });
}
