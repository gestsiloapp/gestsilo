# GestSilo – Contexto do Projeto e Arquitetura (Documento Consolidado)

**Versão:** 1.0  
**Data:** 22 de Fevereiro de 2026  
**Status:** Plano Aprovado – Consolidação Next.js + RxDB PWA Enterprise

---

## Parte 1 – Visão Geral e Contexto Consolidado

O desenvolvimento do GestSilo avançará a partir da base do projeto **`gestsilo`** (Next.js + RxDB), que já incorpora a arquitetura Offline-First robusta e a integração com Supabase. Elementos valiosos do projeto `gestsilo.iastudio` (Vite + mocks) serão migrados e consolidados para enriquecer a UI/UX e completar funcionalidades.

### 1.1 Stack Atual (Base `gestsilo`)

| Camada | Tecnologia | Status |
|--------|------------|--------|
| **Frontend** | Next.js 14 (App Router) | ✅ Implementado |
| **Database Local** | RxDB + Dexie (IndexedDB) | ✅ Funcional |
| **Backend** | Supabase (Postgres + Auth) | ✅ Funcional |
| **Sync** | Outbox Pattern (`sync_status`: PENDING → SYNCED) | ✅ Funcional |
| **Autenticação** | Supabase Auth + Server Actions | ✅ Funcional |
| **Perfis** | Tabela `profiles` (MANAGER, OPERATOR, ADMIN) | ✅ Funcional |
| **Regra de Negócio** | Append-Only (estoque = soma de eventos) | ✅ Validada |
| **PWA** | Manifest configurado | ⚠️ Service Worker não completo |

### 1.2 Funcionalidades Essenciais Validadas

- **Offline-First:** RxDB armazena eventos localmente; sincronização em background. Essencial para uso em áreas rurais.
- **Append-Only:** Eventos (`LOADING`, `USAGE`, `COMPENSATION`) nunca são editados; saldo calculado por agregação.
- **Schema `events`:** `client_event_id`, `silo_id`, `event_type`, `amount_kg`, `input_method`, `sync_status` (local).
- **Schema `silos`:** `id`, `name`, `type`, `content_type`, `capacity_kg`.
- **Bifurcação por perfil:** MANAGER → `/manager`, OPERATOR/ADMIN → `/operator`.
- **Conversão de unidades:** Concha/vagão → kg (fatores configuráveis).

### 1.3 Regra Crítica para Áreas Rurais

> **Uso majoritário em áreas rurais exige trabalho offline com armazenamento temporário.**  
> O operador precisa lançar retiradas/descartes mesmo sem internet; os dados devem ser persistidos localmente e sincronizados quando a conexão for restabelecida.

--- 

## Parte 2 – Justificativa da Escolha Next.js (Base `gestsilo`)

### 2.1 Análise Comparativa Reforçada pelo Contexto Atual

A decisão de prosseguir com **Next.js 14** (presente no projeto `gestsilo`) foi reavaliada e confirmada como a melhor escolha, especialmente devido à já existente e funcional implementação Offline-First com RxDB. Embora a análise inicial pudesse sugerir Vite para um projeto novo e simples, a maturidade e complexidade já desenvolvida no `gestsilo` tornam o Next.js a opção superior para este PWA Enterprise.

| Critério | Next.js (com `gestsilo` existente) | Vite (com `gestsilo.iastudio` existente) | Impacto para PWA Enterprise Offline-First |
|----------|------------------------------------|-----------------------------------------|------------------------------------------|
| **Código existente** | Base robusta com RxDB, Auth, RLS já implementados | Base UI/UX, mas sem persistência ou offline | Next.js acelera a entrega das funcionalidades críticas |
| **Modelo de execução** | Server Components + Client Components + Edge (offline via RxDB/PWA) | SPA 100% client-side | Next.js oferece mais flexibilidade para futuras extensões (ex: API Routes) |
| **PWA / Service Worker** | Manifest configurado; Serwist/Workbox para Service Worker completo | `vite-plugin-pwa` (ecossistema direto) | Ambos suportam, mas a complexidade do `gestsilo` já está resolvida no Next.js |
| **Offline-First** | **RxDB Local-First já funcional; Outbox Pattern implementado** | Sem implementação; exigiria recriar do zero | Next.js com RxDB já atende o requisito mais crítico |
| **Supabase** | SDK completo; Auth com Server Actions para segurança | SDK cliente; Auth client-side | Next.js oferece integração mais profunda e segura para Auth (Server Actions) |
| **RxDB / IndexedDB** | **Totalmente integrado e funcional** | Compatível, mas exigiria nova implementação | RxDB já é um ponto forte do `gestsilo` |
| **Vercel** | Otimizado para Next.js; deploy nativo | Deploy estático | Next.js tem otimizações nativas da Vercel |
| **SEO** | Melhor para páginas públicas (Next.js) | SPA (pouco relevante para dashboard autenticado) | Otimizações de SEO podem ser úteis para futuras landing pages |
| **Tempo para produção** | Menor esforço de integração (com base pronta) | Exigiria muito retrabalho para RxDB/Auth | Next.js (base `gestsilo`) tem caminho mais rápido |

