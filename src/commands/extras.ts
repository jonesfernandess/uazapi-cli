import { Command } from "commander";
import { UazapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

// Newsletter, Business, Sender, Admin, Label, Profile — combined for conciseness

export function registerNewsletterCommands(program: Command): void {
  const cmd = program.command("newsletter").description("Manage WhatsApp Channels/Newsletters");

  cmd.command("list").action(async () => {
    printResponse(await new UazapiClient().get("/newsletter/list"), "Newsletters");
  });

  cmd.command("info").requiredOption("--id <jid>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/newsletter/info", { newsletterJid: opts.id }), "Newsletter Info");
  });

  cmd.command("create").requiredOption("--name <name>").option("--description <text>").action(async (opts) => {
    printResponse(
      await new UazapiClient().post("/newsletter/create", buildBody({ name: opts.name, description: opts.description })),
      "Create Newsletter",
    );
  });

  cmd.command("delete").requiredOption("--id <jid>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/newsletter/delete", { newsletterJid: opts.id }), "Delete");
  });

  cmd.command("follow").requiredOption("--id <jid>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/newsletter/follow", { newsletterJid: opts.id }), "Follow");
  });

  cmd.command("unfollow").requiredOption("--id <jid>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/newsletter/unfollow", { newsletterJid: opts.id }), "Unfollow");
  });

  cmd.command("mute").requiredOption("--id <jid>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/newsletter/mute", { newsletterJid: opts.id }), "Mute");
  });

  cmd.command("unmute").requiredOption("--id <jid>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/newsletter/unmute", { newsletterJid: opts.id }), "Unmute");
  });

  cmd.command("messages").requiredOption("--id <jid>").option("--count <n>", "", parseInt).action(async (opts) => {
    printResponse(
      await new UazapiClient().post("/newsletter/messages", buildBody({ newsletterJid: opts.id, count: opts.count })),
      "Messages",
    );
  });

  cmd.command("search").requiredOption("--query <q>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/newsletter/search", { query: opts.query }), "Search");
  });

  cmd.command("update-name").requiredOption("--id <jid>").requiredOption("--name <name>").action(async (opts) => {
    printResponse(
      await new UazapiClient().post("/newsletter/name", { newsletterJid: opts.id, name: opts.name }),
      "Update Name",
    );
  });

  cmd.command("update-description").requiredOption("--id <jid>").requiredOption("--description <text>").action(async (opts) => {
    printResponse(
      await new UazapiClient().post("/newsletter/description", { newsletterJid: opts.id, description: opts.description }),
      "Update Description",
    );
  });

  cmd.command("update-picture").requiredOption("--id <jid>").requiredOption("--image <url>").action(async (opts) => {
    printResponse(
      await new UazapiClient().post("/newsletter/picture", { newsletterJid: opts.id, image: opts.image }),
      "Update Picture",
    );
  });
}

export function registerBusinessCommands(program: Command): void {
  const cmd = program.command("business").description("Business profile and catalog");

  cmd.command("profile").option("--number <number>").action(async (opts) => {
    printResponse(
      await new UazapiClient().post("/business/get/profile", opts.number ? { number: opts.number } : {}),
      "Business Profile",
    );
  });

  cmd.command("update-profile")
    .option("--description <text>")
    .option("--address <addr>")
    .option("--email <email>")
    .option("--website <url>")
    .option("--category <cat>")
    .action(async (opts) => {
      const body = buildBody(opts);
      printResponse(await new UazapiClient().post("/business/update/profile", body), "Update Profile");
    });

  cmd.command("categories").action(async () => {
    printResponse(await new UazapiClient().get("/business/get/categories"), "Categories");
  });

  cmd.command("catalog-list").option("--number <number>").option("--limit <n>", "", parseInt).option("--offset <n>", "", parseInt)
    .action(async (opts) => {
      printResponse(
        await new UazapiClient().post("/business/catalog/list", buildBody({ number: opts.number, limit: opts.limit, offset: opts.offset })),
        "Catalog",
      );
    });

  cmd.command("catalog-info").requiredOption("--id <productId>").option("--number <number>").action(async (opts) => {
    printResponse(
      await new UazapiClient().post("/business/catalog/info", buildBody({ productId: opts.id, number: opts.number })),
      "Product Info",
    );
  });

  cmd.command("catalog-hide").requiredOption("--ids <json>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/business/catalog/hide", { productIds: parseJsonArg(opts.ids) }), "Hide");
  });

  cmd.command("catalog-show").requiredOption("--ids <json>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/business/catalog/show", { productIds: parseJsonArg(opts.ids) }), "Show");
  });

  cmd.command("catalog-delete").requiredOption("--ids <json>").action(async (opts) => {
    printResponse(await new UazapiClient().post("/business/catalog/delete", { productIds: parseJsonArg(opts.ids) }), "Delete");
  });
}

