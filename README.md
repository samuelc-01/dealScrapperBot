# TechDeals Bot 🤖

API para agregar e monitorar ofertas de tecnologia dos principais e-commerces brasileiros.

## Funcionalidades

- Integração com Shopee, Mercado Livre e Kabum
- Web scraping com Puppeteer e Cheerio
- Notificações via Telegram
- TypeScript com tipagem completa
- Testes unitários com Jest
- Linting com ESLint + Prettier

## Tecnologias

- **Runtime:** Node.js (>=20)
- **Linguagem:** TypeScript
- **Web Scraping:** Puppeteer, Cheerio, Axios
- **Bot:** Telegraf (Telegram)
- **Testes:** Jest + ts-jest
- **Qualidade:** ESLint + Prettier

## Instalação

```bash
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
TELEGRAM_TOKEN=seu_token_aqui
TELEGRAM_CHAT_ID=seu_chat_id_aqui
```

## Scripts Disponíveis

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

## Estrutura do Projeto

```
src/
├── config/
│   └── env.ts          # Configuração de variáveis de ambiente
├── integrations/
│   ├── shopee.ts       # Web scraping Shopee (Puppeteer)
│   ├── mercadolivre.ts # Web scraping Mercado Livre (Cheerio)
│   ├── kabum.ts        # Web scraping Kabum (Cheerio)
│   └── telegram.ts     # Envio de notificações
├── services/
│   └── filter.ts       # Lógica de filtragem de ofertas
├── main.ts             # Entry point da aplicação
└── test.ts             # Arquivo de teste rápido
```

## Status do Projeto

⚠️ **MVP em desenvolvimento** - O projeto enfrentou bloqueios 403 dos sites de e-commerce. A arquitetura está pronta para receber futuras melhorias.

## Licença

MIT
