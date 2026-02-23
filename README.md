# GestSilo – Gerenciamento de Silagem (PWA Enterprise)

Sistema de gestão de silagem **Offline-First** para áreas rurais, construído com Next.js 14, RxDB local, e Supabase como backend.

## Documentação Completa

Para uma visão detalhada do contexto do projeto, decisões de arquitetura (incluindo a análise Vite vs Next.js), modelo de dados e planos de implementação, consulte:

*   **[docs/PROJECT_CONTEXT_AND_ARCHITECTURE.md](docs/PROJECT_CONTEXT_AND_ARCHITECTURE.md)**

## Como Rodar Localmente

**Pré-requisitos:** Node.js (v18+)

1.  **Navegue até a pasta do projeto:**
    ```bash
    cd gestsilo
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env.local` na raiz do projeto com suas chaves do Supabase:
    ```
    NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-url>.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```
    (Você pode encontrar esses valores no seu dashboard Supabase ou no arquivo `.env.local` anterior que já estava no projeto.)

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
5.  **Acesse no navegador:**
    Abra `http://localhost:3000` no seu navegador.

---