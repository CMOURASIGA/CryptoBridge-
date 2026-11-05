import { ProviderError } from './domain.js';

/** This function performs local arithmetic only; it has no transport or exchange client. */
export type PreviewInput = Readonly<{
  side: 'BUY' | 'SELL';
  pair: string;
  quantity: number;
  limitPriceBRL: number;
  feeRatePercent?: number;
}>;
export type Preview = Readonly<{
  kind: 'HYPOTHETICAL_PREVIEW';
  side: 'BUY' | 'SELL';
  pair: string;
  quantity: number;
  limitPriceBRL: number;
  grossBRL: string;
  feeBRL: string | null;
  estimatedTotalBRL: string | null;
  executed: false;
  warning: string;
}>;
export function previewLimitOrder(input: PreviewInput): Preview {
  if (!/^[A-Z0-9]{2,15}-BRL$/.test(input.pair)) throw new ProviderError('INVALID_PAIR', 'Only validated BRL pairs can be previewed.');
  if (![input.quantity,input.limitPriceBRL].every(v=>Number.isFinite(v)&&v>0)) throw new ProviderError('INVALID_ORDER_INPUT', 'Quantity and limit price must be positive finite numbers.');
  if (input.feeRatePercent !== undefined && (!Number.isFinite(input.feeRatePercent)||input.feeRatePercent<0||input.feeRatePercent>100)) throw new ProviderError('INVALID_FEE', 'Fee percent must be between 0 and 100.');
  const gross = input.quantity * input.limitPriceBRL;
  if (!Number.isFinite(gross) || gross<=0) throw new ProviderError('INVALID_ORDER_INPUT', 'Notional is not representable.');
  const fee = input.feeRatePercent === undefined ? null : gross*input.feeRatePercent/100;
  return {
    kind:'HYPOTHETICAL_PREVIEW', side:input.side, pair:input.pair,
    quantity:input.quantity, limitPriceBRL:input.limitPriceBRL,
    grossBRL:gross.toFixed(2), feeBRL:fee===null?null:fee.toFixed(2),
    estimatedTotalBRL:fee===null?null:(input.side==='BUY'?gross+fee:gross-fee).toFixed(2),
    executed:false,
    warning:'Offline arithmetic only. No balance, market price, liquidity, order constraints or fees verified. NO ORDER WAS SENT.'
  };
}
