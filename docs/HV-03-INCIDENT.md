# HV-03 | Public ticker incident report (2026-11-05)
- Documented endpoint: GET https://api.mercadobitcoin.net/api/v4/tickers?symbols=BTC-BRL
- GitHub Actions independent probe: HTTP 302, HTML title 'Mercado Bitcoin - Página indisponível'; no Location header.
- Other documented API v4 endpoints (/BTC-BRL/orderbook, /symbols) returned the same 302/HTML. Legacy website ticker URLs returned HTTP 403.
- This is **not evidence of a bad symbol** and not proof of a global Mercado Bitcoin outage. It documents failed connectivity from our remote testing environment.
- Updated the adapter to reject redirects without following them and report the HTTP status. Reject HTML on 200. No fallback to another venue without clear attribution.
- Financial transaction execution remains prohibited. No production publication authorized.
- LIVE quotes require the provider to respond with validated application/json or an officially supported alternative endpoint.
- Vercel Hobby API deployment quota previously returned HTTP 402 'api-deployments-free-per-day'. Deploy only once capacity is restored; the installed plugin may still point to an older server version.

## Official provider incident identified 2026-11-05

Official Mercado Bitcoin service status (https://status.mercadobitcoin.com.br/) reports Trade API under maintenance. Its customer FAQ (https://central.ajuda.mercadobitcoin.com.br/wiki/spaces/TF/pages/2968387585/Perguntas%2Bfrequentes) states that a security incident identified on 2026-11-02 led to temporary platform suspension, and that a gradual website reopening is planned from 2026-11-09. Its network status page (https://www.mercadobitcoin.com.br/network) indicates withdrawals and deposits temporarily suspended. These notices explain the observed provider-unavailable responses more plausibly than any malformed ticker pair.

**Do not bypass the provider's preventive suspension**, change hosts to evade protection, or substitute quotes from another exchange while labeling them Mercado Bitcoin.

## Exit criteria and recovery sequence

1. Official status of Trade API is operational, and the provider permits normal access.
2. From the deployment environment, GET /api/v4/tickers?symbols=BTC-BRL,ETH-BRL,SOL-BRL must return HTTP 200, application/json and one valid ticker per requested pair with a plausible provider timestamp.
3. Verify that values are real, currency BRL, and source explicitly Mercado Bitcoin, with fetchedAt generated at request time. Missing fields or partial quote sets must FAIL, not be replaced by zeros, guesses, or external quotes.
4. Deploy commit fa6959db1d241e573a8cc2981f1d6f9c5824e5b8 or a newer reviewed develop commit on Vercel preview once API deployment quota permits, and verify the deployed SHA and MCP URL.
5. Execute remote MCP tests for all three pairs, plus list_exchanges, preview_limit_order and trade_status. Revalidate installation in ChatGPT Web.
6. Only mark HV-03 PASS after receiving and validating all three quotes from the connected ChatGPT MCP plugin. Do not merge to main without explicit authorization.

**Current disposition:** BLOCKED_EXTERNAL_PROVIDER, code fix CI PASS but not yet deployed. No assurance of when the API will resume; website reopening does not guarantee Trade API reopening.
