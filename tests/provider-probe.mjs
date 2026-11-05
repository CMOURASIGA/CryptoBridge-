for(const url of [
'https://api.mercadobitcoin.net/api/v4/tickers?symbols=BTC-BRL',
'https://api.mercadobitcoin.net/api/v4/tickers/?symbols=BTC-BRL',
'https://api.mercadobitcoin.net/api/v4/tickers?symbols=ETH-BRL'
]){
 try{
  const r=await fetch(url,{headers:{Accept:'application/json'},redirect:'manual',signal:AbortSignal.timeout(10000)});
  console.log(JSON.stringify({host:new URL(url).host,path:new URL(url).pathname,status:r.status,location:r.headers.get('location'),contentType:r.headers.get('content-type')}));
 }catch(e){console.log(JSON.stringify({error:e instanceof Error?e.name:'unknown'}));process.exitCode=1;}
}
