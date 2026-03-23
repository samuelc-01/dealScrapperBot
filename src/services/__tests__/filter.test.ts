import { Deal } from '../../integrations/mercadolivre';
import { filterDeals } from '../filter';

describe('filterDeals', () => {
  const mockDeals: Deal[] = [
    { title: 'SSD 256GB', price: 'R$ 199,90', url: 'https://example.com/1' },
    { title: 'SSD 512GB', price: 'R$ 350,00', url: 'https://example.com/2' },
    { title: 'SSD 1TB', price: 'R$ 899,90', url: 'https://example.com/3' },
    { title: 'Memoria RAM 8GB', price: 'R$ 150', url: 'https://example.com/4' },
  ];

  it('should filter deals with default maxPrice of 500', () => {
    const result = filterDeals(mockDeals);
    expect(result).toHaveLength(3);
    expect(result.map((d) => d.title)).toEqual([
      'SSD 256GB',
      'SSD 512GB',
      'Memoria RAM 8GB',
    ]);
  });

  it('should filter deals with custom maxPrice', () => {
    const result = filterDeals(mockDeals, 200);
    expect(result).toHaveLength(2);
    expect(result.map((d) => d.title)).toEqual([
      'SSD 256GB',
      'Memoria RAM 8GB',
    ]);
  });

  it('should handle empty array', () => {
    const result = filterDeals([]);
    expect(result).toHaveLength(0);
  });

  it('should handle deals with invalid price format', () => {
    const dealsWithInvalidPrice: Deal[] = [
      { title: 'Test', price: '', url: 'https://example.com' },
      { title: 'Test 2', price: 'R$ invalid', url: 'https://example.com' },
    ];
    const result = filterDeals(dealsWithInvalidPrice);
    expect(result).toHaveLength(0);
  });

  it('should handle prices with comma as decimal separator', () => {
    const deals: Deal[] = [
      { title: 'Product', price: 'R$ 499,99', url: 'https://example.com' },
    ];
    const result = filterDeals(deals, 500);
    expect(result).toHaveLength(1);
  });

  it('should handle prices with dot as decimal separator', () => {
    const deals: Deal[] = [
      { title: 'Product', price: 'R$ 499.99', url: 'https://example.com' },
    ];
    const result = filterDeals(deals, 500);
    expect(result).toHaveLength(1);
  });
});
