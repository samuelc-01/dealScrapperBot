import axios, { AxiosError } from "axios";
import { BaseScraper } from "./index.js";
import { Deal } from "../types/index.js";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
];

const RSS_URLS = [
  "https://www.dealnews.com/?rss=1",
  "https://dealnews.com/?rss=1",
];

export class DealnewsScraper extends BaseScraper {
  private baseUrl = "https://www.dealnews.com";
  private userAgentIndex = 0;

  async scrape(): Promise<Deal[]> {
    for (const rssUrl of RSS_URLS) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const deals = await this.fetchWithRetry(rssUrl);
          if (deals.length > 0) {
            return deals;
          }
        } catch (err) {
          const isRateLimit = this.isRateLimited(err);
          console.warn(
            `[Scraper] Attempt ${attempt}/3 failed for ${rssUrl}: ${isRateLimit ? "Rate limited" : (err instanceof Error ? err.message : err)}`,
          );
          if (attempt < 3) {
            const delay = isRateLimit ? 15000 * attempt : 5000 * attempt;
            console.log(`[Scraper] Waiting ${delay / 1000}s before retry...`);
            await new Promise((r) => setTimeout(r, delay));
          }
        }
      }
    }

    console.warn("[Scraper] All RSS URLs exhausted.");
    return [];
  }

  private async fetchWithRetry(url: string): Promise<Deal[]> {
    this.rotateUserAgent();
    const xml = await this.fetch(url);
    return this.parseRss(xml);
  }

  private rotateUserAgent(): void {
    this.userAgentIndex = (this.userAgentIndex + 1) % USER_AGENTS.length;
  }

  protected override async fetch(url: string): Promise<string> {
    const ua = USER_AGENTS[this.userAgentIndex];
    const response = await axios.get(url, {
      headers: {
        "User-Agent": ua,
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
      },
      timeout: 30000,
    });
    return response.data;
  }

  private isRateLimited(err: unknown): boolean {
    if (err instanceof AxiosError) {
      return err.response?.status === 429 || err.response?.status === 403;
    }
    return false;
  }

  private parseRss(xml: string): Deal[] {
    const deals: Deal[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    const matches = xml.matchAll(itemRegex);

    for (const match of matches) {
      const item = match[1];

      const title = this.extractTag(item, "title") ?? "";
      const link = this.extractTag(item, "link") ?? "";
      const description = this.extractTag(item, "description") ?? "";
      const guid = this.extractTag(item, "guid") ?? link;

      const image = this.extractImage(description);
      const price = this.extractPrice(title, description);
      const originalPrice = this.extractOriginalPrice(title, description);
      const discountPercent = this.calculateDiscount(originalPrice, price);
      const freeShipping = this.hasFreeShipping(description);
      const store = this.extractStore(description);

      if (!title || !link) continue;

      deals.push({
        id: this.generateDealId(guid),
        title: this.cleanHtml(title),
        description: this.cleanHtml(description),
        salePrice: price ?? "$0.00",
        originalPrice: originalPrice ?? undefined,
        discountPercent,
        freeShipping,
        link,
        image,
        store,
      });
    }

    return deals;
  }

  private extractTag(xml: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i");
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  }

  private extractImage(description: string): string | undefined {
    const match = description.match(/src=['"]([^'"]+)['"]/i);
    if (match && match[1].startsWith("http")) {
      return match[1];
    }
    return undefined;
  }

  private extractPrice(title: string, description: string): string | null {
    const text = title + " " + description;
    const patterns = [
      /\$\d[\d,]*(?:\.\d{2})?(?=\s|$|[^0-9])/g,
      /for\s+\$\d[\d,]*(?:\.\d{2})?/gi,
      /\$\d+[\d,]*/g,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const m of matches) {
          const cleaned = m.replace(/[^0-9.]/g, "");
          const num = parseFloat(cleaned);
          if (num > 0 && num < 10000) {
            return "$" + num.toFixed(2);
          }
        }
      }
    }
    return null;
  }

  private extractOriginalPrice(title: string, description: string): string | null {
    const text = title + " " + description;
    const patterns = [
      /(?:was|regular|list)\s*\$[\d,]+\.?\d*/gi,
      /\$[\d,]+\.?\d*\s*(?:was|regular|orig)/gi,
      /\$\d+[\d,]*\.?\d*\s*orig/gi,
      /(?:was|orig|regular)\s*\$[\d,]+\.?\d*/gi,
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const m of matches) {
          const cleaned = m.replace(/[^0-9.]/g, "");
          const num = parseFloat(cleaned);
          if (num > 0) {
            return "$" + num.toFixed(2);
          }
        }
      }
    }
    return null;
  }

  private hasFreeShipping(description: string): boolean {
    const text = description.toLowerCase();
    return (
      text.includes("free shipping") ||
      text.includes("free ship") ||
      text.includes("shipping is free") ||
      text.includes("no shipping") ||
      text.includes("no shipping cost")
    );
  }

  private extractStore(description: string): string {
    const match = description.match(/Buy Now at ([A-Za-z0-9\s&'-]+)/i);
    if (match) {
      return match[1].trim();
    }
    return "Dealnews";
  }

  private calculateDiscount(
    original: string | null,
    current: string | null,
  ): number | undefined {
    if (!original || !current) return undefined;
    const orig = parseFloat(original.replace(/[^0-9.]/g, ""));
    const curr = parseFloat(current.replace(/[^0-9.]/g, ""));
    if (orig && curr && orig > curr) {
      return Math.round(((orig - curr) / orig) * 100);
    }
    return undefined;
  }

  private cleanHtml(text: string): string {
    return text
      .replace(/<[^>]+>/g, " ")
      .replace(/&#x[a-fA-F0-9]+;/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private generateDealId(link: string): string {
    return Buffer.from(link).toString("base64").slice(0, 32);
  }
}
