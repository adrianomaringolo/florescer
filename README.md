# Florescer

Painel da equipe do Projeto Florescer para acompanhar pessoas que pedem atendimento
terapêutico, do pedido ao desligamento — mais a página pública do termo de compromisso.

Baseado no protótipo `Projeto Florescer dashboard` e na identidade visual da
apresentação de logotipos (opção 01). As referências originais estão em `docs/referencias/`.

## Rodando

Requer Docker (para o Postgres local).

```bash
pnpm install
cp .env.example .env.local   # preencha INTAKE_TOKEN (openssl rand -base64 32)
pnpm db:up                   # sobe o Postgres local em localhost:5433
pnpm db:setup                # aplica migrações, insere dados de exemplo e cria o 1º usuário
pnpm dev                     # http://localhost:3002
```

O `db:setup` imprime o e-mail e a senha do primeiro usuário (defina `SEED_ADMIN_SENHA` para
escolher). Use `pnpm db:seed -- --sem-exemplos` para criar só o usuário, sem casos fictícios.

| Script | O quê |
|---|---|
| `pnpm db:up` / `db:down` | Sobe / para o Postgres local (container `florescer-db`) |
| `pnpm db:reset` | Apaga o banco local e recria com os dados de exemplo |
| `pnpm db:generate` | Gera uma migração a partir de `src/db/schema.ts` |
| `pnpm db:migrate` | Aplica as migrações pendentes |
| `pnpm db:seed` | Dados de exemplo + primeiro usuário (idempotente) |
| `pnpm db:studio` | Drizzle Studio para inspecionar o banco |

## Arquitetura

- **Next.js 15 (App Router)** — páginas do painel carregam os dados no servidor
  (`src/app/(painel)/layout.tsx`) e a interface chama **Server Actions** (`src/server/acoes.ts`).
- **Banco**: **Postgres + Drizzle ORM** (`src/db/`), driver `postgres` (postgres.js).
  Em dev, um container Docker; em produção, o **Neon**.
- **Regras de negócio** (`src/lib/regras.ts`) são compartilhadas entre interface e servidor.
  As transições de status são validadas de novo no servidor — a interface só esconde o que
  não se aplica.

### Autenticação

- E-mail e senha (hash **scrypt**). Sessão em cookie `httpOnly` com token aleatório; o banco
  guarda só o SHA-256 do token. Validade de 30 dias.
- Sem níveis de acesso (1.3): toda pessoa usuária ativa pode tudo.
- **Cadastro de usuário** (tela Usuários), de duas formas:
  - **Senha provisória**: quem cadastra define a senha (o painel sugere uma) e a passa à pessoa
    por outro canal. O acesso já nasce ativo, mas com `trocar_senha`: até criar uma senha
    própria em `/trocar-senha`, a pessoa não vê nenhum dado — `/api/painel` e as ações
    respondem 403.
  - **Convite**: gera um link `/convite/<token>` válido por 7 dias e de uso único; a pessoa
    cria a senha e entra. Sem provedor de e-mail, o link aparece num aviso para copiar.
- **Trocar senha**: `/trocar-senha`, pela barra lateral. Pede a senha atual (exceto quando a
  senha é provisória) e encerra as sessões nos outros aparelhos.
- **Esqueci a senha**: ainda não há fluxo (fora do escopo, item 6).
- `src/middleware.ts` só barra quem não tem cookie; a validação real acontece em cada página
  e ação (`usuarioAtual` / `exigirUsuario`).

### Rotas públicas

| Rota | O quê |
|---|---|
| `/login` | Entrada da equipe |
| `/convite/[token]` | Criação de senha a partir do convite |
| `/trocar-senha` | Troca de senha (obrigatória no primeiro acesso com senha provisória) |
| `/termo/[token]` | Termo de compromisso — link individual por caso, aceite único |
| `POST /api/solicitacoes` | Cria um caso a partir do formulário (`Authorization: Bearer $INTAKE_TOKEN`) |

Exemplo de envio do formulário:

```bash
curl -X POST http://localhost:3002/api/solicitacoes \
  -H "Authorization: Bearer $INTAKE_TOKEN" -H "Content-Type: application/json" \
  -d '{"nome":"Ana Souza","idade":30,"email":"ana@email.com","telefone":"(11) 99999-0000",
       "motivo":"Ansiedade","disponibilidade":"Seg e Qua à noite","publico":"Adulto"}'
```

