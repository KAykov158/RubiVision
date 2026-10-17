# CV feature extraction completion checklist

- [ ] Repository audit recorded, including precedence conflicts and missing documents.
- [ ] Versioned TS/JSON feature schema and model manifest validated.
- [ ] Local video import and timestamp-driven frame sampling work.
- [ ] ROI, resize, grayscale, normalization and quality checks tested.
- [ ] Frame difference and motion aggregates validated with synthetic golden vectors.
- [ ] Optional optical flow gracefully unavailable without changing vector schema.
- [ ] Optional hand landmarks represent absence as missing, not zero motion.
- [ ] Window intervals are half-open and within recording duration.
- [ ] Worker jobs support progress, cancellation and resource cleanup.
- [ ] Typed pipeline integrates with existing recording/analysis service.
- [ ] Training/runtime feature parity validated against canonical manifest.
- [ ] Supabase owner-scoped persistence, failure behavior and privacy verified.
- [ ] Real browser performance measured and documented.
- [ ] Unit, integration, browser and adversarial tests run with evidence.
- [ ] Final handoff includes limitations, reproducible demo and evidence links.

**Do not mark items complete based on agent assertions alone.**
