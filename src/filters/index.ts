import { Deal, FilterSettings, DEFAULT_SETTINGS } from "../types/index.js";
import "dotenv/config";

// -------- Utils --------
function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

function parsePrice(priceStr: string): number {
  const parsed = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

// -------- Cache --------
let cachedSettings: FilterSettings | null = null;

// -------- Settings --------
export function getFilterSettings(): FilterSettings {
  if (cachedSettings) return cachedSettings;

  const settings: FilterSettings = {
    minDiscountPercent:
      parseNumber(process.env.MIN_DISCOUNT_PERCENT) ??
      DEFAULT_SETTINGS.minDiscountPercent,

    requireFreeShipping:
      process.env.REQUIRE_FREE_SHIPPING === "true"
        ? true
        : DEFAULT_SETTINGS.requireFreeShipping,

    maxPrice: parseNumber(process.env.MAX_PRICE) ?? DEFAULT_SETTINGS.maxPrice,

    minPrice: parseNumber(process.env.MIN_PRICE) ?? DEFAULT_SETTINGS.minPrice,

    maxPostsPerDay:
      parseNumber(process.env.MAX_POSTS_PER_DAY) ??
      DEFAULT_SETTINGS.maxPostsPerDay,
  };

  cachedSettings = settings;
  return settings;
}

// -------- Scoring --------
function scoreDeal(deal: Deal): number {
  let score = 0;

  if (deal.discountPercent) {
    score += deal.discountPercent * 2;
  }

  if (deal.freeShipping) {
    score += 15;
  }

  const title = deal.title.toLowerCase();
  const description = deal.description.toLowerCase();

  if (title.includes("flash") || title.includes("lightning")) {
    score += 20;
  }

  if (description.includes("limited")) {
    score += 10;
  }

  const price = parsePrice(deal.salePrice);

  if (price < 20) {
    score += 5;
  } else if (price > 100) {
    score += 10;
  }

  return score;
}

// -------- Filter --------
export function filterDeals(deals: Deal[]): Deal[] {
  const settings = getFilterSettings();

  return deals
    .filter((deal) => {
      const price = parsePrice(deal.salePrice);

      if (
        deal.discountPercent !== undefined &&
        deal.discountPercent < settings.minDiscountPercent
      ) {
        return false;
      }

      if (settings.requireFreeShipping && !deal.freeShipping) {
        return false;
      }

      if (settings.maxPrice !== undefined && price > settings.maxPrice) {
        return false;
      }

      if (settings.minPrice !== undefined && price < settings.minPrice) {
        return false;
      }

      return true;
    })

    .map((deal) => ({
      ...deal,
      score: scoreDeal(deal),
    }))

    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

export function getTopDeals(deals: Deal[], count: number): Deal[] {
  const filtered = filterDeals(deals);
  return filtered.slice(0, count);
}

export function adjustFiltersDynamically(availableDeals: Deal[]): FilterSettings {
  const settings = getFilterSettings();

  // Se muitos deals bons disponíveis, aumentamos a требования
  const goodDeals = availableDeals.filter(
    (d) => d.discountPercent! >= settings.minDiscountPercent && d.freeShipping,
  ).length;

  if (goodDeals > 20) {
    // Muita oferta → aumentamos o mínimo
    return { ...settings, minDiscountPercent: 30 };
  }

  if (goodDeals < 3) {
    // Pouca oferta → diminuímos o mínimo
    return { ...settings, minDiscountPercent: 15 };
  }

  return settings;
}
