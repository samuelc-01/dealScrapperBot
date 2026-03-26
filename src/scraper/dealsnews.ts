import * as cheerio from "cheerio";
import { BaseScraper } from "./index.js";
import { Deal } from "../types/index.js";

export class DealnewsScraper extends BaseScraper {
  private baseUrl = "https://dealnews.com";

  async scrape(): Promise<Deal[]> {
    try {
      const html = await this.fetch(this.baseUrl);
      const $ = cheerio.load(html);
      const deals: Deal[] = [];

      $("div.deal").each((_, el) => {
        const title = $(el).find("h3.title a").text().trim();
        const link = this.baseUrl + $(el).find("h3.title a").attr("href");
        const price = $(el).find("span.price").text().trim();
        const originalPrice = $(el).find("span.original-price").text().trim();
        const description = $(el).find("p.description").text().trim();
        const shipping = $(el).find("span.shipping").text().toLowerCase();
        const image = $(el).find("img").attr("src");

        const hasFreeShipping =
          shipping.includes("free") || shipping.includes("shipping");
        const discountPercent = this.calculateDiscount(originalPrice, price);

        const deal: Deal = {
          id: this.generateDealId(link),
          title,
          description,
          salePrice: price,
          originalPrice,
          discountPercent,
          freeShipping: hasFreeShipping,
          link,
          image: image?.startsWith("http") ? image : undefined,
          store: "Dealnews",
        };

        deals.push(deal);
      });

      return deals;
    } catch (error) {
      console.error("Error scraping Dealnews:", error);
      return [];
    }
  }

  private calculateDiscount(
    original: string,
    current: string,
  ): number | undefined {
    const orig = parseFloat(original.replace(/[^0-9.]/g, ""));
    const curr = parseFloat(current.replace(/[^0-9.]/g, ""));

    if (orig && curr && orig > curr) {
      return Math.round(((orig - curr) / orig) * 100);
    }
    return undefined;
  }

  private generateDealId(link: string): string {
    return Buffer.from(link).toString("base64").slice(0, 32);
  }
}
