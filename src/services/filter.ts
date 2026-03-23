import { Deal } from '../integrations/mercadolivre';

export function filterDeals(deals: Deal[], maxPrice: number = 500): Deal[] {
  return deals.filter((deal) => {
    const priceMatch = deal.price.match(/[\d.,]+/);
    if (!priceMatch) return false;
    const price = parseFloat(priceMatch[0].replace(',', '.'));
    return price <= maxPrice;
  });
}
