import { ProviderError, type Balance, type Holding } from './domain.js';
/** Accepts caller-provided snapshots only. Never invents user balances or historical P&L. */
export function summarizeBalances(balances: readonly Balance[], pricesBRL: Readonly<Record<string, string>>): { holdings: Holding[]; totalBRL: string | null; hasMissingPrices: boolean } {
  let total = 0;
  let missing = false;
  const holdings: Holding[] = [];
  for (const b of balances) {
    if (!/^[A-Z0-9]{2,15}$/.test(b.asset)) throw new ProviderError('INVALID_BALANCE', 'Invalid asset.');
    const amount = Number(b.available) + Number(b.locked);
    if (![Number(b.available), Number(b.locked), amount].every(v => Number.isFinite(v) && v >= 0)) throw new ProviderError('INVALID_BALANCE', 'Invalid available/locked balance.');
    const price = b.asset === 'BRL' ? 1 : pricesBRL[b.asset] === undefined ? null : Number(pricesBRL[b.asset]);
    if (price !== null && (!Number.isFinite(price) || price < 0)) throw new ProviderError('INVALID_PRICE', 'Invalid asset quote.');
    const value = price === null ? null : amount * price;
    if (value === null) missing = true;
    else total += value;
    holdings.push({ asset:b.asset, amount:String(amount), priceBRL:price === null ? null : String(price), valueBRL:value === null ? null : value.toFixed(2) });
  }
  return { holdings, totalBRL:missing ? null : total.toFixed(2), hasMissingPrices: missing };
}
