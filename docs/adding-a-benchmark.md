# Adding a benchmark or port

## Benchmark

1. Create `benchmarks/<id>/benchmark.json` conforming to
   `schemas/benchmark.schema.json`.
2. Include positive and negative capability cases. Accepted cases should state
   an exact JSON-compatible result.
3. Define deterministic performance cases using a named generator and explicit
   size parameters.
4. Implement the generator in both port runners and in
   `scripts/lib/common.mjs`, then implement each port's parser factory.
5. Run `make test`; the aggregator will reject missing cases or input-hash
   disagreement.
6. Document what the case proves in `benchmarks/<id>/README.md`.
7. Run `make measure` when the new rows are ready to publish.

Benchmark identifiers and case identifiers are stable public keys. Never reuse
one for a different input or semantic contract.

## Port

A port runner must:

- accept `--config <path>`, `--benchmarks <path>`, and `--profile <name>`;
- read every canonical manifest under the supplied benchmark snapshot;
- write exactly one `port-result.schema.json` document to stdout;
- send diagnostics only to stderr;
- fail non-zero on malformed manifests, parser construction errors, or internal
  runner errors;
- report capability failures in JSON so the cross-port aggregator can explain
  them;
- preserve raw performance samples.

Add its command to `measure.config.json` and ensure CI installs the required
runtime. The port must use the same parser version family as the other rows or
the matrix must identify the version difference explicitly.

## Release history

Update a port's exact dependency pin and lockfile in one commit, then record a
new full run from that clean commit. Use `make measure` locally or dispatch the
`Record historical measurement` workflow. Each run preserves its own parser,
runtime, suite, commit, and environment identities, so adding a port or version
extends the catalog without mutating prior evidence.
