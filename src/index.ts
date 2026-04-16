import "dotenv/config";
import { Telegraf, Context } from "telegraf";
import cron from "node-cron";
import { DealnewsScraper } from "./scraper/dealsnews.js";
import { filterDeals, getTopDeals } from "./filters/index.js";
import {
  isDealPosted,
  markDealAsPosted,
  getTodayCount,
  incrementTodayCount,
  isPaused,
  setPause,
  getPostedDeals,
  getFilterSettings,
  getLastPostedTime,
} from "./database/index.js";
import { Deal } from "./types/index.js";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const ADMIN_ID = process.env.ADMIN_ID!;
const CHAT_ID = process.env.CHAT_ID!;

const POLL_INTERVAL = Number(process.env.POLL_INTERVAL ?? 60);
const MAX_POSTS = Number(process.env.MAX_POSTS_PER_DAY ?? 10);

const bot = new Telegraf(BOT_TOKEN);
const scraper = new DealnewsScraper();

function formatDealMessage(deal: Deal): string {
  const discount = deal.discountPercent ? `🔥 ${deal.discountPercent}% OFF` : "";
  const shipping = deal.freeShipping ? " | 🚚 Frete Grátis" : "";
  const original = deal.originalPrice ? `~~${deal.originalPrice}~~ ` : "";
  const price = deal.salePrice;

  return [
    `📦 <b>${deal.title}</b>`,
    "",
    `${original}<b>${price}</b> ${discount}${shipping}`,
    "",
    `🏪 ${deal.store}`,
    `🔗 <a href="${deal.link}">Ver oferta</a>`,
  ].join("\n");
}

async function runPipeline(): Promise<void> {
  if (isPaused()) {
    console.log("[Pipeline] Paused, skipping.");
    return;
  }

  const todayCount = getTodayCount();
  if (todayCount >= MAX_POSTS) {
    console.log(`[Pipeline] Daily limit reached (${todayCount}/${MAX_POSTS}).`);
    return;
  }

  console.log("[Pipeline] Scraping deals...");
  const allDeals = await scraper.scrape();
  console.log(`[Pipeline] Collected ${allDeals.length} deals.`);

  if (allDeals.length === 0) return;

  const filtered = filterDeals(allDeals);
  console.log(`[Pipeline] ${filtered.length} passed filters.`);

  const newDeals = filtered.filter((d) => !isDealPosted(d.id!));
  const availableSlots = MAX_POSTS - todayCount;
  const toPost = newDeals.slice(0, availableSlots);

  if (toPost.length === 0) {
    console.log("[Pipeline] No new deals to post.");
    return;
  }

  for (const deal of toPost) {
    try {
      const message = formatDealMessage(deal);

      if (deal.image) {
        await bot.telegram.sendPhoto(CHAT_ID, deal.image, {
          caption: message,
          parse_mode: "HTML",
        });
      } else {
      await bot.telegram.sendMessage(CHAT_ID, message, {
        parse_mode: "HTML",
      });
      }

      markDealAsPosted(deal.id!, deal.title, deal.link);
      incrementTodayCount();
      console.log(`[Pipeline] Posted: ${deal.title}`);
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`[Pipeline] Failed to post "${deal.title}":`, err);
    }
  }
}

function isAdmin(ctx: Context): boolean {
  return String(ctx.from?.id) === ADMIN_ID;
}

bot.command("start", async (ctx) => {
  if (!isAdmin(ctx)) return;
  await ctx.reply(
    `🤖 Deal Scraper Bot\n\n` +
    `Limite: ${getTodayCount()}/${MAX_POSTS} posts hoje\n` +
    `Status: ${isPaused() ? "⏸️ Pausado" : "▶️ Ativo"}\n\n` +
    `Comandos disponíveis:\n` +
    `/stats — estatísticas\n` +
    `/posted — últimas ofertas postadas\n` +
    `/pause — pausar bot\n` +
    `/resume — retomar bot`
  );
});

bot.command("stats", async (ctx) => {
  if (!isAdmin(ctx)) return;
  const today = getTodayCount();
  const lastPosted = getLastPostedTime();
  const settings = getFilterSettings();
  const paused = isPaused();

  await ctx.reply(
    `📊 <b>Estatísticas</b>\n\n` +
    `Posts hoje: <b>${today}/${MAX_POSTS}</b>\n` +
    `Último post: ${lastPosted ? new Date(lastPosted).toLocaleString("pt-BR") : "Nenhum"}\n` +
    `Status: ${paused ? "⏸️ Pausado" : "▶️ Ativo"}\n\n` +
    `⚙️ Filtros:\n` +
    `  Mín. desconto: ${settings.minDiscountPercent}%\n` +
    `  Frete grátis: ${settings.requireFreeShipping ? "Sim" : "Não"}\n` +
    `  Faixa de preço: $${settings.minPrice} – $${settings.maxPrice}`,
    { parse_mode: "HTML" }
  );
});

bot.command("posted", async (ctx) => {
  if (!isAdmin(ctx)) return;
  const deals = getPostedDeals(5);

  if (deals.length === 0) {
    await ctx.reply("Nenhuma oferta postada ainda.");
    return;
  }

  const lines = deals.map((d) => {
    const date = new Date(d.postedAt).toLocaleString("pt-BR");
    return `📦 <b>${d.title}</b>\n🔗 <a href="${d.link}">link</a>\n📅 ${date}`;
  });

  await ctx.reply(lines.join("\n\n"), {
    parse_mode: "HTML",
  });
});

bot.command("pause", async (ctx) => {
  if (!isAdmin(ctx)) return;
  setPause(true);
  await ctx.reply("⏸️ Bot pausado. Nenhum novo deal será postado.");
});

bot.command("resume", async (ctx) => {
  if (!isAdmin(ctx)) return;
  setPause(false);
  await ctx.reply("▶️ Bot retomar. Coleta agendada reativada.");
  runPipeline();
});

bot.launch();

cron.schedule(`*/${POLL_INTERVAL} * * * *`, () => {
  runPipeline();
});

runPipeline();

process.on("SIGINT", () => {
  bot.stop("SIGINT");
  process.exit(0);
});
