function scoreDeal(deal: Deal): number {
  let score = 0;

  if (deal.dicountPercent) {
    score += deal.discountPercent * 2;
  }

  if (deal.freeShipping) {
    score += 15;
  }

  if (
    deal.title.toLowerCase().includes("flash") ||
    deal.title.toLowerCase().includes("lightning")
  ) {
    score += 20;
  }
  
  if(deal.description.toLowerCase().includes('limited')) {
    score += 10;
  }
  
  const price = parseFloat(deal.salePrice.replace(/[^0-9.]/g, ''))
  if (price < 20) {
    score += 5;
  } else if (price > 100) {
    score += 10;
  }

  return score;
}


