# 🚜 GestSilo - Contexto do Projeto e Status Atual

**Última Atualização:** 23 de Fevereiro de 2026  
**Versão:** 5.0 (Backend Completo + Realtime + Deploy)

---

## 📋 **ORIENTAÇÕES INICIAIS - ANTES DE CONTEXTUALIZAR**

### ⚠️ **IMPORTANTE: Leia Antes de Começar**

Antes de contextualizar com o projeto GestSilo, é **ESSENCIAL** entender:

1. **Configurações do Ambiente:**
   - Variáveis de ambiente (`.env.local`) devem estar configuradas
   - Supabase deve ter tabelas e policies RLS criadas
   - Banco local (IndexedDB) pode precisar ser limpo após mudanças de schema

2. **Regras de Desenvolvimento:**
   - Sempre responder em **Português (pt-BR)**
   - Preferir soluções simples e manuteníveis
   - Evitar duplicação de código
   - Arquivos não devem exceder 200-300 linhas (refatorar quando necessário)
   - Nunca sobrescrever `.env.local` sem confirmação

3. **Arquitetura do Projeto:**
   - **Offline-First:** RxDB (local) + Supabase (backup)
   - **Append-Only:** Estoque é soma de eventos, nunca editar saldos diretamente
   - **Server Actions:** Autenticação usa Server Actions do Next.js 14
   - **RLS:** Row-Level Security ativo no Supabase

4. **Stack Tecnológica:**
   - Next.js 14 (App Router)
   - RxDB + Dexie (IndexedDB)
   - Supabase (Auth + Postgres)
   - Tailwind CSS + Lucide Icons

5. **Convenções:**
   - TypeScript strict mode
   - Componentes em PascalCase
   - Hooks em camelCase com prefixo `use`
   - Commits seguem padrão: `feat:`, `fix:`, `refactor:`, `docs:`

---

## 🎯 **CONTEXTO DO PROJETO**

### 1. Visão Geral

Sistema de gestão de silagem **Offline-First** para tratadores de gado.

- **Arquitetura:** Local-First (RxDB) com Sincronização em Background (Supabase)
- **Regra de Ouro:** Append-Only (Estoque é soma de eventos, nunca editamos saldos diretamente)
- **UX:** Alto Contraste (Uso sob sol forte)
- **PWA Ready:** Manifesto configurado para instalação em dispositivos móveis
- **Autenticação:** Sistema completo com login/cadastro unificado
- **Rotas por perfil:** Raiz (`/`) redireciona MANAGER → `/manager`, OPERATOR/ADMIN → `/operator`

---

## 2. Stack Tecnológica

- **Frontend:** Next.js 14 (App Router)
- **Estilo:** Tailwind CSS + Lucide Icons (Design System "Industrial Premium")
- **Database Local:** RxDB (Community) com Storage Dexie (IndexedDB)
- **Sync Strategy:** Outbox Pattern ('PENDING' → 'SYNCED') + Realtime (Supabase → RxDB)
- **Backend:** Supabase (Postgres + Auth + Realtime) como backup/réplica
- **Autenticação:** Supabase Auth com Server Actions (SSR)
- **Deploy:** Vercel + GitHub (gestsiloapp/gestsilo)

---

## 3. Estrutura de Dados

### 3.1 Schema Local (RxDB)

**Eventos (`events`):**
- `client_event_id` (PK, UUID)
- `silo_id` (FK, UUID)
- `user_id` (String, padrão: 'user_local')
- `event_type` ('LOADING' | 'USAGE' | 'COMPENSATION')
- `amount_kg` (Number, pode ser negativo para saídas)
- `input_method` ('MANUAL_KG' | 'BUCKET_COUNT' | 'WAGON_COUNT')
- `created_at` (ISO String)
- `updated_at` (ISO String)
- **`sync_status`** ('PENDING' | 'SYNCED') ⚠️ **Campo Crítico**

**Silos (`silos`):**
- `id` (PK, UUID)
- `name` (String)
- `type` (String, ex: 'Trincheira', 'Superfície')
- `content_type` (String, ex: 'Milho (Safra 2024)', 'Sorgo')
- `capacity_kg` (Number)
- `location` (String)
- `created_at` (ISO String)

