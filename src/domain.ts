export type ExchangeId = 'mercado_bitcoin';
export type Capability = 'ticker' | 'balances' | 'orders' | 'portfolio';
export type ExchangeStatus = 'PUBLIC_ONLY' | 'CONNECTED' | 'DISCONNECTED';
export type Ticker = Readonly<{
  exchange: ExchangeId;
  pair: string;
  currency: 'BRL';
  last: string;
  buy: string;
  sell: string;
  sourceTimestamp: string | null;
  fetchedAt: string;
}>;
export type Balance = Readonly<{
  asset: string;
  available: string;
  locked: string;
}>;
export type Holding = Readonly<{
  asset: string;
  amount: string;
  priceBRL: string | null;
  valueBRL: string | null;
}>;
export interface ExchangeAdapter {
  readonly id: ExchangeId;
  readonly capabilities: readonly Capability[];
  getTicker(pair: string): Promise<Ticker>;
}
export class ProviderError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'ProviderError'; }
}
export const TRADING_ENABLED = false as const;
export const PRIVATE_ACCOUNT_ENABLED = false as const;
export function privateAccessUnavailable(): never {
  throw new ProviderError('NOT_CONFIGURED', 'Authenticated account access is unavailable. Never paste API keys into chat.');
}
export function tradingUnavailable(): never {
  throw new ProviderError('TRADING_DISABLED', 'Trading, cancellation, transfer and withdrawal are disabled at server level.');
}
