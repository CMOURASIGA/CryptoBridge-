# CryptoBridge SPEC 00 v0.2
Date: 2026-11-05. Personal project, independent of any company.

## Product goal
A multi-exchange ChatGPT plugin for individual cryptocurrency account visibility. First adapter: Mercado Bitcoin. Private MVP first; public distribution requires a security and privacy review.

## Modules and acceptance criteria
| ID | Module | Target | Current status |
|---|---|---|---|
| CB-01 | User account connection | Per-user authentication, consent, revoke, vault | Not configured |
| CB-02 | Consolidated portfolio | Balances, locked/available, BRL valuation, timestamps | Domain model only |
| CB-03 | Orders | Open/filled/partial/canceled order read | Not configured |
| CB-04 | Portfolio analysis | Allocation, concentration, valid cost basis and period attribution | Partial pure calculation |
| CB-05 | Quotes | Public BRL tickers, provider and timestamp | Initial Mercado Bitcoin adapter |
| CB-06 | Alerts | Rules, scheduled execution, deduplication and notification channel | Planned |
| CB-07 | Visual dashboard | Holdings, allocation, charts, responsive and missing-data states | Planned |
| CB-08 | Trading | Contract design only; no transactions | **BLOCKED** |

## Mandatory CB-08 invariant
No order placement, cancellation, transfer, withdrawal, or operational trading API paths. UI buttons alone are insufficient. No credentials permitting execution should be requested or stored. Unlock only through a SEPARATE security/authorization specification and explicit approval.

## Implementation gates
CP-01: foundation; CP-02: market provider and authenticated account when authorized; CP-03: analytics and UI; CP-04: alerts; CP-05: ChatGPT MCP integration; CP-06: security and regression; CP-07: multi-user and publication readiness.

Current code is a local, public-market-data MCP proof of foundation. **It is not the complete MVP**. No Supabase requirement or configured account credentials. Never label simulated account data as live.
