import { McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { MercadoBitcoinAdapter } from './market/mercado-bitcoin.js';
import { ProviderError, tradingUnavailable } from './domain.js';
import { previewLimitOrder } from './order-preview.js';

const market=new MercadoBitcoinAdapter();
const output=(data:unknown)=>({content:[{type:'text' as const,text:JSON.stringify(data)}]});
const fail=(error:unknown)=>({isError:true,content:[{type:'text' as const,text:JSON.stringify({error:error instanceof ProviderError?error.code:'UNEXPECTED_ERROR',message:error instanceof ProviderError?error.message:'Unexpected failure'})}]});

/** Public server: ONLY public market data and OFFLINE preview. No private key or trading pathways. */
export function registerPublicTools(server:McpServer):void {
  server.registerTool('list_exchanges',{description:'List supported exchanges and their presently enabled capabilities.',inputSchema:z.object({})},async()=>output([{id:'mercado_bitcoin',capabilities:['ticker','offline_preview'],accountConnected:false,tradingEnabled:false}]));
  server.registerTool('get_ticker',{description:'Read CURRENT PUBLIC Mercado Bitcoin quote in BRL; result includes exchange, source timestamp when available, and fetchedAt.',inputSchema:z.object({pair:z.string().regex(/^[A-Z0-9]{2,15}-BRL$/)})},async({pair})=>{try{return output(await market.getTicker(pair));}catch(error){return fail(error);}});
  server.registerTool('connection_status',{description:'Explain supported account connection state; no private connection is enabled.',inputSchema:z.object({})},async()=>output({exchange:'mercado_bitcoin',status:'PUBLIC_ONLY',privateAccountEnabled:false,tradingEnabled:false}));
  server.registerTool('preview_limit_order',{description:'HYPOTHETICAL OFFLINE limit-order calculation only. Does not trade, verify real liquidity, access balances or submit any order.',inputSchema:z.object({side:z.enum(['BUY','SELL']),pair:z.string().regex(/^[A-Z0-9]{2,15}-BRL$/),quantity:z.number().positive(),limitPriceBRL:z.number().positive(),feeRatePercent:z.number().min(0).max(100).optional()})},async(args)=>{try{return output(previewLimitOrder(args));}catch(error){return fail(error);}});
  server.registerTool('trade_status',{description:'Trading is disabled server-side and cannot be enabled through chat.',inputSchema:z.object({})},async()=>{try{tradingUnavailable();}catch(error){return fail(error);}});
}
