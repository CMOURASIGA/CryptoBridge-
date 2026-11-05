import assert from 'node:assert/strict';
const base = process.env.MCP_URL;
if (!base || !base.startsWith('https://')) throw Error('MCP_URL must use HTTPS');
let id=0;
async function call(method,params={}){
 const r=await fetch(base,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json, text/event-stream','MCP-Protocol-Version':'2025-11-25'},body:JSON.stringify({jsonrpc:'2.0',id:++id,method,params}),signal:AbortSignal.timeout(15000)});
 const body=await r.text();
 if(!r.ok) throw Error(method+' HTTP '+r.status+': '+body.slice(0,250));
 if(r.headers.get('content-type')?.includes('event-stream')){
  const messages=body.split(/\r?\n/).filter(x=>x.startsWith('data:')).map(x=>JSON.parse(x.slice(5).trim()));
  const msg=messages.find(x=>x.id===id);
  if(!msg) throw Error('No MCP response for '+method);
  if(msg.error) throw Error(method+' error '+JSON.stringify(msg.error));
  return msg.result;
 }
 const json=JSON.parse(body);
 if(json.error) throw Error(method+' error '+JSON.stringify(json.error));
 return json.result;
}
async function run(){
 const initialized=await call('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'cryptobridge-smoke',version:'0.1.0'}});
 assert.ok(initialized.serverInfo,'MCP initialize must return serverInfo');
 const tools=await call('tools/list',{});
 const names=tools.tools.map(t=>t.name);
 for(const name of ['list_exchanges','get_ticker','connection_status','preview_limit_order','trade_status'])assert.ok(names.includes(name),'missing '+name);
 for(const forbidden of ['place_order','cancel_order','withdraw','transfer','get_balances','get_orders'])assert.ok(!names.includes(forbidden),'unsafe exposed tool '+forbidden);
 const preview=await call('tools/call',{name:'preview_limit_order',arguments:{side:'BUY',pair:'BTC-BRL',quantity:0.001,limitPriceBRL:500000}});
 const p=JSON.parse(preview.content[0].text);
 assert.equal(p.executed,false);
 const ticker=await call('tools/call',{name:'get_ticker',arguments:{pair:'BTC-BRL'}});
 if(ticker.isError) throw Error('Ticker failed: '+ticker.content?.[0]?.text);
 const t=JSON.parse(ticker.content[0].text);
 assert.equal(t.exchange,'mercado_bitcoin');assert.equal(t.pair,'BTC-BRL');assert.ok(t.fetchedAt);
 console.log(JSON.stringify({server:initialized.serverInfo,tools:names,ticker:{pair:t.pair,price:t.last,fetchedAt:t.fetchedAt},previewSafe:!p.executed},null,2));
}
run().catch(e=>{console.error(e.message);process.exitCode=1;});