**Índices:**
- `events`: `['sync_status', 'silo_id']` (otimizado para queries de sincronização)
- `silos`: Nenhum índice adicional (queries simples)

### 3.2 Schema Remoto (Supabase)

**Tabela `events`:**
```sql
-- Schema base; migrations adicionaram farm_id (UUID, FK para farms)
CREATE TABLE events (
    client_event_id UUID PRIMARY KEY,
    silo_id TEXT NOT NULL,
    user_id TEXT,
    farm_id UUID REFERENCES farms(id),  -- Adicionado para multi-fazenda
    event_type TEXT NOT NULL CHECK (event_type IN ('LOADING', 'USAGE', 'COMPENSATION')),
    amount_kg NUMERIC NOT NULL,
    input_method TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
-- Nota: sync_status é controle LOCAL apenas, não vai para Supabase
```

**Tabela `profiles` (Autenticação):**
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'MANAGER' CHECK (role IN ('MANAGER', 'OPERATOR', 'ADMIN')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS Policies (CRÍTICO!)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## 4. Funcionalidades Implementadas

### ✅ Core Features
- [x] **Setup RxDB:** Inicialização segura no browser com `DatabaseProvider`
- [x] **Sync Engine:** Função `pushEventsToSupabase` (busca por `sync_status: 'PENDING'`)
- [x] **Seed de Dados:** Criação automática de 2 silos de teste em `db.ts` se banco vazio
- [x] **Dashboard (Manager):** Lista de Silos com `SiloCard` em `/manager`
- [x] **Cálculo de Saldo:** Hook `useSiloBalance` soma eventos em tempo real
- [x] **Lançamento:** Formulário em `/silos/[id]/new` salvando no RxDB
- [x] **Extrato:** Histórico de eventos em `/silos/[id]` com `EventHistory`
- [x] **UI:** Componentes Button, Card, Header padronizados

### ✅ Rotas por Perfil (v4.0)
- [x] **Bifurcação na raiz (`/`):** `getUserProfile()` no servidor → redireciona por `role`:
  - `MANAGER` → `/manager`
  - `OPERATOR` ou `ADMIN` → `/operator`
- [x] **`get-user-profile.ts`:** Busca perfil na tabela `profiles` (role, full_name, email); fallback `OPERATOR` se perfil inexistente; redirect para `/login` se não autenticado
- [x] **Manager Dashboard (`/manager`):** Lista de silos (SiloCard), links para Extrato e Operação (`/silos/[id]`, `/silos/[id]/new`)
- [x] **Operator Dashboard (`/operator`):** UI de Operação Diária conectada ao RxDB; persistência de retiradas/descartes com `sync_status: 'PENDING'`

### ✅ Módulos e Layout (v5.0)
- [x] **MainLayout:** Sidebar desktop, barra inferior mobile, indicador de sync, logout – integrado ao `layout.tsx`
- [x] **Rotas:** `/dashboards`, `/history`, `/settings` implementadas com dados do RxDB
- [x] **Componentes:** `FieldList`, `SiloSelector`, `MainLayout` com tokens Tailwind (brand, earth, concrete, ui-*, status-*)

### ✅ Sincronização e Realtime (v5.0)
- [x] **Sync com farm_id:** Payload inclui `farm_id` (busca em silos ou fazenda padrão)
- [x] **Sync automático:** Heartbeat a cada 2 minutos no `DatabaseProvider`
- [x] **Realtime Supabase → RxDB:** Hook `useRealtimeSync` inscreve em `events` e `silos`; INSERT/UPDATE/DELETE refletidos no banco local

### 🟡 Pendente
- [ ] **seed.ts:** Módulo `seedSilos()` extraído; `db.ts` mantém seed inline – **não usado**

### ✅ Autenticação (v3.0)
- [x] **Cliente Supabase SSR:** `client.ts`, `server.ts`, `middleware.ts`
- [x] **Server Actions:** Login, Signup e Logout
- [x] **Página Unificada:** Login e Cadastro em `/login`
- [x] **Middleware de Proteção:** Rotas privadas; `/login` é pública
- [x] **Sistema de Perfis:** Criação automática ao cadastrar
- [x] **Header com Logout:** Botão funcional no header

### ✅ Refatorações de Segurança (v2.1)
- [x] **Schema Migration:** `synced_at` → `sync_status` (elimina erro IndexedDB com null)
- [x] **Sync Engine Atualizado:** Query segura com índice otimizado
- [x] **UI de Status:** Feedback visual (✅ Sincronizado / ⏳ Pendente)
- [x] **PWA Manifest:** Configuração para instalação mobile
- [x] **Type Safety:** Enums fortes substituindo campos nullable

---

## 5. Estrutura de Pastas

```text
gestsilo/
├── public/
│   └── manifest.json              # PWA config
├── src/
│   ├── middleware.ts              # Guardião de rotas (proteção + sessão Supabase)
│   ├── app/
│   │   ├── page.tsx               # Bifurcação: getUserProfile → /manager ou /operator
│   │   ├── layout.tsx             # Root Layout (DatabaseProvider + MainLayout)
│   │   ├── globals.css            # Estilos globais
│   │   ├── login/
│   │   │   ├── actions.ts         # Server Actions (login, signup, logout)
│   │   │   └── page.tsx           # Página unificada Login/Signup
│   │   ├── (app)/                 # Route group (não altera URL)
│   │   │   ├── manager/
│   │   │   │   └── page.tsx       # Dashboard Gerente: lista de Silos (RxDB)
│   │   │   └── operator/
│   │   │       └── page.tsx       # Dashboard Operador: Operação Diária (RxDB)
│   │   ├── (modules)/             # Módulos com MainLayout
│   │   │   ├── dashboards/
│   │   │   │   └── page.tsx       # Dashboards com dados RxDB
│   │   │   ├── history/
│   │   │   │   └── page.tsx       # Histórico de eventos
│   │   │   └── settings/
│   │   │       └── page.tsx       # Configurações
│   │   └── silos/
│   │       └── [id]/
│   │           ├── page.tsx       # Extrato do Silo (EventHistory)
│   │           └── new/
│   │               └── page.tsx   # Formulário de Operação (LOADING/USAGE/COMPENSATION)
│   ├── components/
│   │   ├── domain/
│   │   │   ├── SiloCard.tsx       # Card visual do silo + saldo
│   │   │   ├── EventHistory.tsx   # Lista de eventos
│   │   │   ├── FieldList.tsx      # Lista de talhões
│   │   │   └── SiloSelector.tsx   # Seletor de silos
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   └── Card.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Header com logout
│   │   │   └── MainLayout.tsx     # Sidebar + nav mobile (integrado)
│   │   └── providers/
│   │       └── DatabaseProvider.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   └── get-user-profile.ts # Perfil + role no servidor
│   │   ├── database/
│   │   │   ├── db.ts              # Inicialização RxDB + seed inline
│   │   │   ├── schema.ts          # Schemas (events, silos, fields)
│   │   │   ├── seed.ts            # seedSilos() – não usado
│   │   │   ├── hooks.ts           # useRxData, useRxCollection, useSiloEvents
│   │   │   └── RxDBHooksProvider.tsx
│   │   ├── realtime/
│   │   │   └── useRealtimeSync.ts # Supabase Realtime → RxDB
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Client
│   │   │   ├── server.ts          # Server Client
│   │   │   └── middleware.ts      # Session Manager + rotas públicas
│   │   ├── sync.ts                # Motor de sincronização (push PENDING → Supabase)
│   │   └── utils.ts               # Helpers
│   └── hooks/
│       └── useSiloBalance.ts      # Agregação de saldo (soma de eventos)
├── docs/
│   └── PROJECT_CONTEXT_AND_ARCHITECTURE.md
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── PROJECT_STATUS.md              # Este arquivo
```

---

## 6. Fluxo de Dados Crítico

### 6.1 Autenticação e Bifurcação por Perfil
```typescript
// Login: /login → Server Action → Supabase Auth → Cookie → Redirect /
// Signup: /login → Server Action → Auth + Profile → Cookie → Redirect /
// Logout: Header → Server Action (ou supabase.auth.signOut no MainLayout) → Redirect /login

// Raiz (/): page.tsx (Server Component)
//   1. getUserProfile() → supabase.auth.getUser() + profiles
//   2. Se !user → redirect('/login')
//   3. Se profile.role === 'MANAGER' → redirect('/manager')
//   4. Caso contrário (OPERATOR, ADMIN) → redirect('/operator')
```

### 6.2 Criação de Evento
```typescript
// 1. Usuário preenche formulário (silos/[id]/new)
await db.events.insert({
  client_event_id: uuidv4(),
  silo_id: siloId,
  event_type: 'LOADING',
  amount_kg: 1000,
  sync_status: 'PENDING'  // ⚠️ SEMPRE PENDING ao criar
  // ...outros campos
});

// 2. Evento é salvo localmente (IndexedDB)
// 3. UI atualiza instantaneamente (reatividade RxDB)
```

### 6.3 Sincronização (Push: RxDB → Supabase)
```typescript
// Motor busca eventos pendentes
const pending = await db.events.find({
  selector: { sync_status: { $eq: 'PENDING' } }
});

// Payload inclui farm_id (de silos ou fazenda padrão)
// Envia para Supabase
await supabase.from('events').upsert(payload);

// Marca como sincronizado
await db.events.bulkUpsert(
  pending.map(e => ({ ...e, sync_status: 'SYNCED' }))
);
```

### 6.4 Realtime (Pull: Supabase → RxDB)
```typescript
// useRealtimeSync inscreve em postgres_changes (events, silos)
// INSERT/UPDATE: upsert no RxDB local
// DELETE: remove do RxDB local
// Mantém consistência multi-dispositivo/usuário
```

---

## 7. Problemas Resolvidos (Changelog)

### v5.0 - Backend Completo + Realtime + Deploy (23/02/2026) 🎉
**Conquistas:**
1. ✅ **Operator conectado ao RxDB:** Persistência de retiradas/descartes com `sync_status: 'PENDING'`
2. ✅ **Manager/Dashboards com dados reais:** RxDB em vez de mocks
3. ✅ **MainLayout integrado:** Sidebar, nav mobile, rotas `/dashboards`, `/history`, `/settings`
4. ✅ **Sync com farm_id:** Payload inclui farm_id (busca em silos ou fazenda padrão)
5. ✅ **Realtime Supabase → RxDB:** Hook `useRealtimeSync` sincroniza mudanças de outros dispositivos/usuários
6. ✅ **Deploy Vercel:** Build corrigido (fix tipo RxDB subscribe em `hooks.ts`), push GitHub
7. ✅ **Configuração Supabase:** URLs de produção, RLS policies, Realtime (events, silos), fazenda padrão

**Arquivos Criados/Modificados:**
- `src/lib/realtime/useRealtimeSync.ts` (novo)
- `src/lib/database/hooks.ts` (fix: `as any` para collection.$.subscribe)
- `src/components/providers/DatabaseProvider.tsx` (useRealtimeSync)
- `src/app/layout.tsx` (MainLayout)
- `src/app/(modules)/dashboards/page.tsx`, `history/page.tsx`, `settings/page.tsx`
- `src/components/domain/FieldList.tsx`, `SiloSelector.tsx`
- `src/components/layout/MainLayout.tsx` (integrado)
- `src/lib/sync.ts` (farm_id no payload)

### v4.0 - Rotas por Perfil – Manager / Operator (25/01/2026) 🎉
**Conquistas:**
1. ✅ **Bifurcação na raiz:** `/` usa `getUserProfile()` e redireciona MANAGER → `/manager`, outros → `/operator`
2. ✅ **Manager Dashboard:** Lista de silos (SiloCard) em `/manager`; links para Extrato e Operação
3. ✅ **Operator Dashboard:** UI de Operação Diária (Entrada/Saída) em `/operator`; *persistência no RxDB pendente*
4. ✅ **get-user-profile.ts:** Busca perfil + role no servidor; fallback OPERATOR; redirect se não autenticado
5. ✅ **Route group `(app)`:** `manager` e `operator` organizados sem alterar a URL

**Arquivos Criados/Modificados:**
- `src/app/page.tsx` (reescrito: server-side, getUserProfile, redirect por role)
- `src/app/(app)/manager/page.tsx` (novo)
- `src/app/(app)/operator/page.tsx` (novo)
- `src/lib/auth/get-user-profile.ts` (novo)
- `src/components/layout/MainLayout.tsx` (novo – em desenvolvimento, não integrado)
- `src/lib/database/seed.ts` (novo – não usado; db.ts mantém seed inline)

**Observações:**
- Manager e Operator usam `Header`; `MainLayout` (sidebar/nav) ainda não envolve as rotas
- `MainLayout` referencia tokens Tailwind e rotas (`/dashboards`, `/history`, etc.) ainda inexistentes

### v3.0 - Autenticação Completa (20/01/2026)
**Conquistas:**
1. ✅ **Sistema de Autenticação:** Login, Signup e Logout funcionais
2. ✅ **Página Unificada:** Login e Cadastro na mesma tela com toggle
3. ✅ **Middleware de Proteção:** Rotas privadas protegidas automaticamente
4. ✅ **Sistema de Perfis:** Criação automática ao cadastrar
5. ✅ **RLS Policies:** Configuração correta no Supabase
6. ✅ **Provedor de Email:** Configurado e funcionando

**Arquivos Criados/Modificados:**
- `src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- `src/middleware.ts`, `src/app/login/actions.ts`, `src/app/login/page.tsx`
- `src/components/layout/Header.tsx` (logout)
- `src/app/signup/page.tsx` (removido)

### v2.1 - Refatoração de Segurança (19/01/2026)
**Problema:** IndexedDB não aceita índices em campos nullable (`synced_at: null`).

**Solução Implementada:**
1. ✅ Migrado campo `synced_at` (Date | null) → `sync_status` (enum string)
2. ✅ Índice seguro criado: `['sync_status', 'silo_id']`
3. ✅ Query de sync otimizada com `$eq: 'PENDING'`
4. ✅ UI atualizada com feedback visual de status
5. ✅ Manifesto PWA criado (`public/manifest.json`)

**Breaking Change:** ⚠️ Banco local precisa ser limpo (schema incompatível com versão anterior).

---

## 8. Configuração do Ambiente

### 8.1 Variáveis de Ambiente (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**⚠️ IMPORTANTE:** Nunca commitar este arquivo no git!

### 8.2 Configurações Supabase Necessárias

**1. Tabela `profiles` com RLS:**
```sql
-- Execute o SQL da seção 3.2 para criar tabela e policies
```

**2. Authentication Settings:**
- Provedor de email configurado
- Email confirmations configurado conforme necessidade (desenvolvimento/produção)

**3. URL Configuration:**
```
Site URL: http://localhost:3000  (dev) | https://gestsilo.vercel.app (prod)
Redirect URLs: 
  - http://localhost:3000
  - http://localhost:3000/**
  - https://gestsilo.vercel.app
  - https://gestsilo.vercel.app/**
  - https://*.vercel.app/**
```

**4. Realtime (Postgres Changes):**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE silos;
```

**5. Fazenda padrão (obrigatório para sync):**
```sql
INSERT INTO farms (id, name, settings, created_at, updated_at)
VALUES (gen_random_uuid(), 'Fazenda Principal', '{}'::jsonb, NOW(), NOW());
```

**6. RLS Policies:** profiles, farms, silos, events, fields, bromatology_analyses (ver SQL na seção 12)

### 8.3 Deploy (Vercel)
- Variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (All Environment)
- Repositório: https://github.com/gestsiloapp/gestsilo
- `vercel link` para conectar projeto local

### 8.4 Comandos
```bash
npm install          # Instalar dependências
npm run dev          # Servidor de desenvolvimento (porta 3000-3002)
npm run build        # Build de produção
npm run start        # Servidor de produção
```

---

## 9. Tarefas Futuras (Backlog)

### ✅ Concluído (v5.0)
- [x] Conectar Operator ao RxDB
- [x] Integrar MainLayout
- [x] Sincronização automática em background (2 min)
- [x] Rotas `/dashboards`, `/history`, `/settings`
- [x] Realtime Supabase → RxDB

### 🔜 Prioridade Alta
- [ ] Indicador visual de conexão/offline (conectar ao estado real de sync)
- [ ] Retry logic para falhas de sincronização
- [ ] Exibir informações do usuário logado no Header (getUserProfile)
- [ ] Rota `/team` (Equipe)

### 🔜 Pendentes
- [ ] Unificar seed: usar `seed.ts` em `db.ts` ou remover `seed.ts`

### 🔮 Melhorias Futuras
- [ ] Multi-usuário com permissões (admin/tratador) – base em `profiles.role` já existe
- [ ] Relatórios e gráficos de consumo
- [ ] Exportação de dados (CSV/PDF)
- [ ] Notificações push (alertas de estoque baixo)
- [x] Sincronização bidirecional: Push (sync) + Pull (Realtime) ✅
- [ ] Modo câmera para fotos dos silos
- [ ] Geolocalização dos silos

### 🎨 UX/UI
- [ ] Ícone do app (`public/icon.png` 512x512)
- [ ] Splash screen
- [ ] Animações de transição mais elaboradas
- [ ] Modo escuro (opcional)
- [ ] Tutorial de primeiro uso

---

## 10. Notas Técnicas Importantes

### ⚠️ Limpeza de Banco Necessária
Após atualizar o schema, limpe o IndexedDB:
```
F12 → Application → Storage → Clear site data
OU
Abrir em aba anônima
```

### 🔒 Segurança
- Cliente Supabase usa chave ANON (segura para client-side)
- RLS (Row Level Security) configurado e ativo no Supabase
- Nunca commitar `.env.local` no git
- Server Actions executam no servidor (seguro)
- Cookies HTTP-only para sessões

### 🚀 Performance
- Índices otimizados para queries frequentes
- Saldo calculado em tempo real (sem cache - futura otimização)
- Ordenação no RxDB (não em JavaScript)
- Middleware executa no Edge (rápido)

### 📱 PWA
- Manifesto configurado para instalação
- Service Worker ainda não implementado (offline-first já funciona via IndexedDB)
- Ícone pendente (`public/icon.png`)

### 🔐 Autenticação
- Sistema completo com login/cadastro unificado
- Middleware protege todas as rotas privadas (exceto `/login`)
- Perfis criados automaticamente ao cadastrar
- Logout funcional no header (e no MainLayout quando integrado)
- Bifurcação por `profiles.role` em `/` → `/manager` ou `/operator`

### 📁 Componentes e Módulos
- **MainLayout:** Integrado ao `layout.tsx`; sidebar desktop, nav mobile, rotas `/dashboards`, `/history`, `/settings`.
- **seed.ts:** `seedSilos()` extraído; `db.ts` mantém seed inline. Pendente: unificar ou remover.

---

## 11. Convenções do Projeto

### Commits
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `refactor:` refatoração sem mudança funcional
- `docs:` documentação
- `style:` formatação

### Código
- TypeScript strict mode
- ESLint + Prettier
- Componentes em PascalCase
- Hooks em camelCase com prefixo `use`
- Tipos exportados de `schema.ts`
- Server Actions marcadas com `'use server'`

### Arquitetura
- Offline-First: RxDB local + Supabase backup
- Append-Only: Nunca editar saldos diretamente
- Server Actions para autenticação
- Middleware para proteção de rotas

---

## 12. Troubleshooting

### Problema: "new row violates row-level security policy"
**Solução:** Verificar se as 3 policies RLS estão criadas na tabela `profiles`:
```sql
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'profiles';
-- Deve retornar: INSERT, SELECT, UPDATE
```

### Problema: "Database error saving new user"
**Solução:** Verificar configurações de Authentication no Supabase:
- Provedor de email configurado
- Email confirmations configurado corretamente

### Problema: Middleware redirecionando incorretamente
**Solução:** Verificar rotas públicas em `src/lib/supabase/middleware.ts`

### Problema: "Repository not found" ao fazer git push
**Solução:** Credenciais GitHub travadas no Windows. Gerenciador de Credenciais → remover entradas `git:https://github.com`. Ou: `cmdkey /delete:git:https://github.com`

### Problema: Build falha com "This expression is not callable" em hooks.ts
**Solução:** Erro de union type do RxDB em `collection.$.subscribe`. Usar `(collection as any).$.subscribe()`.

### Problema: Realtime logs vazios no Supabase
**Solução:** Verificar se `events` e `silos` estão em `supabase_realtime` (SQL Editor). Logs só aparecem quando o app está aberto com usuário logado.

---

**Status Geral:** ✅ **Produção-Ready** (backend completo, Realtime, deploy Vercel)  
**Próximo Marco:** PWA Service Worker, testes em produção
