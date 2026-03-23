import { env } from '../config/env';
import { DealDispatchSummary } from '../domain/deal';
import { AliExpressClient } from '../integrations/aliexpress.client';
import { AliExpressIntegration } from '../integrations/aliexpress';
import { sendDealMessage } from '../integrations/telegram';
import { dedupeDeals } from './dedupe';
import { filterDealsByPrice } from './filter';

export async function runDealPipeline(): Promise<DealDispatchSummary> {
  const client = new AliExpressClient();
  const integration = new AliExpressIntegration(client);
  const summary: DealDispatchSummary = {
    collected: 0,
    filtered: 0,
    deduplicated: 0,
    sent: 0,
    failed: 0,
  };

  const collected = await integration.fetchDeals(
    env.queryKeyword,
    env.maxItemsPerCycle,
  );
  summary.collected = collected.length;

  const filtered = filterDealsByPrice(collected, env.maxPriceBrl);
  summary.filtered = filtered.length;

  const deduplicated = dedupeDeals(filtered);
  summary.deduplicated = deduplicated.length;

  for (const deal of deduplicated) {
    try {
      await sendDealMessage(deal);
      summary.sent += 1;
    } catch (error) {
      summary.failed += 1;
      console.error('Telegram dispatch failed', error);
    }
  }

  return summary;
}
