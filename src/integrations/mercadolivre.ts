import axios from "axios";

export async function fetchDeals(query: string) {
    const res = await axios.get(
            `https://api.mercadolibre.com/sites/MLB/search?q=${query}`
    );

    return res.data.results.map((item: any) => ({
        title: item.title,
        price: item.price,
        url: item.permalink
    }));
}