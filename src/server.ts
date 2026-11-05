import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import { MercadoBitcoinAdapter } from './market/mercado-bitcoin.js';
import { ProviderError, privateAccessUnavailable, tradingUnavailable } from './domain.js';
import { previewLimitOrder } from './order-preview.js';

const market = new MercadoBitcoinAdapter();
const output = (data:unknown) => ({ content:[{type:'text' as const,text:JSON.stringify(data)}] });
const fail = (error:unknown) => ({ isError:true, content:[{type:'text' as const,text:JSON.stringify({ error:error instanceof ProviderError?error.code:'UNEXPECTED_ERROR', message:error instanceof Error?error.message:'Unknown failure' })}] });

serveStdio(() => {
  const server = new McpServer({name:'cryptobridge',version:'0.1.0'});
  server.registerTool('list_exchanges',{description:'List currently implemented cryptocurrency exchange integrations.',inputSchema:z.object({})},async()=>output([{ id:'mercado_bitcoin', capabilities:['ticker'], accountConnected:false, tradingEnabled:false }]));
  server.registerTool('get_ticker',{description:'Fetch current PUBLIC Mercado Bitcoin quote; not a personal portfolio value.',inputSchema:z.object({pair:z.string().regex(/^[A-Z0-9]{2,15}-BRL$/).describe('e.g. BTC-BRL')})},async({pair})=>{try {return output(await market.getTicker(pair));}catch(e){return fail(e);}});
  server.registerTool('connection_status',{description:'Check whether private account connection is configured.',inputSchema:z.object({})},async()=>output({exchange:'mercado_bitcoin',status:'PUBLIC_ONLY',privateAccountEnabled:false,requiresSecureUserAuthorization:true}));
  server.registerTool('get_balances',{description:'Private account balances, unavailable until secure per-user authorization exists.',inputSchema:z.object({})},async()=>{try{privateAccessUnavailable();}catch(e){return fail(e);}});
  server.registerTool('get_portfolio',{description:'Private portfolio, unavailable until secure per-user authorization exists.',inputSchema:z.object({})},async()=>{try{privateAccessUnavailable();}catch(e){return fail(e);}});
  server.registerTool('get_orders',{description:'Private order history, unavailable until secure per-user authorization exists.',inputSchema:z.object({})},async()=>{try{privateAccessUnavailable();}catch(e){return fail(e);}});
  server.registerTool('preview_limit_order',{description:'LOCAL HYPOTHETICAL limit order math only. This does NOT send an order, check account balance, or contact an exchange.',inputSchema:z.object({side:z.enum(['BUY','SELL']),pair:z.string().regex(/^[A-Z0-9]{2,15}-BRL$/),quantity:z.number().positive(),limitPriceBRL:z.number().positive(),feeRatePercent:z.number().min(0).max(100).optional()})},async(args)=>{try{return output(previewLimitOrder(args));}catch(e){return fail(e);}});
  server.registerTool('trade_status',{description:'Trading is blocked. This tool performs no financial operation.',inputSchema:z.object({})},async()=>{try{tradingUnavailable();}catch(e){return fail(e);}});
  return server;
});
