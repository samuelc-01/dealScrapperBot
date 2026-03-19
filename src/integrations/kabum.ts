import axios from 'axios';
import * as cheerio from 'cheerio';

export async function fetchKabumDeals() {
  try {
    const { data } = await axios.get('https://www.kabum.com.br/promocao', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(data);

    const deals: any[] = [];

    $('a.sc-27518a84-4').each((_, el) => {
      const title = $(el).find('span.sc-27518a84-7').text().trim();
      const price = $(el).find('span.sc-620f2d27-2').text().trim();
      const link = 'https://www.kabum.com.br' + $(el).attr('href');

      if (title && price) {
        deals.push({ title, price, url: link });
      }
    });

    return deals;
  } catch (err) {
    console.error('Erro Kabum:', err);
    return [];
  }
}
