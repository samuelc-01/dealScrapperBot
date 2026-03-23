import { AliExpressIntegration } from '../aliexpress';

describe('AliExpressIntegration', () => {
  it('should normalize deals and keep affiliate links', async () => {
    const mockClient = {
      getHotDeals: jest.fn().mockResolvedValue({
        data: {
          items: [
            {
              product_id: '123',
              title: 'Fone Bluetooth',
              sale_price: '99.90',
              product_detail_url: 'https://aliexpress.com/item/123.html',
              commission_rate: '8%',
              coupon_info: 'R$10 OFF',
            },
          ],
        },
      }),
      createAffiliateDeeplink: jest
        .fn()
        .mockResolvedValue('https://s.click.aliexpress.com/affiliate-123'),
    };

    const integration = new AliExpressIntegration(mockClient as any);
    const result = await integration.fetchDeals('fone', 5);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('123');
    expect(result[0].affiliateUrl).toBe(
      'https://s.click.aliexpress.com/affiliate-123',
    );
    expect(result[0].numericPrice).toBe(99.9);
  });

  it('should fallback to original product URL when deeplink fails', async () => {
    const mockClient = {
      getHotDeals: jest.fn().mockResolvedValue({
        data: {
          items: [
            {
              product_id: '777',
              title: 'Smartwatch',
              sale_price: '120.00',
              promotion_link: 'https://aliexpress.com/item/777.html',
            },
          ],
        },
      }),
      createAffiliateDeeplink: jest.fn().mockRejectedValue(new Error('nope')),
    };

    const integration = new AliExpressIntegration(mockClient as any);
    const result = await integration.fetchDeals('watch', 2);

    expect(result).toHaveLength(1);
    expect(result[0].affiliateUrl).toBe('https://aliexpress.com/item/777.html');
  });
});
