# CryptoBridge

Personal, independent, multi-exchange crypto portfolio connector for ChatGPT. **Early-development repository. Not an investment execution tool.**

## Current state

- Mercado Bitcoin public ticker lookup via its documented `/api/v4/tickers` endpoint.
- Local MCP server over stdio, with deliberately unavailable private account/portfolio/order tools until per-user authorization and secure storage are implemented.
- Domain interfaces for exchange adapters and portfolio analytics operating on explicitly provided data.
- **No trade, transfer, withdraw, cancel or order-submission tool exists.** No real credentials should be supplied. Analysis and execution are separate operating levels; trade execution requires its own future security specification.
- No Supabase dependency. See [architecture decision](docs/ARCHITECTURE.md): the provider is the financial source of truth; optional databases are not required to retrieve data.

## Run locally

Install Node.js 22+, then:

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

The server uses **stdio**, suitable for local MCP clients. Do not expose it over HTTP or deploy as a shared public service: authentication, consent and multi-tenant isolation have not been implemented. Live prices require external network access. Private tools report `NOT_CONFIGURED` and never return mock balances as if real.

## MCP tools

- `list_exchanges`: available adapter capabilities
- `get_ticker`: public Mercado Bitcoin price data for one `BASE-BRL` pair
- `connection_status`: reports that personal account access is not configured
- `get_balances`, `get_portfolio`, `get_orders`: explicitly blocked pending per-user authenticated integration
- `preview_limit_order`: hypothetical local calculations, **never** sends orders
- `trade_status`: execution permanently disabled in this release

See [SPEC 00](docs/SPEC-00.md), [security policy](docs/SECURITY.md) and [implementation plan](docs/ROADMAP.md).

## Release policy

Work in `develop`. `main` is not updated without explicit owner authorization. Public distribution and production deployment require security review.
