import { Command } from "commander";
import { UazapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerSendCommands(program: Command): void {
  const cmd = program.command("send").description("Send messages (text, media, location, contact, etc.)");

  cmd.command("text")
    .description("Send a text message")
    .requiredOption("--number <number>", "Recipient number")
    .requiredOption("--text <text>", "Message text")
    .option("--link-preview", "Enable link preview")
    .option("--reply-id <id>", "Message ID to reply to")
    .option("--mentions <numbers>", "Comma-separated numbers to mention")
    .option("--delay <ms>", "Delay before sending (shows typing)", parseInt)
    .option("--async", "Send asynchronously")
    .option("--read-chat", "Mark chat as read")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        number: opts.number,
        text: opts.text,
        linkPreview: opts.linkPreview,
        replyid: opts.replyId,
        mentions: opts.mentions,
        delay: opts.delay,
        async: opts.async,
        readchat: opts.readChat,
      });
      printResponse(await client.post("/send/text", body), "Send Text");
    });

  cmd.command("media")
    .description("Send media (image, video, audio, document, sticker)")
    .requiredOption("--number <number>", "Recipient number")
    .requiredOption("--type <type>", "image, video, document, audio, ptt, sticker")
    .requiredOption("--file <url>", "URL or base64 of the file")
    .option("--caption <text>", "Caption text")
    .option("--doc-name <name>", "Filename for documents")
    .option("--thumbnail <url>", "Thumbnail URL/base64")
    .option("--mimetype <type>", "MIME type")
    .option("--reply-id <id>", "Message ID to reply to")
    .option("--delay <ms>", "Delay in ms", parseInt)
    .option("--async", "Send asynchronously")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        number: opts.number,
        type: opts.type,
        file: opts.file,
        text: opts.caption,
        docName: opts.docName,
        thumbnail: opts.thumbnail,
        mimetype: opts.mimetype,
        replyid: opts.replyId,
        delay: opts.delay,
        async: opts.async,
      });
      printResponse(await client.post("/send/media", body), "Send Media");
    });

  cmd.command("location")
    .description("Send a geographic location")
    .requiredOption("--number <number>", "Recipient number")
    .requiredOption("--lat <lat>", "Latitude", parseFloat)
    .requiredOption("--lon <lon>", "Longitude", parseFloat)
    .option("--name <name>", "Location name")
    .option("--address <addr>", "Location address")
    .option("--reply-id <id>")
    .option("--delay <ms>", "", parseInt)
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        number: opts.number,
        latitude: opts.lat,
        longitude: opts.lon,
        name: opts.name,
        address: opts.address,
        replyid: opts.replyId,
        delay: opts.delay,
      });
      printResponse(await client.post("/send/location", body), "Send Location");
    });

  cmd.command("contact")
    .description("Send a contact card (vCard)")
    .requiredOption("--number <number>", "Recipient number")
    .requiredOption("--full-name <name>", "Contact full name")
    .requiredOption("--phone <phone>", "Contact phone (comma-separated)")
    .option("--org <org>", "Organization")
    .option("--email <email>")
    .option("--url <url>")
    .option("--reply-id <id>")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        number: opts.number,
        fullName: opts.fullName,
        phoneNumber: opts.phone,
        organization: opts.org,
        email: opts.email,
        url: opts.url,
        replyid: opts.replyId,
      });
      printResponse(await client.post("/send/contact", body), "Send Contact");
    });

  cmd.command("carousel")
    .description("Send a media carousel with buttons")
    .requiredOption("--number <number>", "Recipient number")
    .requiredOption("--text <text>", "Main message text")
    .requiredOption("--carousel <json>", "Carousel cards JSON array")
    .option("--reply-id <id>")
    .option("--delay <ms>", "", parseInt)
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        number: opts.number,
        text: opts.text,
        carousel: parseJsonArg(opts.carousel),
        replyid: opts.replyId,
        delay: opts.delay,
      });
      printResponse(await client.post("/send/carousel", body), "Send Carousel");
    });

  cmd.command("menu")
    .description("Send interactive menu (button, list, poll)")
    .requiredOption("--number <number>", "Recipient number")
    .requiredOption("--type <type>", "button, list, poll, carousel")
    .requiredOption("--text <text>", "Main message text")
    .requiredOption("--choices <json>", "Choices JSON array")
    .option("--footer <text>", "Footer text")
    .option("--list-button <text>", "List button text")
    .option("--reply-id <id>")
    .option("--delay <ms>", "", parseInt)
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        number: opts.number,
        type: opts.type,
        text: opts.text,
        choices: parseJsonArg(opts.choices),
        footerText: opts.footer,
        listButton: opts.listButton,
        replyid: opts.replyId,
        delay: opts.delay,
      });
      printResponse(await client.post("/send/menu", body), "Send Menu");
    });

  cmd.command("status")
    .description("Post a WhatsApp Story")
    .requiredOption("--type <type>", "text, image, video, audio")
    .option("--text <text>", "Text or caption")
    .option("--bg-color <code>", "Background color code", parseInt)
    .option("--font <n>", "Font style", parseInt)
    .option("--file <url>", "Media file URL/base64")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        type: opts.type,
        text: opts.text,
        background_color: opts.bgColor,
        font: opts.font,
        file: opts.file,
      });
      printResponse(await client.post("/send/status", body), "Send Status");
    });

  cmd.command("pix-button")
    .description("Send a PIX payment button")
    .requiredOption("--number <number>")
    .requiredOption("--pix-type <type>", "CPF, CNPJ, PHONE, EMAIL, EVP")
    .requiredOption("--pix-key <key>", "PIX key value")
    .option("--pix-name <name>", "Receiver name")
    .option("--reply-id <id>")
    .option("--delay <ms>", "", parseInt)
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        number: opts.number,
        pixType: opts.pixType,
        pixKey: opts.pixKey,
        pixName: opts.pixName,
        replyid: opts.replyId,
        delay: opts.delay,
      });
      printResponse(await client.post("/send/pix-button", body), "Send PIX Button");
    });

  cmd.command("location-button")
    .description("Request user location")
    .requiredOption("--number <number>")
    .requiredOption("--text <text>")
    .option("--reply-id <id>")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({ number: opts.number, text: opts.text, replyid: opts.replyId });
      printResponse(await client.post("/send/location-button", body), "Send Location Button");
    });

  cmd.command("request-payment")
    .description("Send payment request")
    .requiredOption("--number <number>")
    .requiredOption("--amount <value>", "Amount in BRL", parseFloat)
    .option("--title <text>", "Header title")
    .option("--text <text>", "Body text")
    .option("--footer <text>")
    .option("--item-name <name>")
    .option("--invoice <number>")
    .option("--pix-key <key>")
    .option("--pix-type <type>")
    .option("--pix-name <name>")
    .option("--payment-link <url>")
    .action(async (opts) => {
      const client = new UazapiClient();
      const body = buildBody({
        number: opts.number,
        amount: opts.amount,
        title: opts.title,
        text: opts.text,
        footer: opts.footer,
        itemName: opts.itemName,
        invoiceNumber: opts.invoice,
        pixKey: opts.pixKey,
        pixType: opts.pixType,
        pixName: opts.pixName,
        paymentLink: opts.paymentLink,
      });
      printResponse(await client.post("/send/request-payment", body), "Send Payment Request");
    });
}
