const endpoints=[
'https://api.mercadobitcoin.net/api/v4/tickers?symbols=BTC-BRL',
'https://api.mercadobitcoin.net/api/v4/BTC-BRL/orderbook',
'https://api.mercadobitcoin.net/api/v4/symbols?symbols=BTC-BRL',
'https://www.mercadobitcoin.com.br/api/BTC/ticker/',
'https://www.mercadobitcoin.com.br/api/ticker/'
];
for (const url of endpoints) {
 try{
  const r=await fetch(url,{redirect:'manual',headers:{'Accept':'application/json','User-Agent':'CryptoBridge/0.3 (+public-market-data)'},signal:AbortSignal.timeout(10000)});
  const data=await r.text();
  const location=r.headers.get('location');
  console.log(JSON.stringify({host:new URL(url).hostname,path:new URL(url).pathname,status:r.status,location:location?.startsWith('https://')?new URL(location).origin+new URL(location).pathname:null,contentType:r.headers.get('content-type'),bodyHint:data.slice(0,110).replace(/[^a-zA-Z0-9 <>=:/\-._]/g,' ')}));
 }catch(e){console.log(JSON.stringify({host:new URL(url).hostname,error:e instanceof Error?e.name:'unknown'}));}
}

const cg=[
'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl&include_last_updated_at=true',
'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=90&precision=full'
];
for(const url of cg){
 try{
  const r=await fetch(url,{headers:{Accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(12000)});
  const body=await r.text();let parsed;try{parsed=JSON.parse(body)}catch{}
  const prices=Array.isArray(parsed?.prices)?parsed.prices.length:null;
  const quote=parsed?.bitcoin?.brl;
  console.log(JSON.stringify({provider:'coingecko',path:new URL(url).pathname,status:r.status,contentType:r.headers.get('content-type'),priceAvailable:typeof quote==='number'&&quote>0,pointCount:prices,sourceTimestamp:parsed?.bitcoin?.last_updated_at??null,errorType:parsed?.error?String(parsed.error).slice(0,80):null}));
 }catch(e){console.log(JSON.stringify({provider:'coingecko',path:new URL(url).pathname,error:e instanceof Error?e.name:'unknown'}));}
}
