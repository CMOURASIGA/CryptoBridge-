import { ProviderError, type Balance } from '../domain.js';

const API = 'https://api.mercadobitcoin.net/api/v4/';
type Credentials = Readonly<{ clientId: string; clientSecret: string }>;
type Account = Readonly<{ id: string; name: string; currency: string; type: string }>;
type Order = Readonly<{ id: string; instrument: string; side: string; status: string; qty: string; filledQty: string | null; limitPrice: string | null; createdAt: number | null }>;
function object(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new ProviderError('INVALID_PROVIDER_RESPONSE','Expected an object from provider.');
  return value as Record<string,unknown>;
}
function requireString(v: unknown, field: string): string {
  if (typeof v !== 'string' || !v.trim()) throw new ProviderError('INVALID_PROVIDER_RESPONSE','Missing or invalid '+field);
  return v;
}
function decimal(v: unknown, field: string): string {
  const s = requireString(v,field);
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(s)) throw new ProviderError('INVALID_PROVIDER_RESPONSE','Invalid decimal '+field);
  return s;
}
function safeAccountId(id: string): string {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new ProviderError('INVALID_ACCOUNT_ID','Invalid account ID.');
  return id;
}

/** No write methods, trade endpoints, account mutation or withdrawal routes in this client. */
export class MercadoBitcoinReadClient {
  private token: string | null = null;
  private expiresAt = 0;
  private tokenInFlight: Promise<string> | null = null;
  constructor(private readonly credentials: Credentials, private readonly transport: typeof fetch = fetch, private readonly clock: () => number = Date.now) {
    if (!credentials.clientId || !credentials.clientSecret) throw new ProviderError('NOT_CONFIGURED','Missing local API credentials.');
  }
  private async getToken(): Promise<string> {
    if (this.token && this.clock() < this.expiresAt) return this.token;
    if (this.tokenInFlight) return this.tokenInFlight;
    this.tokenInFlight = this.authenticate();
    try { return await this.tokenInFlight; } finally { this.tokenInFlight=null; }
  }
  private async authenticate(): Promise<string> {
    const params=new URLSearchParams({grant_type:'client_credentials',scope:'global',client_id:this.credentials.clientId,client_secret:this.credentials.clientSecret});
    let response: Response;
    try {
      response=await this.transport(API+'oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:params.toString(),signal:AbortSignal.timeout(10000)});
    } catch { throw new ProviderError('PROVIDER_UNAVAILABLE','Authentication endpoint is unavailable.'); }
    if (!response.ok) throw new ProviderError('AUTH_FAILED','The provider rejected authentication.');
    let payload: Record<string,unknown>;
    try { payload=object(await response.json()); } catch { throw new ProviderError('INVALID_PROVIDER_RESPONSE','Invalid authentication response.'); }
    const token=requireString(payload.access_token,'access_token');
    const expires=payload.expires_in;
    if (typeof expires!=='number'||!Number.isFinite(expires)||expires<=0) throw new ProviderError('INVALID_PROVIDER_RESPONSE','Invalid token expiration.');
    this.token=token;
    this.expiresAt=this.clock()+Math.max(0,(expires-60)*1000);
    return token;
  }
  private async read(path: string): Promise<unknown> {
    // Defense-in-depth: only documented account GET operations below can be requested.
    if (!(/^accounts$/.test(path)||/^accounts\/[A-Za-z0-9_-]{1,128}\/(?:balances|orders)$/.test(path))) {
      throw new ProviderError('FORBIDDEN_OPERATION','Operation is not in the read-only allowlist.');
    }
    const token=await this.getToken();
    let response: Response;
    try { response=await this.transport(API+path,{method:'GET',headers:{Authorization:'Bearer '+token,Accept:'application/json'},signal:AbortSignal.timeout(10000)}); }
    catch { throw new ProviderError('PROVIDER_UNAVAILABLE','Account data is temporarily unavailable.'); }
    if (response.status===401||response.status===403) {this.token=null;this.expiresAt=0;throw new ProviderError('AUTH_FAILED','Access was denied.');}
    if (!response.ok) throw new ProviderError('PROVIDER_HTTP_ERROR','The provider could not complete this read request.');
    try {return await response.json();}catch {throw new ProviderError('INVALID_PROVIDER_RESPONSE','Invalid private response.');}
  }
  async listAccounts(): Promise<Account[]> {
    const data=await this.read('accounts');
    if (!Array.isArray(data)) throw new ProviderError('INVALID_PROVIDER_RESPONSE','Accounts must be an array.');
    return data.map(value=>{const a=object(value); return {id:safeAccountId(requireString(a.id,'id')),name:requireString(a.name,'name'),currency:requireString(a.currency,'currency'),type:requireString(a.type,'type')};});
  }
  private async assertOwned(accountId: string): Promise<void> {
    safeAccountId(accountId);
    if (!(await this.listAccounts()).some(a=>a.id===accountId)) throw new ProviderError('ACCOUNT_NOT_FOUND','Account is not available to the current credential.');
  }
  async getBalances(accountId: string): Promise<Balance[]> {
    await this.assertOwned(accountId);
    const data=await this.read('accounts/'+accountId+'/balances');
    if (!Array.isArray(data)) throw new ProviderError('INVALID_PROVIDER_RESPONSE','Balances must be an array.');
    return data.map(value=>{
      const b=object(value), available=decimal(b.available,'available'),locked=decimal(b.on_hold,'on_hold'),total=decimal(b.total,'total');
      if (Math.abs(Number(available)+Number(locked)-Number(total))>0.00000001) throw new ProviderError('INVALID_PROVIDER_RESPONSE','Provider balance totals differ.');
      return {asset:requireString(b.symbol,'symbol'),available,locked};
    });
  }
  async getOrders(accountId: string): Promise<Order[]> {
    await this.assertOwned(accountId);
    const data=object(await this.read('accounts/'+accountId+'/orders'));
    if (!Array.isArray(data.items)) throw new ProviderError('INVALID_PROVIDER_RESPONSE','Orders items must be an array.');
    return data.items.map(value=>{
      const o=object(value);
      return {id:requireString(o.id,'id'),instrument:requireString(o.instrument,'instrument'),side:requireString(o.side,'side'),status:requireString(o.status,'status'),qty:decimal(o.qty,'qty'),filledQty:typeof o.filledQty==='string'?decimal(o.filledQty,'filledQty'):null,limitPrice:typeof o.limitPrice==='number'&&Number.isFinite(o.limitPrice)?String(o.limitPrice):null,createdAt:typeof o.created_at==='number'&&Number.isFinite(o.created_at)?o.created_at:null};
    });
  }
}
