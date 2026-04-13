# uazapi-cli

> **Aviso:** Esta es una herramienta **no oficial**, creada por la comunidad. **No tiene ningun vinculo, respaldo ni asociacion con UAZAPI.** Usela bajo su propia responsabilidad.

**[Portugues](README.md) | [English](README.en.md)**

Una interfaz de linea de comandos para la API de WhatsApp de [UAZAPI](https://uazapi.com). Administre su instancia, envie mensajes, gestione grupos, contactos, webhooks y mucho mas — todo desde la terminal.

## El problema

UAZAPI expone una API REST poderosa con mas de 128 endpoints para automatizacion de WhatsApp. Pero interactuar con ella significa lidiar con comandos `curl`, recordar paths de endpoints, armar payloads JSON y manejar headers de autenticacion manualmente.

**uazapi-cli** encapsula toda la superficie de UAZAPI en un unico binario con:

- Un **menu interactivo** para operaciones rapidas (probar conexion, enviar mensaje, listar instancias)
- Una **CLI completa** con subcomandos para scripts y automatizacion (`uazapi send text --to 5411... --message "hola"`)
- Un **wizard de configuracion** que guarda la URL y el token de la instancia una sola vez
- **Auto-actualizacion** integrada — ejecute `uazapi update` en cualquier momento

No mas copiar y pegar tokens en headers o consultar la documentacion en cada request.

![uazapi-cli menu interactivo](screenshot.jpeg)

## Instalacion

Un solo comando:

```bash
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/install.sh | bash
```

El script verifica Node.js 18+ y npm, clona el repositorio en `~/.uazapi-cli-app`, compila e instala el comando `uazapi` globalmente.

**Requisitos:** Node.js 18+, npm, git.

## Inicio rapido

```bash
# 1. Instalar
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/install.sh | bash

# 2. Configurar — abre el wizard de setup
uazapi setup

# 3. Probar la conexion
uazapi instance status

# 4. Enviar su primer mensaje
uazapi send text --to 5411999999999 --message "Hola desde la terminal!"
```

O simplemente ejecute `uazapi` sin argumentos para abrir el menu interactivo.

## Actualizacion

Actualice a la version mas reciente en cualquier momento:

```bash
uazapi update
```

`uazapi upgrade` tambien funciona. El comando descarga el codigo mas reciente de GitHub, reinstala dependencias y recompila automaticamente.

## Uso

### Modo interactivo

Ejecute `uazapi` sin argumentos:

```
  UAZAPI CLI — WhatsApp API from the terminal

  ● Que desea hacer?
  ● ⚡ Probar conexion      (verifica status de la instancia)
  ○ ☰  Listar instancias    (todas las instancias de la API)
  ○ ✉  Enviar mensaje       (envio rapido de texto)
  ○ ⚙  Setup wizard
  ○ ◈  Instalar skills de IA
  ○ ↑  Actualizar uazapi-cli
  ○ ✕  Salir
```

### Modo CLI

Para scripts y automatizacion:

```
uazapi [comando] [subcomando] [opciones]
```

### Comandos

| Comando | Descripcion |
|---------|-------------|
| `instance` | Administrar instancia WhatsApp (conectar, desconectar, status, reset) |
| `send` | Enviar mensajes (texto, media, ubicacion, contacto, carrusel, encuesta, boton PIX) |
| `message` | Administrar mensajes (buscar, eliminar, descargar, editar, reaccionar) |
| `chat` | Administrar conversaciones (buscar, archivar, bloquear, eliminar, silenciar, fijar) |
| `group` | Administrar grupos de WhatsApp |
| `contact` | Administrar contactos |
| `webhook` | Administrar webhooks |
| `newsletter` | Administrar Canales/Newsletters de WhatsApp |
| `business` | Perfil comercial y catalogo |
| `sender` | Envio masivo |
| `admin` | Operaciones administrativas (requiere token admin) |
| `label` | Administrar etiquetas |
| `profile` | Administrar perfil de WhatsApp |
| `setup` | Wizard de configuracion |
| `update` | Actualizar a la version mas reciente |
| `install-skills` | Instalar skills de IA (Claude, Cursor, Copilot, Cline, Windsurf, Codex, OpenCode, Gemini, Hermes, OpenClaw) |

### Ejemplos

```bash
# Verificar status de la instancia
uazapi instance status

# Enviar mensaje de texto
uazapi send text --to 5411999999999 --message "Hola!"

# Enviar imagen
uazapi send media --to 5411999999999 --type image --file https://ejemplo.com/foto.jpg

# Enviar boton de pago PIX
uazapi send pix-button --to 5411999999999 --key "su-clave-pix" --amount 49.90

# Publicar un Story en WhatsApp
uazapi send status --type text --message "Novedad!"

# Configurar webhook
uazapi webhook set --url https://su-servidor.com/webhook

# Listar todos los grupos
uazapi group list

# Ayuda de cualquier comando
uazapi send --help
uazapi instance connect --help
```

## Configuracion

En la primera ejecucion, el wizard crea `~/.uazapi-cli/config.json`:

```json
{
  "baseUrl": "https://su-instancia.uazapi.com",
  "token": "su-token-de-instancia",
  "adminToken": ""
}
```

| Campo | Descripcion |
|-------|-------------|
| `baseUrl` | URL de su instancia UAZAPI |
| `token` | Token de autenticacion de la instancia |
| `adminToken` | Token admin (opcional, para listar instancias y operaciones admin) |

Puede reconfigurar en cualquier momento con `uazapi setup` o cambiar valores individuales desde el menu interactivo.

## Skills para IA

Enséñele a su agente a usar UAZAPI en segundos. Las skills contienen la referencia completa de la API REST y la CLI en formato optimizado para LLMs — cargadas automáticamente cuando son relevantes.

### Via uazapi-cli (recomendado)

```bash
uazapi install-skills claude    # Claude Code  → ~/.claude/skills/
uazapi install-skills cursor    # Cursor       → ~/.cursor/skills/
uazapi install-skills copilot   # Copilot      → ~/.copilot/skills/
uazapi install-skills cline     # Cline        → ~/.cline/skills/
uazapi install-skills windsurf  # Windsurf     → ~/.codeium/windsurf/skills/
uazapi install-skills codex     # Codex CLI    → ~/.codex/skills/
uazapi install-skills opencode  # OpenCode     → ~/.config/opencode/skills/
uazapi install-skills gemini    # Gemini CLI   → ~/.gemini/skills/
uazapi install-skills hermes    # Hermes       → ~/.hermes/skills/
uazapi install-skills openclaw  # OpenClaw     → ~/.openclaw/skills/
uazapi install-skills all       # Todos a la vez
```

Instala **globalmente** por defecto (funciona en cualquier proyecto). Use `--local` para instalar en el proyecto actual.

O use el menu interactivo: `uazapi` → **Instalar skills de IA**

### Sin la CLI — via prompt para su agente de IA

Pegue el prompt correspondiente a su herramienta. El agente descarga los archivos del repositorio y los instala en el lugar correcto — sin necesitar `uazapi-cli`.

**Claude Code:**
```
Descarga los dos archivos de abajo y guárdalos en ~/.claude/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.claude/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.claude/skills/uazapi-cli/SKILL.md
```

**Cursor:**
```
Descarga los dos archivos de abajo y guárdalos en ~/.cursor/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.cursor/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.cursor/skills/uazapi-cli/SKILL.md
```

**GitHub Copilot:**
```
Descarga los dos archivos de abajo y guárdalos en ~/.copilot/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.copilot/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.copilot/skills/uazapi-cli/SKILL.md
```

**Cline:**
```
Descarga los dos archivos de abajo y guárdalos en ~/.cline/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.cline/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.cline/skills/uazapi-cli/SKILL.md
```

**Windsurf:**
```
Descarga los dos archivos de abajo y guárdalos en ~/.codeium/windsurf/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.codeium/windsurf/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.codeium/windsurf/skills/uazapi-cli/SKILL.md
```

**Codex CLI:**
```
Descarga los dos archivos de abajo y guárdalos en ~/.codex/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.codex/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.codex/skills/uazapi-cli/SKILL.md
```

**OpenCode:**
```
Descarga los dos archivos de abajo y guárdalos en ~/.config/opencode/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.config/opencode/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.config/opencode/skills/uazapi-cli/SKILL.md
```

**Gemini CLI:**
```
Descarga los dos archivos de abajo y guárdalos en ~/.gemini/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.gemini/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.gemini/skills/uazapi-cli/SKILL.md
```

**Hermes (Nous Research):**
```
Descarga los dos archivos de abajo y guárdalos en ~/.hermes/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.hermes/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.hermes/skills/uazapi-cli/SKILL.md
```

**OpenClaw:**
```
Descarga los dos archivos de abajo y guárdalos en ~/.openclaw/skills/ con el contenido completo (incluyendo el frontmatter YAML). Crea los directorios si no existen.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.openclaw/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.openclaw/skills/uazapi-cli/SKILL.md
```

## Build local

```bash
git clone https://github.com/jonesfernandess/uazapi-cli.git
cd uazapi-cli
npm install
npm run build
npm install -g .
```

### Desarrollo

```bash
npm run dev      # Ejecutar con tsx (sin build)
npm run build    # Compilar TypeScript a dist/
npm run lint     # Verificar tipos sin emitir archivos
```

## Stack

- **TypeScript** + **Commander.js** para el framework CLI
- **@clack/prompts** para el menu interactivo
- **chalk** + **gradient-string** + **figlet** para estilos en la terminal

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jonesfernandess/uazapi-cli&type=Date)](https://star-history.com/#jonesfernandess/uazapi-cli&Date)

## Licencia

MIT
