export interface Deal {
  id?: string;
  title: string;
  description: string;
  originalPrice?: string;
  disccountPercent?: number;
  freeShipping?: boolean;
  link?: string;
  image?: string;
  store: string;
  postedAt?: Date;
  score?: number;
}

export interface FilterSettings {
  minDiscountPercent?: number;
  requireFreeShipping: boolean;
  maxPrice?: number;
  minPrice: number;
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
