import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Deal {
  title: string;
  price: string;
  url: string;
}

export async function fetchDeals(query: string): Promise<Deal[]> {
  try {
    const url = `https://lista.mercadolivre.com.br/${query}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(response.data);
    const deals: Deal[] = [];

    console.log('HTML length:', response.data.length);
    console.log('Has captcha:', response.data.includes('captcha'));
    console.log('Has login:', response.data.includes('login'));

    const items = $(
      'li, div[role="article"], div[data-component-type="s-search-result"]',
    );
    console.log('Items found:', items.length);

    items.each((_, el) => {
      const title =
        $(el).find('h3').text().trim() ||
        $(el).find('.poly-component__title').text().trim() ||
        $(el).find('span[data-testid="title"]').text().trim();
      const priceFraction =
        $(el).find('.poly-price__current .price-tag-fraction').text().trim() ||
        $(el).find('[data-testid="price-part"]').first().text().trim() ||
        $(el).find('.price-tag-fraction').first().text().trim();
      const priceCents = $(el)
        .find('.poly-price__current .price-tag-cents')
        .text()
        .trim();
      const price = priceFraction
        ? `R$ ${priceFraction}${priceCents ? ',' + priceCents : ''}`
        : '';
      const url = $(el).find('a').attr('href') || '';

      if (title && title.length > 10 && price) {
        deals.push({
          title: title.replace(/\s+/g, ' '),
          price,
          url,
        });
      }
    });

    return deals;
  } catch (error: any) {
    console.error('Erro ao buscar Mercado Livre:');
    console.error(error.message);
    return [];
  }
}
