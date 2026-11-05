import test from 'node:test';
import assert from 'node:assert/strict';
import { MercadoBitcoinReadClient } from '../src/private/mercado-bitcoin-read.js';

const creds={clientId:'fake-test-id',clientSecret:'fake-test-secret'};
function response(value:unknown,status=200) {return new Response(JSON.stringify(value),{status});}
test('authenticate and read balances using only GET on account paths',async()=>{
 const requests:{path:string;method:string;authorization?:string}[]=[];
 const mock=(async (url:string | URL | Request,init?:RequestInit)=>{
  const path=new URL(String(url)).pathname, method=init?.method||'GET';
  requests.push({path,method,authorization:new Headers(init?.headers).get('Authorization')??undefined});
  if(path.endsWith('/oauth2/token')) {assert.equal(method,'POST');assert.match(String(init?.body),/grant_type=client_credentials/);return response({access_token:'dummy',expires_in:3600});}
  assert.equal(method,'GET');
  if(path.endsWith('/accounts'))return response([{id:'account_1',name:'Mercado Bitcoin',currency:'BRL',type:'live'}]);
  if(path.endsWith('/balances'))return response([{symbol:'BRL',available:'10',on_hold:'2',total:'12'}]);
  throw Error('Unexpected endpoint');
 }) as typeof fetch;
 const client=new MercadoBitcoinReadClient(creds,mock);
 assert.deepEqual(await client.getBalances('account_1'),[{asset:'BRL',available:'10',locked:'2'}]);
 assert.equal(requests.filter(r=>r.path.endsWith('oauth2/token')).length,1);
 assert.ok(requests.filter(r=>r.method==='GET').every(r=>r.authorization==='Bearer dummy'));
 assert.ok(requests.every(r=>!r.path.includes('transfers')&&!r.path.includes('withdraw')));
});
test('refuses unowned accounts before reading balances',async()=>{
 const routes:string[]=[];
 const mock=(async (url:string|URL|Request)=>{
  const p=new URL(String(url)).pathname;routes.push(p);
  if(p.endsWith('/oauth2/token'))return response({access_token:'token',expires_in:3600});
  if(p.endsWith('/accounts'))return response([{id:'mine',name:'MB',currency:'BRL',type:'live'}]);
  throw Error('Must not fetch account data for unowned account');
 }) as typeof fetch;
 const client=new MercadoBitcoinReadClient(creds,mock);
 await assert.rejects(client.getBalances('someone_else'),{code:'ACCOUNT_NOT_FOUND'});
 assert.ok(!routes.some(r=>r.endsWith('/balances')));
});
test('orders are read and normalized with no POST after OAuth',async()=>{
 const requests:string[]=[];
 const mock=(async (url:string|URL|Request,init?:RequestInit)=>{
  const p=new URL(String(url)).pathname;requests.push((init?.method||'GET')+' '+p);
  if(p.endsWith('/oauth2/token'))return response({access_token:'token',expires_in:3600});
  if(p.endsWith('/accounts'))return response([{id:'mine',name:'MB',currency:'BRL',type:'live'}]);
  if(p.endsWith('/orders'))return response({items:[{id:'order1',instrument:'ETH-BRL',side:'buy',status:'working',qty:'0.1',filledQty:'0',limitPrice:12000,created_at:1760000000}]});
  throw Error('unexpected');
 }) as typeof fetch;
 const c=new MercadoBitcoinReadClient(creds,mock);
 const orders=await c.getOrders('mine');
 assert.equal(orders[0]?.status,'working');
 assert.ok(requests.filter(s=>s.startsWith('POST')).every(s=>s.endsWith('/oauth2/token')));
});
test('error outputs never include provider auth body or secret',async()=>{
 const mock=(async()=>response({message:'secret-should-not-leak'},401)) as typeof fetch;
 const c=new MercadoBitcoinReadClient(creds,mock);
 await assert.rejects(c.listAccounts(),e=>{assert.ok(!String(e).includes('secret-should-not-leak'));return true;});
});
