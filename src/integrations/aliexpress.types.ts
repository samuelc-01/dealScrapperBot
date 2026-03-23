export interface AliExpressDealsRequest {
  keyword: string;
  page?: number;
  pageSize?: number;
}

export interface AliExpressDealRaw {
  product_id?: string | number;
  item_id?: string | number;
  title?: string;
  product_title?: string;
  sale_price?: string | number;
  target_sale_price?: string | number;
  original_price?: string | number;
  promotion_link?: string;
  product_detail_url?: string;
  product_main_image_url?: string;
  main_image?: string;
  commission_rate?: string;
  coupon_info?: string;
}

export interface AliExpressDealsResponseRaw {
  data?: {
    items?: AliExpressDealRaw[];
    list?: AliExpressDealRaw[];
  };
  result?: {
    items?: AliExpressDealRaw[];
    list?: AliExpressDealRaw[];
  };
  items?: AliExpressDealRaw[];
  list?: AliExpressDealRaw[];
}

export interface AliExpressDeeplinkResponseRaw {
  data?: {
    url?: string;
    promotion_link?: string;
    deeplink?: string;
  };
  result?: {
    url?: string;
    promotion_link?: string;
    deeplink?: string;
  };
  url?: string;
  deeplink?: string;
}
