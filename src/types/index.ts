export interface Deal {
  id?: string;
  title: string;
  description: string;
  originalPrice?: string;
  salePrice: string;
  discountPercent?: number;
  freeShipping: boolean;
  link: string;
  image?: string;
  store: string;
  postedAt?: Date;
  score?: number;
}

export interface FilterSettings {
  minDiscountPercent: number;
  requireFreeShipping: boolean;
  maxPrice?: number;
  minPrice?: number;
  maxPostsPerDay: number;
}

export interface DailyCount {
  date: string;
  count: number;
  lastReset: Date;
}

export interface PostedDeal {
  id: number;
  dealId: string;
  title: string;
  link: string;
  postedAt: Date;
}

const DEFAULT_SETTINGS: FilterSettings = {
  minDiscountPercent: 20,
  requireFreeShipping: false,
  maxPrice: 500,
  minPrice: 5,
  maxPostsPerDay: 10,
};

export { DEFAULT_SETTINGS };
