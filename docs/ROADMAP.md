# CryptoBridge Roadmap (2026-11-05)
No mandatory Supabase dependency. Development in develop; main remains unchanged without explicit approval.

1. **CP-01 Foundation**: TypeScript, local stdio MCP, public MB ticker, exchange abstraction, tests, ADR and local non-executing trade preview.
2. **CP-02 Read-only integration**: independently validate provider auth, user-bound secure credentials and restricted permissions; connect balances/orders only after gates.
3. **CP-03 Analytics/UI**: meaningful asset exposure, portfolio history with accurate basis/flows, responsive visuals.
4. **CP-04 Alerts**: persistent consent, scheduling, rules, deduplication and notification delivery.
5. **CP-05 ChatGPT integration**: secure remote MCP auth, connector compatibility, end-to-end testing.
6. **CP-06 Multiuser/security**: tenant isolation, provider revocation, privacy, abuse controls, regressions.
7. **CP-07 Public release**: platform distribution eligibility and provider terms checked, explicit owner approval.
8. **Separate trading SPEC**: never a silent CP-01 to CP-07 extension; request/approve/implement only after rigorous safety review.

Blockers for private-account operation: provider permission model + secure credential vault; for public operation: authenticated remote MCP + per-user isolation; for alerts: scheduler and delivery. None of those require Supabase specifically.
