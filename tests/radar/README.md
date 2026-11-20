# Radar tests

From checkout root: node tests/radar/run.mjs

Uses existing TypeScript to compile contracts/modules in a unique temporary subdirectory, runs Node tests, then removes only that generated directory. No root config or new dependency.

24 offline tests: calculations, future availability, demo rejection, identities/units, indices, missing/stale data, macro reference validation, provider errors and cached fallback. No live requests.

Existing npm run test:foundation verifies API guards. This delivery never activates a mock identity provider or bypasses shared authorization.
