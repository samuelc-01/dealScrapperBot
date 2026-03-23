import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Deal {
  title: string;
  price: string;
  url: string;
}

export async function fetchKabumDeals(query: string): Promise<Deal[]> {
  try {
    const url = `https://www.kabum.com.br/cgi-local/site/listagem/geral.cgi?texto=${encodeURIComponent(query)}&pagina=1&ordenacao=relevancia`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    });

    const $ = cheerio.load(data);
    const deals: Deal[] = [];

    const scriptTags = $(
      'script[type="application/json"], script[id*="__NEXT_DATA"]',
    );

    scriptTags.each((_, el) => {
      try {
        const jsonText = $(el).html() || '';
        const parsed = JSON.parse(jsonText);
        const searchData =
          parsed.props?.pageProps?.data || parsed.props?.pageProps;

        if (Array.isArray(searchData)) {
          searchData.forEach((item: any) => {
            if (item.name || item.title) {
              deals.push({
                title: item.name || item.title,
                price: item.price || item.preco,
                url:
                  item.url ||
                  item.link ||
                  `https://www.kabum.com.br${item.href}`,
              });
            }
          });
        }
      } catch (e) {
        console.log('JSON parse error');
      }
    });

    console.log('Deals found:', deals.length);
    return deals;
  } catch (err: any) {
    console.error('Erro Kabum:', err.message);
    return [];
  }
}
