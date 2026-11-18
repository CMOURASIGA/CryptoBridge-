import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { MercadoBitcoinAdapter } from './market/mercado-bitcoin.js';
import { ProviderError, tradingUnavailable } from './domain.js';
import { previewLimitOrder } from './order-preview.js';
import { CoinGeckoReference } from './market/coingecko-reference.js';
import { analyzeReferenceHistory } from './reference-analysis.js';

const market=new MercadoBitcoinAdapter();
const reference=new CoinGeckoReference();
const output=(data:unknown)=>({content:[{type:'text' as const,text:JSON.stringify(data)}]});
const fail=(error:unknown)=>({isError:true,content:[{type:'text' as const,text:JSON.stringify({error:error instanceof ProviderError?error.code:'UNEXPECTED_ERROR',message:error instanceof ProviderError?error.message:'Unexpected failure'})}]});

/** Public server: ONLY public market data and OFFLINE preview. No private key or trading pathways. */
export function registerPublicTools(server:McpServer):void {
  server.registerTool('list_exchanges',{description:'List supported exchanges and their presently enabled capabilities.',inputSchema:z.object({})},async()=>output([{id:'mercado_bitcoin',capabilities:['ticker','offline_preview'],accountConnected:false,tradingEnabled:false}]));
  server.registerTool('get_ticker',{description:'Read CURRENT PUBLIC Mercado Bitcoin quote in BRL; result includes exchange, source timestamp when available, and fetchedAt.',inputSchema:z.object({pair:z.string().regex(/^[A-Z0-9]{2,15}-BRL$/)})},async({pair})=>{try{return output(await market.getTicker(pair));}catch(error){return fail(error);}});
  server.registerTool('get_reference_price',{description:'Get a fresh BRL aggregated CoinGecko REFERENCE price for BTC/ETH/SOL; NOT a Mercado Bitcoin quote or executable price.',inputSchema:z.object({pair:z.enum(['BTC-BRL','ETH-BRL','SOL-BRL'])})},async({pair})=>{try{return output(await reference.getQuote(pair));}catch(error){return fail(error);}});
  server.registerTool('analyze_market_reference',{description:'Historical analysis from CoinGecko aggregated daily sampled BRL prices: SMA20/50, RSI14, annualized volatility and heuristic regime. Not OHLCV, not ATR, not a Mercado Bitcoin quote, never trade advice.',inputSchema:z.object({pair:z.enum(['BTC-BRL','ETH-BRL','SOL-BRL']),days:z.number().int().min(60).max(90).default(90)})},async({pair,days})=>{try{return output(analyzeReferenceHistory(await reference.getHistory(pair,days)));}catch(error){return fail(error);}});
  server.registerTool('connection_status',{description:'Explain supported account connection state; no private connection is enabled.',inputSchema:z.object({})},async()=>output({exchange:'mercado_bitcoin',status:'PUBLIC_ONLY',privateAccountEnabled:false,tradingEnabled:false}));
  server.registerTool('preview_limit_order',{description:'HYPOTHETICAL OFFLINE limit-order calculation only. Does not trade, verify real liquidity, access balances or submit any order.',inputSchema:z.object({side:z.enum(['BUY','SELL']),pair:z.string().regex(/^[A-Z0-9]{2,15}-BRL$/),quantity:z.number().positive(),limitPriceBRL:z.number().positive(),feeRatePercent:z.number().min(0).max(100).optional()})},async(args)=>{try{return output(previewLimitOrder(args));}catch(error){return fail(error);}});
  server.registerTool('trade_status',{description:'Trading is disabled server-side and cannot be enabled through chat.',inputSchema:z.object({})},async()=>{try{tradingUnavailable();}catch(error){return fail(error);}});
}
