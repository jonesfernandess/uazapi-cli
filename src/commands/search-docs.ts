import { Command } from "commander";
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  description?: string;
  enum?: string[];
  items?: { type?: string };
};

type OpenAPISchema = {
  properties?: Record<string, SchemaProp>;
  required?: string[];
};

type EndpointMatch = {
  method: string;
  path: string;
  op: OpenAPIOperation;
};

type GuideSection = {
  name: string;
  body: string;
};

// ─── Loaders ──────────────────────────────────────────────────────────────────

function loadSpec(): OpenAPISpec {
  const dir = dirname(fileURLToPath(import.meta.url));
  const specPath = resolve(dir, "../../uazapi-openapi.json");
  return JSON.parse(readFileSync(specPath, "utf-8")) as OpenAPISpec;
}

/** Loads and concatenates all SKILL.md files found under skills/*\/SKILL.md */
function loadAllSkills(): string {
  const dir = dirname(fileURLToPath(import.meta.url));
  const skillsRoot = resolve(dir, "../../skills");
  const parts: string[] = [];

  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillFile = join(skillsRoot, entry.name, "SKILL.md");
    if (existsSync(skillFile)) {
      parts.push(readFileSync(skillFile, "utf-8"));
    }
  }

  return parts.join("\n\n");
}

// ─── SKILL.md parsing ─────────────────────────────────────────────────────────

function parseSkillSections(content: string): GuideSection[] {
  const sections: GuideSection[] = [];
  let current: GuideSection | null = null;

  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { name: line.slice(3).trim(), body: "" };
    } else if (current) {
      current.body += line + "\n";
    }
  }
  if (current) sections.push(current);
  return sections;
}

/** Splits query into words; a hit requires ALL words to appear somewhere in the text. */
function matchesAll(text: string, words: string[]): boolean {
  const t = text.toLowerCase();
  return words.every((w) => t.includes(w));
}

function searchGuide(sections: GuideSection[], query: string): GuideSection[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return sections.filter((s) => {
    const combined = (s.name + " " + s.body).toLowerCase();
    return matchesAll(combined, words);
  });
}

/** Returns first N lines of body that contain the query term (as context snippet). */
function guideExcerpt(section: GuideSection, query: string, maxLines = 6): string {
  const q = query.toLowerCase();
  const lines = section.body.split("\n");
  const hits: string[] = [];

  for (let i = 0; i < lines.length && hits.length < maxLines; i++) {
    if (lines[i].toLowerCase().includes(q)) {
      // include one line before for context
      if (i > 0 && !hits.includes(lines[i - 1])) hits.push(lines[i - 1]);
      hits.push(lines[i]);
    }
  }

  return hits.length ? hits.join("\n") : lines.slice(0, maxLines).join("\n");
}

// ─── Spec search ──────────────────────────────────────────────────────────────

function searchSpec(spec: OpenAPISpec, query: string): EndpointMatch[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const results: EndpointMatch[] = [];

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, op] of Object.entries(methods)) {
      const combined = [
        path,
        op.summary ?? "",
        op.description ?? "",
        ...(op.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      if (matchesAll(combined, words)) {
        results.push({ method: method.toUpperCase(), path, op });
      }
    }
  }

  return results;
}

// ─── Tags / topics listing ────────────────────────────────────────────────────

