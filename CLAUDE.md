# Memora Estúdio — Contexto para Claude Code

## O que é este projeto

Plataforma de encomendas de retratos artísticos sob encomenda. Clientes fazem pedidos, enviam fotos de referência, e recebem versões do retrato para aprovação antes da entrega final. Desenvolvido no Lovable (lovable.dev) — **não fazer force push nem rebase/amend de commits já publicados**, pois o Lovable sincroniza o histórico git.

## Stack

- **Runtime**: Bun
- **Framework**: React 19 + TanStack Router/Start (SSR)
- **Banco**: Supabase (Auth + Postgres + Storage)
- **UI**: Tailwind v4 + Radix UI + shadcn/ui
- **Build**: Vite 8
- **Dev**: `bun run dev`

## Estrutura de arquivos relevantes

```
src/
  components/
    Memora.jsx                   # App root (53 linhas) — session, role, routing
    memora/
      images.js                  # Base64 das imagens de estilo (ART, BRUSH, ARTSTYLE)
      constants.js               # Todas as constantes: PIX, cores, arrays de dados, SERIF
      helpers.js                 # normalize, seedOrders, artGradient, fmtFormato, etc.
      styles.js                  # Objeto S (inline styles) + string CSS global
      Shell.jsx                  # Layout: header, main, footer
      Login.jsx                  # Formulário login/cadastro (Supabase)
      ui/
        pieces.jsx               # ArtSample, Frame, StatusTag, Uploader, FilePick, etc.
      client/
        Client.jsx               # Dashboard do cliente + OrderCard
        NewOrder.jsx             # Wizard de novo pedido (4 fases)
        ClientDetail.jsx         # Detalhe do pedido + ResumoPedido + aprovação de versões
      admin/
        AdminCloud.jsx           # Tabela de pedidos do ateliê (dados Supabase)
        NewOrderModal.jsx        # Modal de criação de pedido pelo admin
        AdminCloudDetail.jsx     # Detalhe do pedido + PixCard (QR Code + e-mail)
  routes/
    __root.tsx                   # Root com QueryClientProvider e error/404 boundaries
    index.tsx                    # Rota "/" monta <Memora />
  integrations/supabase/
    client.ts                    # Supabase client (lazy proxy, funciona client + SSR)
    auth-attacher.ts             # Middleware client: anexa Bearer token às serverFns
    auth-middleware.ts           # Middleware server: valida token JWT no lado servidor
  lib/
    pix.ts                       # Lógica de pagamento PIX
supabase/migrations/             # Migrações aplicadas ao banco
```

## Banco de dados (esquema atual)

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Dados do usuário (id, email, full_name) — criado automaticamente no cadastro |
| `user_roles` | Papéis dos usuários: `admin` ou `client` — todo novo usuário recebe `client` |
| `orders` | Pedidos de retrato (client_user_id, style, people_count, include_pet, status, price_cents, paid_at) |
| `order_photos` | Fotos enviadas pelos clientes (storage_path) |
| `order_versions` | Versões do retrato enviadas pelo admin (v1 e v2, is_approved) |

### Status do pedido (enum `order_status`)

`draft` → `awaiting_photos` → `in_production` → `versions_sent` → `approved` → `completed`

### Storage

Bucket `order-images` com RLS: admins gerenciam tudo; clientes leem/escrevem apenas na pasta do próprio pedido (`{order_id}/...`).

### Funções SQL

- `has_role(user_id, role)` — verifica papel do usuário (SECURITY DEFINER)
- `handle_new_user()` — trigger em `auth.users`: cria profile + atribui papel `client`

## Autenticação

### Fluxo client-side (`Memora.jsx`)

1. `supabase.auth.getSession()` ao montar o app — recupera sessão existente
2. `supabase.auth.onAuthStateChange` — atualiza `session` state em tempo real
3. `supabase.auth.signInWithPassword({ email, password })` — login
4. `supabase.auth.signUp({ email, password })` — cadastro
5. `supabase.auth.signOut()` — logout
6. Após sessão ativa: busca papel do usuário na tabela `user_roles` via `fetchRole`
7. Renderiza `<Login />` se sem sessão, ou `<Client />` / view admin conforme papel

### Fluxo server-side (serverFns)

- `auth-attacher.ts`: middleware client que lê `session.access_token` e injeta header `Authorization: Bearer <token>` nas chamadas de serverFn
- `auth-middleware.ts`: middleware server que valida o token JWT via `supabase.auth.getClaims(token)`, expõe `{ supabase, userId, claims }` no contexto

## Papéis de usuário

- **`client`**: vê apenas seus próprios pedidos; envia fotos; aprova versões
- **`admin`**: gerencia todos os pedidos; faz upload de versões; envia e-mails de notificação; acessa painel AdminCloud com PIX

## Componentes principais

| Arquivo | Componente(s) | Descrição |
|---------|---------------|-----------|
| `Memora.jsx` | `App`, `ClaimAdminBar` | Root: session, role, routing |
| `memora/Shell.jsx` | `Shell` | Layout com header e logout |
| `memora/Login.jsx` | `Login` | Formulário login/cadastro |
| `memora/client/Client.jsx` | `Client`, `OrderCard` | Dashboard do cliente |
| `memora/client/NewOrder.jsx` | `NewOrder` | Wizard de novo pedido (4 fases) |
| `memora/client/ClientDetail.jsx` | `ClientDetail`, `ResumoPedido` | Detalhe + aprovação de versões |
| `memora/admin/AdminCloud.jsx` | `AdminCloud` | Painel admin com tabela de pedidos |
| `memora/admin/NewOrderModal.jsx` | `NewOrderModal` | Modal de criação pelo admin |
| `memora/admin/AdminCloudDetail.jsx` | `AdminCloudDetail`, `PixCard` | Detalhe + QR Code PIX + e-mails |
| `memora/ui/pieces.jsx` | vários | ArtSample, Frame, StatusTag, Uploader, FilePick, ProgressRail, etc. |

## Status atual (atualizado 2026-06-27)

### ✅ Concluído
- Fluxo de autenticação completo funcionando e validado com testes automatizados
- Login com credenciais erradas → mensagem "Invalid login credentials" ✅
- Signup de novo cliente → dashboard de cliente, sem acesso admin ✅
- Login admin (`artista@memoraestudio.com`) → dashboard de ateliê ✅
- Botão "Sou a artista" → promove para admin via RLS (sem dependência de RPC) ✅
- `inputValidator()` → `validator()` em `orders.functions.ts` (API atualizada)
- Todas as migrations aplicadas no projeto Supabase correto
- Refatoração de `Memora.jsx` (1697 linhas → 53 linhas) em 13 módulos ✅

### ⚠️ Supabase: projeto correto é `jsdcwkuekaqfwukcsjyt`
O projeto antigo (`njweakwqimosafwtzehb`) era gerenciado pelo Lovable e sem acesso direto.
O `.env` já aponta para o projeto correto.

### Migrations aplicadas (em ordem)
1. Tabelas principais: profiles, user_roles, orders, order_photos, order_versions + triggers
2. GRANT INSERT + policy RLS para claim de primeiro admin
3. Storage policies para bucket `order-images`
4. Colunas price_cents e paid_at na tabela orders

## Comandos úteis

```bash
bun run dev       # servidor de desenvolvimento
bun run build     # build de produção
bun run lint      # ESLint
bun run format    # Prettier
```

## Variáveis de ambiente (`.env`)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
```
