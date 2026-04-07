import { Command } from "commander";
import { UazapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerGroupCommands(program: Command): void {
  const cmd = program.command("group").description("Manage WhatsApp groups");

  cmd.command("list")
    .description("List all groups")
    .option("--participants", "Include participant list")
    .action(async (opts) => {
      const client = new UazapiClient();
      if (opts.participants) {
        printResponse(await client.post("/group/list", { getParticipants: true }), "Groups");
      } else {
        printResponse(await client.get("/group/list"), "Groups");
      }
    });

  cmd.command("info")
    .description("Get group info")
    .requiredOption("--id <jid>", "Group JID")
    .option("--participants", "Include participants")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(
        await client.post("/group/info", buildBody({ groupJid: opts.id, getParticipants: opts.participants })),
        "Group Info",
      );
    });

  cmd.command("create")
    .description("Create a new group")
    .requiredOption("--name <name>")
    .requiredOption("--participants <json>", 'JSON array of numbers')
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(
        await client.post("/group/create", { name: opts.name, participants: parseJsonArg(opts.participants) }),
        "Create Group",
      );
    });

  cmd.command("join")
    .description("Join via invite link/code")
    .requiredOption("--code <code>", "Invite code or full link")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/group/join", { inviteCode: opts.code }), "Join Group");
    });

  cmd.command("leave")
    .description("Leave a group")
    .requiredOption("--id <jid>")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/group/leave", { groupJid: opts.id }), "Leave Group");
    });

  cmd.command("invite-info")
    .description("Get invite link info")
    .requiredOption("--code <code>")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/group/inviteInfo", { inviteCode: opts.code }), "Invite Info");
    });

  cmd.command("reset-invite")
    .description("Reset invite code")
    .requiredOption("--id <jid>")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/group/resetInviteCode", { groupJid: opts.id }), "Reset Invite");
    });

  cmd.command("update-name")
    .requiredOption("--id <jid>")
    .requiredOption("--name <name>")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/group/updateName", { groupJid: opts.id, name: opts.name }), "Update Name");
    });

  cmd.command("update-description")
    .requiredOption("--id <jid>")
    .requiredOption("--description <text>")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(
        await client.post("/group/updateDescription", { groupJid: opts.id, description: opts.description }),
        "Update Description",
      );
    });

  cmd.command("update-image")
    .requiredOption("--id <jid>")
    .requiredOption("--image <url>", "Image URL or base64")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(await client.post("/group/updateImage", { groupJid: opts.id, image: opts.image }), "Update Image");
    });

  cmd.command("update-participants")
    .description("Add/remove/promote/demote participants")
    .requiredOption("--id <jid>")
    .requiredOption("--action <action>", "add, remove, promote, demote")
    .requiredOption("--participants <json>", "JSON array of numbers")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(
        await client.post("/group/updateParticipants", {
          groupJid: opts.id,
          action: opts.action,
          participants: parseJsonArg(opts.participants),
        }),
        "Update Participants",
      );
    });

  cmd.command("update-announce")
    .requiredOption("--id <jid>")
    .requiredOption("--value <bool>", "true = only admins send")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(
        await client.post("/group/updateAnnounce", { groupJid: opts.id, announce: opts.value === "true" }),
        "Update Announce",
      );
    });

  cmd.command("update-locked")
    .requiredOption("--id <jid>")
    .requiredOption("--value <bool>", "true = only admins edit info")
    .action(async (opts) => {
      const client = new UazapiClient();
      printResponse(
        await client.post("/group/updateLocked", { groupJid: opts.id, locked: opts.value === "true" }),
        "Update Locked",
      );
    });
}
