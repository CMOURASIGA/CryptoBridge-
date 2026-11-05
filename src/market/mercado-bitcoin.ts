import { ProviderError, type ExchangeAdapter, type Ticker } from '../domain.js';

type RemoteTicker = { pair?: unknown; last?: unknown; buy?: unknown; sell?: unknown; date?: unknown };
export class MercadoBitcoinAdapter implements ExchangeAdapter {
  readonly id = 'mercado_bitcoin' as const;
  readonly capabilities = ['ticker'] as const;
  constructor(private readonly transport: typeof fetch = fetch) {}
  async getTicker(pair: string): Promise<Ticker> {
    if (!/^[A-Z0-9]{2,15}-BRL$/.test(pair)) {
      throw new ProviderError('INVALID_PAIR', 'Use a pair such as BTC-BRL, ETH-BRL or SOL-BRL.');
    }
    const url = new URL('https://api.mercadobitcoin.net/api/v4/tickers');
    url.searchParams.set('symbols', pair);
    let response: Response;
    try {
      response = await this.transport(url.toString(), { method: 'GET', signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' } });
    } catch {
      throw new ProviderError('PROVIDER_UNAVAILABLE', 'Mercado Bitcoin ticker is temporarily unreachable.');
    }
    if (!response.ok) throw new ProviderError('PROVIDER_HTTP_ERROR', 'Mercado Bitcoin returned an error for this ticker.');
    let body: unknown;
    try { body = await response.json(); } catch { throw new ProviderError('INVALID_PROVIDER_RESPONSE', 'Invalid ticker JSON.'); }
    const row = Array.isArray(body) ? body.find((r: RemoteTicker) => r && r.pair === pair) as RemoteTicker | undefined : undefined;
    if (!row || typeof row.last !== 'string' || typeof row.buy !== 'string' || typeof row.sell !== 'string') {
      throw new ProviderError('INVALID_PROVIDER_RESPONSE', 'Ticker values were not available in the expected format.');
    }
    const valid = [row.last, row.buy, row.sell].every(v => /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(v as string) && Number.isFinite(Number(v)) && Number(v) >= 0);
    if (!valid) throw new ProviderError('INVALID_PROVIDER_RESPONSE', 'Ticker contains invalid prices.');
    // The provider documentation currently gives inconsistent timestamp units; avoid guessing.
    const sourceTimestamp = typeof row.date === 'number' && Number.isFinite(row.date)
      ? new Date(row.date > 1e17 ? row.date / 1e6 : row.date > 1e14 ? row.date / 1e3 : row.date > 1e11 ? row.date : row.date * 1000).toISOString()
      : null;
    return { exchange: this.id, pair, currency: 'BRL', last: row.last, buy: row.buy, sell: row.sell, sourceTimestamp, fetchedAt: new Date().toISOString() };
  }
}
