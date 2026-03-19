import { fetchDeals } from './integrations/mercadolivre';
import { sendMessage } from './integrations/telegram';
import { filterDeals } from './services/filter';

async function main() {
  const deals = await fetchDeals('ssd');

  const filtered = filterDeals(deals);

  for (const deal of filtered.slice(0, 5)) {
    await sendMessage(
      `🔥 *${deal.title}*\n💰 R$ ${deal.price}\n🔗 ${deal.url}`,
    );
  }
}

main();