### 2.2 Implicações Práticas: Consolidação Next.js (`gestsilo`) + Migração de UI (`gestsilo.iastudio`)

**O que será feito:**

1. **Base `gestsilo`:** Manter a estrutura Next.js 14 (App Router), o motor RxDB local, a integração Supabase (Auth, RLS, DB) e o sistema de roteamento por perfil.
2. **Migração de UI/UX:** Transferir componentes e lógicas de apresentação (Layout, Dashboards, Configurações, Talhões) do `gestsilo.iastudio` para o `gestsilo`, adaptando-os ao Next.js e aos dados RxDB/Supabase.

**Benefícios:**

- **Aproveitamento Máximo:** Utiliza a base arquitetônica funcional e madura do `gestsilo` e a experiência de UI do `gestsilo.iastudio`.
- **Offline-First Garantido:** O Next.js com RxDB já implementa a funcionalidade crucial para áreas rurais.
- **Segurança Reforçada:** Supabase Auth com Server Actions fornece um modelo de autenticação mais seguro e robusto.
- **Redução de Riscos:** Evita refatorar ou recriar do zero componentes complexos como o motor de sincronização e o banco de dados local.
- **Escalabilidade:** A arquitetura Next.js + Supabase + RxDB é comprovada para aplicações escaláveis.

--- 

---

## Parte 3 – Consolidação de Elementos na Base `gestsilo`

Esta seção detalha os elementos que serão mantidos e os que serão integrados na nova base de código, que é o projeto `gestsilo` (Next.js + RxDB).

### 3.1 Do Projeto Base `gestsilo` (Next.js + RxDB)

Todos os elementos da arquitetura core do `gestsilo` serão mantidos, por serem cruciais para o projeto PWA Enterprise Offline-First:

*   **Next.js 14 (App Router):** Framework principal.
*   **RxDB + Dexie (IndexedDB):** Banco de dados local com estratégia Offline-First e Append-Only.
*   **Supabase (Auth, Postgres, RLS):** Backend e serviço de autenticação.
*   **Outbox Pattern (`sync_status`):** Mecanismo de sincronização de eventos.
*   **Server Actions para Auth:** Modelo de autenticação seguro.
*   **Tabela `profiles` com roles:** `MANAGER`, `OPERATOR`, `ADMIN` para controle de acesso.
*   **Bifurcação por perfil na raiz (`/`):** Redirecionamento para `/manager` ou `/operator`.
*   **Schemas `events` e `silos`:** Modelos de dados para eventos de estoque e silos.

### 3.2 Elementos a Integrar do `gestsilo.iastudio` (Vite + mocks)

Os seguintes elementos serão migrados do `gestsilo.iastudio` para o `gestsilo`, adaptando-os à nova stack e ao fluxo de dados RxDB/Supabase:

| Elemento | Justificativa da Migração |
|----------|---------------------------|
| **Design System (Tailwind)** | Cores, fontes, animações customizadas para unificar a identidade visual. Migrar de CDN para `tailwind.config.js`. |
| **Layout (Sidebar + Nav Mobile)** | UI de navegação mais completa e polida. Adaptar para o App Router e conectar ao status de sincronização. |
| **Páginas: AnalyticsDashboard, SettingsPage, HistoryPage** | UIs mais desenvolvidas que aceleram a entrega de funcionalidades de gestão. Adaptar para buscar dados do RxDB/Supabase. |
| **Componentes: NewFieldForm, FieldList** | Gerenciamento de talhões (fields), funcionalidade essencial. Adaptar para RxDB/Supabase. |
| **OperatorLivestock** | Se a UI ou fluxo for superior, integrar ou mesclar com o existente em `gestsilo` (`src/app/(app)/operator/page.tsx`). |

### 3.3 Elementos a Descartar do `gestsilo.iastudio`

*   **Vite + React Router DOM:** Completamente substituídos pelo Next.js App Router.
*   **Mocks de dados:** Serão substituídos por dados do RxDB local e sincronizados com Supabase.
*   **Tailwind via CDN:** Substituído pela instalação via npm.

--- 

## Parte 4 – Arquitetura Final Unificada

