import { ProviderError } from '../domain.js';

const ids: Record<string,string> = {'BTC-BRL':'bitcoin','ETH-BRL':'ethereum','SOL-BRL':'solana'};
type Row = Record<string,unknown>;
export type ReferenceQuote = Readonly<{provider:'coingecko';kind:'AGGREGATED_REFERENCE_NOT_EXCHANGE_EXECUTION_PRICE';pair:string;currency:'BRL';priceBRL:string;sourceTimestamp:string;fetchedAt:string;isFresh:boolean}>;
export type DailyPoint = Readonly<{date:string;priceBRL:number}>;
export type ReferenceHistory = Readonly<{provider:'coingecko';kind:'AGGREGATED_REFERENCE_HISTORY_NOT_OHLCV';pair:string;currency:'BRL';fetchedAt:string;daysRequested:number;points:DailyPoint[];lastSourceTimestamp:string}>;
const err=(code:string,msg:string)=>new ProviderError(code,msg);
function validatePair(pair:string):string{
 const id=ids[pair];
 if(!id) throw err('UNSUPPORTED_PAIR','Reference data currently supports BTC-BRL, ETH-BRL and SOL-BRL only.');
 return id;
}
function numeric(x:unknown):x is number{return typeof x==='number'&&Number.isFinite(x)&&x>0;}
function timestamp(ms:number):string {
 if(!Number.isFinite(ms)||ms<Date.UTC(2015,0,1)||ms>Date.now()+300000) throw err('INVALID_PROVIDER_RESPONSE','Market data has an invalid timestamp.');
 return new Date(ms).toISOString();
}
export class CoinGeckoReference {
 constructor(private readonly transport:typeof fetch=fetch,private readonly now:()=>number=Date.now){}
 private async get(path:string):Promise<unknown>{
  const headers:Record<string,string>={Accept:'application/json'};
  if(process.env.COINGECKO_DEMO_API_KEY) headers['x-cg-demo-api-key']=process.env.COINGECKO_DEMO_API_KEY;
  let r:Response;
  try{r=await this.transport('https://api.coingecko.com/api/v3/'+path,{method:'GET',redirect:'manual',headers,signal:AbortSignal.timeout(10000)});}
  catch{throw err('REFERENCE_UNAVAILABLE','CoinGecko request failed; reference price unavailable.');}
  if(!r.ok)throw err('REFERENCE_HTTP_ERROR','CoinGecko returned HTTP '+r.status+'; reference price unavailable.');
  if(!r.headers.get('content-type')?.includes('application/json'))throw err('INVALID_PROVIDER_RESPONSE','CoinGecko returned non-JSON market data.');
  try{return await r.json();}catch{throw err('INVALID_PROVIDER_RESPONSE','CoinGecko JSON could not be parsed.');}
 }
 async getQuote(pair:string):Promise<ReferenceQuote>{
  const id=validatePair(pair);
  const data=await this.get('simple/price?ids='+id+'&vs_currencies=brl&include_last_updated_at=true');
  const row=(data as Row)?.[id] as Row|undefined;
  const seconds=row?.last_updated_at;
  if(!numeric(row?.brl)||!numeric(seconds))throw err('INVALID_PROVIDER_RESPONSE','CoinGecko reference price or timestamp is missing.');
  const sourceMs=seconds*1000;
  timestamp(sourceMs);
  const age=this.now()-sourceMs;
  if(age< -300000 || age>600000)throw err('STALE_REFERENCE_PRICE','CoinGecko reference price is more than ten minutes old.');
  return {provider:'coingecko',kind:'AGGREGATED_REFERENCE_NOT_EXCHANGE_EXECUTION_PRICE',pair,currency:'BRL',priceBRL:String(row.brl),sourceTimestamp:new Date(sourceMs).toISOString(),fetchedAt:new Date(this.now()).toISOString(),isFresh:true};
 }
 async getHistory(pair:string,days=90):Promise<ReferenceHistory>{
  const id=validatePair(pair);
  if(!Number.isInteger(days)||days<60||days>90)throw err('INVALID_WINDOW','History window must be from 60 to 90 days.');
  const data=await this.get('coins/'+id+'/market_chart?vs_currency=brl&days='+days+'&precision=full') as Row;
  if(!Array.isArray(data?.prices))throw err('INVALID_PROVIDER_RESPONSE','CoinGecko price series is missing.');
  const pointsByDay=new Map<string,DailyPoint>();
  let lastSource=0;
  for(const raw of data.prices as unknown[]){
   if(!Array.isArray(raw)||raw.length<2||!numeric(raw[0])||!numeric(raw[1]))throw err('INVALID_PROVIDER_RESPONSE','History contains invalid price points.');
   const ms=raw[0],price=raw[1];timestamp(ms);
   if(ms>this.now()+300000)throw err('INVALID_PROVIDER_RESPONSE','History includes future prices.');
   const date=new Date(ms).toISOString().slice(0,10);
   if(ms>lastSource)lastSource=ms;
   pointsByDay.set(date,{date,priceBRL:price});
  }
  const points=[...pointsByDay.values()].sort((a,b)=>a.date.localeCompare(b.date));
  if(points.length<51)throw err('INSUFFICIENT_HISTORY','At least 51 daily price observations are required.');
  if(this.now()-lastSource>86400000*2)throw err('STALE_REFERENCE_HISTORY','CoinGecko history is more than two days old.');
  for(let i=1;i<points.length;i++){
   const gap=(Date.parse(points[i].date)-Date.parse(points[i-1].date))/86400000;
   if(gap!==1)throw err('INCOMPLETE_HISTORY','Daily reference history has missing days.');
  }
  return {provider:'coingecko',kind:'AGGREGATED_REFERENCE_HISTORY_NOT_OHLCV',pair,currency:'BRL',fetchedAt:new Date(this.now()).toISOString(),daysRequested:days,points,lastSourceTimestamp:new Date(lastSource).toISOString()};
 }
}