function collectTags(spec: OpenAPISpec): Map<string, number> {
  const counts = new Map<string, number>();
  for (const methods of Object.values(spec.paths)) {
    for (const op of Object.values(methods)) {
      for (const tag of op.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
  }
  return counts;
}

// ─── Rendering helpers ────────────────────────────────────────────────────────

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
    lines.push(
      `  path params   : ${path.map((p) => `${p.name}:${p.schema?.type ?? "string"}`).join("  ")}`
    );
  if (query.length)
    lines.push(
      `  query params  : ${query
        .map((p) => `${p.name}:${p.schema?.type ?? "string"}${p.required ? "*" : ""}`)
        .join("  ")}`
    );
  return lines;
}

function methodColor(m: string): typeof chalk {
  if (m === "GET") return chalk.green;
  if (m === "DELETE") return chalk.red;
  if (m === "PATCH") return chalk.yellow;
  return chalk.blue;
}

// ─── Human-readable output ────────────────────────────────────────────────────

function printEndpoints(matches: EndpointMatch[], query: string): void {
  if (matches.length === 0) return;

  console.log(chalk.bold(`\n${matches.length} endpoint(s) para "${query}"\n`));

  for (const { method, path, op } of matches) {
    const color = methodColor(method);
    const tags = op.tags?.join(", ") ?? "";

    console.log(chalk.dim("─".repeat(64)));
    process.stdout.write(`${color.bold(`[${method}]`)} ${chalk.bold(path)}`);
    if (tags) process.stdout.write(chalk.dim(`  · ${tags}`));
    console.log();

    if (op.summary) console.log(`  ${op.summary}`);

    if (op.description) {
      const lines = op.description.split("\n").filter((l) => l.trim());
      for (const line of lines.slice(0, 4)) {
        if (line.trim() !== op.summary?.trim()) {
          console.log(chalk.dim(`  ${line.slice(0, 120)}`));
        }
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

function printGuide(sections: GuideSection[], query: string): void {
  if (sections.length === 0) return;

  console.log(chalk.bold(`\n${sections.length} seção(ões) do guia para "${query}"\n`));

  for (const section of sections) {
    console.log(chalk.dim("─".repeat(64)));
    console.log(`${chalk.cyan.bold("[GUIA]")} ${chalk.bold(section.name)}`);
    const excerpt = guideExcerpt(section, query);
    for (const line of excerpt.split("\n")) {
      if (line.trim()) console.log(chalk.dim(`  ${line}`));
    }
    console.log();
  }
}

function print(
  endpoints: EndpointMatch[],
  guideSections: GuideSection[],
  query: string
): void {
  const total = endpoints.length + guideSections.length;

  if (total === 0) {
    console.log(chalk.yellow(`\nNenhum resultado para: "${query}"\n`));
    console.log(
      chalk.dim(`  Dica: use ${chalk.white("uazapi search-docs --list")} para ver tópicos disponíveis\n`)
    );
    return;
  }

  printGuide(guideSections, query);
  printEndpoints(endpoints, query);
}

// ─── JSON output ─────────────────────────────────────────────────────────────

function toJson(
  endpoints: EndpointMatch[],
  guideSections: GuideSection[],
  query: string,
  pretty: boolean
): void {
  const endpointMatches = endpoints.map(({ method, path, op }) => {
    const schema = op.requestBody?.content?.["application/json"]?.schema as
      | OpenAPISchema
      | undefined;

    const parameters = (op.parameters ?? []).map((p) => ({
      name: p.name,
      in: p.in,
      required: Boolean(p.required),
      type: p.schema?.type,
      enum: p.schema?.enum,
    }));

    const requestBody = schema
      ? {
          required: schema.required ?? [],
          properties: schema.properties
            ? Object.fromEntries(
                Object.entries(schema.properties).map(([name, prop]) => [
                  name,
                  {
                    type: prop.type,
                    description: prop.description,
                    enum: prop.enum,
                    itemsType: prop.items?.type,
                  },
                ])
              )
            : undefined,
        }
      : undefined;

    return {
      method,
      path,
      tags: op.tags ?? [],
      summary: op.summary,
      description: op.description ?? undefined,
      parameters: parameters.length ? parameters : undefined,
      requestBody,
    };
  });

  const guideMatches = guideSections.map((s) => ({
    section: s.name,
    content: s.body.trim(),
  }));

  const payload = {
    query,
    count: { endpoints: endpointMatches.length, guide: guideMatches.length },
    endpoints: endpointMatches,
    guide: guideMatches,
  };

  console.log(JSON.stringify(payload, null, pretty ? 2 : 0));
}

// ─── --list mode ──────────────────────────────────────────────────────────────

function printList(spec: OpenAPISpec, skillSections: GuideSection[], asJson: boolean): void {
  const tags = collectTags(spec);
  const sectionNames = skillSections.map((s) => s.name);

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          api_tags: Array.from(tags.entries()).map(([tag, count]) => ({ tag, endpoints: count })),
          guide_sections: sectionNames,
        },
        null,
        2
      )
    );
    return;
  }

  console.log(chalk.bold("\nTags da API (use como query):\n"));
  for (const [tag, count] of tags.entries()) {
    console.log(`  ${chalk.cyan(tag)} ${chalk.dim(`(${count} endpoints)`)}`);
  }

  console.log(chalk.bold("\nSeções do guia (use com --section):\n"));
  for (const name of sectionNames) {
    console.log(`  ${chalk.yellow(name)}`);
  }
  console.log();
}

// ─── --section mode ───────────────────────────────────────────────────────────

function printSection(sections: GuideSection[], name: string, asJson: boolean): void {
  const q = name.toLowerCase();
  const match = sections.find((s) => s.name.toLowerCase().includes(q));

  if (!match) {
    const names = sections.map((s) => `  • ${s.name}`).join("\n");
    console.error(chalk.red(`\nSeção "${name}" não encontrada.\n`));
    console.error(chalk.dim(`Seções disponíveis:\n${names}\n`));
    process.exit(1);
  }

  if (asJson) {
    console.log(JSON.stringify({ section: match.name, content: match.body.trim() }, null, 2));
    return;
  }

  console.log(chalk.bold(`\n## ${match.name}\n`));
  console.log(match.body.trim());
  console.log();
}

// ─── Command registration ─────────────────────────────────────────────────────

export function registerSearchDocsCommand(program: Command): void {
  program
    .command("search-docs")
    .description(
      "Busca endpoints e guias da UAZAPI por palavra-chave — útil para agentes e devs"
    )
    .argument("[query]", "Termo de busca (obrigatório salvo com --list ou --section)")
    .option("--json", "Output JSON (machine-readable)")
    .option("--pretty", "Pretty-print JSON (implica --json)")
    .option("--list", "Lista tags da API e seções do guia disponíveis")
    .option("--section <nome>", "Retorna seção completa do guia pelo nome")
    .action(
      (
        query: string | undefined,
        options: {
          json?: boolean;
          pretty?: boolean;
          list?: boolean;
          section?: string;
        }
      ) => {
        try {
          const asJson = Boolean(options.json || options.pretty);
          const spec = loadSpec();
          const skillContent = loadAllSkills();
          const skillSections = parseSkillSections(skillContent);

          // --list: discovery mode
          if (options.list) {
            printList(spec, skillSections, asJson);
            return;
          }

          // --section: full section retrieval
          if (options.section) {
            printSection(skillSections, options.section, asJson);
            return;
          }

          // search mode (requires query)
          if (!query) {
            console.error(
              chalk.red(
                "\nForneca uma query. Exemplo: uazapi search-docs \"send text\"\n" +
                  "Ou use --list para ver tópicos disponíveis.\n"
              )
            );
            process.exit(1);
          }

          const endpoints = searchSpec(spec, query);
          const guide = searchGuide(skillSections, query);

          if (asJson) {
            toJson(endpoints, guide, query, Boolean(options.pretty));
          } else {
            print(endpoints, guide, query);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(chalk.red(`Erro: ${msg}`));
          process.exit(1);
        }
      }
    );
}
