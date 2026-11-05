const url='https://api.mercadobitcoin.net/api/v4/tickers?symbols=BTC-BRL';
try {
 const r=await fetch(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
 console.log(JSON.stringify({host:new URL(url).host,status:r.status,contentType:r.headers.get('content-type'),retryAfter:r.headers.get('retry-after')}));
 if(r.ok){const data=await r.json();console.log(JSON.stringify({isArray:Array.isArray(data),pairs:Array.isArray(data)?data.map(x=>x.pair).slice(0,3):[],fields:Array.isArray(data)&&data[0]?Object.keys(data[0]):[]}));}
} catch(e){console.log(JSON.stringify({host:new URL(url).host,error:e instanceof Error?e.name:'unknown'}));process.exitCode=1;}
