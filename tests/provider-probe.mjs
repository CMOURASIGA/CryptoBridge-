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
