# Otimizações de Performance - GestSilo

## Diagnóstico (Investigação)

### Causas identificadas da lentidão

1. **Compilação em modo dev (Webpack)**
   - Next.js compila páginas sob demanda no desenvolvimento
   - Primeira requisição e navegações podem levar 5–7 segundos

2. **Duplicação de chamadas de auth**
   - Middleware: `auth.getUser()` em toda requisição
   - Página raiz: `getUserProfile()` → `auth.getUser()` + `profiles.select()`
   - Para `/`: duas chamadas de auth + uma de profile antes de redirecionar

3. **Página raiz desnecessária**
   - `/` redireciona para `/manager` ou `/operator` conforme o role
   - A página era carregada, executava e só então redirecionava
   - Isso gerava compilação + renderização + chamadas de API antes do destino final

4. **Dependências pesadas**
   - RxDB + Dexie (IndexedDB)
   - Supabase (auth + realtime)
   - `DatabaseProvider` inicializa o banco em todas as rotas protegidas

5. **Aviso do webpack**
   - `Serializing big strings (131kiB)` — cache do webpack, impacto baixo em dev

---

## Otimizações implementadas

### 1. Turbopack (compilação mais rápida)

- **Script:** `next dev --turbo`
- **Efeito:** Compilação mais rápida (ex.: ~1s vs ~6s)
- **Resultado:** Startup e Fast Refresh mais rápidos

### 2. Redirect centralizado no middleware

- **Antes:** `/` → carregava `page.tsx` → `getUserProfile()` → redirect
- **Depois:** `/` → middleware busca profile → redirect direto para `/manager` ou `/operator`
- **Efeito:** Evita carregar a página raiz e reduz chamadas de auth

### 3. Loading.tsx

- **Arquivo:** `src/app/loading.tsx`
- **Efeito:** Mostra loading enquanto a página carrega
- **Resultado:** Melhora a percepção de carregamento durante navegações

---

## Observações

- **Turbopack** ignora o `webpack` custom em `next.config.js` (polyfills para RxDB). Se o RxDB falhar em runtime com Turbopack, use `next dev` (sem `--turbo`) para voltar ao Webpack.
- **Produção** (`next build`): continua usando Webpack; o build não foi alterado.
- **DatabaseProvider**: inicialização do RxDB continua necessária; o ganho é na compilação e no fluxo de auth.

---

## Próximos passos (opcionais)

- **Bundle analyzer:** `@next/bundle-analyzer` para analisar tamanho dos chunks
- **Dynamic imports:** `next/dynamic` para telas pesadas (ex.: dashboards)
- **Cache:** `unstable_cache` ou React Query para cache de dados no servidor