### 4.1 Visão Geral

```mermaid
┌─────────────────────────────────────────────────────────────────────────┐
│                        GESTSILO – PWA ENTERPRISE                        │
│                     Offline-First para Áreas Rurais                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Dispositivo    │     │   Armazenamento  │     │     Backend      │
│   (celular/PC)   │     │     Local        │     │   (Supabase)     │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ • Next.js 14     │────▶│ • RxDB           │────▶│ • PostgreSQL     │
│ • React 18       │     │ • IndexedDB      │     │ • Auth           │
│ • Service Worker │     │ • Outbox Queue   │     │ • Realtime       │
│ • PWA Manifest   │     │                  │     │ • Storage        │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                          │                        │
        │     Sem internet         │     Com internet       │
        │     ────────────────────▶│     ──────────────────▶▶
        │     Grava local          │     Sync PENDING →     │
        │     sync_status=PENDING  │     Supabase → SYNCED  │
        └──────────────────────────┴────────────────────────┘
```

### 4.2 Stack Tecnológico

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS (npm), Lucide Icons |
| **Database Local** | RxDB + Dexie (IndexedDB) – Offline-First, Append-Only, Outbox Pattern |
| **Backend** | Supabase (PostgreSQL, Auth via Server Actions, Realtime, Storage, RLS) |
| **PWA** | Serwist / Workbox, manifest, service worker, precache, runtime cache |
| **Repositório** | GitHub |
| **Deploy** | Vercel (Framework Preset: Next.js) |
| **Orquestrador** | Cursor (IA) |

### 4.3 Funcionalidades Essenciais

1. **Offline-First com armazenamento temporário**
   - Eventos gravados em RxDB/IndexedDB mesmo sem internet.
   - Queue de sincronização (Outbox) com `sync_status`.
   - Indicador visual de online/offline e pendências.

2. **Append-Only**
   - Estoque calculado como soma de eventos.
   - Nunca editar saldos diretamente.
   - Tipos: `LOADING`, `USAGE`, `COMPENSATION`.

3. **Perfis e bifurcação**
   - MANAGER: Dashboard completo, silos, talhões, dashboards, histórico, ajustes.
   - OPERATOR: Modo operador simplificado (seleção de silo, entrada/saída, conversão concha/vagão/kg).
   - ADMIN: Mesmos acessos que MANAGER (ou conforme RBAC futuro).

4. **Conversão de unidades**
   - Concha, vagão, kg.
   - Fatores configuráveis por fazenda em `farms.settings`.

5. **Sincronização**
   - Push de eventos PENDING → Supabase.
   - Marcar como SYNCED após sucesso.
   - Retry em caso de falha.
   - (Futuro) Pull para receber dados de outros usuários.

---

## Parte 5 – Modelo de Dados Unificado

### 5.1 Local (RxDB)

**Coleção `events`:**
- `client_event_id` (PK, UUID)
- `silo_id` (FK)
- `user_id` (string)
- `event_type` ('LOADING' | 'USAGE' | 'COMPENSATION')
- `amount_kg` (number)
- `input_method` ('MANUAL_KG' | 'BUCKET_COUNT' | 'WAGON_COUNT')
- `sync_status` ('PENDING' | 'SYNCED')
- `created_at`, `updated_at` (ISO string)

**Coleção `silos`:**
- `id` (PK, UUID)
- `farm_id` (FK)
- `name`, `type`, `crop`, `status`
- `max_capacity_kg`, `current_stock_kg` (calculado ou cache)
- `dry_matter`, `open_date`
- `created_at`, `updated_at`

**Coleção `fields`** (talhões):
- `id`, `farm_id`, `name`, `area_ha`, `culture`, `status`, `metadata`

### 5.2 Remoto (Supabase)

- `profiles` (id, email, full_name, farm_id, role)
- `farms` (id, name, settings)
- `silos` (espelho do local, com `farm_id`)
- `events` (espelho; sem `sync_status`)
- `bromatology_analyses` (análises de laboratório)
- `fields` (talhões)

### 5.3 Índices RxDB

- `events`: `['sync_status', 'silo_id']` (otimizado para sync e consultas por silo)
- Evitar índices em campos nullable (motivo da migração `synced_at` → `sync_status` no protótipo anterior)

---

## Parte 6 – Fases de Implementação (Novo Plano)

