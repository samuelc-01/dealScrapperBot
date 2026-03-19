import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.mercadolibre.com',
  timeout: 5000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    Connection: 'keep-alive',
    Referer: 'https://www.mercadolivre.com.br/',
  },
});

export async function fetchDeals(query: string) {
  try {
    const response = await client.get('/sites/MLB/search', {
      params: { q: query },
    });

    return response.data.results.map((item: any) => ({
      title: item.title,
      price: item.price,
      url: item.permalink,
    }));
  } catch (err: any) {
    console.error('Mercado Livre error:', err.response?.status);
    console.error(err.response?.data || err.message);
    throw err;
  }
}
