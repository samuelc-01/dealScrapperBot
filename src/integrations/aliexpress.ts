import { Deal } from '../domain/deal';
import { AliExpressClient } from './aliexpress.client';
import { AliExpressDealRaw } from './aliexpress.types';

function toNumber(value: string | number | undefined): number {
  if (typeof value === 'number') {
    return value;
  }
  if (!value) {
    return 0;
  }

  const normalized = String(value).replace(/[^\d.,]/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function resolveItems(payload: unknown): AliExpressDealRaw[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const body = payload as {
    items?: AliExpressDealRaw[];
    list?: AliExpressDealRaw[];
    data?: { items?: AliExpressDealRaw[]; list?: AliExpressDealRaw[] };
    result?: { items?: AliExpressDealRaw[]; list?: AliExpressDealRaw[] };
  };

  return (
    body.data?.items ??
    body.data?.list ??
    body.result?.items ??
    body.result?.list ??
    body.items ??
    body.list ??
    []
  );
}

function normalizeDeal(raw: AliExpressDealRaw, affiliateUrl: string): Deal | null {
  const id = String(raw.product_id ?? raw.item_id ?? '').trim();
  const title = (raw.title ?? raw.product_title ?? '').trim();
  const productUrl = (raw.promotion_link ?? raw.product_detail_url ?? '').trim();
  const numericPrice = toNumber(raw.sale_price ?? raw.target_sale_price);

  if (!id || !title || !productUrl || numericPrice <= 0) {
    return null;
  }

  return {
    id,
    title,
    price: `R$ ${numericPrice.toFixed(2).replace('.', ',')}`,
    numericPrice,
    currency: 'BRL',
    productUrl,
    affiliateUrl,
    imageUrl: raw.product_main_image_url ?? raw.main_image,
    commissionRate: raw.commission_rate,
    couponInfo: raw.coupon_info,
    source: 'aliexpress',
  };
}

export class AliExpressIntegration {
  constructor(private readonly client: AliExpressClient) {}

  async fetchDeals(keyword: string, maxItems: number): Promise<Deal[]> {
    const response = await this.client.getHotDeals({
      keyword,
      page: 1,
      pageSize: maxItems,
    });

    const items = resolveItems(response).slice(0, maxItems);
    const deals: Deal[] = [];

    for (const item of items) {
      const targetUrl = (item.promotion_link ?? item.product_detail_url ?? '').trim();
      if (!targetUrl) {
        continue;
      }

      let affiliateUrl = targetUrl;
      try {
        affiliateUrl = await this.client.createAffiliateDeeplink(targetUrl);
      } catch (error) {
        console.error('AliExpress deeplink fallback to target URL', error);
      }

      const normalized = normalizeDeal(item, affiliateUrl);
      if (normalized) {
        deals.push(normalized);
      }
    }

    return deals;
  }
}