Casos com contato incompleto ou menção de risco entram como **Pendente** (2.5). O risco vem
do campo `risco: true` ou de uma lista de termos em `route.ts` — é uma rede de segurança,
não substitui a leitura humana.

### Auditoria e e-mails

- Tabela `auditoria`: login, cada visualização de caso e cada alteração (5.2).
- Tabela `emails`: caixa de saída de tudo que o sistema "envia" (boas-vindas, ficha,
  lembretes, convites, cópia do termo). Ainda não há provedor; ligar o Resend (ou similar)
  é trocar `enviarEmail` em `src/server/registro.ts`.

## Identidade visual

- **Logo**: `public/brand/florescer-logo.svg` e `florescer-rosa.svg`, extraídos em vetor do PDF
  (wordmark Astrid convertido em contornos). No código, `<Logo />` e `<Rosa />` usam `currentColor`.
  Combinação principal: areia `#D5CEB1` sobre vinho `#8F143F`.
- **Paleta**: creme `#FAF3D5`, areia `#D5CEB1`, caramelo `#BC976B`, vinho `#8F143F`,
  ameixa `#4C1B4B`, bruma `#8DA8B1` — tokens em `src/app/globals.css` e `tailwind.config.ts`.
  Terracota fica reservada a risco/problemas.
- **Tipografia**: a Astrid é comercial e só aparece no logo. Títulos usam Cormorant Garamond
  (serifa delicada, próxima da Astrid); texto de interface usa Public Sans.

## Decisões sobre pontos da especificação

- **Ocupação** é derivada dos casos "Em atendimento" ligados ao terapeuta (1.2).
- **Disponibilidade** só ordena a sugestão; público, status ativo e vaga livre eliminam (2.2).
- **"1º atendimento confirmado"** virou uma terceira marcação em "Em atendimento", para que o
  alerta de "> 5 dias úteis" (3) tenha como ser resolvido. Dias úteis são aproximados a partir
  dos dias corridos no status.
- **Ordem de urgência**: risco → dados incompletos → parados → escolha → acolhimento. A spec
  não posiciona "dados incompletos"; ficou logo após risco por ser imediato.
- **Desligamento** (fora do escopo, item 6): implementado como modal com motivo obrigatório,
  disponível em qualquer status exceto Desligado.
- **Termo para menores**: se a idade do caso for < 18, "responsável legal" vem marcado e travado
  (validado também no servidor).
- **Termo e novos atendimentos**: ao encaminhar ou retornar, repasse e 1º atendimento voltam ao
  padrão; o termo fica marcado se a pessoa já aceitou online (o aceite é do paciente).
- Em aberto, mantidos como na spec: envio de boas-vindas não é obrigatório para concluir o
  acolhimento; marcações voltam ao padrão a cada novo atendimento.

## Deploy (Vercel + Neon)

1. **Neon**: crie um projeto (região mais próxima do Brasil disponível). No painel, em
   *Connection details*, copie duas strings:
   - **Pooled connection** (host com `-pooler`) → `DATABASE_URL`
   - **Direct connection** → `DATABASE_URL_DIRETA` (usada só pelas migrações)
   Com o CLI do Neon (`neon link`), as variáveis são baixadas para o `.env.local`. Mova
   `DATABASE_URL`, `DATABASE_URL_UNPOOLED` e `NEON_BRANCH` para `.env.neon.local` e devolva ao
   `.env.local` a URL do Postgres local, para o dev não usar o banco de produção. Use
   `neon deploy --no-env-pull` pelo mesmo motivo.
2. **Migrações e primeiro usuário**, da sua máquina, lendo o `.env.neon.local`:
   ```bash
   pnpm db:neon:migrate
   SEED_ADMIN_EMAIL=voce@florescer.org SEED_ADMIN_SENHA='...' pnpm db:neon:seed
   ```
   Com `--sem-exemplos` (já incluso no `db:neon:seed`), a senha do seed é provisória: o painel
   pede uma nova no primeiro acesso.
3. **Vercel**: importe o repositório e defina `DATABASE_URL` (pooled), `APP_URL`
   (ex.: `https://florescer.vercel.app`) e `INTAKE_TOKEN`. Região das funções: a mais próxima
   do banco.
4. A cada mudança no schema: `pnpm db:generate`, commit da migração em `drizzle/` e
   `pnpm db:neon:migrate` antes do deploy.

No plano gratuito, o Neon suspende o banco após 5 minutos sem uso e o retoma sozinho na próxima
consulta — a primeira requisição depois de um tempo parado leva um pouco mais.
