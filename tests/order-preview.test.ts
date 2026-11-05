import test from 'node:test';
import assert from 'node:assert/strict';
import { previewLimitOrder } from '../src/order-preview.js';
import { TRADING_ENABLED, tradingUnavailable } from '../src/domain.js';

test('preview is hypothetical and never executes',()=>{
  const p=previewLimitOrder({side:'BUY',pair:'ETH-BRL',quantity:0.1,limitPriceBRL:12000,feeRatePercent:0.5});
  assert.equal(p.grossBRL,'1200.00');
  assert.equal(p.feeBRL,'6.00');
  assert.equal(p.estimatedTotalBRL,'1206.00');
  assert.equal(p.executed,false);
  assert.match(p.warning,/NO ORDER WAS SENT/);
});
test('fee unknown means total unknown',()=>{
  const p=previewLimitOrder({side:'SELL',pair:'BTC-BRL',quantity:0.01,limitPriceBRL:500000});
  assert.equal(p.grossBRL,'5000.00');
  assert.equal(p.estimatedTotalBRL,null);
});
test('invalid preview inputs fail closed',()=>{
  assert.throws(()=>previewLimitOrder({side:'BUY',pair:'BTC-BRL',quantity:0,limitPriceBRL:1}),{code:'INVALID_ORDER_INPUT'});
  assert.throws(()=>previewLimitOrder({side:'SELL',pair:'BTC-BRL',quantity:1,limitPriceBRL:1,feeRatePercent:105}),{code:'INVALID_FEE'});
});
test('trading invariant still disabled',()=>{assert.equal(TRADING_ENABLED,false);assert.throws(tradingUnavailable,{code:'TRADING_DISABLED'});});
