import { fetchShopeeDeals } from './integrations/shopee';
import { sendMessage } from './integrations/telegram';

async function main() {
  console.log('Searching products on Shopee...');
  const deals = await fetchShopeeDeals('ssd');

  if (deals.length === 0) {
    console.log("Don't find anything");
    return;
  }

  console.log(`Found ${deals.length} deals`);

  for (const deal of deals.slice(0, 3)) {
    console.log('Sending:', deal.title);
    await sendMessage(`🔥 ${deal.title}\n💰 ${deal.price}\n🔗 ${deal.url}`);
  }

  console.log('Finish');
}

main();