### Fase 1: Análise e Consolidação da Base (0.5–1 dia)
- **Analisar e migrar UI/UX:** Identificar e migrar componentes, estilos e páginas úteis do `gestsilo.iastudio` (protótipo Vite) para o `gestsilo` (Next.js). Priorizar: Design System (Tailwind), Layout (sidebar/nav mobile), `AnalyticsDashboard`, `SettingsPage`, `HistoryPage`, `NewFieldForm`, `FieldList`, e, se pertinente, partes do `OperatorLivestock`.
- **Atualizar Documentação:** Adaptar este documento (`PROJECT_CONTEXT_AND_ARCHITECTURE.md`) para refletir a adoção de `gestsilo` como base e a incorporação de elementos do `gestsilo.iastudio`.

### Fase 2: Finalizar RxDB (Local) e Supabase (Remoto) (1–2 dias)
- **RxDB:** Validar e, se necessário, refatorar setup de RxDB (`db.ts`, `schema.ts`) no `gestsilo`, garantindo a estratégia Append-Only e Outbox Pattern.
- **Supabase:** Criar projeto Supabase, configurar tabelas (`farms`, `silos`, `events`, `profiles`, `bromatology_analyses`, `fields`) via migrations (SQL). Implementar RLS em todas as tabelas sensíveis. Configurar Supabase Auth (Email/Password).
- **Autenticação:** Finalizar e testar `login/actions.ts` e `get-user-profile.ts` para garantir o fluxo completo de autenticação e redirecionamento por perfil.
- **Sincronização:** Validar e refatorar `sync.ts` para garantir push eficiente de eventos `PENDING` para o Supabase e atualização para `SYNCED`.

### Fase 3: Integração Completa de Funcionalidades (2–3 dias)
- **Dashboard Gerente (`/manager`):** Garantir que busca dados do RxDB local (eventos agregados) e silos do RxDB. Adicionar componentes e funcionalidades de visualização de dados do `AnalyticsDashboard` (migrado).
- **Dashboard Operador (`/operator`):** Conectar o formulário de Entrada/Saída ao RxDB para persistir eventos localmente com `sync_status: 'PENDING'`. Implementar cálculo de saldo (`useSiloBalance`) a partir dos eventos locais.
- **Detalhes do Silo (`/silos/[id]`):** Buscar dados do silo e histórico de eventos do RxDB. Integrar exibição de `bromatology_analyses` (do Supabase).
- **Gestão de Talhões (`fields`):** Implementar CRUD completo para talhões usando RxDB local e sincronização.
- **Páginas de Configuração (`/settings`):** Integrar a funcionalidade de ajustes e fatores de conversão (migrada) para o `gestsilo`, persistindo em `farms.settings` no Supabase.

### Fase 4: PWA Avançado e UX (1–2 dias)
- **Service Worker:** Implementar Service Worker completo usando Serwist/Workbox para Next.js (precache, runtime cache, fallbacks para rotas dinâmicas).
- **Offline:** Testar rigorosamente a experiência offline: carregamento, navegação, lançamento de eventos, e sincronização ao reconectar.
- **Indicador de Sincronização:** Atualizar o Header/Layout para exibir o status real de conexão (online/offline) e a quantidade de eventos `PENDING`.
- **UX:** Refinar animações, loading states, e feedback visual para operações. Unificar o `MainLayout` do `gestsilo` (ou o migrado) para uma experiência de usuário consistente.

### Fase 5: Realtime, CI/CD e Hardening (0.5–1 dia)
- **Realtime:** Implementar Supabase Realtime para updates em tempo real em dashboards ou listas de eventos.
- **CI/CD:** Configurar repositório GitHub, conectar ao Vercel (Framework Preset: Next.js), configurar variáveis de ambiente e redirecionamento de Auth no Supabase.
- **Monitoramento e Logs:** Integrar ferramentas de monitoramento e logs.
- **Testes:** Adicionar testes de unidade e integração.
- **Documentação Final:** Finalizar `ARCHITECTURE.md`, `TECH_STACK.md`, `DATABASE.md`, `DEPLOYMENT.md`, `CONTRIBUTING.md` e atualizar `README.md`.

---

## Parte 7 – Documentos Relacionados

- **ARCHITECTURE.md** – Diagramas e fluxos detalhados da arquitetura unificada.
- **TECH_STACK.md** – Versões e responsabilidades das tecnologias (Next.js, RxDB, Supabase, etc.).
- **DATABASE.md** – Schema completo, RLS, migrations, índices (tanto local quanto remoto).
- **DEPLOYMENT.md** – Vercel, variáveis de ambiente, ambientes de deploy.
- **CONTRIBUTING.md** – Setup local, comandos, convenções de código.

--- 

## Referências

- Projeto base: `gestsilo/` (Next.js + RxDB).
- Projeto para migração de UI/UX: `gestsilo.iastudio/` (Vite + mocks).
- `PROJECT_STATUS.md` do `gestsilo` – Contexto original do projeto base.
