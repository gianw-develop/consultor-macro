# Radar observations — shared contract 0.2.0

This module emits RadarObservation, never RadarOpportunity. A price change does not establish a macro thesis or trading strategy.

## Entry point

Call collectObservations({ assetClass, horizon, context? }, dependencies?) from service.ts on the server AFTER Platform's session/permission check. It returns ApiEnvelope<RadarPage<RadarObservation>>. This delivery does not connect routes/UI, register Server Actions, create storage, schedule polling or modify authentication.

- observations.ts validates identities, units and dates, computes descriptive metrics and serializes the shared contract. Indices retain index/index_points.
- coinbase.ts makes a bounded public request for up to 100 complete daily candles for BTC-USD, ETH-USD or SOL-USD. No credentials or transaction endpoints. It records actual response receipt as demonstrable availability.
- service.ts filters markets, supports injected read-only providers and optional cached rows, preserves unavailable/stale/partial states and does not invent fallback values.

Default stocks/index loader returns no data. DJIA, SP500, NDX and MSFT remain present as unavailable, not neutral. A licensed stock/fundamental connector, corporate-action policy and session calendar are pending.

Macro context remains null without a supplied dated/versioned reference. Different horizon, missing version, unavailable or future context is rejected with a warning. Radar neither computes nor modifies AnnieNexus theses.

## Semantics

Coinbase asOf is the close boundary of the bucket, not an exact last-trade timestamp. availableAt retains the latest demonstrable availability among rows used, distinct from generatedAt. A historical download today does not establish point-in-time availability years ago.

Calendar comparison windows: 1/7/30/90 days for today/week/1–3 months/3–6 months. Today means the previous complete daily interval, NOT the current intraday session. An anchor may precede its target by at most 4 calendar days; the method records its actual date. This tolerance is provisional for stocks, not an exchange calendar.

Freshness: 2 days for daily crypto; provisional 4 days for stocks/indices pending provider/calendar. The adapter reevaluates age at serialization. Missing records remain present; dataAsOf is null when dates differ or all are missing.

Demo rejected by default; explicitly enabled synthetic fixtures stay labelled. Mixed demo/real data and conflicting duplicate closes cannot generate combined returns. Changes exclude dividends, split adjustments, costs and execution. No strategy result or probability is claimed.

## Validation and delivery

Run node tests/radar/run.mjs (24 offline tests). npm run test:foundation verifies existing closed API guards. Shared contracts, routes, styles, dependencies and framework settings remain untouched. No UI changes: Platform owns frame and component integration.

Production prerequisites still include provider rights/redistribution, session configuration, persistence, fundamental sources and historical validation.
