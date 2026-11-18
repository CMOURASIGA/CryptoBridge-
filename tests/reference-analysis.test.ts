import test from 'node:test';
import assert from 'node:assert/strict';
import { CoinGeckoReference } from '../src/market/coingecko-reference.js';
import { analyzeReferenceHistory } from '../src/reference-analysis.js';
const now=Date.UTC(2026,10,18,12);
const json=(x:unknown,status=200)=>new Response(JSON.stringify(x),{status,headers:{'content-type':'application/json'}});
test('reference quote retains different provider identity and fresh source timestamp',async()=>{
 let url='';
 const api=new CoinGeckoReference((async(input)=>{url=String(input);return json({bitcoin:{brl:500000,last_updated_at:now/1000-20}});}) as typeof fetch,()=>now);
 const q=await api.getQuote('BTC-BRL');
 assert.match(url,/coingecko.com\/api\/v3\/simple\/price/);assert.equal(q.provider,'coingecko');assert.equal(q.priceBRL,'500000');assert.equal(q.isFresh,true);
 assert.match(q.kind,/NOT_EXCHANGE/);
});
test('stale or absent reference quotes are rejected without fallback',async()=>{
 const api=new CoinGeckoReference((async()=>json({ethereum:{brl:100,last_updated_at:now/1000-10000}})) as typeof fetch,()=>now);
 await assert.rejects(api.getQuote('ETH-BRL'),{code:'STALE_REFERENCE_PRICE'});
});
test('history computes reproducible indicators and never claims OHLCV or executable quote',async()=>{
 const start=now-80*86400000;
 const prices=Array.from({length:81},(_,i)=>[start+i*86400000,100+i]);
 const api=new CoinGeckoReference((async()=>json({prices})) as typeof fetch,()=>now);
 const h=await api.getHistory('SOL-BRL',90);
 const a=analyzeReferenceHistory(h);
 assert.equal(a.observations,81);assert.equal(a.sma20BRL,170.5);assert.equal(a.latestReferencePriceBRL,'180');
 assert.equal(a.atr14,null);assert.equal(a.executableQuote,false);assert.equal(a.tradingEnabled,false);
});
test('series with days missing fails closed',async()=>{
 const start=now-80*86400000;
 const prices=Array.from({length:81},(_,i)=>[start+i*86400000,100+i]).filter((_,i)=>i!==45);
 const api=new CoinGeckoReference((async()=>json({prices})) as typeof fetch,()=>now);
 await assert.rejects(api.getHistory('BTC-BRL'),{code:'INCOMPLETE_HISTORY'});
});
test('CoinGecko HTML errors never surface as market data',async()=>{
 const api=new CoinGeckoReference((async()=>new Response('<html>down</html>',{status:200,headers:{'content-type':'text/html'}})) as typeof fetch,()=>now);
 await assert.rejects(api.getQuote('BTC-BRL'),{code:'INVALID_PROVIDER_RESPONSE'});
});
