# Security controls | CryptoBridge

## Current restrictions
- No trading, order cancellation, transfer or withdrawal API routes.
- No real exchange secrets in source control, chat, model/tool responses or logs.
- The local stdio server must not be exposed as a public service.
- No account credential is configured; private account tools fail closed with `NOT_CONFIGURED`.
- Order previews are local, hypothetical calculations only: no exchange POST and no account state change.
- Trading credentials must not be requested or persisted during SPEC 00.
- Quotes must show the provider and retrieval timestamp, and missing prices must not be treated as zero.

## Required before authenticated reading
- Verify the provider's API key scope and permitted authorization flow.
- Use platform secure storage, e.g. OS credential vault for a single-user local application; never plain .env or Git history for persistent secrets.
- Explicit per-user connection and revocation, account-to-user binding, read-only permissions where enforceable, key rotation and error redaction.
- Log only safe metadata and audit authentication failure without secret exposure.

## Required before public multi-user rollout
Remote MCP with authenticated identity, tenant separation, encrypted secrets, TLS, anti-abuse/rate limits, revocation and deletion workflows, data-minimization, retention policy, LGPD assessment, incident handling and end-to-end authorization tests. Supabase is optional, not required.

## Required before execution (SEPARATE SPEC)
Threat model; narrow exchange privileges; explicit per-order user confirmation outside untrusted content; transaction limits; idempotency; replay protection; account and symbol validation; rejection safeguards; audit; provider constraints. No automatic or agent-initiated trading until these gates are explicitly approved.
