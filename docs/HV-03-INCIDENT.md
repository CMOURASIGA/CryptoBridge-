# HV-03 | Public ticker incident report (2026-11-05)
- Documented endpoint: GET https://api.mercadobitcoin.net/api/v4/tickers?symbols=BTC-BRL
- GitHub Actions independent probe: HTTP 302, HTML title 'Mercado Bitcoin - Página indisponível'; no Location header.
- Other documented API v4 endpoints (/BTC-BRL/orderbook, /symbols) returned the same 302/HTML. Legacy website ticker URLs returned HTTP 403.
- This is **not evidence of a bad symbol** and not proof of a global Mercado Bitcoin outage. It documents failed connectivity from our remote testing environment.
- Updated the adapter to reject redirects without following them and report the HTTP status. Reject HTML on 200. No fallback to another venue without clear attribution.
- Financial transaction execution remains prohibited. No production publication authorized.
- LIVE quotes require the provider to respond with validated application/json or an officially supported alternative endpoint.
- Vercel Hobby API deployment quota previously returned HTTP 402 'api-deployments-free-per-day'. Deploy only once capacity is restored; the installed plugin may still point to an older server version.
