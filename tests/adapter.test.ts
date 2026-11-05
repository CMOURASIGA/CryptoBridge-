import test from 'node:test';
import assert from 'node:assert/strict';
import { MercadoBitcoinAdapter } from '../src/market/mercado-bitcoin.js';
import { summarizeBalances } from '../src/analytics.js';
import { PRIVATE_ACCOUNT_ENABLED, TRADING_ENABLED, privateAccessUnavailable, tradingUnavailable } from '../src/domain.js';

test('ticker request uses documented public endpoint and normalizes prices',async()=>{
  let called = '';
  const mock = (async (url:string | URL | Request)=>{called=String(url);return new Response(JSON.stringify([{pair:'BTC-BRL',last:'500000.00',buy:'499000.00',sell:'501000.00',date:1760000000}]),{status:200});}) as typeof fetch;
  const result = await new MercadoBitcoinAdapter(mock).getTicker('BTC-BRL');
  assert.match(called,/api\/v4\/tickers\?symbols=BTC-BRL/);
  assert.equal(result.last,'500000.00');assert.equal(result.exchange,'mercado_bitcoin');
});
test('invalid symbols rejected before outbound request',async()=>{
  const adapter=new MercadoBitcoinAdapter((async()=>{throw Error('Must not call');}) as typeof fetch);
  await assert.rejects(adapter.getTicker('http://example.com'),{code:'INVALID_PAIR'});
});
test('provider errors hide transport internals',async()=>{
  const adapter=new MercadoBitcoinAdapter((async()=>{throw Error('secret');}) as typeof fetch);
  await assert.rejects(adapter.getTicker('BTC-BRL'),{code:'PROVIDER_UNAVAILABLE'});
});
test('portfolio totals require all prices',()=>{
  const r=summarizeBalances([{asset:'BTC',available:'0.1',locked:'0.1'},{asset:'BRL',available:'50',locked:'0'}],{BTC:'400000'});
  assert.equal(r.totalBRL,'80050.00');
  assert.equal(summarizeBalances([{asset:'ETH',available:'1',locked:'0'}],{}).totalBRL,null);
});
test('trading and private account access are blocked',()=>{
  assert.equal(TRADING_ENABLED,false);assert.equal(PRIVATE_ACCOUNT_ENABLED,false);
  assert.throws(tradingUnavailable,{code:'TRADING_DISABLED'});
  assert.throws(privateAccessUnavailable,{code:'NOT_CONFIGURED'});
});
