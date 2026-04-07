# uazapi-cli

> **Aviso:** Esta é uma ferramenta **não oficial**, criada por mim para facilitar minhas automações. **Não possui nenhum vínculo, endosso ou associação com a UAZAPI.**

**[English](README.en.md) | [Espanol](README.es.md)**

Uma interface de linha de comando para a API de WhatsApp da [UAZAPI](https://uazapi.com). Gerencie sua instancia, envie mensagens, administre grupos, contatos, webhooks e muito mais — tudo pelo terminal.

## O problema

A UAZAPI expõe uma API REST poderosa com mais de 128 endpoints para automacao de WhatsApp. Mas interagir com ela significa ficar lidando com comandos `curl`, lembrando paths de endpoints, montando payloads JSON e gerenciando headers de autenticacao manualmente.

Eles até tem um arquivo yaml com instruções que podem ser usadas para instruir a sua LLM quanto ao uso da API, porém eu construí algo que considero mais poderoso e prático de usar.

**uazapi-cli** encapsula toda a superficie da UAZAPI em um único binario com:

- Um **menu interativo** para operacoes rapidas (testar conexao, enviar mensagem, listar instancias)
- Uma **CLI completa** com subcomandos para scripts e automacao (`uazapi send text --to 5511... --message "ola"`)
- Um **wizard de configuracao** que salva a URL e o token da instancia uma unica vez
- **Auto-atualizacao** embutida — rode `uazapi update` a qualquer momento

Chega de copiar e colar tokens em headers ou consultar a documentacao a cada request.

![uazapi-cli menu interativo](screenshot.jpeg)

## Instalacao

Um comando:

```bash
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/install.sh | bash
```

O script verifica Node.js 18+ e npm, clona o repositorio em `~/.uazapi-cli-app`, compila e instala o comando `uazapi` globalmente.

**Requisitos:** Node.js 18+, npm, git.

## Inicio rapido

```bash
# 1. Instalar
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/install.sh | bash

# 2. Configurar — abre o wizard de setup
uazapi setup

# 3. Testar a conexao
uazapi instance status

# 4. Enviar sua primeira mensagem
uazapi send text --to 5511999999999 --message "Ola do terminal!"
```

Ou rode `uazapi` sem argumentos para abrir o menu interativo.

## Atualizacao

Atualize para a versao mais recente a qualquer momento:

```bash
uazapi update
```

`uazapi upgrade` também funciona. O comando puxa o código mais recente do GitHub, reinstala dependências e recompila automaticamente.

## Uso

### Modo interativo

Rode `uazapi` sem argumentos:

```
  UAZAPI CLI — WhatsApp API from the terminal

  ● O que deseja fazer?
  ● ⚡ Testar conexao      (verifica status da instancia)
  ○ ☰  Listar instancias   (todas as instancias da API)
  ○ ✉  Enviar mensagem     (envio rapido de texto)
  ○ ⚙  Setup wizard
  ○ ✕  Sair
```

### Modo CLI

Para scripts e automacao:

```
uazapi [comando] [subcomando] [opcoes]
```

### Comandos

| Comando | Descricao |
|---------|-----------|
| `instance` | Gerenciar instancia WhatsApp (conectar, desconectar, status, reset) |
| `send` | Enviar mensagens (texto, midia, localizacao, contato, carrossel, enquete, botao PIX) |
| `message` | Gerenciar mensagens (buscar, deletar, baixar, editar, reagir) |
| `chat` | Gerenciar conversas (buscar, arquivar, bloquear, deletar, silenciar, fixar) |
| `group` | Gerenciar grupos do WhatsApp |
| `contact` | Gerenciar contatos |
| `webhook` | Gerenciar webhooks |
| `newsletter` | Gerenciar Canais/Newsletters do WhatsApp |
| `business` | Perfil comercial e catalogo |
| `sender` | Envio em massa |
| `admin` | Operacoes administrativas (requer token admin) |
| `label` | Gerenciar etiquetas |
| `profile` | Gerenciar perfil do WhatsApp |
| `setup` | Wizard de configuracao |
| `update` | Atualizar para a versao mais recente |

### Exemplos

```bash
# Verificar status da instancia
uazapi instance status

# Enviar mensagem de texto
uazapi send text --to 5511999999999 --message "Ola!"

# Enviar imagem
uazapi send media --to 5511999999999 --type image --file https://exemplo.com/foto.jpg

# Enviar botao de pagamento PIX
uazapi send pix-button --to 5511999999999 --key "sua-chave-pix" --amount 49.90

# Postar um Story no WhatsApp
uazapi send status --type text --message "Novidade!"

# Configurar webhook
uazapi webhook set --url https://seu-servidor.com/webhook

# Listar todos os grupos
uazapi group list

# Ajuda de qualquer comando
uazapi send --help
uazapi instance connect --help
```

## Configuracao

Na primeira execucao, o wizard cria `~/.uazapi-cli/config.json`:

```json
{
  "baseUrl": "https://sua-instancia.uazapi.com",
  "token": "seu-token-de-instancia",
  "adminToken": ""
}
```

| Campo | Descricao |
|-------|-----------|
| `baseUrl` | URL da sua instancia UAZAPI |
| `token` | Token de autenticacao da instancia |
| `adminToken` | Token admin (opcional, para listar instancias e operacoes admin) |

Voce pode reconfigurar a qualquer momento com `uazapi setup` ou alterar valores individuais pelo menu interativo.

## Build local

```bash
git clone https://github.com/jonesfernandess/uazapi-cli.git
cd uazapi-cli
npm install
npm run build
npm install -g .
```

### Desenvolvimento

```bash
npm run dev      # Rodar com tsx (sem build)
npm run build    # Compilar TypeScript para dist/
npm run lint     # Verificar tipos sem emitir arquivos
```

## Stack

- **TypeScript** + **Commander.js** para o framework CLI
- **@clack/prompts** para o menu interativo
- **chalk** + **gradient-string** + **figlet** para estilizacao no terminal

## Licenca

MIT
