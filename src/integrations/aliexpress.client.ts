import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { env } from '../config/env';
import {
  AliExpressDealsRequest,
  AliExpressDealsResponseRaw,
  AliExpressDeeplinkResponseRaw,
} from './aliexpress.types';

function signPayload(payload: Record<string, string>, secret: string): string {
  const canonical = Object.keys(payload)
    .sort()
    .map((key) => `${key}${payload[key]}`)
    .join('');

  return crypto.createHmac('sha256', secret).update(canonical).digest('hex');
}

export class AliExpressClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.aliexpressApiBaseUrl,
      timeout: env.requestTimeoutMs,
    });
  }

  private buildAuthPayload(extra: Record<string, string>): Record<string, string> {
    const timestamp = Date.now().toString();
    const payload = {
      app_key: env.aliexpressAppKey,
      timestamp,
      ...extra,
    };

    return {
      ...payload,
      sign: signPayload(payload, env.aliexpressAppSecret),
    };
  }

  async getHotDeals(request: AliExpressDealsRequest): Promise<AliExpressDealsResponseRaw> {
    const params = this.buildAuthPayload({
      keyword: request.keyword,
      page: String(request.page ?? 1),
      page_size: String(request.pageSize ?? env.maxItemsPerCycle),
    });

    const response = await this.http.get<AliExpressDealsResponseRaw>(
      env.aliexpressDealsPath,
      { params },
    );
    return response.data;
  }

  async createAffiliateDeeplink(targetUrl: string): Promise<string> {
    const params = this.buildAuthPayload({
      target_url: targetUrl,
      tracking_id: env.aliexpressTrackingId,
    });

    const response = await this.http.get<AliExpressDeeplinkResponseRaw>(
      env.aliexpressDeeplinkPath,
      { params },
    );

    return (
      response.data?.data?.url ??
      response.data?.data?.promotion_link ??
      response.data?.data?.deeplink ??
      response.data?.result?.url ??
      response.data?.result?.promotion_link ??
      response.data?.result?.deeplink ??
      response.data?.url ??
      response.data?.deeplink ??
      targetUrl
    );
  }
}
