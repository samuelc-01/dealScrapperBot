import { fetchDeals } from './integrations/mercadolivre';
import { sendMessage } from './integrations/telegram';

async function main() {
  console.log('search produts...');
  const deals = await fetchDeals('ssd');

  if (deals.length === 0) {
    console.log("don't find anything or block");
    return;
  }

  console.log(`Finding something ${deals.length} sale`);

  for (const deal of deals.slice(0, 3)) {
    console.log('Sending:', deal.title);

    await sendMessage(`🔥 ${deal.title}\n💰 R$ ${deal.price}\n🔗 ${deal.url}`);
  }

  console.log('Finish');
}

main();
