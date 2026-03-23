import puppeteer from 'puppeteer';

export interface Deal {
  title: string;
  price: string;
  url: string;
}

export async function fetchShopeeDeals(query: string): Promise<Deal[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    });

    const url = `https://shopee.com.br/search?keyword=${encodeURIComponent(query)}`;
    console.log('Navigating to:', url);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Esperar pelos produtos carregarem
    await page
      .waitForSelector('a[href*="product"]', { timeout: 30000 })
      .catch(() => {
        console.log('Timeout waiting for products');
      });

    // Pequeno delay extra
    await new Promise((r) => setTimeout(r, 2000));

    const pageInfo = await page.evaluate(() => {
      const info: any = {};
      info.url = window.location.href;
      info.title = document.title;
      info.bodyText = document.body.innerText.substring(0, 500);
      info.productLinks =
        document.querySelectorAll('a[href*="product"]').length;
      info.allLinks = document.querySelectorAll('a').length;
      return info;
    });

    console.log('Page URL:', pageInfo.url);
    console.log('Page title:', pageInfo.title);
    console.log('Product links:', pageInfo.productLinks);
    console.log('Body text preview:', pageInfo.bodyText.substring(0, 200));

    const deals = await page.evaluate(() => {
      const items: Deal[] = [];

      // Debug: ver estrutura da página
      const allLinks = document.querySelectorAll('a[href*="product"]');
      console.log('Product links found:', allLinks.length);

      // Tentar vários seletores comuns do Shopee
      const cards = document.querySelectorAll(
        '[data-sqe="item"], .shopee-search-item-result__item, .col-xs-2-4, .Cve6f',
      );
      console.log('Cards found:', cards.length);

      if (cards.length > 0) {
        cards.forEach((card, i) => {
          if (i < 3)
            console.log('Card ' + i + ':', card.className.substring(0, 50));
        });
      }

      // Seletores antigos
      document.querySelectorAll('[data-sqe="item"]').forEach((card) => {
        const titleEl = card.querySelector('.Cve6f');
        const priceEl = card.querySelector('._1AtRZ');

        if (titleEl && priceEl) {
          items.push({
            title: titleEl.textContent?.trim() || '',
            price: priceEl.textContent?.trim() || '',
            url: card.querySelector('a')?.href || '',
          });
        }
      });

      // Seletores novos
      document
        .querySelectorAll('.shopee-search-item-result__item')
        .forEach((card) => {
          const titleEl = card.querySelector('[class*="title"], .Cve6f');
          const priceEl = card.querySelector('[class*="price"], .Cve6f');

          if (titleEl && priceEl) {
            items.push({
              title: titleEl.textContent?.trim() || '',
              price: priceEl.textContent?.trim() || '',
              url: card.querySelector('a')?.href || '',
            });
          }
        });

      return items;
    });

    console.log(`Found ${deals.length} deals from Shopee`);
    return deals;
  } catch (error) {
    console.error('Shopee error:', error);
    return [];
  } finally {
    await browser.close();
  }
}
