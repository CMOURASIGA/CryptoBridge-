# CP-05A | CryptoBridge MCP remote (PUBLIC ONLY)
Deploy the `develop` branch as a **preview** to Vercel. Endpoint `https://<verified-preview-domain>/api/mcp` over Streamable HTTP, using `mcp-handler@2`. This exposes only public ticker data and purely hypothetical offline order calculations.

Tools: `list_exchanges`, `get_ticker`, `connection_status`, `preview_limit_order`, `trade_status` (blocked). **Not provided:** private balance/order retrieval, account authorization, money transfers, order placement/cancellation.

Manual MCP smoke checks:
1. Send initialize and list tools via a compliant client.
2. Call get_ticker for BTC-BRL, ETH-BRL and SOL-BRL, confirm provider/BRL/fetchedAt.
3. Call preview_limit_order and confirm executed:false.
4. Attempt to use trading: ensure no trade tool/HTTP API exists.
5. Confirm GET/POST MCP compatibility and reject unauthorized/private APIs.

Important: public market tools intentionally do not require a client identity, and therefore this preview may be reachable by others who know its URL. Do NOT add private user/financial endpoints without a full OAuth + tenant isolation gate.
The remote plugin's mcp.json must be updated with the deployment's **actually verified** HTTPS URL; never invent it. Plugin identity and logo must be preserved.
