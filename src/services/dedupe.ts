import { createHash } from 'crypto';
import { Deal } from '../domain/deal';

const sentCache = new Set<string>();

function buildKey(deal: Deal): string {
  const hourBucket = new Date().toISOString().slice(0, 13);
  return createHash('sha1')
    .update(`${deal.id}|${deal.numericPrice}|${hourBucket}`)
    .digest('hex');
}

export function dedupeDeals(deals: Deal[]): Deal[] {
  const unique: Deal[] = [];

  for (const deal of deals) {
    const key = buildKey(deal);
    if (sentCache.has(key)) {
      continue;
    }
    sentCache.add(key);
    unique.push(deal);
  }

  return unique;
}
