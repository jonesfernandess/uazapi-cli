import { Command } from "commander";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

type OpenAPISpec = {
  paths: Record<string, Record<string, OpenAPIOperation>>;
};

type OpenAPIOperation = {
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: {
    content?: {
      "application/json"?: {
        schema?: OpenAPISchema;
      };
    };
  };
};

type OpenAPIParameter = {
  name: string;
  in: string;
  required?: boolean;
  schema?: { type?: string; enum?: string[] };
};

type SchemaProp = {
  type?: string;
  enum?: string[];
  items?: { type?: string };
};

type OpenAPISchema = {
  properties?: Record<string, SchemaProp>;
  required?: string[];
};

type Match = {
  method: string;
  path: string;
  op: OpenAPIOperation;
};

function loadSpec(): OpenAPISpec {
  const dir = dirname(fileURLToPath(import.meta.url));
  // compiled to dist/commands/ → go up two levels to repo root
  const specPath = resolve(dir, "../../uazapi-openapi.json");
  return JSON.parse(readFileSync(specPath, "utf-8")) as OpenAPISpec;
}

function search(spec: OpenAPISpec, query: string): Match[] {
  const q = query.toLowerCase();
  const results: Match[] = [];

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      const hit =
        path.toLowerCase().includes(q) ||
        op.summary?.toLowerCase().includes(q) ||
        op.description?.toLowerCase().includes(q) ||
        op.tags?.some((t) => t.toLowerCase().includes(q));

      if (hit) results.push({ method: method.toUpperCase(), path, op });
    }
  }

  return results;
}

function propType(prop: SchemaProp): string {
  if (prop.enum) {
    const preview = prop.enum.slice(0, 4).join("|");
    return prop.enum.length > 4 ? `${preview}…` : preview;
  }
  if (prop.type === "array" && prop.items?.type) return `${prop.items.type}[]`;
  return prop.type ?? "any";
}

function bodyLines(schema: OpenAPISchema): string[] {
  if (!schema.properties) return [];
  const req = new Set(schema.required ?? []);
  const required: string[] = [];
  const optional: string[] = [];

  for (const [name, prop] of Object.entries(schema.properties)) {
    const t = propType(prop);
    (req.has(name) ? required : optional).push(`${name}:${t}`);
  }

  const lines: string[] = [];
  if (required.length) lines.push(`  body required : ${required.join("  ")}`);
  if (optional.length) lines.push(`  body optional : ${optional.join("  ")}`);
  return lines;
}

function paramLines(params: OpenAPIParameter[]): string[] {
  const lines: string[] = [];
  const path = params.filter((p) => p.in === "path");
  const query = params.filter((p) => p.in === "query");

  if (path.length)
    lines.push(`  path params   : ${path.map((p) => `${p.name}:${p.schema?.type ?? "string"}`).join("  ")}`);
  if (query.length)
    lines.push(`  query params  : ${query.map((p) => `${p.name}:${p.schema?.type ?? "string"}${p.required ? "*" : ""}`).join("  ")}`);
  return lines;
}

function methodColor(m: string): typeof chalk {
  if (m === "GET") return chalk.green;
  if (m === "DELETE") return chalk.red;
  if (m === "PATCH") return chalk.yellow;
  return chalk.blue;
}

function print(matches: Match[], query: string): void {
  if (matches.length === 0) {
    console.log(chalk.yellow(`\nNenhum endpoint encontrado para: "${query}"\n`));
    return;
  }

  console.log(chalk.bold(`\n${matches.length} endpoint(s) encontrado(s) para "${query}"\n`));

  for (const { method, path, op } of matches) {
    const color = methodColor(method);
    const tags = op.tags?.join(", ") ?? "";

    console.log(chalk.dim("─".repeat(64)));
    process.stdout.write(`${color.bold(`[${method}]`)} ${chalk.bold(path)}`);
    if (tags) process.stdout.write(chalk.dim(`  · ${tags}`));
    console.log();

    if (op.summary) console.log(`  ${op.summary}`);

    if (op.description) {
      const first = op.description.split("\n")[0].trim();
      if (first && first !== op.summary) {
        console.log(chalk.dim(`  ${first.slice(0, 120)}`));
      }
    }

    if (op.parameters?.length) {
      for (const l of paramLines(op.parameters)) console.log(l);
    }

    const schema = op.requestBody?.content?.["application/json"]?.schema;
    if (schema) {
      for (const l of bodyLines(schema as OpenAPISchema)) console.log(l);
    }

    console.log();
  }
}

export function registerSearchDocsCommand(program: Command): void {
  program
    .command("search-docs")
    .description("Busca endpoints da UAZAPI por palavra-chave (path, summary, description ou tag)")
    .argument("<query>", "Termo de busca")
    .action((query: string) => {
      try {
        const spec = loadSpec();
        const matches = search(spec, query);
        print(matches, query);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(chalk.red(`Erro: ${msg}`));
        process.exit(1);
      }
    });
}
