# Security contract
- No secret keys in source control, chat prompts, tool outputs or logs.
- Never enable trading as a by-product of connecting an exchange.
- No HTTP network exposure of the initial stdio MCP process.
- Public ticker data requires no account authorization.
- Private tools MUST return NOT_CONFIGURED until secure identity, consent, vault, account isolation and revocation are implemented and tested.
- Before public release: auth against the remote MCP server, explicit identity mapping, authenticated callback flow where allowed, encrypted secret storage, rate limits, deletion, audit, threat model, incident handling, LGPD privacy policy.
- Financial analytics are informational and distinguish real P&L from mark-to-market fluctuations and cash flows.
- Never treat missing price/history as zero. Report missing information explicitly.
