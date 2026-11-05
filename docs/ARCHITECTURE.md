# CryptoBridge Architecture Decision Record ADR-001
Date: 2026-11-05 | Status: accepted for SPEC 00 design

## Decision: no mandatory Supabase
CryptoBridge is an independent personal project, initially local, later potentially public. Neither exchange access nor market analytics requires Supabase or a replicated custody database.

### Local private prototype
ChatGPT-compatible local stdio MCP <-> CryptoBridge adapter <-> exchange public API. When a secure operating-system-backed credential store and exchange's permitted credential scope have been validated, authenticated **read-only** private API calls can be considered. No live keys, authentication secrets, accounts or sessions exist in the current build.

### Public multiuser target
ChatGPT <-> authenticated remote MCP <-> per-user authorization, session mapping, encrypted token/secret vault <-> exchange adapters. Optional persistence can be provided by any appropriate storage engine; Supabase is **not required**. Public distribution additionally requires user consent, secure identity binding, key rotation/revocation, rate controls, tenancy tests, logging hygiene, privacy/compliance and incident response. A single shared API key or env variable for all users is prohibited.

### Layers
1. Public read-only market data.
2. Authenticated private read-only data (future).
3. Analysis and hypothetical **local order previews** using explicit supplied inputs only. No external trade request.
4. Trading execution (future separate SPEC; hard-blocked).

Trading and website navigation are different. API integration does not click through the exchange's website or imply UI control. Site interaction, if ever considered, requires separate implementation and approval.

### Data sourcing
Treat source timestamps, quote type, currency, available/locked balance, fees and data freshness as first-class fields. Do not represent snapshots as complete historical performance. The exchange is the source of truth for live balances and order states.

## Release controls
Changes land on develop; main requires explicit authorization. Any implementation of order execution/cancel/withdraw/transfer requires a distinct security authorization and specification before new tools/routes or trading-permission credentials are introduced.
