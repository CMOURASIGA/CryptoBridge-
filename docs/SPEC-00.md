# CryptoBridge | SPEC 00 v0.3
Date: 2026-11-05 | Personal project independent of Consult Services | Status: implementation in progress

## Goal
A ChatGPT cryptocurrency analysis tool, starting with Mercado Bitcoin, with an exchange-adapter architecture for other providers. Start private; only pursue public multi-user distribution after identity, authorization, security, privacy and provider contractual review.

## Architectural decision
Supabase is **not a dependency**. An exchange retains financial records and custody; the CryptoBridge retrieves information on demand. A database may be added later for user preferences, notification rules, audit and encrypted token metadata using an appropriate backend. Authentication and safe secret storage are still mandatory for real private account queries and multiuser use. See [ADR-001](ARCHITECTURE.md).

## Operating modes and acceptance
| Mode | Function | Current policy |
|---|---|---|
| L1: analysis | Public quotes, eventually authenticated balances/orders, non-binding analysis | Public quotes only are operational |
| L2: preview | Locally compute illustrative quantity/notional and compare optional user-supplied fee assumptions | Pure calculation only. No exchange call |
| L3: execution | Create, amend, cancel orders; transfers and withdrawals | **BLOCKED**; separate SPEC and explicit consent required |

## Modules
| ID | Feature | Acceptance target | Status |
|---|---|---|---|
| CB-01 | Connection | Per-user credentials stored securely and individually revocable | BLOCKED pending vault/authorization |
| CB-02 | Portfolio | Accurate available/locked/value in BRL, missing prices reported | Data model and offline utility |
| CB-03 | Orders | Read own statuses and order history | BLOCKED pending authenticated read |
| CB-04 | Analysis | Allocation and concentration; historical P&L only with validated history | Partial local utility |
| CB-05 | Quotes | Exchange, timestamp, market-pair and public bid/ask/last | Initial MB adapter |
| CB-06 | Alerts | Scheduled polling, deduplication, consent, notification status | Planned; requires runner |
| CB-07 | Dashboard | Responsive charting with accurate source/freshness | Planned |
| CB-08 | Trading | Contract and risk design only; no execution | HARD-BLOCKED, including API paths |

## Trading invariant
No executable trade submission, cancellation, withdrawal, or transfer operation exists in MCP or the adapter. No key with trade/withdraw capability should be requested. User consent in chat by itself **does not** override the block. The proposed execution feature requires a **separate SPEC**, approved threat model, transaction confirmation boundary, limits, idempotency, protection against prompt injection and real-account sandbox tests where supported.

## Delivery packages
CP-01: TypeScript, MCP, adapter abstraction, public market data, automated gates and ADR.
CP-02: secure credential mechanism and read-only authenticated market data, when approved.
CP-03: portfolio analytics and visualizations, with honest history/price gaps.
CP-04: scheduling and alert service; dedicated infrastructure if required.
CP-05: authenticated remote MCP integration with ChatGPT; no unauthenticated private exposure.
CP-06: multiuser isolation, threat model and regression.
CP-07: public distribution, privacy and provider/platform terms.

## Verification policy
typecheck, tests and build must pass on develop. No automatic production deployment or merge to main. Current stage is a local MCP foundation, **not** an operational ChatGPT plugin or authenticated portfolio reader.
