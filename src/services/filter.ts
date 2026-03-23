import { Deal } from '../domain/deal';

export function filterDealsByPrice(deals: Deal[], maxPrice: number): Deal[] {
  return deals.filter((deal) => deal.numericPrice > 0 && deal.numericPrice <= maxPrice);
}
