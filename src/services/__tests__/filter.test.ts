import { Deal } from '../../domain/deal';
import { filterDealsByPrice } from '../filter';

describe('filterDealsByPrice', () => {
  const mockDeals: Deal[] = [
    {
      id: '1',
      title: 'SSD 256GB',
      price: 'R$ 199,90',
      numericPrice: 199.9,
      currency: 'BRL',
      productUrl: 'https://example.com/1',
      affiliateUrl: 'https://example.com/1?a=1',
      source: 'aliexpress',
    },
    {
      id: '2',
      title: 'SSD 512GB',
      price: 'R$ 350,00',
      numericPrice: 350,
      currency: 'BRL',
      productUrl: 'https://example.com/2',
      affiliateUrl: 'https://example.com/2?a=1',
      source: 'aliexpress',
    },
    {
      id: '3',
      title: 'SSD 1TB',
      price: 'R$ 899,90',
      numericPrice: 899.9,
      currency: 'BRL',
      productUrl: 'https://example.com/3',
      affiliateUrl: 'https://example.com/3?a=1',
      source: 'aliexpress',
    },
    {
      id: '4',
      title: 'Memoria RAM 8GB',
      price: 'R$ 150,00',
      numericPrice: 150,
      currency: 'BRL',
      productUrl: 'https://example.com/4',
      affiliateUrl: 'https://example.com/4?a=1',
      source: 'aliexpress',
    },
  ];

  it('should filter deals with maxPrice of 500', () => {
    const result = filterDealsByPrice(mockDeals, 500);
    expect(result).toHaveLength(3);
    expect(result.map((d) => d.title)).toEqual([
      'SSD 256GB',
      'SSD 512GB',
      'Memoria RAM 8GB',
    ]);
  });

  it('should filter deals with custom maxPrice', () => {
    const result = filterDealsByPrice(mockDeals, 200);
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.title)).toEqual([
      'SSD 256GB',
      'Memoria RAM 8GB',
    ]);
  });

  it('should handle empty array', () => {
    const result = filterDealsByPrice([], 500);
    expect(result).toHaveLength(0);
  });

  it('should handle deals with invalid numeric price', () => {
    const dealsWithInvalidPrice: Deal[] = [{
      id: 'x',
      title: 'Test',
      price: 'R$ 0,00',
      numericPrice: 0,
      currency: 'BRL',
      productUrl: 'https://example.com',
      affiliateUrl: 'https://example.com?a=1',
      source: 'aliexpress',
    }];
    const result = filterDealsByPrice(dealsWithInvalidPrice, 500);
    expect(result).toHaveLength(0);
  });
});
