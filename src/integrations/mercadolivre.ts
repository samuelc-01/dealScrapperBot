import axios from 'axios';

export async function fetchDeals(query: string) {
  try {
    const response = await axios.get(
      `https://api.mercadolibre.com/sites/MLB/search?q=${query}&limit=10`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      },
    );

    return response.data.results.map((item: any) => ({
      title: item.title,
      price: item.price,
      url: item.permalink,
    }));
  } catch (error: any) {
    console.error('Erro ao buscar Mercado Livre:');
    console.error(error.response?.status);
    console.error(error.response?.data);

    return []; // NÃO quebra o sistema
  }
}
