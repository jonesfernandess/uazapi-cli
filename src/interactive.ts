import * as p from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// ── Config ──

const CONFIG_DIR = join(homedir(), ".uazapi-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const ENV_FILE = join(CONFIG_DIR, ".env");

export interface UazapiConfig {
  baseUrl: string;
  token: string;
  adminToken: string;
}

const DEFAULTS: UazapiConfig = {
  baseUrl: "",
  token: "",
  adminToken: "",
};

export function loadConfig(): UazapiConfig {
  if (!existsSync(CONFIG_FILE)) return { ...DEFAULTS };
  try {
    const data = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    return { ...DEFAULTS, ...data };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveConfig(config: UazapiConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  generateEnvFile(config);
}

function generateEnvFile(config: UazapiConfig): void {
  const lines = [
    `UAZAPI_BASE_URL=${config.baseUrl}`,
    `UAZAPI_TOKEN=${config.token}`,
  ];
  if (config.adminToken) lines.push(`UAZAPI_ADMIN_TOKEN=${config.adminToken}`);
  writeFileSync(ENV_FILE, lines.join("\n") + "\n");
}

// ── Styling ──

const accent = chalk.hex("#0a4db1"); // UAZAPI blue
const dim = chalk.dim;
const uazGradient = gradient(["#0a4db1", "#1a6fd4", "#3a8ff0"]);

function showBanner(): void {
  const banner = figlet.textSync("UAZAPI", {
    font: "ANSI Shadow",
    horizontalLayout: "fitted",
  });
  console.log("");
  console.log(uazGradient(banner));
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log(
    `  ${accent("●")} ${chalk.bold.white("UAZAPI CLI")}  ${dim("— WhatsApp API from the terminal")}`,
  );
  console.log(dim("  ─────────────────────────────────────────────────────"));
}

function maskToken(token: string): string {
  if (!token) return chalk.red("nao configurado");
  if (token.length <= 10) return chalk.green("****");
  return chalk.green(token.slice(0, 6) + "..." + token.slice(-4));
}

function statusBar(config: UazapiConfig): void {
  const lines = [
    "",
    `  ${dim("Base URL".padEnd(16))} ${config.baseUrl ? accent(config.baseUrl) : chalk.red("nao configurado")}`,
    `  ${dim("Token".padEnd(16))} ${maskToken(config.token)}`,
    `  ${dim("Admin Token".padEnd(16))} ${maskToken(config.adminToken)}`,
    `  ${dim("Config".padEnd(16))} ${chalk.blue(CONFIG_FILE)}`,
    "",
  ];
  console.log(lines.join("\n"));
}

// ── Setup Wizard ──

async function runSetupWizard(config: UazapiConfig): Promise<void> {
  console.clear();
  showBanner();

  p.intro(chalk.bold("Vamos configurar a UAZAPI CLI!"));

  // Step 1: Base URL
  console.log("");
  p.log.step(accent("Passo 1/3") + dim(" — URL da API"));
  p.log.message(dim("A URL base da sua instancia UAZAPI."));
  p.log.message(dim("Exemplos: https://free.uazapi.com ou https://api.uazapi.com"));

  const baseUrl = await p.text({
    message: "URL base da UAZAPI",
    placeholder: "https://free.uazapi.com",
    initialValue: config.baseUrl || "",
    validate: (v) => {
      if (!v || !v.trim()) return "URL e obrigatoria";
      if (!v.startsWith("http")) return "URL deve comecar com http:// ou https://";
      return undefined;
    },
  });
  if (p.isCancel(baseUrl)) {
    p.outro(dim("Setup cancelado."));
    process.exit(0);
  }
  config.baseUrl = (baseUrl as string).trim().replace(/\/$/, "");
  saveConfig(config);
  p.log.success("URL salva!");

  // Step 2: Instance Token
  console.log("");
  p.log.step(accent("Passo 2/3") + dim(" — Token da Instancia"));
  p.log.message(dim("O token da sua instancia WhatsApp na UAZAPI."));
  p.log.message(dim("Encontre no painel da UAZAPI em 'Instancias'."));

  const token = await p.text({
    message: "Token da instancia",
    placeholder: "Cole o token aqui",
    initialValue: config.token || "",
    validate: (v) => {
      if (!v || !v.trim()) return "Token e obrigatorio";
      return undefined;
    },
  });
  if (p.isCancel(token)) {
    p.outro(dim("Setup cancelado."));
    process.exit(0);
  }
  config.token = (token as string).trim();
  saveConfig(config);
  p.log.success("Token salvo!");

  // Step 3: Admin Token (optional)
  console.log("");
  p.log.step(accent("Passo 3/3") + dim(" — Token Admin (opcional)"));
  p.log.message(dim("Necessario apenas para endpoints administrativos"));
  p.log.message(dim("(criar/listar instancias, restart do servidor, etc.)"));

  const wantAdmin = await p.confirm({
    message: "Deseja configurar o token admin?",
    initialValue: false,
  });

  if (!p.isCancel(wantAdmin) && wantAdmin) {
    const adminToken = await p.text({
      message: "Token admin",
      placeholder: "Cole o admin token aqui",
      initialValue: config.adminToken || "",
    });
    if (!p.isCancel(adminToken)) {
      config.adminToken = (adminToken as string).trim();
      saveConfig(config);
      p.log.success("Admin token salvo!");
    }
  }

  // Done
  console.log("");
  console.log(dim("  ─────────────────────────────────────────────────────"));
  p.log.success(chalk.bold("Tudo pronto!"));
  p.log.message(dim("Config salva em " + CONFIG_FILE));
  p.log.message(dim("Env salvo em " + ENV_FILE));
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log("");
  p.log.message("Agora voce pode usar:");
  p.log.message(accent("  uazapi instance status"));
  p.log.message(accent('  uazapi send text --number 5511999 --text "Ola"'));
  p.log.message(accent("  uazapi group list"));
  console.log("");

  const goMenu = await p.confirm({
    message: "Abrir menu interativo?",
    initialValue: true,
  });
  if (!p.isCancel(goMenu) && goMenu) {
    return mainMenu();
  }
  p.outro(dim("Ate mais!"));
}

// ── Menu Handlers ──

async function handleBaseUrl(config: UazapiConfig): Promise<void> {
  const baseUrl = await p.text({
    message: "URL base da UAZAPI",
    placeholder: "https://free.uazapi.com",
    initialValue: config.baseUrl || "",
    validate: (v) => {
      if (!v?.trim()) return "URL obrigatoria";
      if (!v.startsWith("http")) return "Deve comecar com http";
      return undefined;
    },
  });
  if (p.isCancel(baseUrl)) return mainMenu();
  config.baseUrl = (baseUrl as string).trim().replace(/\/$/, "");
  saveConfig(config);
  p.log.success("URL atualizada!");
  return mainMenu();
}

async function handleToken(config: UazapiConfig): Promise<void> {
  const token = await p.text({
    message: "Token da instancia",
    placeholder: "Cole o token",
    initialValue: config.token || "",
    validate: (v) => {
      if (!v?.trim()) return "Token obrigatorio";
      return undefined;
    },
  });
  if (p.isCancel(token)) return mainMenu();
  config.token = (token as string).trim();
  saveConfig(config);
  p.log.success("Token atualizado!");
  return mainMenu();
}

async function handleAdminToken(config: UazapiConfig): Promise<void> {
  const adminToken = await p.text({
    message: "Token admin",
    placeholder: "Cole o admin token (vazio para remover)",
    initialValue: config.adminToken || "",
  });
  if (p.isCancel(adminToken)) return mainMenu();
  config.adminToken = (adminToken as string).trim();
  saveConfig(config);
  p.log.success(config.adminToken ? "Admin token atualizado!" : "Admin token removido!");
  return mainMenu();
}

async function handleTestConnection(config: UazapiConfig): Promise<void> {
  if (!config.baseUrl || !config.token) {
    p.log.error("Configure a URL e o token primeiro.");
    return mainMenu();
  }

  const s = p.spinner();
  s.start("Testando conexao...");

  try {
    const resp = await fetch(`${config.baseUrl}/instance/status`, {
      headers: { token: config.token, Accept: "application/json" },
    });
    const data = await resp.json() as Record<string, unknown>;

    if (resp.ok) {
      const instance = (data["instance"] as Record<string, unknown>) || {};
      const statusObj = (data["status"] as Record<string, unknown>) || {};
      const isConnected = statusObj["connected"] === true;
      const instanceStatus = (instance["status"] as string) || "unknown";
      const name = (instance["name"] as string) || (instance["profileName"] as string) || "";
      const owner = (instance["owner"] as string) || "";

      if (isConnected) {
        s.stop(chalk.green("Conectado!"));
      } else {
        s.stop(chalk.yellow("Desconectado"));
      }

      p.log.success(`Status: ${isConnected ? accent("connected") : chalk.yellow(instanceStatus)}`);
      if (name) p.log.message(`Instancia: ${chalk.white(name)}`);
      if (owner) p.log.message(`Numero: ${chalk.white(owner)}`);
    } else {
      s.stop(chalk.red("Erro na conexao"));
      p.log.error(`HTTP ${resp.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    s.stop(chalk.red("Falha na conexao"));
    p.log.error(String(err));
  }

  return mainMenu();
}

async function handleQuickSend(config: UazapiConfig): Promise<void> {
  if (!config.baseUrl || !config.token) {
    p.log.error("Configure a URL e o token primeiro.");
    return mainMenu();
  }

  const number = await p.text({
    message: "Numero do destinatario (com DDI)",
    placeholder: "5511999999999",
    validate: (v) => {
      if (!v?.trim()) return "Numero obrigatorio";
      if (!/^\d{10,15}$/.test(v.trim())) return "Numero invalido (apenas digitos, 10-15 chars)";
      return undefined;
    },
  });
  if (p.isCancel(number)) return mainMenu();

  const text = await p.text({
    message: "Mensagem",
    placeholder: "Escreva sua mensagem...",
    validate: (v) => {
      if (!v?.trim()) return "Mensagem obrigatoria";
      return undefined;
    },
  });
  if (p.isCancel(text)) return mainMenu();

  const s = p.spinner();
  s.start("Enviando mensagem...");

  try {
    const resp = await fetch(`${config.baseUrl}/send/text`, {
      method: "POST",
      headers: {
        token: config.token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        number: (number as string).trim(),
        text: (text as string).trim(),
      }),
    });

    if (resp.ok) {
      s.stop(chalk.green("Mensagem enviada!"));
    } else {
      const data = await resp.json();
      s.stop(chalk.red("Erro ao enviar"));
      p.log.error(JSON.stringify(data));
    }
  } catch (err) {
    s.stop(chalk.red("Falha no envio"));
    p.log.error(String(err));
  }

  return mainMenu();
}

async function handleListInstances(config: UazapiConfig): Promise<void> {
  if (!config.baseUrl) {
    p.log.error("Configure a URL primeiro.");
    return mainMenu();
  }

  const token = config.adminToken || config.token;
  if (!token) {
    p.log.error("Configure o token admin ou token da instancia primeiro.");
    return mainMenu();
  }

  const s = p.spinner();
  s.start("Buscando instancias...");

  try {
    const resp = await fetch(`${config.baseUrl}/instance/all`, {
      headers: { token, Accept: "application/json" },
    });
    const data = await resp.json();

    if (!resp.ok) {
      s.stop(chalk.red("Erro ao listar"));
      p.log.error(`HTTP ${resp.status}: ${JSON.stringify(data)}`);
      return mainMenu();
    }

    const instances = Array.isArray(data) ? data : (data as Record<string, unknown>)["instances"] as unknown[] || [data];
    s.stop(chalk.green(`${instances.length} instancia(s) encontrada(s)`));

    console.log("");
    for (const inst of instances) {
      const i = inst as Record<string, unknown>;
      const statusInfo = (i["status"] as Record<string, unknown>) || {};
      const connected = statusInfo["connected"] === true;
      const statusIcon = connected ? chalk.green("●") : chalk.red("●");
      const statusText = connected ? chalk.green("connected") : chalk.red("disconnected");

      const name = (i["name"] as string) || (i["profileName"] as string) || "—";
      const id = (i["id"] as string) || "";
      const owner = (i["owner"] as string) || "";
      const tokenStr = (i["token"] as string) || "";
      const tokenDisplay = tokenStr ? tokenStr.slice(0, 8) + "..." + tokenStr.slice(-4) : "—";

      console.log(`  ${statusIcon} ${chalk.bold.white(name)} ${dim(`(${id})`)}`);
      console.log(`    ${dim("Status:")} ${statusText}  ${dim("Numero:")} ${owner || "—"}  ${dim("Token:")} ${chalk.blue(tokenDisplay)}`);
      console.log("");
    }
  } catch (err) {
    s.stop(chalk.red("Falha na requisicao"));
    p.log.error(String(err));
  }

  return mainMenu();
}

// ── Main Menu ──

async function mainMenu(): Promise<void> {
  const config = loadConfig();

  console.clear();
  showBanner();
  statusBar(config);

  const isConfigured = Boolean(config.baseUrl && config.token);

  const options: Array<{ value: string; label: string; hint?: string }> = [];

  if (isConfigured) {
    options.push(
      { value: "test", label: `${chalk.green("⚡")} Testar conexao`, hint: "verifica status da instancia" },
      { value: "instances", label: `${chalk.cyan("☰")} Listar instancias`, hint: "todas as instancias da API" },
      { value: "send", label: `${chalk.green("✉")} Enviar mensagem`, hint: "envio rapido de texto" },
    );
  }

  options.push(
    { value: "setup", label: `${chalk.blue("⚙")} Setup wizard`, hint: isConfigured ? "reconfigurar" : "configurar agora" },
    { value: "base-url", label: "URL da API" },
    { value: "token", label: "Token da instancia" },
    { value: "admin-token", label: "Token admin" },
    { value: "exit", label: `${chalk.red("✕")} Sair` },
  );

  const action = await p.select({
    message: "O que deseja fazer?",
    options,
  });

  if (p.isCancel(action) || action === "exit") {
    p.outro(dim("Ate mais!"));
    process.exit(0);
  }

  switch (action) {
    case "test":
      return handleTestConnection(config);
    case "instances":
      return handleListInstances(config);
    case "send":
      return handleQuickSend(config);
    case "setup":
      return runSetupWizard(config);
    case "base-url":
      return handleBaseUrl(config);
    case "token":
      return handleToken(config);
    case "admin-token":
      return handleAdminToken(config);
  }
}

// ── Exports ──

export async function startInteractive(): Promise<void> {
  const config = loadConfig();
  if (!config.baseUrl || !config.token) {
    return runSetupWizard(config);
  }
  return mainMenu();
}

export { runSetupWizard, mainMenu, CONFIG_DIR, ENV_FILE };
