export function filterDeals(deals: any[]) {
  return deals.filter((deal) => deal.price < 500);
}
