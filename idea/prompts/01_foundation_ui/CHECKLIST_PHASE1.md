# Phase 1 verification checklist

Mark PASS only with reproducible evidence; otherwise FAIL or NOT VERIFIED.

## Repository and tooling
- [ ] Repository audit identifies existing implementation and untracked changes.
- [ ] Clean install works with documented Node and package-manager versions.
- [ ] Strict TypeScript, lint, unit tests and production build execute successfully.
- [ ] No unrelated working features overwritten.

## Application shell
- [ ] `/timer`, `/solves`, `/statistics`, `/analyze`, `/challenges`, `/settings` render.
- [ ] Default redirect and 404 work.
- [ ] Browser back/forward works without full reload.
- [ ] Desktop and mobile navigation accessible.
- [ ] No hidden overflow at 320/375/768/1024/1440 CSS px.
- [ ] Persistent app-level state survives route changes in test-only lifecycle rehearsal.

## Design system and accessibility
- [ ] Semantic theme tokens and reusable components used.
- [ ] Light/dark/system themes work and persistence/fallback tested.
- [ ] Keyboard-only navigation, skip link, focus, landmarks, labels work.
- [ ] Dialog focus behavior and reduced-motion checked.
- [ ] Loading, empty, error, unavailable, offline states honest and distinguishable.
- [ ] Contrast and screen-reader behavior reviewed or NOT VERIFIED.

## Architecture and integrity
- [ ] Canonical types agree with 00_DATA_CONTRACTS.md.
- [ ] No direct IndexedDB access in visual components.
- [ ] No timer/model logic in visual components.
- [ ] No fake production solves, stats, camera or AI claims.
- [ ] No unexpected permission prompts, uploads or secret exposure.
- [ ] Future service interfaces and ownership documented.

## Verification and release
- [ ] Cross-browser matrix with actual browser versions or NOT VERIFIED.
- [ ] Bundle size baseline measured or NOT VERIFIED.
- [ ] Dependency audit recorded or NOT VERIFIED.
- [ ] SPA deep-link behavior documented.
- [ ] README fresh-start instructions verified or NOT VERIFIED.
- [ ] Completion report lists commands, outcomes, environment, commit, limitations.
- [ ] Phase 2 timer handoff complete.

**Do not check Phase 2+ checklist items in 00_INTEGRATION_CHECKLIST.md merely because placeholder pages exist.**
