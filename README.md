# AliExpress Affiliate Telegram Bot

Pipeline em TypeScript para buscar promocoes pela API oficial de afiliados da AliExpress e publicar no Telegram com link de afiliado.

## O que este projeto faz

- Coleta ofertas da AliExpress via endpoint oficial
- Gera/resolve deeplink de afiliado
- Aplica filtro de preco maximo
- Evita duplicidade de envio por ciclo
- Publica no Telegram com formatacao de oferta
- Executa continuamente com agendamento (`node-cron`)

## Pre-requisitos

- Node.js 20+
- Conta de afiliado AliExpress ativa
- Credenciais oficiais da API de afiliado:
  - `ALIEXPRESS_APP_KEY`
  - `ALIEXPRESS_APP_SECRET`
  - `ALIEXPRESS_TRACKING_ID`
- Bot do Telegram e `chat_id` de destino

## Instalacao

1. Instale dependencias:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` na raiz:

```env
TELEGRAM_TOKEN=seu_token_do_bot
TELEGRAM_CHAT_ID=seu_chat_id

ALIEXPRESS_APP_KEY=sua_app_key
ALIEXPRESS_APP_SECRET=seu_app_secret
ALIEXPRESS_TRACKING_ID=seu_tracking_id

# opcionais
ALIEXPRESS_API_BASE_URL=https://api-sg.aliexpress.com
ALIEXPRESS_DEALS_PATH=/affiliate/deals/hot
ALIEXPRESS_DEEPLINK_PATH=/affiliate/deeplink/create
ALIEXPRESS_QUERY_KEYWORD=smartphone
MAX_PRICE_BRL=500
POLL_INTERVAL_MINUTES=15
MAX_ITEMS_PER_CYCLE=10
REQUEST_TIMEOUT_MS=12000
```

## Scripts

| Comando             | Descrição                              |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Desenvolvimento com hot-reload         |
| `npm run build`     | Compilar TypeScript para `dist/`       |
| `npm run start`     | Executar versão compilada              |
| `npm run test`      | Executar testes unitários              |
| `npm run lint`      | Verificar código com ESLint            |
| `npm run lint:fix`  | Corrigir erros de lint automaticamente |
| `npm run format`    | Formatar código com Prettier           |
| `npm run typecheck` | Verificar tipos TypeScript             |

## Estrutura principal

```
src/
├── config/
│   └── env.ts                     # Variaveis obrigatorias/opcionais
├── domain/
│   └── deal.ts                    # Contrato interno de oferta
├── integrations/
│   ├── aliexpress.client.ts       # Cliente HTTP com autenticacao/assinatura
│   ├── aliexpress.ts              # Normalizacao e montagem de ofertas
│   └── telegram.ts                # Envio para Telegram
├── services/
│   ├── dedupe.ts                 # Evita spam de ofertas duplicadas
│   ├── filter.ts                 # Filtro por preco
│   ├── pipeline.ts               # Orquestracao do ciclo
│   └── scheduler.ts              # Agendamento recorrente
└── main.ts                       # Bootstrap da aplicacao
```

## Fluxo de execucao

1. Busca promocoes na API da AliExpress
2. Gera link de afiliado para cada item
3. Filtra por preco maximo
4. Deduplica ofertas no ciclo
5. Envia para Telegram
6. Agenda proxima execucao automaticamente

## Observacao importante

A assinatura/autenticacao pode variar de acordo com o endpoint oficial habilitado na sua conta de afiliado. Se o seu painel usar nomes de parametros diferentes, ajuste os caminhos e campos no modulo `src/integrations/aliexpress.client.ts`.
