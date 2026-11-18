import type {ReferenceHistory} from './market/coingecko-reference.js';
import {ProviderError} from './domain.js';
const round=(n:number)=>Math.round(n*10000)/10000;
function sma(prices:number[],n:number):number{return prices.slice(-n).reduce((a,b)=>a+b,0)/n;}
function rsi(prices:number[],length=14):number{
 let gain=0,loss=0;
 const changes=[];
 for(let i=1;i<prices.length;i++)changes.push(prices[i]-prices[i-1]);
 for(const d of changes.slice(0,length)){gain+=Math.max(0,d)/length;loss+=Math.max(0,-d)/length;}
 for(const d of changes.slice(length)){gain=(gain*(length-1)+Math.max(0,d))/length;loss=(loss*(length-1)+Math.max(0,-d))/length;}
 if(loss===0)return gain===0?50:100;
 return 100-100/(1+gain/loss);
}
export function analyzeReferenceHistory(h:ReferenceHistory){
 const p=h.points.map(x=>x.priceBRL);
 if(p.length<51||p.some(x=>!Number.isFinite(x)||x<=0))throw new ProviderError('INSUFFICIENT_HISTORY','At least 51 valid daily prices are needed.');
 const prev=p.slice(-21,-1);const changes=p.slice(-21).map((v,i,a)=>i===0?null:Math.log(v/a[i-1])).slice(1) as number[];
 const mean=changes.reduce((a,b)=>a+b,0)/changes.length;
 const variance=changes.reduce((a,b)=>a+(b-mean)**2,0)/changes.length;
 const vol=Math.sqrt(variance)*Math.sqrt(365)*100;
 const current=p.at(-1)!;const avg20=sma(p,20),avg50=sma(p,50);
 const change20=(current/prev[0]-1)*100;
 const drawdown20=(current/Math.max(...p.slice(-21))-1)*100;
 // Heuristic labels, NOT trade signals or predictive forecasts.
 const regime=drawdown20<=-15?'CRASH':vol>=90?'AGITADO':Math.abs(change20)<3?'LATERAL':'TENDENCIA_CALMA';
 return {provider:h.provider,pair:h.pair,currency:h.currency,kind:'REFERENCE_ANALYSIS_NOT_EXCHANGE_PRICE',historyKind:h.kind,sourceTimestamp:h.lastSourceTimestamp,fetchedAt:h.fetchedAt,observations:p.length,latestReferencePriceBRL:String(current),sma20BRL:round(avg20),sma50BRL:round(avg50),rsi14:round(rsi(p)),annualizedVolatility20Pct:round(vol),change20DaysPct:round(change20),drawdown20DaysPct:round(drawdown20),regime,regimeRules:{crashDrawdown20Pct:-15,agitatedAnnualizedVolatilityPct:90,lateralAbsChange20Pct:3},atr14:null,atrStatus:'NOT_CALCULATED_NO_OHLC',volumeStatus:'NOT_EVALUATED',tradingEnabled:false,executableQuote:false,disclaimer:'Daily sampled aggregated reference prices; not Mercado Bitcoin candles, execution quotes or trading advice.'};
}
