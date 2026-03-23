export interface Deal {
  id: string;
  title: string;
  price: string;
  numericPrice: number;
  currency: string;
  productUrl: string;
  affiliateUrl: string;
  imageUrl?: string;
  commissionRate?: string;
  couponInfo?: string;
  source: 'aliexpress';
}

export interface DealDispatchSummary {
  collected: number;
  filtered: number;
  deduplicated: number;
  sent: number;
  failed: number;
}