export function registerSenderCommands(program: Command): void {
  const cmd = program.command("sender").description("Mass messaging / sender");

  cmd.command("simple")
    .description("Start a simple mass send")
    .requiredOption("--numbers <json>", "JSON array of numbers")
    .requiredOption("--message <json>", "Message object JSON")
    .option("--name <name>", "Campaign name")
    .action(async (opts) => {
      const body = buildBody({
        numbers: parseJsonArg(opts.numbers),
        message: parseJsonArg(opts.message),
        name: opts.name,
      });
      printResponse(await new UazapiClient().post("/sender/simple", body), "Simple Send");
    });

  cmd.command("advanced")
    .description("Start advanced mass send")
    .requiredOption("--config <json>", "Full config JSON")
    .action(async (opts) => {
      printResponse(
        await new UazapiClient().post("/sender/advanced", parseJsonArg(opts.config) as Record<string, unknown>),
        "Advanced Send",
      );
    });

  cmd.command("list-messages")
    .description("List messages of a send job")
    .requiredOption("--id <id>", "Sender job ID")
    .option("--limit <n>", "", parseInt)
    .option("--offset <n>", "", parseInt)
    .action(async (opts) => {
      printResponse(
        await new UazapiClient().post("/sender/listmessages", buildBody({ id: opts.id, limit: opts.limit, offset: opts.offset })),
        "Sender Messages",
      );
    });

  cmd.command("list-folders").description("List sender folders").action(async () => {
    printResponse(await new UazapiClient().get("/sender/listfolders"), "Folders");
  });

  cmd.command("clear-all").description("Clear all send jobs").action(async () => {
    printResponse(await new UazapiClient().delete("/sender/clearall"), "Clear All");
  });

  cmd.command("clear-done").description("Clear completed jobs").action(async () => {
    printResponse(await new UazapiClient().post("/sender/cleardone"), "Clear Done");
  });
}

export function registerAdminCommands(program: Command): void {
  const cmd = program.command("admin").description("Admin operations");

  cmd.command("restart").description("Restart UAZAPI server").action(async () => {
    printResponse(await new UazapiClient(true).post("/admin/restart"), "Restart");
  });

  cmd.command("instances").description("List all instances").action(async () => {
    printResponse(await new UazapiClient(true).get("/instance/all"), "Instances");
  });
}

export function registerLabelCommands(program: Command): void {
  const cmd = program.command("label").description("Manage labels");

  cmd.command("list").description("List all labels").action(async () => {
    printResponse(await new UazapiClient().get("/labels"), "Labels");
  });

  cmd.command("edit")
    .description("Create or edit a label")
    .requiredOption("--name <name>", "Label name")
    .option("--color <n>", "Color index", parseInt)
    .option("--id <id>", "Label ID (for editing)")
    .action(async (opts) => {
      printResponse(
        await new UazapiClient().post("/label/edit", buildBody({ name: opts.name, color: opts.color, id: opts.id })),
        "Edit Label",
      );
    });
}

export function registerProfileCommands(program: Command): void {
  const cmd = program.command("profile").description("Manage WhatsApp profile");

  cmd.command("image")
    .description("Update profile picture")
    .requiredOption("--image <url>", "Image URL or base64")
    .action(async (opts) => {
      printResponse(await new UazapiClient().post("/profile/image", { image: opts.image }), "Update Image");
    });

  cmd.command("name")
    .description("Update profile name")
    .requiredOption("--name <name>")
    .action(async (opts) => {
      printResponse(await new UazapiClient().post("/profile/name", { name: opts.name }), "Update Name");
    });
}
