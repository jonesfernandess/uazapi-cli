import * as p from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, extname } from "path";
import { homedir } from "os";
import { TOOLS, type Tool, installForTool, isToolInstalled } from "./commands/install-skills.js";

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

// ── Bulk Send ──

function parseNumbersFromText(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((n) => n.trim().replace(/\D/g, ""))
    .filter((n) => n.length >= 10 && n.length <= 15);
}

function parseNumbersFromCsv(content: string): string[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const numbers: string[] = [];
  for (const line of lines) {
    const cols = line.split(/[,;\t]+/);
    for (const col of cols) {
      const clean = col.trim().replace(/^["']|["']$/g, "").replace(/\D/g, "");
      if (clean.length >= 10 && clean.length <= 15) {
        numbers.push(clean);
      }
    }
  }
  return numbers;
}

async function handleBulkSend(config: UazapiConfig): Promise<void> {
  if (!config.baseUrl || !config.token) {
    p.log.error("Configure a URL e o token primeiro.");
    return mainMenu();
  }

  const action = await p.select({
    message: "Envio em massa",
    options: [
      { value: "new", label: `${chalk.green("+")} Nova campanha`, hint: "criar envio em massa" },
      { value: "list", label: `${chalk.cyan("☰")} Listar pastas`, hint: "ver campanhas existentes" },
      { value: "clear-done", label: `${chalk.yellow("✓")} Limpar finalizados`, hint: "remover jobs completos" },
      { value: "back", label: `${chalk.red("←")} Voltar` },
    ],
  });

  if (p.isCancel(action) || action === "back") return mainMenu();

  if (action === "list") {
    const s = p.spinner();
    s.start("Buscando pastas...");
    try {
      const resp = await fetch(`${config.baseUrl}/sender/listfolders`, {
        headers: { token: config.token, Accept: "application/json" },
      });
      const data = await resp.json();
      if (resp.ok) {
        s.stop(chalk.green("Pastas carregadas"));
        const folders = Array.isArray(data) ? data : [];
        if (folders.length === 0) {
          p.log.info("Nenhuma pasta encontrada.");
        } else {
          for (const f of folders) {
            const folder = f as Record<string, unknown>;
            const name = (folder["name"] as string) || "Sem nome";
            const id = (folder["id"] as string) || (folder["_id"] as string) || "";
            const status = (folder["status"] as string) || "";
            const statusIcon = status === "done" ? chalk.green("✓") : status === "sending" ? chalk.yellow("⟳") : chalk.dim("●");
            console.log(`  ${statusIcon} ${chalk.bold.white(name)} ${dim(id ? `(${id})` : "")}`);
            if (status) console.log(`    ${dim("Status:")} ${status}`);
            console.log("");
          }
        }
      } else {
        s.stop(chalk.red("Erro"));
        p.log.error(JSON.stringify(data));
      }
    } catch (err) {
      s.stop(chalk.red("Falha"));
      p.log.error(String(err));
    }
    return handleBulkSend(config);
  }

  if (action === "clear-done") {
    const s = p.spinner();
    s.start("Limpando jobs finalizados...");
    try {
      const resp = await fetch(`${config.baseUrl}/sender/cleardone`, {
        method: "POST",
        headers: { token: config.token, Accept: "application/json" },
      });
      const data = await resp.json();
      if (resp.ok) {
        s.stop(chalk.green("Jobs finalizados removidos!"));
      } else {
        s.stop(chalk.red("Erro"));
        p.log.error(JSON.stringify(data));
      }
    } catch (err) {
      s.stop(chalk.red("Falha"));
      p.log.error(String(err));
    }
    return handleBulkSend(config);
  }

  // ── Nova campanha ──

  const inputMethod = await p.select({
    message: "Como deseja informar os numeros?",
    options: [
      { value: "type", label: "Digitar numeros", hint: "separados por virgula ou um por linha" },
      { value: "file", label: "Importar de arquivo", hint: "CSV ou TXT" },
    ],
  });
  if (p.isCancel(inputMethod)) return handleBulkSend(config);

  let numbers: string[] = [];

  if (inputMethod === "file") {
    // List CSV/TXT files in home directory and current directory
    const searchDirs = [homedir(), join(homedir(), "Desktop"), join(homedir(), "Downloads"), process.cwd()];
    const files: Array<{ value: string; label: string }> = [];

    for (const dir of searchDirs) {
      try {
        if (!existsSync(dir)) continue;
        const entries = readdirSync(dir);
        for (const entry of entries) {
          const ext = extname(entry).toLowerCase();
          if ([".csv", ".txt"].includes(ext)) {
            const full = join(dir, entry);
            const label = `${entry} ${dim(`(${dir})`)}`;
            if (!files.some((f) => f.value === full)) {
              files.push({ value: full, label });
            }
          }
        }
      } catch { /* skip inaccessible dirs */ }
    }

    if (files.length === 0) {
      p.log.warn("Nenhum arquivo .csv ou .txt encontrado em ~/Desktop, ~/Downloads ou diretorio atual.");
      const filePath = await p.text({
        message: "Caminho completo do arquivo",
        placeholder: "/caminho/para/numeros.csv",
        validate: (v) => {
          if (!v?.trim()) return "Caminho obrigatorio";
          if (!existsSync(v.trim())) return "Arquivo nao encontrado";
          return undefined;
        },
      });
      if (p.isCancel(filePath)) return handleBulkSend(config);
      const content = readFileSync((filePath as string).trim(), "utf-8");
      numbers = parseNumbersFromCsv(content);
    } else {
      files.push({ value: "__custom__", label: "Digitar caminho manualmente..." });
      const chosen = await p.select({
        message: "Selecione o arquivo",
        options: files,
      });
      if (p.isCancel(chosen)) return handleBulkSend(config);

      let filePath = chosen as string;
      if (filePath === "__custom__") {
        const custom = await p.text({
          message: "Caminho completo do arquivo",
          placeholder: "/caminho/para/numeros.csv",
          validate: (v) => {
            if (!v?.trim()) return "Caminho obrigatorio";
            if (!existsSync(v.trim())) return "Arquivo nao encontrado";
            return undefined;
          },
        });
        if (p.isCancel(custom)) return handleBulkSend(config);
        filePath = (custom as string).trim();
      }

      const content = readFileSync(filePath, "utf-8");
      numbers = parseNumbersFromCsv(content);
    }
  } else {
    const raw = await p.text({
      message: "Numeros (separados por virgula, ponto-e-virgula ou um por linha)",
      placeholder: "5511999999999, 5511888888888",
      validate: (v) => {
        if (!v?.trim()) return "Informe pelo menos um numero";
        const parsed = parseNumbersFromText(v);
        if (parsed.length === 0) return "Nenhum numero valido encontrado (10-15 digitos)";
        return undefined;
      },
    });
    if (p.isCancel(raw)) return handleBulkSend(config);
    numbers = parseNumbersFromText(raw as string);
  }

  // Deduplicate
  numbers = [...new Set(numbers)];

  if (numbers.length === 0) {
    p.log.error("Nenhum numero valido encontrado.");
    return handleBulkSend(config);
  }

  p.log.info(`${accent(String(numbers.length))} numero(s) valido(s) encontrado(s)`);
  if (numbers.length <= 10) {
    p.log.message(dim(numbers.join(", ")));
  } else {
    p.log.message(dim(`${numbers.slice(0, 5).join(", ")} ... e mais ${numbers.length - 5}`));
  }

  const text = await p.text({
    message: "Mensagem para enviar",
    placeholder: "Escreva a mensagem que sera enviada para todos...",
    validate: (v) => {
      if (!v?.trim()) return "Mensagem obrigatoria";
      return undefined;
    },
  });
  if (p.isCancel(text)) return handleBulkSend(config);

  const campaignName = await p.text({
    message: "Nome da campanha (opcional)",
    placeholder: "Minha campanha",
  });
  if (p.isCancel(campaignName)) return handleBulkSend(config);

  const delayChoice = await p.select({
    message: "Delay entre mensagens",
    options: [
      { value: 0, label: "Sem delay", hint: "envia o mais rapido possivel" },
      { value: 1000, label: "1 segundo" },
      { value: 3000, label: "3 segundos" },
      { value: 5000, label: "5 segundos" },
      { value: 10000, label: "10 segundos" },
      { value: -1, label: "Personalizado", hint: "definir em milissegundos" },
    ],
  });
  if (p.isCancel(delayChoice)) return handleBulkSend(config);

  let delay = delayChoice as number;
  if (delay === -1) {
    const customDelay = await p.text({
      message: "Delay em milissegundos",
      placeholder: "2000",
      validate: (v) => {
        if (!v?.trim()) return "Valor obrigatorio";
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 0) return "Deve ser um numero >= 0";
        return undefined;
      },
    });
    if (p.isCancel(customDelay)) return handleBulkSend(config);
    delay = parseInt((customDelay as string).trim(), 10);
  }

  // Confirmation
  const delayLabel = delay === 0 ? "nenhum" : `${delay}ms (${(delay / 1000).toFixed(1)}s)`;
  console.log("");
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log(`  ${chalk.bold.white("Resumo do envio em massa")}`);
  console.log(`  ${dim("Destinatarios:")} ${accent(String(numbers.length))}`);
  console.log(`  ${dim("Mensagem:")} ${chalk.white((text as string).slice(0, 80))}${(text as string).length > 80 ? "..." : ""}`);
  if ((campaignName as string)?.trim()) {
    console.log(`  ${dim("Campanha:")} ${chalk.white(campaignName as string)}`);
  }
  console.log(`  ${dim("Delay:")} ${chalk.white(delayLabel)}`);
  if (delay > 0 && numbers.length > 1) {
    const totalSec = ((numbers.length - 1) * delay) / 1000;
    const totalMin = totalSec / 60;
    const estimate = totalMin >= 1 ? `~${totalMin.toFixed(1)} min` : `~${totalSec.toFixed(0)}s`;
    console.log(`  ${dim("Tempo estimado:")} ${chalk.white(estimate)}`);
  }
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log("");

  const confirm = await p.confirm({
    message: `Enviar para ${numbers.length} numero(s)?`,
    initialValue: false,
  });
  if (p.isCancel(confirm) || !confirm) {
    p.log.info("Envio cancelado.");
    return handleBulkSend(config);
  }

  const s = p.spinner();
  s.start("Iniciando envio em massa...");

  try {
    const body: Record<string, unknown> = {
      numbers,
      message: { text: (text as string).trim() },
    };
    if ((campaignName as string)?.trim()) {
      body.name = (campaignName as string).trim();
    }
    if (delay > 0) {
      body.delay = delay;
    }

    const resp = await fetch(`${config.baseUrl}/sender/simple`, {
      method: "POST",
      headers: {
        token: config.token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json() as Record<string, unknown>;

    if (resp.ok) {
      s.stop(chalk.green("Envio em massa iniciado!"));
      const id = (data["id"] as string) || (data["_id"] as string) || "";
      if (id) p.log.message(`${dim("Job ID:")} ${accent(id)}`);
      p.log.success(`Campanha criada com ${numbers.length} destinatario(s).`);
    } else {
      s.stop(chalk.red("Erro ao iniciar envio"));
      p.log.error(JSON.stringify(data));
    }
  } catch (err) {
    s.stop(chalk.red("Falha no envio"));
    p.log.error(String(err));
  }

  return handleBulkSend(config);
}

// ── Update CLI ──

async function handleUpdate(): Promise<void> {
  console.log("");

  const s = p.spinner();
  s.start("Verificando versao atual...");

  let currentVersion = "desconhecida";
  try {
    const result = execSync("npm list -g uazapi-cli --depth=0 2>/dev/null || true", {
      encoding: "utf-8",
    });
    const match = result.match(/uazapi-cli@([\d.]+)/);
    if (match) currentVersion = match[1];
  } catch { /* ignora */ }

  s.stop(`Versao atual: ${accent(currentVersion)}`);

  const confirm = await p.confirm({
    message: `Atualizar uazapi-cli para a versao mais recente?`,
    initialValue: true,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.log.info("Atualizacao cancelada.");
    return mainMenu();
  }

  const s2 = p.spinner();
  s2.start("Atualizando uazapi-cli...");

  try {
    execSync("npm install -g uazapi-cli@latest", { stdio: "pipe" });
    s2.stop(chalk.green("Atualizado com sucesso!"));

    let newVersion = "desconhecida";
    try {
      const result = execSync("npm list -g uazapi-cli --depth=0 2>/dev/null || true", {
        encoding: "utf-8",
      });
      const match = result.match(/uazapi-cli@([\d.]+)/);
      if (match) newVersion = match[1];
    } catch { /* ignora */ }

    p.log.success(`uazapi-cli atualizado para ${accent(newVersion)}`);
    if (newVersion !== currentVersion && currentVersion !== "desconhecida") {
      p.log.message(dim(`${currentVersion} → ${newVersion}`));
    }
  } catch (err) {
    s2.stop(chalk.red("Erro ao atualizar"));
    p.log.error(String(err));
    p.log.message(dim("Tente manualmente: npm install -g uazapi-cli@latest"));
  }

  console.log("");
  await p.text({
    message: chalk.dim("Pressione Enter para voltar ao menu..."),
    placeholder: "",
  });

  return mainMenu();
}

// ── Install Skills ──

async function handleInstallSkills(): Promise<void> {
  console.log("");
  p.log.message(chalk.dim("Instala os docs da UAZAPI no seu editor/agente de IA."));
  p.log.message(chalk.dim("Rode dentro do diretorio do seu projeto."));
  console.log("");

  p.log.message(chalk.dim("  Espaço  → marcar/desmarcar   Enter → confirmar seleção"));
  console.log("");

  const toolOptions = (Object.entries(TOOLS) as [Tool, string][]).map(([value, label]) => {
    const installed = isToolInstalled(value);
    return {
      value,
      label: installed ? `${label} ${chalk.green("✓")}` : label,
      hint: installed ? "já instalado" : undefined,
    };
  });

  const selected = await p.multiselect<Tool>({
    message: "Selecione as ferramentas para instalar:",
    options: toolOptions,
    required: true,
  });

  if (p.isCancel(selected)) return mainMenu();

  const targets = selected as Tool[];

  console.log("");
  for (const target of targets) {
    p.log.step(`Instalando para ${chalk.cyan(TOOLS[target])}...`);
    try {
      installForTool(target);
    } catch (err: unknown) {
      p.log.error(`Falha: ${err instanceof Error ? err.message : String(err)}`);
    }
    console.log("");
  }

  p.log.success("Pronto! Skills instaladas no diretório atual.");
  console.log("");

  await p.text({
    message: chalk.dim("Pressione Enter para voltar ao menu..."),
    placeholder: "",
  });

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
      { value: "bulk-send", label: `${chalk.magenta("◆")} Envio em massa`, hint: "campanhas e sender" },
    );
  }

  options.push(
    { value: "setup", label: `${chalk.blue("⚙")} Setup wizard`, hint: isConfigured ? "reconfigurar" : "configurar agora" },
    { value: "base-url", label: "URL da API" },
    { value: "token", label: "Token da instancia" },
    { value: "admin-token", label: "Token admin" },
    { value: "install-skills", label: `${chalk.yellow("◈")} Instalar skills de IA`, hint: "Cursor, Copilot, Windsurf, Cline, Claude, Codex, Gemini, OpenCode" },
    { value: "update", label: `${chalk.cyan("↑")} Atualizar uazapi-cli`, hint: "instala a versao mais recente" },
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
    case "bulk-send":
      return handleBulkSend(config);
    case "setup":
      return runSetupWizard(config);
    case "base-url":
      return handleBaseUrl(config);
    case "token":
      return handleToken(config);
    case "admin-token":
      return handleAdminToken(config);
    case "install-skills":
      return handleInstallSkills();
    case "update":
      return handleUpdate();
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
